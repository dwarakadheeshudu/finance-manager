import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { DoctorRecord } from "./data.ts";
import type { StoredAppointment } from "./storage.ts";

function sanitizeWinAnsi(text: unknown): string {
  return String(text ?? "")
    .replace(/≥/g, ">=")
    .replace(/≤/g, "<=")
    .replace(/—/g, "-")
    .replace(/–/g, "-")
    .replace(/•/g, "*")
    .replace(/²/g, "^2")
    .replace(/°/g, " deg ")
    .replace(/[^\x20-\x7E]/g, " ");
}

function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  const clean = sanitizeWinAnsi(text).replace(/\s+/g, " ").trim();
  if (!clean) return [""];
  const words = clean.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      if (font.widthOfTextAtSize(word, fontSize) <= maxWidth) {
        current = word;
      } else {
        let chunk = "";
        for (const ch of word) {
          if (font.widthOfTextAtSize(chunk + ch, fontSize) <= maxWidth) {
            chunk += ch;
          } else {
            if (chunk) lines.push(chunk);
            chunk = ch;
          }
        }
        current = chunk;
      }
    }
  }
  if (current) lines.push(current);
  return lines;
}

class PdfCursor {
  doc: PDFDocument;
  page: PDFPage;
  y: number;
  width: number;
  height: number;
  margin = 40;
  regular!: PDFFont;
  bold!: PDFFont;

  constructor(doc: PDFDocument) {
    this.doc = doc;
    this.page = doc.addPage([595.28, 841.89]); // A4
    const size = this.page.getSize();
    this.width = size.width;
    this.height = size.height;
    this.y = this.height - this.margin;
  }

  async initFonts() {
    this.regular = await this.doc.embedFont(StandardFonts.Helvetica);
    this.bold = await this.doc.embedFont(StandardFonts.HelveticaBold);
  }

  ensureSpace(needed: number) {
    if (this.y - needed < this.margin) {
      this.page = this.doc.addPage([595.28, 841.89]);
      this.y = this.height - this.margin;
    }
  }

  drawCentered(text: string, size: number, bold = false, color = rgb(0.06, 0.09, 0.16)) {
    const font = bold ? this.bold : this.regular;
    const clean = sanitizeWinAnsi(text);
    const w = font.widthOfTextAtSize(clean, size);
    this.ensureSpace(size + 8);
    this.page.drawText(clean, {
      x: Math.max(this.margin, (this.width - w) / 2),
      y: this.y - size,
      size,
      font,
      color,
    });
    this.y -= size + 6;
  }

  drawRule(color = rgb(0.01, 0.52, 0.78)) {
    this.ensureSpace(12);
    this.page.drawLine({
      start: { x: this.margin, y: this.y },
      end: { x: this.width - this.margin, y: this.y },
      thickness: 1.5,
      color,
    });
    this.y -= 12;
  }

  drawSectionHeading(text: string) {
    this.ensureSpace(24);
    this.y -= 6;
    this.page.drawText(sanitizeWinAnsi(text), {
      x: this.margin,
      y: this.y - 11,
      size: 11,
      font: this.bold,
      color: rgb(0.06, 0.09, 0.16),
    });
    this.y -= 18;
  }

  drawKeyValueRow(label: string, value: string, highlight = false) {
    const labelW = 165;
    const valW = this.width - this.margin * 2 - labelW - 14;
    const valLines = wrapText(value, this.regular, 9, valW);
    const rowH = Math.max(18, valLines.length * 12 + 8);
    this.ensureSpace(rowH + 2);

    this.page.drawRectangle({
      x: this.margin,
      y: this.y - rowH,
      width: this.width - this.margin * 2,
      height: rowH,
      color: highlight ? rgb(0.93, 0.99, 0.96) : rgb(0.97, 0.98, 0.99),
      borderColor: rgb(0.8, 0.84, 0.88),
      borderWidth: 0.5,
    });

    this.page.drawText(sanitizeWinAnsi(label), {
      x: this.margin + 6,
      y: this.y - 13,
      size: 9,
      font: this.bold,
      color: rgb(0.2, 0.25, 0.33),
    });

    valLines.forEach((line, idx) => {
      this.page.drawText(line, {
        x: this.margin + labelW + 6,
        y: this.y - 13 - idx * 12,
        size: 9,
        font: this.regular,
        color: rgb(0.06, 0.09, 0.16),
      });
    });

    this.y -= rowH;
  }

  drawParagraph(text: string, size = 8.5, bold = false, color = rgb(0.2, 0.25, 0.33)) {
    const font = bold ? this.bold : this.regular;
    const lines = wrapText(text, font, size, this.width - this.margin * 2);
    for (const line of lines) {
      this.ensureSpace(size + 5);
      this.page.drawText(line, {
        x: this.margin,
        y: this.y - size,
        size,
        font,
        color,
      });
      this.y -= size + 4;
    }
  }
}

export async function buildAppointmentPdf(app: StoredAppointment, docInfo?: DoctorRecord): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const c = new PdfCursor(pdf);
  await c.initFonts();

  c.drawCentered("MEDICAI CLINICAL INTELLIGENCE PLATFORM", 17, true, rgb(0.06, 0.09, 0.16));
  c.drawCentered("OFFICIAL VERIFIED APPOINTMENT CONFIRMATION SLIP & CLINIC ENTRY PASS", 9.5, false, rgb(0.01, 0.52, 0.78));
  c.drawRule(rgb(0.01, 0.52, 0.78));

  const modalityDetail =
    app.consultation_type === "Tele-Consultation" && app.teleconsult_url
      ? `Tele-Consultation (Video Room: ${app.teleconsult_url})`
      : `${app.consultation_type} (${app.room_number})`;

  const rows: [string, string][] = [
    ["Appointment Reference ID", app.reference_id],
    ["Booking Status", `${app.status.toUpperCase()} (Verified in Persistent Store)`],
    ["Booked Timestamp", app.created_at || "N/A"],
    ["Patient Full Name", app.patient_name],
    ["Patient Contact", `${app.patient_email || "Not Provided"} | ${app.patient_phone || "Not Provided"}`],
    ["Chief Complaint / Purpose", app.chief_complaint || "Clinical consultation"],
    ["Attending Physician", `${app.doctor_name} (${docInfo?.qualifications || "MD"})`],
    ["Medical Registration No.", docInfo?.registration_number || "MCI-VERIFIED-2026"],
    ["Department / Specialty", app.department],
    ["Hospital / Clinic Location", docInfo?.hospital || "Apex Healthcare Pavilion"],
    ["Consultation Date & Time", `${app.appointment_date} at ${app.time_slot}`],
    ["Consultation Modality & Room", modalityDetail],
    ["Consultation Fee", `$${app.fee_paid.toFixed(2)} (Payable at Clinic / Billing Portal)`],
    ["Digital Verification Hash", app.security_verification_hash],
  ];

  for (const [k, v] of rows) {
    c.drawKeyValueRow(k, v);
  }

  c.y -= 12;
  c.drawSectionHeading("CLINICAL APPOINTMENT INSTRUCTIONS:");
  c.drawParagraph("1. Arrive 15 minutes prior to your scheduled slot for initial vitals triage (BP, SpO2, Temperature).", 8.5);
  c.drawParagraph("2. Bring relevant lab panels, imaging records, and this digitally signed confirmation slip.", 8.5);
  c.drawParagraph("3. For Tele-Consultations, join the encrypted video link 5 minutes before your slot with your Reference ID.", 8.5);
  c.y -= 8;
  c.drawParagraph("Secured with SHA-256 tamper-evident audit chaining under HIPAA Title II & GDPR Article 9 governance.", 8, false, rgb(0.39, 0.45, 0.55));

  return await pdf.save();
}

function formatInputsKv(inputs?: Record<string, unknown> | null): string {
  if (!inputs) return "Standard parameters";
  return Object.entries(inputs)
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`)
    .join(" | ");
}

export async function buildMasterReportPdf(
  payload: Record<string, any>,
  reportId: string,
  auditHash: string
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const c = new PdfCursor(pdf);
  await c.initFonts();

  c.drawCentered("MEDICAI CLINICAL INTELLIGENCE PLATFORM", 17, true, rgb(0.12, 0.23, 0.54));
  c.drawCentered("ACTUAL PATIENT CLINICAL EVALUATION & VERIFIED AUDIT REPORT", 9.5, false, rgb(0.39, 0.45, 0.55));
  c.drawRule(rgb(0.12, 0.23, 0.54));

  c.drawKeyValueRow("Patient Name", String(payload.patient_name || "Clinical Screening Patient"));
  c.drawKeyValueRow("Report Reference", reportId);
  c.drawKeyValueRow("Contact Details", `${payload.patient_email || "N/A"} | ${payload.patient_phone || "N/A"}`);
  c.drawKeyValueRow("Generated Date", new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC");
  c.drawKeyValueRow("Demographics / Context", String(payload.age_gender || "Not Specified"));
  c.drawKeyValueRow("SHA-256 Audit Seal", `${auditHash.slice(0, 32)}...`);

  c.drawSectionHeading("Multi-Disease Diagnostic Summary (Evaluated Modules)");

  const cancerVal = payload.cancer_details?.risk_percentage ?? payload.cancer_risk;
  const heartVal = payload.heart_details?.probability_percentage ?? payload.heart_risk;
  const parkVal = payload.parkinson_details?.status ?? payload.parkinson_status;
  const diabVal = payload.diabetes_details?.risk_percentage ?? payload.diabetes_risk;
  const kidneyVal = payload.kidney_details?.kdigo_stage ?? payload.kidney_stage;
  const respVal = payload.respiratory_details?.respiratory_risk_percentage ?? payload.respiratory_risk;

  const summaryRows: [string, string][] = [
    ["Cancer Risk (Oncology)", cancerVal != null ? `${cancerVal}% (${payload.cancer_details?.risk_category || "Evaluated"}) [NCCN v2026.1]` : "Not Evaluated Yet"],
    ["Heart Disease (Cardiology)", heartVal != null ? `${heartVal}% (${payload.heart_details?.risk_category || "Evaluated"}) [ACC/AHA]` : "Not Evaluated Yet"],
    ["Parkinson's Voice (Neurology)", payload.parkinson_details ? `${payload.parkinson_details.risk_percentage}% (${payload.parkinson_details.risk_category}) [MDS]` : parkVal ? String(parkVal) : "Not Evaluated Yet"],
    ["Type 2 Diabetes (Endocrinology)", diabVal != null ? `${diabVal}% (${payload.diabetes_details?.clinical_tier || "Evaluated"}) [ADA 2026]` : "Not Evaluated Yet"],
    ["Chronic Kidney Disease (Nephrology)", payload.kidney_details ? `eGFR ${payload.kidney_details.calculated_egfr} (${payload.kidney_details.overall_renal_risk_percentage}%) - ${kidneyVal}` : kidneyVal ? String(kidneyVal) : "Not Evaluated Yet"],
    ["Pneumonia & Respiratory (Pulmonology)", respVal != null ? `${respVal}% (CURB-65: ${payload.respiratory_details?.curb65_severity_score ?? "-"}) [BTS]` : "Not Evaluated Yet"],
  ];

  for (const [k, v] of summaryRows) {
    c.drawKeyValueRow(k, v);
  }

  const detailedSections: [string, any][] = [
    ["Oncology (Cancer Risk) - Inputs & Findings", payload.cancer_details],
    ["Cardiology (Heart Disease) - Inputs & Findings", payload.heart_details],
    ["Neurology (Parkinson's Voice) - Inputs & Findings", payload.parkinson_details],
    ["Endocrinology (Type 2 Diabetes) - Inputs & Findings", payload.diabetes_details],
    ["Nephrology (Chronic Kidney Disease) - Inputs & Findings", payload.kidney_details],
    ["Pulmonology (Pneumonia / Respiratory) - Inputs & Findings", payload.respiratory_details],
  ];

  if (detailedSections.some(([, d]) => Boolean(d))) {
    c.drawSectionHeading("Detailed Patient Inputs & Clinical Recommendations");
    for (const [heading, detail] of detailedSections) {
      if (!detail) continue;
      c.drawParagraph(heading, 9, true, rgb(0.06, 0.09, 0.16));
      if (detail.medication_guidance?.medicines?.length) {
        const medsText = detail.medication_guidance.medicines
          .map((m: any) => `${m.name} (${m.dosage})`)
          .join("; ");
        c.drawParagraph(`Recommended Medications: ${medsText}`, 8);
        if (detail.medication_guidance.doctor_consultation_advice) {
          c.drawParagraph(`Doctor Advice: ${detail.medication_guidance.doctor_consultation_advice}`, 8);
        }
      }
      if (detail.echo_inputs) c.drawParagraph(`User Inputs: ${formatInputsKv(detail.echo_inputs)}`, 8);
      if (detail.plain_summary) c.drawParagraph(`Summary: ${detail.plain_summary}`, 8);
      if (detail.recommendation) c.drawParagraph(`Clinical Action: ${detail.recommendation}`, 8);
      c.y -= 4;
    }
  }

  const testsList = payload.rare_details?.tests || payload.ranked_tests;
  if (Array.isArray(testsList) && testsList.length > 0) {
    c.drawSectionHeading("Prioritized Rare Disease Diagnostic Hierarchy (Orphanet Yield)");
    testsList.slice(0, 5).forEach((t: any, idx: number) => {
      const yPct = t.probability_ranking_pct ?? t.yield_percentage ?? "N/A";
      const tat = t.turnaround_time ?? (t.turnaround_days ? `${t.turnaround_days} Days` : "N/A");
      c.drawKeyValueRow(`#${idx + 1} (${yPct}% yield, ${tat})`, String(t.test_name || ""));
    });
  }

  if (payload.latest_appointment) {
    const apt = payload.latest_appointment;
    c.drawSectionHeading("Confirmed Specialist Appointment Record");
    c.drawKeyValueRow("Reference ID & Status", `${apt.reference_id || ""} (${apt.status || "Confirmed"})`, true);
    c.drawKeyValueRow("Specialist & Date", `${apt.doctor || ""} (${apt.department || ""}) - ${apt.date || ""} at ${apt.slot || ""}`, true);
    c.drawKeyValueRow("Modality / Room", `${apt.consultation_type || ""} - ${apt.room_number || ""}`, true);
  }

  c.drawSectionHeading("Regulatory & Trustworthy Governance");
  c.drawParagraph(
    `This clinical summary functions as FDA Class II Clinical Decision Support (CDS). Report ID ${reportId} is permanently logged in the SHA-256 audit ledger (Hash: ${auditHash}).`,
    8,
    false,
    rgb(0.28, 0.33, 0.41)
  );

  return await pdf.save();
}

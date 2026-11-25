import axios from 'axios';

const API_BASE =
  import.meta.env.VITE_API_URL ||
  ((typeof window !== 'undefined' && window.location.origin)
    ? `${window.location.origin}/api`
    : 'http://127.0.0.1:8000/api');

function triggerBlobDownload(blobData: BlobPart, fallbackFilename: string, contentDisposition?: string) {
  let filename = fallbackFilename;
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?([^";]+)"?/i);
    if (match && match[1]) {
      filename = match[1];
    }
  }
  const url = window.URL.createObjectURL(new Blob([blobData], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => window.URL.revokeObjectURL(url), 1000);
}

export const medicaiApi = {
  checkHealth: async () => {
    const res = await axios.get(`${API_BASE}/health`);
    return res.data;
  },

  // 1. Cancer Risk Prediction
  predictCancer: async (data: {
    Age: number;
    Gender: number;
    BMI: number;
    Smoking: number;
    GeneticRisk: number;
    PhysicalActivity: number;
    AlcoholIntake: number;
    CancerHistory: number;
  }) => {
    const res = await axios.post(`${API_BASE}/predict/cancer`, data);
    return res.data;
  },

  // 2. Cardiovascular Heart Disease
  predictHeart: async (data: {
    age: number;
    sex: number;
    cp: number;
    trestbps: number;
    chol: number;
    fbs: number;
    restecg: number;
    thalach: number;
    exang: number;
    oldpeak: number;
    slope: number;
    ca: number;
    thal: number;
  }) => {
    const res = await axios.post(`${API_BASE}/predict/heart`, data);
    return res.data;
  },

  // 3. Parkinson's Voice Screening
  predictParkinsonFeatures: async (data: {
    fo: number;
    fhi: number;
    flo: number;
    jitter: number;
    shimmer: number;
    hnr: number;
    spread1: number;
  }) => {
    const res = await axios.post(`${API_BASE}/predict/parkinson/features`, data);
    return res.data;
  },

  predictParkinsonAudio: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post(`${API_BASE}/predict/parkinson/audio`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // 4. Type 2 Diabetes & Metabolic Syndrome (Endocrinology)
  predictDiabetes: async (data: {
    Age: number;
    BMI: number;
    Glucose: number;
    HbA1c: number;
    Insulin: number;
    SystolicBP: number;
    DiabetesPedigree: number;
    PhysicalActivityHours: number;
  }) => {
    const res = await axios.post(`${API_BASE}/predict/diabetes`, data);
    return res.data;
  },

  // 5. Chronic Kidney Disease & Renal Failure (Nephrology)
  predictKidney: async (data: {
    Age: number;
    Gender: number;
    SerumCreatinine: number;
    eGFR?: number;
    BUN: number;
    UrineAlbumin: number;
    SystolicBP: number;
    Hemoglobin: number;
  }) => {
    const res = await axios.post(`${API_BASE}/predict/kidney`, data);
    return res.data;
  },

  // 6. Pneumonia & Respiratory Disease (Pulmonology)
  predictRespiratory: async (data: {
    Age: number;
    SpO2: number;
    RespiratoryRate: number;
    Temperature: number;
    CoughDurationDays: number;
    DyspneaGrade: number;
    CracklesWheezing: number;
    SmokingPackYears: number;
    Confusion: number;
    BUN?: number;
    SystolicBP?: number;
  }) => {
    const res = await axios.post(`${API_BASE}/predict/respiratory`, data);
    return res.data;
  },

  // 7. Rare Disease Diagnostic Odyssey
  prioritizeRareTests: async (data: {
    onset_age: string;
    phenotypes: string[];
    suspected_inheritance: string;
    previous_tests?: string[];
  }) => {
    const res = await axios.post(`${API_BASE}/rare-diseases/prioritize`, data);
    return res.data;
  },

  searchRareDiseases: async (query: string) => {
    const res = await axios.get(`${API_BASE}/rare-diseases/search?q=${encodeURIComponent(query)}`);
    return res.data;
  },

  // 8. Doctors & Real Appointments (100% Real, Slot-Locked, Persistent in Database)
  getDoctors: async () => {
    const res = await axios.get(`${API_BASE}/doctors`);
    return res.data;
  },

  getDoctorAvailableSlots: async (doctorIdOrName: string, date: string) => {
    const res = await axios.get(`${API_BASE}/doctors/${encodeURIComponent(doctorIdOrName)}/slots?date=${encodeURIComponent(date)}`);
    return res.data;
  },

  bookAppointment: async (data: {
    patient_name: string;
    patient_email?: string;
    patient_phone?: string;
    doctor_name: string;
    department: string;
    date: string;
    slot: string;
    consultation_type?: string;
    chief_complaint?: string;
  }) => {
    const res = await axios.post(`${API_BASE}/appointments/book`, data);
    return res.data;
  },

  getActiveAppointments: async () => {
    const res = await axios.get(`${API_BASE}/appointments/active`);
    return res.data;
  },

  cancelAppointment: async (referenceId: string) => {
    const res = await axios.post(`${API_BASE}/appointments/${encodeURIComponent(referenceId)}/cancel`);
    return res.data;
  },

  downloadAppointmentPdf: async (referenceId: string) => {
    const res = await axios.get(`${API_BASE}/appointments/${encodeURIComponent(referenceId)}/pdf`, {
      responseType: 'blob',
    });
    triggerBlobDownload(
      res.data,
      `MedicAI_Appointment_${referenceId}.pdf`,
      res.headers?.['content-disposition']
    );
  },

  // 9. Security, Privacy & Trust Suite
  getAuditLogs: async () => {
    const res = await axios.get(`${API_BASE}/security/audit-logs`);
    return res.data;
  },

  verifySecurityRecord: async (recordIdOrHash: string) => {
    const res = await axios.post(`${API_BASE}/security/verify-record`, {
      record_id_or_hash: recordIdOrHash,
    });
    return res.data;
  },

  anonymizeData: async (rawText: string) => {
    const res = await axios.post(`${API_BASE}/security/anonymize`, {
      raw_text: rawText,
    });
    return res.data;
  },

  getComplianceStatus: async () => {
    const res = await axios.get(`${API_BASE}/security/compliance-status`);
    return res.data;
  },

  // 10. Medical GraphRAG Chatbot
  queryGraphRAG: async (query: string) => {
    const res = await axios.post(`${API_BASE}/chatbot/graphrag`, { query });
    return res.data;
  },

  // 11. Master Clinical Report PDF
  downloadPdfReport: async (data: any) => {
    const res = await axios.post(`${API_BASE}/report/generate-pdf`, data, {
      responseType: 'blob',
    });
    triggerBlobDownload(
      res.data,
      `MedicAI_Clinical_Report_${Date.now()}.pdf`,
      res.headers?.['content-disposition']
    );
    return {
      reportId: res.headers?.['x-report-id'],
      verificationHash: res.headers?.['x-verification-hash'],
    };
  },
};

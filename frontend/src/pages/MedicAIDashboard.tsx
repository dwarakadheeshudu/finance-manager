import React, { useState, useEffect } from 'react';
import {
  Activity,
  Heart,
  Brain,
  Calendar,
  MessageSquare,
  Dna,
  FileText,
  Upload,
  Search,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Shield,
  Lock,
  Stethoscope,
  Droplets,
  Wind,
  Check,
  XCircle,
  Download,
  RefreshCw,
  Printer,
  X,
  Volume2,
  VolumeX,
  Pill
} from 'lucide-react';
import { medicaiApi } from '../services/medicaiApi';

const DEFAULT_DOCTORS = [
  {
    name: "Dr. Vikramaditya Rao",
    specialty: "Cardiology",
    qualifications: "MD, DM (Cardiology), FACC",
    registration_number: "MCI-29481-DEL",
    hospital: "Apex Heart & Vascular Institute, Wing 4B",
    experience_years: 18,
    consultation_fee: 120.0,
    rating: 4.95,
    available_days: "Mon - Sat",
    room_number: "Room 210, 2nd Floor",
    teleconsult_available: true,
    verified: true
  },
  {
    name: "Dr. R. K. Sharma",
    specialty: "Oncology",
    qualifications: "MD, DNB (Medical Oncology), ESMO Certified",
    registration_number: "MCI-48192-MUM",
    hospital: "Tata Comprehensive Cancer Center, Block C",
    experience_years: 22,
    consultation_fee: 150.0,
    rating: 4.88,
    available_days: "Mon - Fri",
    room_number: "Room 105, Cancer Care Pavilion",
    teleconsult_available: true,
    verified: true
  },
  {
    name: "Dr. Ananya Patel",
    specialty: "Neurology & Movement Disorders",
    qualifications: "MD, DM (Neurology), Fellow Movement Disorders",
    registration_number: "MCI-38291-BLR",
    hospital: "National Neurosciences Institute, Main Wing",
    experience_years: 15,
    consultation_fee: 130.0,
    rating: 4.92,
    available_days: "Mon, Wed, Fri, Sat",
    room_number: "Room 304, Neuro Clinic",
    teleconsult_available: true,
    verified: true
  },
  {
    name: "Dr. Meera Nambiar",
    specialty: "Medical Genetics & Rare Disorders",
    qualifications: "MD, PhD (Genomics), FACMG Affiliate",
    registration_number: "MCI-51920-CHN",
    hospital: "Center for Genomic Medicine & Orphan Diseases",
    experience_years: 16,
    consultation_fee: 160.0,
    rating: 4.96,
    available_days: "Tue - Sat",
    room_number: "Room 412, Genomics Tower",
    teleconsult_available: true,
    verified: true
  },
  {
    name: "Dr. Arvind Swaminathan",
    specialty: "Endocrinology & Diabetology",
    qualifications: "MD, DM (Endocrinology), FACE (USA)",
    registration_number: "MCI-41902-HYD",
    hospital: "Apex Diabetes & Metabolic Health Center",
    experience_years: 19,
    consultation_fee: 110.0,
    rating: 4.89,
    available_days: "Mon - Sat",
    room_number: "Room 118, Metabolic Suite",
    teleconsult_available: true,
    verified: true
  },
  {
    name: "Dr. Preeti Deshmukh",
    specialty: "Nephrology & Renal Transplant",
    qualifications: "MD, DM (Nephrology), FISN Member",
    registration_number: "MCI-63821-PUN",
    hospital: "Institute of Kidney Diseases & Dialysis Care",
    experience_years: 17,
    consultation_fee: 135.0,
    rating: 4.91,
    available_days: "Mon - Sat",
    room_number: "Room 222, Renal Block",
    teleconsult_available: true,
    verified: true
  },
  {
    name: "Dr. Siddharth Mukherjee",
    specialty: "Pulmonology & Critical Care",
    qualifications: "MD, FCCP (USA), DNB (Respiratory Medicine)",
    registration_number: "MCI-37190-KOL",
    hospital: "Pulmonary & Thoracic Specialty Hospital",
    experience_years: 20,
    consultation_fee: 125.0,
    rating: 4.94,
    available_days: "Mon - Sat",
    room_number: "Room 108, Chest Care Center",
    teleconsult_available: true,
    verified: true
  }
];

const PHENOTYPE_OPTIONS = [
  "Neurological: Motor regression, developmental delay, seizures",
  "Skeletal / Dysmorphic: Bone dysplasia, joint pain, facial dysmorphism",
  "Metabolic / Hepatic: Hepatosplenomegaly, lactic acidosis, dark urine",
  "Cardiopulmonary: Aortic aneurysm, bronchiectasis, pancreatic insufficiency",
  "Neuromuscular: Hypotonia, muscle weakness, ataxia"
];

const PREVIOUS_TEST_OPTIONS = [
  "Basic Metabolic Panel",
  "Chromosomal Microarray",
  "Brain MRI",
  "Single-Gene Sequencing"
];

function createSampleWavFile(dysphonic: boolean): File {
  const sampleRate = 16000;
  const durationSec = 1.0;
  const numSamples = Math.floor(sampleRate * durationSec);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeStr(0, "RIFF");
  view.setUint32(4, 36 + numSamples * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, numSamples * 2, true);

  let phase = 0;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const freqJitter = dysphonic ? Math.sin(2 * Math.PI * 12 * t) * 14.0 : 0.3;
    const ampMod = dysphonic ? 0.55 + 0.40 * Math.sin(2 * Math.PI * 19 * t) : 0.92;
    const noise = dysphonic ? (Math.sin(i * 1.7) * 0.14) : 0.005 * Math.sin(i * 1.3);
    const freq = 145 + freqJitter;
    phase += (2 * Math.PI * freq) / sampleRate;
    const val = Math.max(-1, Math.min(1, ampMod * Math.sin(phase) + noise));
    view.setInt16(44 + i * 2, Math.round(val * 28000), true);
  }

  return new File(
    [buffer],
    dysphonic ? "sample_dysphonic_tremor.wav" : "sample_healthy_vowel.wav",
    { type: "audio/wav" }
  );
}

const InputEchoPanel: React.FC<{ inputs?: Record<string, any> }> = ({ inputs }) => {
  if (!inputs || Object.keys(inputs).length === 0) return null;
  return (
    <div className="bg-white/90 border border-slate-200 rounded-xl p-3 text-left">
      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
        Your Submitted Inputs (Verified)
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
        {Object.entries(inputs).map(([k, v]) => (
          <div key={k} className="bg-slate-50 border border-slate-200/80 rounded-lg px-2 py-1">
            <span className="text-slate-400 block text-[10px]">{k}</span>
            <span className="font-semibold text-slate-800 break-words">
              {Array.isArray(v) ? v.join(', ') : String(v)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface MedicationGuidanceProps {
  guidance?: {
    is_severe?: boolean;
    severity_level?: string;
    primary_specialist?: string;
    primary_department?: string;
    headline?: string;
    medicines?: Array<{
      name: string;
      dosage: string;
      purpose: string;
      notes: string;
      category: string;
    }>;
    doctor_consultation_advice?: string;
    speech_script?: string;
  };
  onConsultDoctor: (doctorName: string, department: string) => void;
  onSpeak: (text: string) => void;
  onStopSpeak: () => void;
  isSpeaking: boolean;
}

const MedicationGuidancePanel: React.FC<MedicationGuidanceProps> = ({
  guidance,
  onConsultDoctor,
  onSpeak,
  onStopSpeak,
  isSpeaking
}) => {
  if (!guidance || !guidance.medicines || guidance.medicines.length === 0) return null;
  const isSevere = Boolean(guidance.is_severe);
  const speakText = guidance.speech_script || guidance.doctor_consultation_advice || '';

  return (
    <div
      className={`p-4 rounded-2xl border-2 text-left space-y-3 shadow-sm ${
        isSevere
          ? 'bg-rose-50/90 border-rose-400'
          : 'bg-sky-50/80 border-sky-300'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isSevere ? 'bg-rose-600 text-white' : 'bg-sky-600 text-white'}`}>
            <Pill className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wide text-slate-900">
                1st Priority: Detailed Medicine Guidance
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  isSevere
                    ? 'bg-rose-600 text-white'
                    : guidance.severity_level === 'Moderate'
                    ? 'bg-amber-200 text-amber-900'
                    : 'bg-emerald-200 text-emerald-900'
                }`}
              >
                {guidance.severity_level || (isSevere ? 'Severe' : 'Mild')}
              </span>
            </div>
            <div className="text-[11px] font-semibold text-slate-700">{guidance.headline}</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {isSpeaking ? (
            <button
              type="button"
              onClick={onStopSpeak}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-semibold flex items-center gap-1 hover:bg-slate-800 transition"
            >
              <VolumeX className="h-3.5 w-3.5" /> Stop Voice
            </button>
          ) : (
            <button
              type="button"
              onClick={() => speakText && onSpeak(speakText)}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-800 text-[11px] font-semibold flex items-center gap-1 hover:bg-slate-100 transition"
            >
              <Volume2 className="h-3.5 w-3.5 text-sky-600" /> Say Guidance
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {guidance.medicines.map((med, idx) => (
          <div key={idx} className="bg-white rounded-xl p-3 border border-slate-200/90 space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-xs text-slate-900">
                {idx + 1}. {med.name}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  med.category.includes('OTC')
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-indigo-100 text-indigo-800'
                }`}
              >
                {med.category}
              </span>
            </div>
            <div className="text-[11px] text-slate-800">
              <b>Dosage:</b> {med.dosage}
            </div>
            <div className="text-[11px] text-slate-600">
              <b>Why / Purpose:</b> {med.purpose}
            </div>
            <div className="text-[10px] text-slate-500">
              <b>Safety Note:</b> {med.notes}
            </div>
          </div>
        ))}
      </div>

      <div
        className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
          isSevere
            ? 'bg-rose-100 border-rose-300 text-rose-950'
            : 'bg-amber-50 border-amber-200 text-amber-950'
        }`}
      >
        <div className="text-[11px] font-semibold leading-relaxed flex items-start gap-2">
          <AlertTriangle className={`h-4 w-4 flex-shrink-0 mt-0.5 ${isSevere ? 'text-rose-700' : 'text-amber-700'}`} />
          <span>{guidance.doctor_consultation_advice}</span>
        </div>
        {guidance.primary_specialist && guidance.primary_department && (
          <button
            type="button"
            onClick={() => onConsultDoctor(guidance.primary_specialist!, guidance.primary_department!)}
            className={`px-3 py-2 rounded-lg text-[11px] font-bold whitespace-nowrap flex items-center gap-1.5 shadow-sm transition ${
              isSevere
                ? 'bg-rose-700 hover:bg-rose-800 text-white'
                : 'bg-slate-800 hover:bg-slate-900 text-white'
            }`}
          >
            <Stethoscope className="h-3.5 w-3.5" />
            {isSevere ? 'Consult Doctor Now' : 'Consult Doctor'}
          </button>
        )}
      </div>
    </div>
  );
};

export const MedicAIDashboard: React.FC = () => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [activeTab, setActiveTab] = useState<
    'rare' | 'cancer' | 'heart' | 'parkinson' | 'diabetes' | 'kidney' | 'respiratory' | 'appointments' | 'security' | 'chatbot'
  >(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace(/^#\/?/, '').split('?')[0];
      const validTabs = ['rare', 'cancer', 'heart', 'parkinson', 'diabetes', 'kidney', 'respiratory', 'appointments', 'security', 'chatbot'];
      if (validTabs.includes(hash)) return hash as any;
      const tabParam = new URLSearchParams(window.location.search).get('tab');
      if (tabParam && validTabs.includes(tabParam)) return tabParam as any;
    }
    return 'rare';
  });

  const [backendStatus, setBackendStatus] = useState<string>('Checking...');
  const [complianceScore, setComplianceScore] = useState<number>(98.5);
  const [printPreviewMode, setPrintPreviewMode] = useState<'master' | 'appointment' | null>(null);
  const [printAppointmentTarget, setPrintAppointmentTarget] = useState<any>(null);
  const [reportDownloading, setReportDownloading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const speakClinicalGuidance = (text: string, forceSpeak = false) => {
    if ((!voiceEnabled && !forceSpeak) || !text) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 0.98;
      utter.pitch = 1.0;
      utter.onstart = () => setIsSpeaking(true);
      utter.onend = () => setIsSpeaking(false);
      utter.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utter);
    } catch {
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    medicaiApi.checkHealth()
      .then(res => {
        setBackendStatus(`Online (${res.rare_diseases_indexed} Rare Diseases • ${res.verified_specialists} Doctors)`);
      })
      .catch(() => setBackendStatus('Offline (Backend unreachable)'));
  }, []);

  // ============================================================================
  // 1. RARE DISEASE STATE
  // ============================================================================
  const [onsetAge, setOnsetAge] = useState('Childhood (2 - 12 years)');
  const [selectedPhenotypes, setSelectedPhenotypes] = useState<string[]>([
    PHENOTYPE_OPTIONS[0],
    PHENOTYPE_OPTIONS[1]
  ]);
  const [customPhenotype, setCustomPhenotype] = useState('');
  const [previousTests, setPreviousTests] = useState<string[]>([]);
  const [suspectedInheritance, setSuspectedInheritance] = useState('Autosomal recessive (Consanguinity / Carrier parents)');
  const [rareResult, setRareResult] = useState<any>(null);
  const [rankededTests, setRankedTests] = useState<any[]>([]);
  const [rareLoading, setRareLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('dysplasia');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchMessage, setSearchMessage] = useState('');

  // ============================================================================
  // 2. CHATBOT STATE
  // ============================================================================
  const [chatQuery, setChatQuery] = useState("What diagnostic tests are recommended for Parkinson's and Alexander disease?");
  const [chatResponse, setChatResponse] = useState<any>(null);
  const [chatLoading, setChatLoading] = useState(false);

  // ============================================================================
  // 3. CANCER STATE (ALL 8 INPUTS EXPOSED)
  // ============================================================================
  const [cancerAge, setCancerAge] = useState(45);
  const [cancerGender, setCancerGender] = useState(1);
  const [cancerBmi, setCancerBmi] = useState(24.5);
  const [cancerSmoking, setCancerSmoking] = useState(0);
  const [cancerGenRisk, setCancerGenRisk] = useState(0);
  const [cancerActivity, setCancerActivity] = useState(3.5);
  const [cancerAlcohol, setCancerAlcohol] = useState(1.0);
  const [cancerHistory, setCancerHistory] = useState(0);
  const [cancerResult, setCancerResult] = useState<any>(null);
  const [cancerLoading, setCancerLoading] = useState(false);

  // ============================================================================
  // 4. HEART DISEASE STATE (ALL 13 INPUTS EXPOSED)
  // ============================================================================
  const [heartAge, setHeartAge] = useState(48);
  const [heartSex, setHeartSex] = useState(1);
  const [heartCp, setHeartCp] = useState(0);
  const [heartBps, setHeartBps] = useState(122);
  const [heartChol, setHeartChol] = useState(195);
  const [heartFbs, setHeartFbs] = useState(0);
  const [heartRestecg, setHeartRestecg] = useState(0);
  const [heartThalach, setHeartThalach] = useState(156);
  const [heartExang, setHeartExang] = useState(0);
  const [heartOldpeak, setHeartOldpeak] = useState(0.4);
  const [heartSlope, setHeartSlope] = useState(1);
  const [heartCa, setHeartCa] = useState(0);
  const [heartThal, setHeartThal] = useState(2);
  const [heartResult, setHeartResult] = useState<any>(null);
  const [heartLoading, setHeartLoading] = useState(false);

  // ============================================================================
  // 5. PARKINSON'S STATE (AUDIO + MANUAL ACOUSTIC FEATURES)
  // ============================================================================
  const [parkinsonMode, setParkinsonMode] = useState<'audio' | 'manual'>('audio');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [parkFo, setParkFo] = useState(152.0);
  const [parkFhi, setParkFhi] = useState(182.0);
  const [parkFlo, setParkFlo] = useState(118.0);
  const [parkJitter, setParkJitter] = useState(0.004);
  const [parkShimmer, setParkShimmer] = useState(0.025);
  const [parkHnr, setParkHnr] = useState(23.0);
  const [parkSpread1, setParkSpread1] = useState(-5.8);
  const [parkinsonResult, setParkinsonResult] = useState<any>(null);
  const [parkinsonLoading, setParkinsonLoading] = useState(false);
  const [parkinsonError, setParkinsonError] = useState('');

  // ============================================================================
  // 6. TYPE 2 DIABETES STATE
  // ============================================================================
  const [diabAge, setDiabAge] = useState(45);
  const [diabBmi, setDiabBmi] = useState(26.5);
  const [diabGlucose, setDiabGlucose] = useState(105);
  const [diabHba1c, setDiabHba1c] = useState(5.8);
  const [diabInsulin, setDiabInsulin] = useState(14);
  const [diabBp, setDiabBp] = useState(126);
  const [diabPedigree, setDiabPedigree] = useState(0.45);
  const [diabActivity, setDiabActivity] = useState(3.0);
  const [diabetesResult, setDiabetesResult] = useState<any>(null);
  const [diabetesLoading, setDiabetesLoading] = useState(false);

  // ============================================================================
  // 7. CHRONIC KIDNEY DISEASE (CKD) STATE
  // ============================================================================
  const [kidneyAge, setKidneyAge] = useState(50);
  const [kidneyGender, setKidneyGender] = useState(1);
  const [kidneyCreatinine, setKidneyCreatinine] = useState(1.1);
  const [kidneyBun, setKidneyBun] = useState(18);
  const [kidneyAlbumin, setKidneyAlbumin] = useState(22);
  const [kidneyBp, setKidneyBp] = useState(128);
  const [kidneyHb, setKidneyHb] = useState(13.8);
  const [kidneyResult, setKidneyResult] = useState<any>(null);
  const [kidneyLoading, setKidneyLoading] = useState(false);

  // ============================================================================
  // 8. PNEUMONIA / RESPIRATORY STATE (ALL CURB-65 INPUTS EXPOSED)
  // ============================================================================
  const [respAge, setRespAge] = useState(46);
  const [respSpo2, setRespSpo2] = useState(96);
  const [respRate, setRespRate] = useState(18);
  const [respTemp, setRespTemp] = useState(37.2);
  const [respCoughDays, setRespCoughDays] = useState(3);
  const [respDyspnea, setRespDyspnea] = useState(1);
  const [respCrackles, setRespCrackles] = useState(0);
  const [respSmokingYears, setRespSmokingYears] = useState(2);
  const [respConfusion, setRespConfusion] = useState(0);
  const [respBun, setRespBun] = useState(15);
  const [respSbp, setRespSbp] = useState(120);
  const [respResult, setRespResult] = useState<any>(null);
  const [respLoading, setRespLoading] = useState(false);

  // ============================================================================
  // 9. REAL DOCTOR APPOINTMENTS STATE
  // ============================================================================
  const [doctorsList, setDoctorsList] = useState<any[]>(DEFAULT_DOCTORS);
  const [selectedDoctor, setSelectedDoctor] = useState('Dr. Vikramaditya Rao');
  const [selectedDepartment, setSelectedDepartment] = useState('Cardiology');
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [appDate, setAppDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [appSlot, setAppSlot] = useState('');
  const [consultType, setConsultType] = useState('In-Person');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [doctorSlots, setDoctorSlots] = useState<any[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [appointmentMsg, setAppointmentMsg] = useState('');
  const [appointmentError, setAppointmentError] = useState('');
  const [latestBookedTicket, setLatestBookedTicket] = useState<any>(null);
  const [activeAppointments, setActiveAppointments] = useState<any[]>([]);
  const [bookingLoading, setBookingLoading] = useState(false);

  // ============================================================================
  // 10. SECURITY & TRUST CENTER STATE
  // ============================================================================
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [rawClinicalText, setRawClinicalText] = useState(
    'Patient Mr. Johnathan Doe, DOB 04/12/1972, phone +1-555-234-5678, email john.doe@email.com, presented with elevated blood pressure and fasting glucose 145 mg/dL.'
  );
  const [anonymizedOutput, setAnonymizedOutput] = useState<any>(null);

  useEffect(() => {
    loadDoctors();
    refreshAppointments();
    loadAuditLogs();
  }, []);

  useEffect(() => {
    if (selectedDoctor && appDate) {
      loadSlots(selectedDoctor, appDate);
    }
  }, [selectedDoctor, appDate]);

  const loadDoctors = async () => {
    try {
      const docs = await medicaiApi.getDoctors();
      if (Array.isArray(docs) && docs.length > 0) {
        setDoctorsList(docs);
      }
    } catch (err) {
      console.log('Doctors load fallback:', err);
    }
  };

  const loadSlots = async (docName: string, dateStr: string) => {
    setSlotsLoading(true);
    try {
      const res = await medicaiApi.getDoctorAvailableSlots(docName, dateStr);
      const slots = res.slots || [];
      setDoctorSlots(slots);
      const currentStillAvail = slots.find((s: any) => s.slot === appSlot && s.available);
      if (!currentStillAvail) {
        const firstAvail = slots.find((s: any) => s.available);
        setAppSlot(firstAvail ? firstAvail.slot : '');
      }
    } catch (err) {
      console.log('Slots check error:', err);
    } finally {
      setSlotsLoading(false);
    }
  };

  const refreshAppointments = async () => {
    try {
      const res = await medicaiApi.getActiveAppointments();
      setActiveAppointments(Array.isArray(res) ? res : []);
    } catch (err) {
      console.log('Appointments load error:', err);
    }
  };

  const loadAuditLogs = async () => {
    setAuditLoading(true);
    try {
      const res = await medicaiApi.getAuditLogs();
      setAuditLogs(Array.isArray(res) ? res : []);
      const comp = await medicaiApi.getComplianceStatus();
      if (comp?.compliance_score) setComplianceScore(comp.compliance_score);
    } catch (err) {
      console.log('Audit logs fetch error:', err);
    } finally {
      setAuditLoading(false);
    }
  };

  const togglePhenotype = (p: string) => {
    setSelectedPhenotypes(prev =>
      prev.includes(p) ? prev.filter(item => item !== p) : [...prev, p]
    );
  };

  const togglePreviousTest = (t: string) => {
    setPreviousTests(prev =>
      prev.includes(t) ? prev.filter(item => item !== t) : [...prev, t]
    );
  };

  // Handlers
  const handlePrioritize = async () => {
    const combinedPhenotypes = [...selectedPhenotypes];
    if (customPhenotype.trim()) combinedPhenotypes.push(customPhenotype.trim());
    if (combinedPhenotypes.length === 0) {
      return alert('Please select or enter at least one clinical phenotype.');
    }
    setRareLoading(true);
    try {
      const res = await medicaiApi.prioritizeRareTests({
        onset_age: onsetAge,
        phenotypes: combinedPhenotypes,
        suspected_inheritance: suspectedInheritance,
        previous_tests: previousTests
      });
      setRareResult(res);
      setRankedTests(res.tests || []);
      speakClinicalGuidance(res.medication_guidance?.speech_script || res.plain_summary || '');
      loadAuditLogs();
    } catch {
      alert('Failed to connect to backend API.');
    } finally {
      setRareLoading(false);
    }
  };

  const handleSearchRare = async () => {
    try {
      const res = await medicaiApi.searchRareDiseases(searchQuery);
      setSearchResults(res.diseases || []);
      setSearchMessage(res.message || '');
    } catch {
      alert('Error searching rare diseases.');
    }
  };

  const handleChat = async () => {
    if (!chatQuery.trim()) return;
    setChatLoading(true);
    try {
      const res = await medicaiApi.queryGraphRAG(chatQuery);
      setChatResponse(res);
    } catch {
      alert('Error contacting GraphRAG service.');
    } finally {
      setChatLoading(false);
    }
  };

  const handleCancerPredict = async () => {
    setCancerLoading(true);
    try {
      const res = await medicaiApi.predictCancer({
        Age: cancerAge,
        Gender: cancerGender,
        BMI: cancerBmi,
        Smoking: cancerSmoking,
        GeneticRisk: cancerGenRisk,
        PhysicalActivity: cancerActivity,
        AlcoholIntake: cancerAlcohol,
        CancerHistory: cancerHistory
      });
      setCancerResult(res);
      speakClinicalGuidance(res.medication_guidance?.speech_script || res.plain_summary || '');
      loadAuditLogs();
    } catch {
      alert('Cancer prediction failed. Verify backend is running.');
    } finally {
      setCancerLoading(false);
    }
  };

  const handleHeartPredict = async () => {
    setHeartLoading(true);
    try {
      const res = await medicaiApi.predictHeart({
        age: heartAge,
        sex: heartSex,
        cp: heartCp,
        trestbps: heartBps,
        chol: heartChol,
        fbs: heartFbs,
        restecg: heartRestecg,
        thalach: heartThalach,
        exang: heartExang,
        oldpeak: heartOldpeak,
        slope: heartSlope,
        ca: heartCa,
        thal: heartThal
      });
      setHeartResult(res);
      speakClinicalGuidance(res.medication_guidance?.speech_script || res.plain_summary || '');
      loadAuditLogs();
    } catch {
      alert('Heart prediction failed. Verify backend is running.');
    } finally {
      setHeartLoading(false);
    }
  };

  const handleAudioUpload = async (fileOverride?: File) => {
    const targetFile = fileOverride || audioFile;
    if (!targetFile) {
      setParkinsonError('Please select a .wav audio file or generate a sample vocal recording.');
      return;
    }
    setParkinsonError('');
    setParkinsonLoading(true);
    try {
      const res = await medicaiApi.predictParkinsonAudio(targetFile);
      setParkinsonResult(res);
      speakClinicalGuidance(res.medication_guidance?.speech_script || res.plain_summary || '');
      loadAuditLogs();
    } catch (err: any) {
      setParkinsonError(err.response?.data?.detail || 'Audio processing failed. Ensure file is a valid PCM .wav recording.');
    } finally {
      setParkinsonLoading(false);
    }
  };

  const handleManualParkinsonPredict = async () => {
    setParkinsonError('');
    setParkinsonLoading(true);
    try {
      const res = await medicaiApi.predictParkinsonFeatures({
        fo: parkFo,
        fhi: parkFhi,
        flo: parkFlo,
        jitter: parkJitter,
        shimmer: parkShimmer,
        hnr: parkHnr,
        spread1: parkSpread1
      });
      setParkinsonResult(res);
      speakClinicalGuidance(res.medication_guidance?.speech_script || res.plain_summary || '');
      loadAuditLogs();
    } catch (err: any) {
      setParkinsonError(err.response?.data?.detail || 'Acoustic feature evaluation failed.');
    } finally {
      setParkinsonLoading(false);
    }
  };

  const handleDiabetesPredict = async () => {
    setDiabetesLoading(true);
    try {
      const res = await medicaiApi.predictDiabetes({
        Age: diabAge,
        BMI: diabBmi,
        Glucose: diabGlucose,
        HbA1c: diabHba1c,
        Insulin: diabInsulin,
        SystolicBP: diabBp,
        DiabetesPedigree: diabPedigree,
        PhysicalActivityHours: diabActivity
      });
      setDiabetesResult(res);
      speakClinicalGuidance(res.medication_guidance?.speech_script || res.plain_summary || '');
      loadAuditLogs();
    } catch {
      alert('Diabetes prediction failed.');
    } finally {
      setDiabetesLoading(false);
    }
  };

  const handleKidneyPredict = async () => {
    setKidneyLoading(true);
    try {
      const res = await medicaiApi.predictKidney({
        Age: kidneyAge,
        Gender: kidneyGender,
        SerumCreatinine: kidneyCreatinine,
        BUN: kidneyBun,
        UrineAlbumin: kidneyAlbumin,
        SystolicBP: kidneyBp,
        Hemoglobin: kidneyHb
      });
      setKidneyResult(res);
      speakClinicalGuidance(res.medication_guidance?.speech_script || res.plain_summary || '');
      loadAuditLogs();
    } catch {
      alert('Kidney disease evaluation failed.');
    } finally {
      setKidneyLoading(false);
    }
  };

  const handleRespPredict = async () => {
    setRespLoading(true);
    try {
      const res = await medicaiApi.predictRespiratory({
        Age: respAge,
        SpO2: respSpo2,
        RespiratoryRate: respRate,
        Temperature: respTemp,
        CoughDurationDays: respCoughDays,
        DyspneaGrade: respDyspnea,
        CracklesWheezing: respCrackles,
        SmokingPackYears: respSmokingYears,
        Confusion: respConfusion,
        BUN: respBun,
        SystolicBP: respSbp
      });
      setRespResult(res);
      speakClinicalGuidance(res.medication_guidance?.speech_script || res.plain_summary || '');
      loadAuditLogs();
    } catch {
      alert('Respiratory evaluation failed.');
    } finally {
      setRespLoading(false);
    }
  };

  const handleBook = async () => {
    setAppointmentError('');
    setAppointmentMsg('');

    if (patientName.trim().length < 2) {
      setAppointmentError('Please enter the patient full name (at least 2 characters).');
      return;
    }
    if (patientEmail.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(patientEmail.trim())) {
      setAppointmentError('Please enter a valid patient email address.');
      return;
    }
    if (!appSlot) {
      setAppointmentError('Please select an available time slot.');
      return;
    }

    setBookingLoading(true);
    try {
      const res = await medicaiApi.bookAppointment({
        patient_name: patientName.trim(),
        patient_email: patientEmail.trim(),
        patient_phone: patientPhone.trim(),
        doctor_name: selectedDoctor,
        department: selectedDepartment,
        date: appDate,
        slot: appSlot,
        consultation_type: consultType,
        chief_complaint: chiefComplaint.trim() || 'Clinical consultation & AI screening review'
      });
      setAppointmentMsg(res.message);
      setLatestBookedTicket(res.appointment);
      refreshAppointments();
      loadSlots(selectedDoctor, appDate);
      loadAuditLogs();
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Booking failed. Verify backend server is active.';
      setAppointmentError(errorMsg);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelAppointment = async (refId: string) => {
    if (!window.confirm(`Are you sure you want to cancel appointment ${refId}? The reserved time slot will be released.`)) {
      return;
    }
    try {
      const res = await medicaiApi.cancelAppointment(refId);
      alert(res.message);
      if (latestBookedTicket?.reference_id === refId) {
        setLatestBookedTicket({ ...latestBookedTicket, status: 'Cancelled' });
      }
      refreshAppointments();
      loadSlots(selectedDoctor, appDate);
      loadAuditLogs();
    } catch {
      alert('Cancellation failed.');
    }
  };

  const handleDownloadAppointmentSlip = async (refId: string) => {
    try {
      await medicaiApi.downloadAppointmentPdf(refId);
    } catch {
      alert('Could not download appointment PDF slip.');
    }
  };

  const handleVerify = async () => {
    if (!verifyInput.trim()) return alert('Please enter an appointment Reference ID or SHA-256 hash.');
    try {
      const res = await medicaiApi.verifySecurityRecord(verifyInput.trim());
      setVerifyResult(res);
    } catch {
      alert('Verification request failed.');
    }
  };

  const handleAnonymize = async () => {
    if (!rawClinicalText.trim()) return;
    try {
      const res = await medicaiApi.anonymizeData(rawClinicalText);
      setAnonymizedOutput(res);
      loadAuditLogs();
    } catch {
      alert('Anonymization request failed.');
    }
  };

  const buildMasterReportPayload = () => {
    const activeApt =
      latestBookedTicket ||
      activeAppointments.find((a) => a.status !== 'Cancelled') ||
      activeAppointments[0] ||
      null;

    return {
      patient_name: patientName.trim() || 'Clinical Screening Patient',
      patient_email: patientEmail.trim() || undefined,
      patient_phone: patientPhone.trim() || undefined,
      age_gender: cancerResult
        ? `Age ${cancerAge}, ${cancerGender === 1 ? 'Male' : 'Female'}`
        : heartResult
        ? `Age ${heartAge}, ${heartSex === 1 ? 'Male' : 'Female'}`
        : diabetesResult
        ? `Age ${diabAge}`
        : kidneyResult
        ? `Age ${kidneyAge}, ${kidneyGender === 1 ? 'Male' : 'Female'}`
        : respResult
        ? `Age ${respAge}`
        : rareResult
        ? `${onsetAge} / ${suspectedInheritance.split(' ')[0]}`
        : 'Not Specified',
      cancer_risk: cancerResult?.risk_percentage ?? null,
      heart_risk: heartResult?.probability_percentage ?? null,
      parkinson_status: parkinsonResult?.status ?? null,
      diabetes_risk: diabetesResult?.risk_percentage ?? null,
      kidney_stage: kidneyResult?.kdigo_stage ?? null,
      respiratory_risk: respResult?.respiratory_risk_percentage ?? null,
      ranked_tests: rankededTests.length > 0 ? rankededTests : null,
      cancer_details: cancerResult,
      heart_details: heartResult,
      parkinson_details: parkinsonResult,
      diabetes_details: diabetesResult,
      kidney_details: kidneyResult,
      respiratory_details: respResult,
      rare_details: rareResult,
      latest_appointment: activeApt
    };
  };

  const handleDownloadMasterPdf = async () => {
    setReportDownloading(true);
    try {
      await medicaiApi.downloadPdfReport(buildMasterReportPayload());
      loadAuditLogs();
    } catch {
      alert('Could not download clinical PDF. Verify backend is running.');
    } finally {
      setReportDownloading(false);
    }
  };

  const openMasterPrintPreview = () => {
    setPrintAppointmentTarget(null);
    setPrintPreviewMode('master');
  };

  const openAppointmentPrintPreview = (apt: any) => {
    setPrintAppointmentTarget(apt);
    setPrintPreviewMode('appointment');
  };

  const triggerBrowserPrint = () => {
    window.print();
  };

  const bookWithSpecialist = (docName: string, dept: string) => {
    setSelectedDoctor(docName);
    setSelectedDepartment(dept);
    setActiveTab('appointments');
  };

  const evaluatedDomains = [
    cancerResult && { title: 'Cancer Risk (Oncology)', score: `${cancerResult.risk_percentage}%`, tier: cancerResult.risk_category, data: cancerResult },
    heartResult && { title: 'Heart Disease (Cardiology)', score: `${heartResult.probability_percentage}%`, tier: heartResult.risk_category, data: heartResult },
    parkinsonResult && { title: "Parkinson's Voice (Neurology)", score: `${parkinsonResult.risk_percentage}%`, tier: parkinsonResult.risk_category, data: parkinsonResult },
    diabetesResult && { title: 'Type 2 Diabetes (Endocrinology)', score: `${diabetesResult.risk_percentage}%`, tier: diabetesResult.clinical_tier, data: diabetesResult },
    kidneyResult && { title: 'Chronic Kidney Disease (Nephrology)', score: `eGFR ${kidneyResult.calculated_egfr}`, tier: kidneyResult.kdigo_stage, data: kidneyResult },
    respResult && { title: 'Pneumonia & Respiratory (Pulmonology)', score: `${respResult.respiratory_risk_percentage}% (CURB-65: ${respResult.curb65_severity_score})`, tier: respResult.triage_level, data: respResult },
  ].filter(Boolean) as any[];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Top Navbar */}
      <header className="no-print bg-gradient-to-r from-blue-950 via-indigo-900 to-sky-900 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md ring-1 ring-white/20">
              <Activity className="h-7 w-7 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight">MedicAI Enterprise Clinical Intelligence</h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" /> HIPAA / GDPR Secured
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                Multi-Disease Predictors • 100% Real Persistent Appointments • Cryptographic Audit Ledger • Explainable AI
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <span className="px-3 py-1.5 rounded-full bg-blue-950/60 text-blue-100 font-mono flex items-center gap-2 border border-white/10">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              FastAPI REST: {backendStatus}
            </span>
            <button
              type="button"
              onClick={() => {
                if (isSpeaking) stopSpeaking();
                setVoiceEnabled(prev => !prev);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium border text-xs transition ${
                voiceEnabled
                  ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-100 border-emerald-400/40'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/20'
              }`}
              title="Automatically read medication and severity guidance aloud when results arrive"
            >
              {voiceEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              {isSpeaking ? 'Speaking...' : voiceEnabled ? 'Voice: ON' : 'Voice: OFF'}
            </button>
            {isSpeaking && (
              <button
                type="button"
                onClick={stopSpeaking}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-xs transition"
              >
                <VolumeX className="h-3.5 w-3.5" /> Stop
              </button>
            )}
            <button
              onClick={openMasterPrintPreview}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-lg font-medium border border-white/20 text-xs transition"
            >
              <Printer className="h-3.5 w-3.5" />
              Print Report
            </button>
            <button
              onClick={handleDownloadMasterPdf}
              disabled={reportDownloading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-medium shadow text-xs transition"
            >
              <Download className="h-3.5 w-3.5" />
              {reportDownloading ? 'Compiling PDF...' : 'Download Master PDF'}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-6 flex overflow-x-auto gap-1 border-t border-white/10 text-xs font-medium scrollbar-thin">
          {[
            { id: 'rare', label: '🧬 Rare Disease Odyssey' },
            { id: 'cancer', label: '🎗️ Cancer Risk (AUC 0.86)' },
            { id: 'heart', label: '❤️ Heart Disease (0.97 Recall)' },
            { id: 'parkinson', label: '🧠 Parkinson Voice (KNN)' },
            { id: 'diabetes', label: '💉 Type 2 Diabetes (ADA 2026)', isNew: true },
            { id: 'kidney', label: '🫘 Chronic Kidney Disease (KDIGO)', isNew: true },
            { id: 'respiratory', label: '🫁 Pneumonia & Respiratory (BTS)', isNew: true },
            { id: 'appointments', label: '🗓️ Verified Doctor Appointments (REAL)', highlight: true },
            { id: 'security', label: '🛡️ Security & Trust Center', highlight: true },
            { id: 'chatbot', label: '💬 Medical Chatbot (GraphRAG)' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-3 border-b-2 whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'border-cyan-300 text-cyan-200 bg-white/10 font-bold'
                  : 'border-transparent text-blue-100 hover:text-white hover:bg-white/5'
              } ${tab.highlight ? 'text-amber-200' : ''}`}
            >
              {tab.label}
              {tab.isNew && (
                <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-cyan-400 text-blue-950 uppercase">
                  New
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Main Container */}
      <main className="no-print max-w-7xl mx-auto px-6 py-8">
        {/* ==================================================================== */}
        {/* TAB 1: RARE DISEASES DIAGNOSTIC ODYSSEY */}
        {/* ==================================================================== */}
        {activeTab === 'rare' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Dna className="h-6 w-6 text-blue-600" />
                    Multi-Agent Diagnostic Test Prioritization System
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Select patient age of onset, inheritance pattern, and phenotypes to compute personalized diagnostic test yields across 11,456 indexed Orphanet disorders.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={openMasterPrintPreview}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-xs transition"
                  >
                    <Printer className="h-4 w-4" /> Print Report
                  </button>
                  <button
                    onClick={handleDownloadMasterPdf}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow font-medium text-xs transition"
                  >
                    <FileText className="h-4 w-4" /> Download PDF
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Form */}
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                  <h3 className="font-semibold text-sm text-slate-700">Patient Phenotype & Presentation</h3>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Age of Onset</label>
                    <select
                      value={onsetAge}
                      onChange={e => setOnsetAge(e.target.value)}
                      className="w-full text-sm border-slate-300 rounded-lg p-2.5 bg-white border"
                    >
                      <option>Neonatal (Birth - 28 days)</option>
                      <option>Infancy (1 - 24 months)</option>
                      <option>Childhood (2 - 12 years)</option>
                      <option>Adolescent (12 - 18 years)</option>
                      <option>Adult / All ages</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Suspected Inheritance Pattern</label>
                    <select
                      value={suspectedInheritance}
                      onChange={e => setSuspectedInheritance(e.target.value)}
                      className="w-full text-sm border-slate-300 rounded-lg p-2.5 bg-white border"
                    >
                      <option>Autosomal recessive (Consanguinity / Carrier parents)</option>
                      <option>Autosomal dominant (Affected parent/child)</option>
                      <option>X-linked recessive</option>
                      <option>Mitochondrial (Maternal inheritance)</option>
                      <option>De novo / Sporadic / Unknown</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Clinical Phenotype Clusters</label>
                    <div className="space-y-1.5">
                      {PHENOTYPE_OPTIONS.map((p) => (
                        <label key={p} className="flex items-start gap-2 text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedPhenotypes.includes(p)}
                            onChange={() => togglePhenotype(p)}
                            className="mt-0.5 accent-blue-600"
                          />
                          <span>{p}</span>
                        </label>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={customPhenotype}
                      onChange={e => setCustomPhenotype(e.target.value)}
                      placeholder="Optional custom symptom (e.g. aortic aneurysm, lactic acidosis)..."
                      className="w-full mt-2 text-xs border-slate-300 rounded-lg p-2 border bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Previously Completed Tests (Optional)</label>
                    <div className="flex flex-wrap gap-2">
                      {PREVIOUS_TEST_OPTIONS.map((t) => (
                        <label key={t} className="inline-flex items-center gap-1.5 text-[11px] bg-white px-2.5 py-1 rounded-lg border border-slate-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={previousTests.includes(t)}
                            onChange={() => togglePreviousTest(t)}
                            className="accent-blue-600"
                          />
                          <span>{t}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handlePrioritize}
                    disabled={rareLoading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition shadow flex items-center justify-center gap-2"
                  >
                    {rareLoading ? 'Computing Test Rankings across Orphanet...' : 'Run Prioritization Agent'}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Ranked Results */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-slate-700">Prioritized Test Hierarchy &amp; Medication Guidance</h3>
                  {rareResult?.medication_guidance && (
                    <MedicationGuidancePanel
                      guidance={rareResult.medication_guidance}
                      onConsultDoctor={bookWithSpecialist}
                      onSpeak={(txt) => speakClinicalGuidance(txt, true)}
                      onStopSpeak={stopSpeaking}
                      isSpeaking={isSpeaking}
                    />
                  )}
                  {rareResult?.plain_summary && (
                    <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-950 font-medium">
                      {rareResult.plain_summary}
                    </div>
                  )}
                  {rareResult?.echo_inputs && <InputEchoPanel inputs={rareResult.echo_inputs} />}
                  {rankededTests.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-xl text-slate-400 text-sm">
                      Select your clinical presentation on the left and click "Run Prioritization Agent" to compute personalized diagnostic test yields.
                    </div>
                  ) : (
                    rankededTests.map((test, idx) => (
                      <div key={idx} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-sm text-slate-900">#{idx + 1}: {test.test_name}</span>
                          <span className="px-2.5 py-1 bg-blue-100 text-blue-800 font-bold text-xs rounded-full whitespace-nowrap">
                            {test.probability_ranking_pct}% Yield
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                          <span>Cost: <b className="text-slate-700">{test.cost_estimate}</b></span>
                          <span>TAT: <b className="text-slate-700">{test.turnaround_time}</b></span>
                          <span>Specialty: <b className="text-slate-700">{test.target_specialty}</b></span>
                        </div>
                        <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                          💡 {test.clinical_rationale}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Rare Disease Database Search */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 text-base mb-3 flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-600" />
                Verified Orphanet Reference Disorder Lookup
              </h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Enter disorder name, keyword, ICD-10 or OrphaCode (e.g. Alexander, Marfan, Gaucher, Q77.4, 166024)..."
                  className="flex-1 text-sm border-slate-300 rounded-xl p-2.5 border bg-slate-50"
                />
                <button
                  onClick={handleSearchRare}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-medium"
                >
                  Search
                </button>
              </div>

              {searchMessage && (
                <p className="text-xs text-slate-600 mt-3 font-medium">{searchMessage}</p>
              )}

              {searchResults.length > 0 && (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b text-slate-600">
                        <th className="p-2">OrphaCode</th>
                        <th className="p-2">Disorder Name</th>
                        <th className="p-2">Onset</th>
                        <th className="p-2">Inheritance</th>
                        <th className="p-2">ICD-10</th>
                        <th className="p-2">Prevalence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map((row, i) => (
                        <tr key={i} className="border-b hover:bg-slate-50">
                          <td className="p-2 font-mono text-blue-600 font-semibold">{row.OrphaCode}</td>
                          <td className="p-2 font-medium text-slate-800">{row.Name}</td>
                          <td className="p-2 text-slate-600">{row.AgeOfOnset}</td>
                          <td className="p-2 text-slate-600">{row.TypeOfInheritance}</td>
                          <td className="p-2 font-mono text-slate-500">{row['ICD-10']}</td>
                          <td className="p-2 text-slate-500">{row.Prevalence}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: CANCER PREDICTOR */}
        {/* ==================================================================== */}
        {activeTab === 'cancer' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="h-6 w-6 text-rose-600" />
                  Cancer Risk Stratification (Multi-Modal Gradient Boosting AUC: 0.864)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  All 8 clinical inputs are evaluated against NCCN v2026.1 practice standards with SHAP feature attributions.
                </p>
              </div>
              <button
                onClick={() => bookWithSpecialist('Dr. R. K. Sharma', 'Oncology')}
                className="px-3.5 py-2 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Stethoscope className="h-4 w-4" /> Consult Oncologist Dr. R. K. Sharma
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Patient Age: {cancerAge} yrs</label>
                    <input type="range" min="18" max="95" value={cancerAge} onChange={e => setCancerAge(+e.target.value)} className="w-full accent-rose-600" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Biological Sex</label>
                    <select value={cancerGender} onChange={e => setCancerGender(+e.target.value)} className="w-full text-xs p-2 rounded-lg border bg-white">
                      <option value={1}>Male</option>
                      <option value={0}>Female</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                    <span>Body Mass Index (BMI)</span>
                    <span className="font-mono text-slate-900">{cancerBmi} kg/m²</span>
                  </div>
                  <input type="range" min="14" max="50" step="0.5" value={cancerBmi} onChange={e => setCancerBmi(+e.target.value)} className="w-full accent-rose-600" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Physical Activity (hrs/week): {cancerActivity}</label>
                    <input type="range" min="0" max="10" step="0.5" value={cancerActivity} onChange={e => setCancerActivity(+e.target.value)} className="w-full accent-rose-600" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Alcohol Intake (units/wk): {cancerAlcohol}</label>
                    <input type="range" min="0" max="10" step="0.5" value={cancerAlcohol} onChange={e => setCancerAlcohol(+e.target.value)} className="w-full accent-rose-600" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Tobacco Smoking Exposure</label>
                  <select value={cancerSmoking} onChange={e => setCancerSmoking(+e.target.value)} className="w-full text-xs p-2.5 rounded-lg border bg-white">
                    <option value={0}>Non-Smoker / Never</option>
                    <option value={1}>Active Smoker / Past Heavy Smoker</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Genetic / Hereditary Risk Tier</label>
                  <select value={cancerGenRisk} onChange={e => setCancerGenRisk(+e.target.value)} className="w-full text-xs p-2.5 rounded-lg border bg-white">
                    <option value={0}>Tier 0: Low (No known family cancer clusters)</option>
                    <option value={1}>Tier 1: Moderate (Second-degree relative)</option>
                    <option value={2}>Tier 2: High (First-degree relative / BRCA/Lynch markers)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Prior Personal / Family History</label>
                  <select value={cancerHistory} onChange={e => setCancerHistory(+e.target.value)} className="w-full text-xs p-2.5 rounded-lg border bg-white">
                    <option value={0}>Negative History</option>
                    <option value={1}>Positive History (Confirmed Malignancy)</option>
                  </select>
                </div>

                <button
                  onClick={handleCancerPredict}
                  disabled={cancerLoading}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-xl text-sm shadow transition"
                >
                  {cancerLoading ? 'Evaluating Biomarkers...' : 'Calculate Cancer Risk Index'}
                </button>
              </div>

              {cancerResult ? (
                <div className="space-y-4">
                  <MedicationGuidancePanel
                    guidance={cancerResult.medication_guidance}
                    onConsultDoctor={bookWithSpecialist}
                    onSpeak={(txt) => speakClinicalGuidance(txt, true)}
                    onStopSpeak={stopSpeaking}
                    isSpeaking={isSpeaking}
                  />
                  <div className={`p-6 rounded-2xl border flex flex-col justify-center items-center text-center ${cancerResult.is_high_risk ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
                    {cancerResult.is_high_risk ? <AlertTriangle className="h-10 w-10 text-rose-600 mb-2" /> : <CheckCircle className="h-10 w-10 text-emerald-600 mb-2" />}
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">{cancerResult.risk_category}</span>
                    <h3 className="text-3xl font-extrabold text-slate-900">{cancerResult.risk_percentage}% Risk</h3>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full mt-1 bg-white shadow-sm border">
                      95% CI: {cancerResult.confidence_interval_95}
                    </span>
                    {cancerResult.plain_summary && (
                      <p className="text-xs text-slate-800 mt-3 bg-white/80 p-2.5 rounded-lg border border-slate-200 font-medium">{cancerResult.plain_summary}</p>
                    )}
                    <p className="text-xs text-slate-700 mt-2 font-medium">{cancerResult.recommendation}</p>
                    <div className="mt-3 pt-3 border-t border-slate-200/60 w-full text-[11px] text-slate-500 space-y-1">
                      <div><b>Benchmark:</b> {cancerResult.model_used} • {cancerResult.paper_auc_benchmark}</div>
                      <div><b>Clinical Standard:</b> {cancerResult.guideline_standards}</div>
                      <div className="font-mono text-[10px] text-slate-400">Audit Hash: {cancerResult.verification_hash?.slice(0, 24)}...</div>
                    </div>
                  </div>

                  <InputEchoPanel inputs={cancerResult.echo_inputs} />

                  {cancerResult.shap_feature_importance && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <h4 className="text-xs font-bold text-slate-700 mb-2">Explainable AI (XAI) Biomarker Contributions</h4>
                      <div className="space-y-2">
                        {cancerResult.shap_feature_importance.map((f: any, idx: number) => (
                          <div key={idx} className="text-xs">
                            <div className="flex justify-between text-slate-600 mb-0.5">
                              <span>{f.feature}</span>
                              <span className={f.direction === 'elevating' ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                                {f.direction === 'elevating' ? `+${f.impact_pct}%` : `${f.impact_pct}%`}
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${f.direction === 'elevating' ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min(100, Math.abs(f.impact_pct) * 3)}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button onClick={openMasterPrintPreview} className="flex-1 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                      <Printer className="h-3.5 w-3.5" /> Print Clinical Report
                    </button>
                    <button onClick={handleDownloadMasterPdf} className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                      <Download className="h-3.5 w-3.5" /> Download PDF
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-xs">
                  <Activity className="h-10 w-10 text-slate-300 mb-2" />
                  Enter patient biomarkers on the left and click "Calculate Cancer Risk Index" to get your personalized result.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: HEART DISEASE (ALL 13 CLINICAL INPUTS) */}
        {/* ==================================================================== */}
        {activeTab === 'heart' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Heart className="h-6 w-6 text-red-600" />
                  Cardiovascular Heart Disease Screening (SVM Recall: 0.972)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  All 13 UCI Cleveland hemodynamic inputs are adjustable with ACC/AHA guideline interpretation and SHAP breakdown.
                </p>
              </div>
              <button
                onClick={() => bookWithSpecialist('Dr. Vikramaditya Rao', 'Cardiology')}
                className="px-3.5 py-2 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Stethoscope className="h-4 w-4" /> Consult Cardiologist Dr. Vikramaditya Rao
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3.5 bg-slate-50 p-5 rounded-xl border border-slate-200">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Patient Age: {heartAge} yrs</label>
                    <input type="range" min="20" max="95" value={heartAge} onChange={e => setHeartAge(+e.target.value)} className="w-full accent-red-600" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Biological Sex</label>
                    <select value={heartSex} onChange={e => setHeartSex(+e.target.value)} className="w-full text-xs p-2 rounded-lg border bg-white">
                      <option value={1}>Male</option>
                      <option value={0}>Female</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Resting BP: {heartBps} mmHg</label>
                    <input type="range" min="85" max="220" value={heartBps} onChange={e => setHeartBps(+e.target.value)} className="w-full accent-red-600" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Cholesterol: {heartChol} mg/dL</label>
                    <input type="range" min="110" max="500" value={heartChol} onChange={e => setHeartChol(+e.target.value)} className="w-full accent-red-600" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Max Heart Rate: {heartThalach} bpm</label>
                    <input type="range" min="70" max="210" value={heartThalach} onChange={e => setHeartThalach(+e.target.value)} className="w-full accent-red-600" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">ST Depression (Oldpeak): {heartOldpeak} mm</label>
                    <input type="range" min="0" max="6" step="0.1" value={heartOldpeak} onChange={e => setHeartOldpeak(+e.target.value)} className="w-full accent-red-600" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Chest Pain Type (CP)</label>
                    <select value={heartCp} onChange={e => setHeartCp(+e.target.value)} className="w-full text-xs p-2 rounded-lg border bg-white">
                      <option value={0}>0: Asymptomatic</option>
                      <option value={1}>1: Atypical Angina</option>
                      <option value={2}>2: Non-Anginal Pain</option>
                      <option value={3}>3: Typical Angina</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Exercise Induced Angina</label>
                    <select value={heartExang} onChange={e => setHeartExang(+e.target.value)} className="w-full text-xs p-2 rounded-lg border bg-white">
                      <option value={0}>No (0)</option>
                      <option value={1}>Yes (1)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">FBS &gt; 120</label>
                    <select value={heartFbs} onChange={e => setHeartFbs(+e.target.value)} className="w-full text-xs p-2 rounded-lg border bg-white">
                      <option value={0}>No (0)</option>
                      <option value={1}>Yes (1)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Resting ECG</label>
                    <select value={heartRestecg} onChange={e => setHeartRestecg(+e.target.value)} className="w-full text-xs p-2 rounded-lg border bg-white">
                      <option value={0}>Normal (0)</option>
                      <option value={1}>ST-T Abn (1)</option>
                      <option value={2}>LVH (2)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">ST Slope</label>
                    <select value={heartSlope} onChange={e => setHeartSlope(+e.target.value)} className="w-full text-xs p-2 rounded-lg border bg-white">
                      <option value={0}>Upsloping (0)</option>
                      <option value={1}>Flat (1)</option>
                      <option value={2}>Downsloping (2)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Major Vessels (CA: 0-4)</label>
                    <select value={heartCa} onChange={e => setHeartCa(+e.target.value)} className="w-full text-xs p-2 rounded-lg border bg-white">
                      <option value={0}>0 vessels</option>
                      <option value={1}>1 vessel</option>
                      <option value={2}>2 vessels</option>
                      <option value={3}>3 vessels</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Thalassemia (Thal)</label>
                    <select value={heartThal} onChange={e => setHeartThal(+e.target.value)} className="w-full text-xs p-2 rounded-lg border bg-white">
                      <option value={2}>Normal (2)</option>
                      <option value={1}>Fixed Defect (1)</option>
                      <option value={3}>Reversible Defect (3)</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleHeartPredict}
                  disabled={heartLoading}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl text-sm shadow transition"
                >
                  {heartLoading ? 'Calculating Hemodynamics...' : 'Evaluate Heart Risk Index'}
                </button>
              </div>

              {heartResult ? (
                <div className="space-y-4">
                  <MedicationGuidancePanel
                    guidance={heartResult.medication_guidance}
                    onConsultDoctor={bookWithSpecialist}
                    onSpeak={(txt) => speakClinicalGuidance(txt, true)}
                    onStopSpeak={stopSpeaking}
                    isSpeaking={isSpeaking}
                  />
                  <div className={`p-6 rounded-2xl border flex flex-col justify-center items-center text-center ${heartResult.is_positive ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
                    {heartResult.is_positive ? <AlertTriangle className="h-10 w-10 text-red-600 mb-2" /> : <CheckCircle className="h-10 w-10 text-emerald-600 mb-2" />}
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">{heartResult.risk_category}</span>
                    <h3 className="text-3xl font-extrabold text-slate-900">{heartResult.probability_percentage}% Cardiac Probability</h3>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full mt-1 bg-white shadow-sm border">
                      95% CI: {heartResult.confidence_interval_95}
                    </span>
                    {heartResult.plain_summary && (
                      <p className="text-xs text-slate-800 mt-3 bg-white/80 p-2.5 rounded-lg border border-slate-200 font-medium">{heartResult.plain_summary}</p>
                    )}
                    <p className="text-xs text-slate-700 mt-2 font-medium">{heartResult.recommendation}</p>
                    <div className="mt-3 pt-3 border-t border-slate-200/60 w-full text-[11px] text-slate-500 space-y-1">
                      <div><b>Benchmark:</b> {heartResult.model_used} • Recall: {heartResult.paper_recall_benchmark}</div>
                      <div><b>Guideline:</b> {heartResult.guideline_standards}</div>
                      <div className="font-mono text-[10px] text-slate-400">Audit Hash: {heartResult.verification_hash?.slice(0, 24)}...</div>
                    </div>
                  </div>

                  <InputEchoPanel inputs={heartResult.echo_inputs} />

                  {heartResult.shap_feature_importance && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <h4 className="text-xs font-bold text-slate-700 mb-2">Explainable AI (XAI) Hemodynamic Breakdown</h4>
                      <div className="space-y-2">
                        {heartResult.shap_feature_importance.map((f: any, idx: number) => (
                          <div key={idx} className="text-xs">
                            <div className="flex justify-between text-slate-600 mb-0.5">
                              <span>{f.feature}</span>
                              <span className={f.direction === 'elevating' ? 'text-red-600 font-bold' : 'text-emerald-600 font-bold'}>
                                {f.direction === 'elevating' ? `+${f.impact_pct}%` : `${f.impact_pct}%`}
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${f.direction === 'elevating' ? 'bg-red-500' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min(100, Math.abs(f.impact_pct) * 3)}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button onClick={openMasterPrintPreview} className="flex-1 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                      <Printer className="h-3.5 w-3.5" /> Print Clinical Report
                    </button>
                    <button onClick={handleDownloadMasterPdf} className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                      <Download className="h-3.5 w-3.5" /> Download PDF
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-xs">
                  <Heart className="h-10 w-10 text-slate-300 mb-2" />
                  Adjust age, BP, cholesterol, ECG, angina, and ST depression on the left, then click "Evaluate Heart Risk Index".
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 4: PARKINSON'S VOICE SCREENING (AUDIO + MANUAL FEATURES) */}
        {/* ==================================================================== */}
        {activeTab === 'parkinson' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Brain className="h-6 w-6 text-purple-600" />
                  Parkinson's Disease Voice Screening (Acoustic Phonatory Analysis)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Analyze a sustained vowel /a/ PCM .WAV recording or enter MDVP acoustic parameters directly.
                </p>
              </div>
              <button
                onClick={() => bookWithSpecialist('Dr. Ananya Patel', 'Neurology & Movement Disorders')}
                className="px-3.5 py-2 bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Stethoscope className="h-4 w-4" /> Consult Neurologist Dr. Ananya Patel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setParkinsonMode('audio')}
                    className={`flex-1 py-2 rounded-lg transition ${parkinsonMode === 'audio' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    Upload .WAV Recording
                  </button>
                  <button
                    type="button"
                    onClick={() => setParkinsonMode('manual')}
                    className={`flex-1 py-2 rounded-lg transition ${parkinsonMode === 'manual' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    Enter Acoustic Features
                  </button>
                </div>

                {parkinsonMode === 'audio' ? (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-slate-800">Upload Sustained Vowel Audio (.WAV)</h3>
                    <p className="text-xs text-slate-500">
                      Extracts fundamental frequency (Fo), cycle-to-cycle Jitter, Shimmer, and Harmonics-to-Noise Ratio (HNR) directly from PCM WAV samples.
                    </p>
                    <input
                      type="file"
                      accept=".wav"
                      onChange={e => setAudioFile(e.target.files?.[0] || null)}
                      className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const f = createSampleWavFile(false);
                          setAudioFile(f);
                          handleAudioUpload(f);
                        }}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-semibold flex items-center gap-1"
                      >
                        <Volume2 className="h-3.5 w-3.5" /> Test Healthy Sample .WAV
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const f = createSampleWavFile(true);
                          setAudioFile(f);
                          handleAudioUpload(f);
                        }}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-semibold flex items-center gap-1"
                      >
                        <Volume2 className="h-3.5 w-3.5" /> Test Tremor Sample .WAV
                      </button>
                    </div>
                    <button
                      onClick={() => handleAudioUpload()}
                      disabled={parkinsonLoading}
                      className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium shadow flex items-center justify-center gap-2 transition"
                    >
                      <Upload className="h-4 w-4" /> {parkinsonLoading ? 'Processing Acoustic Signal...' : 'Analyze Voice Recording'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">Fo Pitch (Hz)</label>
                        <input type="number" step="1" value={parkFo} onChange={e => setParkFo(+e.target.value)} className="w-full text-xs p-2 rounded-lg border bg-white" />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">Fhi Max (Hz)</label>
                        <input type="number" step="1" value={parkFhi} onChange={e => setParkFhi(+e.target.value)} className="w-full text-xs p-2 rounded-lg border bg-white" />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">Flo Min (Hz)</label>
                        <input type="number" step="1" value={parkFlo} onChange={e => setParkFlo(+e.target.value)} className="w-full text-xs p-2 rounded-lg border bg-white" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">MDVP Jitter (ratio)</label>
                        <input type="number" step="0.001" value={parkJitter} onChange={e => setParkJitter(+e.target.value)} className="w-full text-xs p-2 rounded-lg border bg-white" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">MDVP Shimmer (ratio)</label>
                        <input type="number" step="0.005" value={parkShimmer} onChange={e => setParkShimmer(+e.target.value)} className="w-full text-xs p-2 rounded-lg border bg-white" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">HNR (dB)</label>
                        <input type="number" step="0.5" value={parkHnr} onChange={e => setParkHnr(+e.target.value)} className="w-full text-xs p-2 rounded-lg border bg-white" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Spread1 (-10 to 0)</label>
                        <input type="number" step="0.2" value={parkSpread1} onChange={e => setParkSpread1(+e.target.value)} className="w-full text-xs p-2 rounded-lg border bg-white" />
                      </div>
                    </div>
                    <button
                      onClick={handleManualParkinsonPredict}
                      disabled={parkinsonLoading}
                      className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium shadow transition"
                    >
                      {parkinsonLoading ? 'Evaluating Acoustic Features...' : 'Run Acoustic Dysphonia Classifier'}
                    </button>
                  </div>
                )}

                {parkinsonError && (
                  <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-rose-800 text-xs flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
                    <span>{parkinsonError}</span>
                  </div>
                )}
              </div>

              {parkinsonResult ? (
                <div className="space-y-4">
                  <MedicationGuidancePanel
                    guidance={parkinsonResult.medication_guidance}
                    onConsultDoctor={bookWithSpecialist}
                    onSpeak={(txt) => speakClinicalGuidance(txt, true)}
                    onStopSpeak={stopSpeaking}
                    isSpeaking={isSpeaking}
                  />
                  <div className={`p-6 rounded-2xl border space-y-3 ${parkinsonResult.is_positive ? 'bg-amber-50 border-amber-300' : 'bg-purple-50/50 border-purple-200'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-900 uppercase">{parkinsonResult.risk_category}</span>
                      <span className="px-2.5 py-1 bg-purple-200 text-purple-900 font-bold text-xs rounded-full">
                        {parkinsonResult.risk_percentage}% Tremor Index
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{parkinsonResult.status}</h4>
                    {parkinsonResult.plain_summary && (
                      <p className="text-xs text-slate-800 bg-white/80 p-2.5 rounded-lg border border-slate-200 font-medium">{parkinsonResult.plain_summary}</p>
                    )}
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-xs pt-1">
                      <div className="p-2 bg-white rounded-lg border text-center">
                        <span className="text-slate-400 block text-[10px]">Pitch (Fo)</span>
                        <b>{parkinsonResult.extracted_parameters?.Fo_Hz} Hz</b>
                      </div>
                      <div className="p-2 bg-white rounded-lg border text-center">
                        <span className="text-slate-400 block text-[10px]">Jitter (%)</span>
                        <b>{parkinsonResult.extracted_parameters?.Jitter_pct}%</b>
                      </div>
                      <div className="p-2 bg-white rounded-lg border text-center">
                        <span className="text-slate-400 block text-[10px]">Shimmer</span>
                        <b>{parkinsonResult.extracted_parameters?.Shimmer_dB}</b>
                      </div>
                      <div className="p-2 bg-white rounded-lg border text-center">
                        <span className="text-slate-400 block text-[10px]">HNR (dB)</span>
                        <b>{parkinsonResult.extracted_parameters?.HNR_dB} dB</b>
                      </div>
                      <div className="p-2 bg-white rounded-lg border text-center">
                        <span className="text-slate-400 block text-[10px]">Spread1</span>
                        <b>{parkinsonResult.extracted_parameters?.Spread1}</b>
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 bg-white/70 p-2.5 rounded-lg border border-slate-200">
                      💡 {parkinsonResult.recommendation}
                    </p>
                    <div className="pt-1 text-[11px] text-slate-500">
                      <div><b>Model:</b> {parkinsonResult.model_used}</div>
                      <div><b>Benchmark:</b> {parkinsonResult.paper_accuracy}</div>
                      <div className="font-mono text-[10px] text-slate-400">Audit Hash: {parkinsonResult.verification_hash?.slice(0, 24)}...</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={openMasterPrintPreview} className="flex-1 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                      <Printer className="h-3.5 w-3.5" /> Print Clinical Report
                    </button>
                    <button onClick={handleDownloadMasterPdf} className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                      <Download className="h-3.5 w-3.5" /> Download PDF
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-xs">
                  <Brain className="h-10 w-10 text-slate-300 mb-2" />
                  Upload a .wav sustained vowel recording (or test a sample / enter acoustic parameters) to run the dysphonia classifier.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 5: TYPE 2 DIABETES & METABOLIC SYNDROME */}
        {/* ==================================================================== */}
        {activeTab === 'diabetes' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Droplets className="h-6 w-6 text-sky-600" />
                  <h2 className="text-xl font-bold text-slate-900">
                    Type 2 Diabetes & Metabolic Syndrome Risk Evaluator
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300">
                    ADA 2026 Standards
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Stratifies glycemic status into Normal, Prediabetes, or Clinical Diabetes Mellitus with 5-year complication forecasts.
                </p>
              </div>
              <button
                onClick={() => bookWithSpecialist('Dr. Arvind Swaminathan', 'Endocrinology & Diabetology')}
                className="px-3.5 py-2 bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Stethoscope className="h-4 w-4" /> Consult Endocrinologist Dr. Arvind Swaminathan
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Patient Age: {diabAge} yrs</label>
                    <input type="range" min="18" max="85" value={diabAge} onChange={e => setDiabAge(+e.target.value)} className="w-full accent-sky-600" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Body Mass Index: {diabBmi}</label>
                    <input type="range" min="15" max="45" step="0.2" value={diabBmi} onChange={e => setDiabBmi(+e.target.value)} className="w-full accent-sky-600" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Fasting Blood Glucose (mg/dL)</label>
                    <input type="number" value={diabGlucose} onChange={e => setDiabGlucose(+e.target.value)} className="w-full text-xs p-2.5 rounded-lg border bg-white" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Glycated HbA1c (%)</label>
                    <input type="number" step="0.1" value={diabHba1c} onChange={e => setDiabHba1c(+e.target.value)} className="w-full text-xs p-2.5 rounded-lg border bg-white" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Fasting Serum Insulin (uIU/mL)</label>
                    <input type="number" value={diabInsulin} onChange={e => setDiabInsulin(+e.target.value)} className="w-full text-xs p-2.5 rounded-lg border bg-white" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Systolic BP (mm Hg)</label>
                    <input type="number" value={diabBp} onChange={e => setDiabBp(+e.target.value)} className="w-full text-xs p-2.5 rounded-lg border bg-white" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Diabetes Genetic Pedigree: {diabPedigree}</label>
                    <input type="range" min="0.1" max="2.0" step="0.05" value={diabPedigree} onChange={e => setDiabPedigree(+e.target.value)} className="w-full accent-sky-600" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Aerobic Exercise: {diabActivity} hrs/wk</label>
                    <input type="range" min="0" max="15" step="0.5" value={diabActivity} onChange={e => setDiabActivity(+e.target.value)} className="w-full accent-sky-600" />
                  </div>
                </div>

                <button
                  onClick={handleDiabetesPredict}
                  disabled={diabetesLoading}
                  className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-xl text-sm shadow transition"
                >
                  {diabetesLoading ? 'Calculating ADA Glycemic Tiers...' : 'Run Diabetes Risk & Complication Analysis'}
                </button>
              </div>

              {diabetesResult ? (
                <div className="space-y-4">
                  <MedicationGuidancePanel
                    guidance={diabetesResult.medication_guidance}
                    onConsultDoctor={bookWithSpecialist}
                    onSpeak={(txt) => speakClinicalGuidance(txt, true)}
                    onStopSpeak={stopSpeaking}
                    isSpeaking={isSpeaking}
                  />
                  <div className={`p-6 rounded-2xl border ${diabetesResult.risk_percentage >= 50 ? 'bg-amber-50 border-amber-300' : 'bg-emerald-50 border-emerald-200'}`}>
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{diabetesResult.severity_level}</span>
                        <h3 className="text-2xl font-black text-slate-900 mt-1">{diabetesResult.clinical_tier}</h3>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-extrabold text-sky-800">{diabetesResult.risk_percentage}%</span>
                        <div className="text-[10px] text-slate-500 font-mono">95% CI: {diabetesResult.confidence_interval_95}</div>
                      </div>
                    </div>

                    {diabetesResult.plain_summary && (
                      <p className="text-xs text-slate-800 mt-3 bg-white/80 p-2.5 rounded-lg border border-slate-200 font-medium">{diabetesResult.plain_summary}</p>
                    )}

                    <p className="text-xs text-slate-700 mt-2 p-2.5 bg-white/70 rounded-lg border border-slate-200 leading-relaxed">
                      💡 {diabetesResult.recommendation}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 bg-white rounded-lg border">
                        <span className="text-[10px] text-slate-500 block">Retinopathy Risk</span>
                        <b className="text-amber-700">{diabetesResult.complication_risks?.diabetic_retinopathy_pct}%</b>
                      </div>
                      <div className="p-2 bg-white rounded-lg border">
                        <span className="text-[10px] text-slate-500 block">Nephropathy Risk</span>
                        <b className="text-amber-700">{diabetesResult.complication_risks?.diabetic_nephropathy_pct}%</b>
                      </div>
                      <div className="p-2 bg-white rounded-lg border">
                        <span className="text-[10px] text-slate-500 block">Cardio Risk</span>
                        <b className="text-amber-700">{diabetesResult.complication_risks?.cardiovascular_event_risk_pct}%</b>
                      </div>
                    </div>
                  </div>

                  <InputEchoPanel inputs={diabetesResult.echo_inputs} />

                  {diabetesResult.shap_feature_importance && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <h4 className="text-xs font-bold text-slate-700 mb-2">Explainable AI (XAI) Biomarker Attributions</h4>
                      <div className="space-y-2">
                        {diabetesResult.shap_feature_importance.map((f: any, idx: number) => (
                          <div key={idx} className="text-xs">
                            <div className="flex justify-between text-slate-600 mb-0.5">
                              <span>{f.feature}</span>
                              <span className={f.direction === 'elevating' ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                                {f.direction === 'elevating' ? `+${f.impact_pct}%` : `${f.impact_pct}%`}
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${f.direction === 'elevating' ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min(100, Math.abs(f.impact_pct) * 3)}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button onClick={openMasterPrintPreview} className="flex-1 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                      <Printer className="h-3.5 w-3.5" /> Print Clinical Report
                    </button>
                    <button onClick={handleDownloadMasterPdf} className="flex-1 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                      <Download className="h-3.5 w-3.5" /> Download PDF
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-xs">
                  <Droplets className="h-10 w-10 text-slate-300 mb-2" />
                  Provide Fasting Blood Glucose, HbA1c, and metabolic markers, then click "Run Diabetes Risk & Complication Analysis".
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 6: CHRONIC KIDNEY DISEASE (CKD) */}
        {/* ==================================================================== */}
        {activeTab === 'kidney' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-6 w-6 text-teal-600" />
                  <h2 className="text-xl font-bold text-slate-900">
                    Chronic Kidney Disease (CKD) & Renal Progression Staging
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300">
                    KDIGO 2024 / CKD-EPI 2021
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Computes race-free CKD-EPI 2021 eGFR, KDIGO G1-G5 / A1-A3 staging, and 5-year dialysis progression risk via KFRE.
                </p>
              </div>
              <button
                onClick={() => bookWithSpecialist('Dr. Preeti Deshmukh', 'Nephrology & Renal Transplant')}
                className="px-3.5 py-2 bg-teal-50 border border-teal-200 text-teal-700 hover:bg-teal-100 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Stethoscope className="h-4 w-4" /> Consult Nephrologist Dr. Preeti Deshmukh
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Age: {kidneyAge} yrs</label>
                    <input type="range" min="18" max="95" value={kidneyAge} onChange={e => setKidneyAge(+e.target.value)} className="w-full accent-teal-600" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Biological Sex</label>
                    <select value={kidneyGender} onChange={e => setKidneyGender(+e.target.value)} className="w-full text-xs p-2.5 rounded-lg border bg-white">
                      <option value={1}>Male</option>
                      <option value={0}>Female</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Serum Creatinine (mg/dL)</label>
                    <input type="number" step="0.1" value={kidneyCreatinine} onChange={e => setKidneyCreatinine(+e.target.value)} className="w-full text-xs p-2.5 rounded-lg border bg-white" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Blood Urea Nitrogen (BUN mg/dL)</label>
                    <input type="number" value={kidneyBun} onChange={e => setKidneyBun(+e.target.value)} className="w-full text-xs p-2.5 rounded-lg border bg-white" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Urine Albumin (uACR mg/g)</label>
                    <input type="number" value={kidneyAlbumin} onChange={e => setKidneyAlbumin(+e.target.value)} className="w-full text-xs p-2.5 rounded-lg border bg-white" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Systolic BP (mm Hg)</label>
                    <input type="number" value={kidneyBp} onChange={e => setKidneyBp(+e.target.value)} className="w-full text-xs p-2.5 rounded-lg border bg-white" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Hemoglobin (g/dL)</label>
                  <input type="number" step="0.1" value={kidneyHb} onChange={e => setKidneyHb(+e.target.value)} className="w-full text-xs p-2.5 rounded-lg border bg-white" />
                </div>

                <button
                  onClick={handleKidneyPredict}
                  disabled={kidneyLoading}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl text-sm shadow transition"
                >
                  {kidneyLoading ? 'Evaluating CKD-EPI Equation...' : 'Run KDIGO Renal Staging Analysis'}
                </button>
              </div>

              {kidneyResult ? (
                <div className="space-y-4">
                  <MedicationGuidancePanel
                    guidance={kidneyResult.medication_guidance}
                    onConsultDoctor={bookWithSpecialist}
                    onSpeak={(txt) => speakClinicalGuidance(txt, true)}
                    onStopSpeak={stopSpeaking}
                    isSpeaking={isSpeaking}
                  />
                  <div className={`p-6 rounded-2xl border ${kidneyResult.is_impaired ? 'bg-amber-50 border-amber-300' : 'bg-emerald-50 border-emerald-200'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-teal-800">eGFR Filtration Rate ({kidneyResult.risk_category} Risk)</span>
                        <h3 className="text-3xl font-black text-slate-900 mt-1">{kidneyResult.calculated_egfr} <span className="text-xs font-normal text-slate-500">mL/min/1.73m²</span></h3>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-extrabold text-teal-800">{kidneyResult.overall_renal_risk_percentage}% Risk</span>
                        <div className="text-[10px] text-slate-500 font-mono">95% CI: {kidneyResult.confidence_interval_95}</div>
                      </div>
                    </div>

                    {kidneyResult.plain_summary && (
                      <p className="text-xs text-slate-800 mt-3 bg-white/80 p-2.5 rounded-lg border border-slate-200 font-medium">{kidneyResult.plain_summary}</p>
                    )}

                    <div className="mt-3 p-3 bg-white/80 rounded-xl border border-slate-200 space-y-1 text-xs">
                      <div><b>KDIGO Stage:</b> <span className="text-slate-800">{kidneyResult.kdigo_stage}</span></div>
                      <div><b>Albuminuria:</b> <span className="text-slate-800">{kidneyResult.albuminuria_category}</span></div>
                      <div><b>5-Year Dialysis Progression:</b> <span className="text-rose-700 font-bold">{kidneyResult.dialysis_5year_progression_risk_pct}%</span></div>
                    </div>

                    <p className="text-xs text-slate-700 mt-3 p-2 bg-white/70 rounded-lg border border-slate-200 leading-relaxed">
                      💡 {kidneyResult.recommendation}
                    </p>
                  </div>

                  <InputEchoPanel inputs={kidneyResult.echo_inputs} />

                  {kidneyResult.shap_feature_importance && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <h4 className="text-xs font-bold text-slate-700 mb-2">Explainable AI (XAI) Biomarker Attributions</h4>
                      <div className="space-y-2">
                        {kidneyResult.shap_feature_importance.map((f: any, idx: number) => (
                          <div key={idx} className="text-xs">
                            <div className="flex justify-between text-slate-600 mb-0.5">
                              <span>{f.feature}</span>
                              <span className={f.direction === 'elevating' ? 'text-rose-600 font-bold' : 'text-teal-600 font-bold'}>
                                {f.direction === 'elevating' ? `+${f.impact_pct}%` : `${f.impact_pct}%`}
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${f.direction === 'elevating' ? 'bg-rose-500' : 'bg-teal-500'}`}
                                style={{ width: `${Math.min(100, Math.abs(f.impact_pct) * 3)}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button onClick={openMasterPrintPreview} className="flex-1 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                      <Printer className="h-3.5 w-3.5" /> Print Clinical Report
                    </button>
                    <button onClick={handleDownloadMasterPdf} className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                      <Download className="h-3.5 w-3.5" /> Download PDF
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-xs">
                  <Stethoscope className="h-10 w-10 text-slate-300 mb-2" />
                  Enter Serum Creatinine, BUN, and Urine Albumin (uACR), then click "Run KDIGO Renal Staging Analysis".
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 7: PNEUMONIA & RESPIRATORY DISEASE (ALL CURB-65 INPUTS) */}
        {/* ==================================================================== */}
        {activeTab === 'respiratory' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Wind className="h-6 w-6 text-indigo-600" />
                  <h2 className="text-xl font-bold text-slate-900">
                    Pneumonia, COPD & Acute Respiratory Failure Triage
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
                    CURB-65 / BTS Standard
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Computes full 5-point CURB-65 score (Confusion, Urea BUN, Respiratory rate, Blood Pressure, Age &ge; 65) plus SpO2 hypoxemia triage.
                </p>
              </div>
              <button
                onClick={() => bookWithSpecialist('Dr. Siddharth Mukherjee', 'Pulmonology & Critical Care')}
                className="px-3.5 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Stethoscope className="h-4 w-4" /> Consult Pulmonologist Dr. Siddharth Mukherjee
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Age: {respAge} yrs</label>
                    <input type="range" min="1" max="100" value={respAge} onChange={e => setRespAge(+e.target.value)} className="w-full accent-indigo-600" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">SpO2: {respSpo2}%</label>
                    <input type="range" min="70" max="100" value={respSpo2} onChange={e => setRespSpo2(+e.target.value)} className="w-full accent-indigo-600" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Resp Rate: {respRate} bpm</label>
                    <input type="range" min="10" max="50" value={respRate} onChange={e => setRespRate(+e.target.value)} className="w-full accent-indigo-600" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Body Temperature (°C)</label>
                    <input type="number" step="0.1" value={respTemp} onChange={e => setRespTemp(+e.target.value)} className="w-full text-xs p-2.5 rounded-lg border bg-white" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Cough Duration (Days)</label>
                    <input type="number" value={respCoughDays} onChange={e => setRespCoughDays(+e.target.value)} className="w-full text-xs p-2.5 rounded-lg border bg-white" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">BUN Urea (mg/dL)</label>
                    <input type="number" value={respBun} onChange={e => setRespBun(+e.target.value)} className="w-full text-xs p-2.5 rounded-lg border bg-white" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Systolic BP (mmHg)</label>
                    <input type="number" value={respSbp} onChange={e => setRespSbp(+e.target.value)} className="w-full text-xs p-2.5 rounded-lg border bg-white" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Shortness of Breath (mMRC)</label>
                    <select value={respDyspnea} onChange={e => setRespDyspnea(+e.target.value)} className="w-full text-xs p-2.5 rounded-lg border bg-white">
                      <option value={0}>Grade 0: Only with strenuous exercise</option>
                      <option value={1}>Grade 1: When hurrying or slight hill</option>
                      <option value={2}>Grade 2: Walks slower than peers</option>
                      <option value={3}>Grade 3: Stops after 100 meters</option>
                      <option value={4}>Grade 4: Too breathless to leave house</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Lung Auscultation Findings</label>
                    <select value={respCrackles} onChange={e => setRespCrackles(+e.target.value)} className="w-full text-xs p-2.5 rounded-lg border bg-white">
                      <option value={0}>Clear breath sounds (No rales)</option>
                      <option value={1}>Expiratory Wheezing / Bronchospasm</option>
                      <option value={2}>Inspiratory Crackles / Alveolar Rales</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Smoking Exposure (Pack-Years)</label>
                    <input type="number" value={respSmokingYears} onChange={e => setRespSmokingYears(+e.target.value)} className="w-full text-xs p-2.5 rounded-lg border bg-white" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Mental Alertness (Confusion)</label>
                    <select value={respConfusion} onChange={e => setRespConfusion(+e.target.value)} className="w-full text-xs p-2.5 rounded-lg border bg-white">
                      <option value={0}>Alert & Fully Oriented</option>
                      <option value={1}>Acute Confusion / Disoriented (CURB)</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleRespPredict}
                  disabled={respLoading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-sm shadow transition"
                >
                  {respLoading ? 'Evaluating Pulmonary Triage...' : 'Evaluate Respiratory Severity Index'}
                </button>
              </div>

              {respResult ? (
                <div className="space-y-4">
                  <MedicationGuidancePanel
                    guidance={respResult.medication_guidance}
                    onConsultDoctor={bookWithSpecialist}
                    onSpeak={(txt) => speakClinicalGuidance(txt, true)}
                    onStopSpeak={stopSpeaking}
                    isSpeaking={isSpeaking}
                  />
                  <div className={`p-6 rounded-2xl border ${respResult.respiratory_risk_percentage >= 50 ? 'bg-rose-50 border-rose-300' : 'bg-emerald-50 border-emerald-200'}`}>
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide">
                          CURB-65 Score: {respResult.curb65_severity_score} / 5 ({respResult.risk_category})
                        </span>
                        <h3 className="text-xl font-black text-slate-900 mt-1">{respResult.triage_level}</h3>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-extrabold text-indigo-900">{respResult.respiratory_risk_percentage}%</span>
                        <div className="text-[10px] text-slate-500 font-mono">95% CI: {respResult.confidence_interval_95}</div>
                      </div>
                    </div>

                    {respResult.curb65_breakdown && (
                      <div className="mt-3 grid grid-cols-5 gap-1.5 text-center text-[10px]">
                        {Object.entries(respResult.curb65_breakdown).map(([k, v]: any) => (
                          <div key={k} className={`p-1.5 rounded border ${v ? 'bg-rose-100 border-rose-300 text-rose-900 font-bold' : 'bg-white border-slate-200 text-slate-500'}`}>
                            <div className="truncate">{k.split('_')[0]}</div>
                            <div>{v} pt</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {respResult.supplemental_o2_indicated && (
                      <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded-lg text-red-900 text-xs font-semibold flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-700" />
                        Supplemental Oxygen Therapy Indicated (Hypoxemia SpO2 &lt; 92%)
                      </div>
                    )}

                    {respResult.plain_summary && (
                      <p className="text-xs text-slate-800 mt-3 bg-white/80 p-2.5 rounded-lg border border-slate-200 font-medium">{respResult.plain_summary}</p>
                    )}

                    <p className="text-xs text-slate-700 mt-2 p-2.5 bg-white/70 rounded-lg border border-slate-200 leading-relaxed">
                      💡 {respResult.recommendation}
                    </p>
                  </div>

                  <InputEchoPanel inputs={respResult.echo_inputs} />

                  {respResult.shap_feature_importance && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <h4 className="text-xs font-bold text-slate-700 mb-2">Explainable AI (XAI) Respiratory Biomarkers</h4>
                      <div className="space-y-2">
                        {respResult.shap_feature_importance.map((f: any, idx: number) => (
                          <div key={idx} className="text-xs">
                            <div className="flex justify-between text-slate-600 mb-0.5">
                              <span>{f.feature}</span>
                              <span className={f.direction === 'elevating' ? 'text-rose-600 font-bold' : 'text-indigo-600 font-bold'}>
                                {f.direction === 'elevating' ? `+${f.impact_pct}%` : `${f.impact_pct}%`}
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${f.direction === 'elevating' ? 'bg-rose-500' : 'bg-indigo-500'}`}
                                style={{ width: `${Math.min(100, Math.abs(f.impact_pct) * 3)}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button onClick={openMasterPrintPreview} className="flex-1 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                      <Printer className="h-3.5 w-3.5" /> Print Clinical Report
                    </button>
                    <button onClick={handleDownloadMasterPdf} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                      <Download className="h-3.5 w-3.5" /> Download PDF
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-xs">
                  <Wind className="h-10 w-10 text-slate-300 mb-2" />
                  Input age, SpO2, respiratory rate, BUN, BP, and auscultation findings, then click "Evaluate Respiratory Severity Index".
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 8: VERIFIED DOCTOR APPOINTMENTS (100% REAL PERSISTENCE) */}
        {/* ==================================================================== */}
        {activeTab === 'appointments' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-emerald-600" />
                  Verified Doctor Appointment Center (100% Real Database Persistence)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Appointments are saved to the database with double-booking prevention, SHA-256 verification seals, printable passes, and downloadable PDF slips.
                </p>
              </div>
              <button
                onClick={refreshAppointments}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Refresh Reservations
              </button>
            </div>

            {/* Doctor Cards */}
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Select Attending Clinical Specialist ({doctorsList.length} Verified Doctors Available)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {doctorsList.map((doc, idx) => {
                  const isSelected = selectedDoctor === doc.name;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedDoctor(doc.name);
                        setSelectedDepartment(doc.specialty);
                      }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-50/70 border-emerald-500 shadow-sm ring-1 ring-emerald-400'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-bold text-xs text-slate-900">{doc.name}</span>
                        {doc.verified && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Check className="h-2.5 w-2.5" /> Verified
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-blue-700 font-semibold mt-0.5">{doc.specialty}</div>
                      <div className="text-[10px] text-slate-500 mt-1">{doc.qualifications}</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">Reg: {doc.registration_number}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{doc.available_days} • {doc.room_number}</div>
                      <div className="flex justify-between items-center text-[10px] text-slate-600 mt-2 pt-2 border-t border-slate-200/60">
                        <span>Fee: <b>${doc.consultation_fee}</b></span>
                        <span className="text-amber-600 font-bold">★ {doc.rating}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Booking Form & Confirmed Slip */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h3 className="font-semibold text-sm text-slate-800 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-600" />
                  Schedule Confirmed Consultation
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Patient Full Name *</label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={e => setPatientName(e.target.value)}
                      placeholder="Enter patient full name"
                      className="w-full text-xs p-2.5 rounded-lg border bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Patient Email</label>
                    <input
                      type="email"
                      value={patientEmail}
                      onChange={e => setPatientEmail(e.target.value)}
                      placeholder="patient@example.com"
                      className="w-full text-xs p-2.5 rounded-lg border bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Patient Phone</label>
                    <input
                      type="text"
                      value={patientPhone}
                      onChange={e => setPatientPhone(e.target.value)}
                      placeholder="+91-98765-43210"
                      className="w-full text-xs p-2.5 rounded-lg border bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Consultation Date *</label>
                    <input
                      type="date"
                      min={todayStr}
                      value={appDate}
                      onChange={e => setAppDate(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Consultation Mode</label>
                    <select
                      value={consultType}
                      onChange={e => setConsultType(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border bg-white"
                    >
                      <option value="In-Person">In-Person (Hospital Clinic)</option>
                      <option value="Tele-Consultation">Tele-Consultation (Video)</option>
                    </select>
                  </div>
                </div>

                {/* Live Slot Availability */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                    Available Time Slots for {selectedDoctor} on {appDate}
                  </label>
                  {slotsLoading ? (
                    <div className="text-xs text-slate-400 py-3">Checking live database slot availability...</div>
                  ) : doctorSlots.length === 0 ? (
                    <div className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                      Unable to fetch live slots from backend. Check server status above.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {doctorSlots.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          disabled={!s.available}
                          onClick={() => setAppSlot(s.slot)}
                          className={`py-2 px-2 rounded-lg text-xs font-medium border text-center transition ${
                            !s.available
                              ? 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed line-through'
                              : appSlot === s.slot
                              ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                              : 'bg-white hover:bg-emerald-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {s.slot}
                        </button>
                      ))}
                    </div>
                  )}
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    * Strikethrough slots are already reserved in the database for {selectedDoctor} on {appDate}.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Chief Symptoms / Complaint</label>
                  <input
                    type="text"
                    value={chiefComplaint}
                    onChange={e => setChiefComplaint(e.target.value)}
                    placeholder="e.g. Chest discomfort / AI screening follow-up"
                    className="w-full text-xs p-2.5 rounded-lg border bg-white"
                  />
                </div>

                {appointmentError && (
                  <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-rose-800 text-xs flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
                    <span>{appointmentError}</span>
                  </div>
                )}

                {appointmentMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span>{appointmentMsg}</span>
                  </div>
                )}

                <button
                  onClick={handleBook}
                  disabled={bookingLoading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-sm shadow transition flex items-center justify-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  {bookingLoading ? 'Securing Slot in Database...' : 'Confirm Real Booking (Save in Database)'}
                </button>
              </div>

              {/* Confirmed Booking Pass */}
              {latestBookedTicket ? (
                <div className="p-6 bg-emerald-50/50 rounded-2xl border-2 border-emerald-500/40 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-6 w-6 text-emerald-600" />
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">Official Verified Booking Pass</h4>
                        <span className="text-[10px] font-mono text-emerald-800">REF: {latestBookedTicket.reference_id}</span>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 font-bold text-xs rounded-full ${latestBookedTicket.status === 'Cancelled' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}>
                      {latestBookedTicket.status?.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Patient:</span>
                      <b className="text-slate-900">{latestBookedTicket.patient}</b>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Contact (Email / Phone):</span>
                      <b className="text-slate-800">{latestBookedTicket.patient_email || 'N/A'} | {latestBookedTicket.patient_phone || 'N/A'}</b>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Doctor:</span>
                      <b className="text-slate-900">{latestBookedTicket.doctor} ({latestBookedTicket.department})</b>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Appointment Date &amp; Time:</span>
                      <b className="text-emerald-700">{latestBookedTicket.date} at {latestBookedTicket.slot}</b>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Modality &amp; Location:</span>
                      <b className="text-slate-900 text-right">{latestBookedTicket.consultation_type} — {latestBookedTicket.room_number}</b>
                    </div>
                    {latestBookedTicket.teleconsult_url && (
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500">Tele-Health Room URL:</span>
                        <span className="font-mono text-blue-700 text-[11px]">{latestBookedTicket.teleconsult_url}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Chief Complaint:</span>
                      <span className="text-slate-800 text-right">{latestBookedTicket.chief_complaint}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Consultation Fee:</span>
                      <b className="text-slate-900">${latestBookedTicket.fee_paid} (Payable at Clinic / Portal)</b>
                    </div>
                    <div className="py-1">
                      <span className="text-slate-500 block text-[10px]">Cryptographic SHA-256 Security Hash:</span>
                      <span className="font-mono text-[9px] text-slate-600 break-all bg-white p-1 rounded border block mt-0.5">
                        {latestBookedTicket.security_hash}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      onClick={() => openAppointmentPrintPreview(latestBookedTicket)}
                      className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl shadow flex items-center justify-center gap-1.5 transition"
                    >
                      <Printer className="h-4 w-4" /> Print Booking Pass
                    </button>
                    <button
                      onClick={() => handleDownloadAppointmentSlip(latestBookedTicket.reference_id)}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow flex items-center justify-center gap-1.5 transition"
                    >
                      <Download className="h-4 w-4" /> Download PDF Slip
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-xs">
                  <Calendar className="h-10 w-10 text-slate-300 mb-2" />
                  Enter patient details, select a doctor and open time slot, and click "Confirm Real Booking" to generate your verified pass.
                </div>
              )}
            </div>

            {/* Active Bookings Table */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-slate-800">
                  Active Clinical Reservations in Database ({activeAppointments.length} Total Records)
                </h3>
                <span className="text-xs text-slate-500 font-mono">Persistent SQLite / PostgreSQL Storage</span>
              </div>

              {activeAppointments.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border">
                  No appointments recorded in database yet. Book one using the form above!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b text-slate-600">
                        <th className="p-2.5">Ref ID</th>
                        <th className="p-2.5">Patient & Contact</th>
                        <th className="p-2.5">Doctor & Specialty</th>
                        <th className="p-2.5">Date & Slot</th>
                        <th className="p-2.5">Type</th>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeAppointments.map((app, idx) => (
                        <tr key={idx} className="border-b hover:bg-slate-50">
                          <td className="p-2.5 font-mono text-blue-600 font-semibold">{app.reference_id}</td>
                          <td className="p-2.5">
                            <span className="font-medium text-slate-900 block">{app.patient}</span>
                            <span className="text-[10px] text-slate-400">{app.patient_email}</span>
                          </td>
                          <td className="p-2.5 text-slate-700">
                            <b>{app.doctor}</b>
                            <span className="block text-[10px] text-slate-400">{app.department}</span>
                          </td>
                          <td className="p-2.5">
                            <b>{app.date}</b>
                            <span className="block text-emerald-700 font-semibold">{app.slot}</span>
                          </td>
                          <td className="p-2.5 text-slate-600">{app.consultation_type}</td>
                          <td className="p-2.5">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                app.status === 'Confirmed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {app.status}
                            </span>
                          </td>
                          <td className="p-2.5 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => openAppointmentPrintPreview(app)}
                              title="Print Appointment Pass"
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded font-semibold text-[11px]"
                            >
                              Print
                            </button>
                            <button
                              onClick={() => handleDownloadAppointmentSlip(app.reference_id)}
                              title="Download PDF Entry Pass"
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-[11px]"
                            >
                              PDF Pass
                            </button>
                            {app.status !== 'Cancelled' && (
                              <button
                                onClick={() => handleCancelAppointment(app.reference_id)}
                                title="Cancel appointment and free slot"
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded font-semibold text-[11px]"
                              >
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 9: SECURITY, PRIVACY & TRUST CENTER */}
        {/* ==================================================================== */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white p-6 rounded-2xl shadow-md border border-white/10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-400/30">
                    <ShieldCheck className="h-8 w-8 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">MedicAI Trustworthy & Security Architecture</h2>
                    <p className="text-xs text-blue-200 mt-1">
                      Full-Spectrum HIPAA Title II, GDPR Article 9 & FDA Class II Clinical Decision Support Governance
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-400">{complianceScore}%</span>
                    <span className="block text-[10px] text-blue-200 uppercase font-semibold">Security Grade A+</span>
                  </div>
                  <div className="h-10 w-px bg-white/20"></div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-cyan-300">{auditLogs.length}</span>
                    <span className="block text-[10px] text-blue-200 uppercase font-semibold">Immutable Blocks</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-blue-600" />
                  HIPAA Safe Harbor PHI Sanitizer Lab
                </h3>
                <p className="text-xs text-slate-500">
                  Paste raw clinical notes with Protected Health Information (Names, DOB, Phone, Email, SSN) to scrub identifiers in real time.
                </p>
                <textarea
                  rows={4}
                  value={rawClinicalText}
                  onChange={e => setRawClinicalText(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border bg-slate-50 font-mono"
                ></textarea>
                <button
                  onClick={handleAnonymize}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition"
                >
                  De-identify Protected Health Information (PHI)
                </button>

                {anonymizedOutput && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-blue-900">Sanitized Clinical Record</span>
                      <span className="font-mono bg-blue-200 text-blue-900 px-2 py-0.5 rounded text-[10px]">
                        ID: {anonymizedOutput.anonymized_id}
                      </span>
                    </div>
                    <p className="font-mono text-[11px] text-slate-800 bg-white p-2.5 rounded border border-blue-100 leading-relaxed whitespace-pre-wrap">
                      {anonymizedOutput.sanitized_text}
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-600" />
                  Cryptographic Integrity & Tamper Verifier
                </h3>
                <p className="text-xs text-slate-500">
                  Verify any Appointment Reference ID, Report ID (MED-RPT-...), or SHA-256 hash against the database.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={verifyInput}
                    onChange={e => setVerifyInput(e.target.value)}
                    placeholder="Enter Reference ID or SHA-256 Hash..."
                    className="flex-1 text-xs p-2.5 rounded-xl border bg-slate-50 font-mono"
                  />
                  <button
                    onClick={handleVerify}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition"
                  >
                    Verify Seal
                  </button>
                </div>

                {verifyResult && (
                  <div
                    className={`p-4 rounded-xl border text-xs space-y-2 ${
                      verifyResult.status === 'VERIFIED_AUTHENTIC'
                        ? 'bg-emerald-50 border-emerald-300'
                        : 'bg-rose-50 border-rose-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold">
                      {verifyResult.status === 'VERIFIED_AUTHENTIC' ? (
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-rose-600" />
                      )}
                      <span className={verifyResult.status === 'VERIFIED_AUTHENTIC' ? 'text-emerald-900' : 'text-rose-900'}>
                        {verifyResult.status === 'VERIFIED_AUTHENTIC' ? 'Authentic Record Verified' : 'Verification Unconfirmed'}
                      </span>
                    </div>
                    {verifyResult.entity && (
                      <div className="space-y-1 text-slate-700">
                        <div><b>Entity:</b> {verifyResult.entity}</div>
                        {verifyResult.reference_id && <div><b>Reference:</b> {verifyResult.reference_id}</div>}
                        {verifyResult.patient_name && <div><b>Patient:</b> {verifyResult.patient_name} with {verifyResult.doctor}</div>}
                        {verifyResult.action && <div><b>Action:</b> {verifyResult.action}</div>}
                        <div><b>Tamper Check:</b> <span className="text-emerald-700 font-semibold">{verifyResult.tamper_status}</span></div>
                      </div>
                    )}
                    {verifyResult.message && <div className="text-rose-800">{verifyResult.message}</div>}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    Immutable Cryptographic Audit Ledger (SHA-256 Chained Blocks)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Every diagnostic inference, report generation, appointment booking, and de-identification event is permanently chained.
                  </p>
                </div>
                <button
                  onClick={loadAuditLogs}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" /> Refresh Blocks
                </button>
              </div>

              {auditLoading ? (
                <div className="p-6 text-center text-xs text-slate-400">Loading cryptographic blocks...</div>
              ) : auditLogs.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">No audit events recorded yet. Run a prediction or book an appointment to generate live blocks.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b text-slate-600">
                        <th className="p-2.5">Block #</th>
                        <th className="p-2.5">Timestamp</th>
                        <th className="p-2.5">Event Type</th>
                        <th className="p-2.5">Patient Token</th>
                        <th className="p-2.5">Action Summary</th>
                        <th className="p-2.5">Chained SHA-256 Hash</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log, i) => (
                        <tr key={i} className="border-b hover:bg-slate-50">
                          <td className="p-2.5 font-mono text-slate-500">#{log.id}</td>
                          <td className="p-2.5 text-slate-500 text-[11px] whitespace-nowrap">{log.timestamp}</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-blue-100 text-blue-800 font-semibold">
                              {log.event_type}
                            </span>
                          </td>
                          <td className="p-2.5 font-mono text-slate-600">{log.pseudonym}</td>
                          <td className="p-2.5 text-slate-800 font-medium">{log.action}</td>
                          <td className="p-2.5 font-mono text-[10px] text-slate-400">
                            {log.cryptographic_hash?.slice(0, 18)}...
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 10: CHATBOT GRAPHRAG */}
        {/* ==================================================================== */}
        {activeTab === 'chatbot' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-blue-600" />
                Medical Chatbot: GraphRAG with Hybrid Retrieval
              </h2>
              <p className="text-sm text-slate-500">
                Retrieves clinical guidelines and Knowledge Graph triplets G=(V,E) across all 7 specialties.
              </p>
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                value={chatQuery}
                onChange={e => setChatQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleChat()}
                placeholder="Ask about Parkinson's, Heart Disease, Diabetes, Kidney CKD, Pneumonia CURB-65, Cancer, or Rare Diseases..."
                className="flex-1 text-sm border-slate-300 rounded-xl p-3 border bg-slate-50"
              />
              <button
                onClick={handleChat}
                disabled={chatLoading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium shadow"
              >
                {chatLoading ? 'Reasoning...' : 'Ask MedicAI'}
              </button>
            </div>

            {chatResponse && (
              <div className="space-y-4 pt-4 border-t">
                <div className="p-5 bg-blue-50/50 rounded-xl border border-blue-100">
                  <h4 className="font-semibold text-xs text-blue-800 mb-2">Synthesized Response</h4>
                  <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">{chatResponse.response}</p>
                  <span className="text-xs text-slate-400 mt-3 block">Latency: {chatResponse.latency_ms} ms</span>
                </div>

                {chatResponse.triplets && chatResponse.triplets.length > 0 && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <h4 className="font-semibold text-xs text-slate-700 mb-2">Extracted Knowledge Subgraph Triplets G=(V, E):</h4>
                    <div className="space-y-1 font-mono text-xs text-slate-600">
                      {chatResponse.triplets.map((t: string, i: number) => (
                        <div key={i}>• {t}</div>
                      ))}
                    </div>
                  </div>
                )}

                {chatResponse.citations && chatResponse.citations.length > 0 && (
                  <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200">
                    <h4 className="font-semibold text-xs text-emerald-800 mb-1.5">Clinical Guideline Citations:</h4>
                    <ul className="list-disc list-inside text-xs text-slate-700 space-y-0.5">
                      {chatResponse.citations.map((c: string, i: number) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ====================================================================== */}
      {/* PRINTABLE CLINICAL REPORT / APPOINTMENT PASS MODAL & PRINT SHEET */}
      {/* ====================================================================== */}
      {printPreviewMode && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:static print:bg-white print:p-0">
          <div id="medicai-print-sheet" className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
            {/* Modal Toolbar (hidden in print) */}
            <div className="no-print flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Printer className="h-4 w-4 text-cyan-300" />
                {printPreviewMode === 'appointment'
                  ? 'Printable Official Appointment Pass'
                  : 'Printable Master Clinical Summary Report'}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={triggerBrowserPrint}
                  className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5"
                >
                  <Printer className="h-3.5 w-3.5" /> Print Now
                </button>
                {printPreviewMode === 'master' ? (
                  <button
                    onClick={handleDownloadMasterPdf}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5" /> Download PDF
                  </button>
                ) : (
                  printAppointmentTarget && (
                    <button
                      onClick={() => handleDownloadAppointmentSlip(printAppointmentTarget.reference_id)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5"
                    >
                      <Download className="h-3.5 w-3.5" /> Download PDF Slip
                    </button>
                  )
                )}
                <button
                  onClick={() => setPrintPreviewMode(null)}
                  className="p-1.5 hover:bg-white/10 rounded-lg"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Printable Body */}
            <div className="p-8 space-y-6 text-slate-800 max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible">
              <div className="border-b-2 border-blue-900 pb-4 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-black text-blue-950">MEDICAI CLINICAL INTELLIGENCE PLATFORM</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {printPreviewMode === 'appointment'
                      ? 'Official Verified Appointment Confirmation Pass'
                      : 'Actual Patient Clinical Evaluation & Diagnostic Summary'}
                  </p>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <div>Printed: {new Date().toLocaleString()}</div>
                  <div>Compliance: HIPAA / GDPR / FDA Class II CDS</div>
                </div>
              </div>

              {printPreviewMode === 'appointment' && printAppointmentTarget ? (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div><span className="text-slate-500 block">Reference ID</span><b className="font-mono text-sm text-blue-800">{printAppointmentTarget.reference_id}</b></div>
                    <div><span className="text-slate-500 block">Status</span><b className="text-emerald-700 text-sm">{printAppointmentTarget.status}</b></div>
                    <div><span className="text-slate-500 block">Patient Name</span><b>{printAppointmentTarget.patient}</b></div>
                    <div><span className="text-slate-500 block">Contact</span><b>{printAppointmentTarget.patient_email || 'N/A'} | {printAppointmentTarget.patient_phone || 'N/A'}</b></div>
                    <div><span className="text-slate-500 block">Attending Specialist</span><b>{printAppointmentTarget.doctor} ({printAppointmentTarget.department})</b></div>
                    <div><span className="text-slate-500 block">Date &amp; Time Slot</span><b>{printAppointmentTarget.date} at {printAppointmentTarget.slot}</b></div>
                    <div><span className="text-slate-500 block">Consultation Mode &amp; Room</span><b>{printAppointmentTarget.consultation_type} — {printAppointmentTarget.room_number}</b></div>
                    <div><span className="text-slate-500 block">Consultation Fee</span><b>${printAppointmentTarget.fee_paid} (Payable at Clinic / Portal)</b></div>
                    <div className="col-span-2"><span className="text-slate-500 block">Chief Complaint</span><b>{printAppointmentTarget.chief_complaint || 'Clinical consultation'}</b></div>
                    {printAppointmentTarget.teleconsult_url && (
                      <div className="col-span-2"><span className="text-slate-500 block">Tele-Health Room URL</span><span className="font-mono text-blue-700">{printAppointmentTarget.teleconsult_url}</span></div>
                    )}
                    <div className="col-span-2"><span className="text-slate-500 block">SHA-256 Verification Hash</span><span className="font-mono text-[10px] break-all">{printAppointmentTarget.security_hash}</span></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-5 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div><span className="text-slate-500 block">Patient Name</span><b>{patientName.trim() || 'Clinical Screening Patient'}</b></div>
                    <div><span className="text-slate-500 block">Email</span><b>{patientEmail.trim() || 'Not Provided'}</b></div>
                    <div><span className="text-slate-500 block">Phone</span><b>{patientPhone.trim() || 'Not Provided'}</b></div>
                    <div><span className="text-slate-500 block">Evaluated Domains</span><b>{evaluatedDomains.length} / 6 + {rankededTests.length > 0 ? 'Rare' : '0 Rare'}</b></div>
                  </div>

                  {evaluatedDomains.length === 0 && rankededTests.length === 0 ? (
                    <div className="p-6 text-center bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                      No diagnostic predictors have been run yet in this session. Run any disease screening tab first to include its actual inputs and results here.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {evaluatedDomains.map((dom, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-slate-200 space-y-2">
                          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                            <b className="text-sm text-slate-900">{dom.title}</b>
                            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold">{dom.score} — {dom.tier}</span>
                          </div>
                          {dom.data.medication_guidance?.medicines?.length > 0 && (
                            <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-200 space-y-1">
                              <b className="text-sky-950 block">Recommended Medications:</b>
                              <ul className="list-disc list-inside text-slate-700 space-y-0.5">
                                {dom.data.medication_guidance.medicines.map((m: any, mIdx: number) => (
                                  <li key={mIdx}><b>{m.name}</b> — {m.dosage} ({m.purpose})</li>
                                ))}
                              </ul>
                              {dom.data.medication_guidance.doctor_consultation_advice && (
                                <p className="text-rose-800 font-semibold pt-1">{dom.data.medication_guidance.doctor_consultation_advice}</p>
                              )}
                            </div>
                          )}
                          {dom.data.plain_summary && <p className="text-slate-800 font-medium">{dom.data.plain_summary}</p>}
                          <InputEchoPanel inputs={dom.data.echo_inputs} />
                          {dom.data.recommendation && <p className="text-slate-600"><b>Clinical Action:</b> {dom.data.recommendation}</p>}
                          {dom.data.verification_hash && <p className="font-mono text-[10px] text-slate-400">Audit Hash: {dom.data.verification_hash}</p>}
                        </div>
                      ))}

                      {rankededTests.length > 0 && (
                        <div className="p-4 rounded-xl border border-slate-200 space-y-2">
                          <b className="text-sm text-slate-900 block">Prioritized Rare Disease Diagnostic Tests</b>
                          {rareResult?.echo_inputs && <InputEchoPanel inputs={rareResult.echo_inputs} />}
                          <ul className="list-disc list-inside space-y-1 text-slate-700">
                            {rankededTests.map((t, i) => (
                              <li key={i}><b>#{i + 1} {t.test_name}</b> — {t.probability_ranking_pct}% Yield ({t.turnaround_time})</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {(latestBookedTicket || activeAppointments.length > 0) && (
                    <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/40 space-y-1">
                      <b className="text-sm text-emerald-950 block">Confirmed Appointment</b>
                      {(() => {
                        const a = latestBookedTicket || activeAppointments.find(x => x.status !== 'Cancelled') || activeAppointments[0];
                        return (
                          <div>
                            Ref: <b className="font-mono">{a.reference_id}</b> • {a.doctor} ({a.department}) • {a.date} at {a.slot} • Status: <b>{a.status}</b>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicAIDashboard;

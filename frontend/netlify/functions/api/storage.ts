import crypto from "node:crypto";
import { getStore } from "@netlify/blobs";

export interface StoredAppointment {
  id: number;
  reference_id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  doctor_id: number;
  doctor_name: string;
  department: string;
  appointment_date: string;
  time_slot: string;
  consultation_type: string;
  chief_complaint: string;
  status: string;
  security_verification_hash: string;
  teleconsult_url: string | null;
  room_number: string;
  fee_paid: number;
  created_at: string;
}

export interface StoredAuditLog {
  id: number;
  event_type: string;
  entity_type: string;
  entity_id: string;
  pseudonym: string;
  action: string;
  details: Record<string, unknown>;
  cryptographic_hash: string;
  previous_hash: string;
  timestamp: string;
}

export interface PersistedState {
  appointments: StoredAppointment[];
  auditLogs: StoredAuditLog[];
  nextAppointmentId: number;
  nextAuditId: number;
}

const DEFAULT_STATE: PersistedState = {
  appointments: [],
  auditLogs: [],
  nextAppointmentId: 1,
  nextAuditId: 1,
};

let memoryFallback: PersistedState = structuredClone(DEFAULT_STATE);

const STORE_NAME = "medicai-clinical-state";
const STATE_KEY = "state-v1";

function openBlobStore() {
  try {
    return getStore({ name: STORE_NAME, consistency: "strong" });
  } catch {
    return null;
  }
}

export async function readState(): Promise<PersistedState> {
  const store = openBlobStore();
  if (!store) return memoryFallback;
  try {
    const data = await store.get(STATE_KEY, { type: "json", consistency: "strong" });
    if (data && typeof data === "object") {
      return {
        appointments: Array.isArray((data as PersistedState).appointments) ? (data as PersistedState).appointments : [],
        auditLogs: Array.isArray((data as PersistedState).auditLogs) ? (data as PersistedState).auditLogs : [],
        nextAppointmentId: typeof (data as PersistedState).nextAppointmentId === "number" ? (data as PersistedState).nextAppointmentId : 1,
        nextAuditId: typeof (data as PersistedState).nextAuditId === "number" ? (data as PersistedState).nextAuditId : 1,
      };
    }
  } catch {
    // Fall back to in-memory store if Blobs is unavailable in a local test harness.
  }
  return memoryFallback;
}

export async function writeState(state: PersistedState): Promise<void> {
  memoryFallback = state;
  const store = openBlobStore();
  if (!store) return;
  try {
    await store.setJSON(STATE_KEY, state);
  } catch {
    // Keep memoryFallback updated if Blobs write fails outside Netlify runtime.
  }
}

export function sha256Hex(input: string): string {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

export function md5Hex(input: string): string {
  return crypto.createHash("md5").update(input, "utf8").digest("hex");
}

export async function recordAuditEvent(
  eventType: string,
  entityType: string,
  actionSummary: string,
  details: Record<string, unknown>,
  patientPseudonym?: string,
  entityId?: string
): Promise<string> {
  const state = await readState();
  const lastLog = state.auditLogs[0];
  const prevHash = lastLog ? lastLog.cryptographic_hash : "GENESIS_MEDICAL_BLOCK_000000000000";
  const isoTs = new Date().toISOString();
  const displayTs = isoTs.replace("T", " ").slice(0, 19);

  const sortedDetails = JSON.stringify(details, Object.keys(details).sort());
  const payload = `${prevHash}|${isoTs}|${eventType}|${entityType}|${actionSummary}|${sortedDetails}`;
  const currentHash = sha256Hex(payload);

  const entry: StoredAuditLog = {
    id: state.nextAuditId++,
    event_type: eventType,
    entity_type: entityType,
    entity_id: entityId || "",
    pseudonym: patientPseudonym || "ANONYMOUS_PATIENT",
    action: actionSummary,
    details,
    cryptographic_hash: currentHash,
    previous_hash: prevHash,
    timestamp: displayTs,
  };

  state.auditLogs.unshift(entry);
  if (state.auditLogs.length > 200) {
    state.auditLogs = state.auditLogs.slice(0, 200);
  }
  await writeState(state);
  return currentHash;
}

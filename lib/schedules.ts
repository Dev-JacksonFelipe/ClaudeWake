import { getRedis } from "./redis";
import {
  isQstashConfigured,
  createSchedule as qstashCreate,
  deleteSchedule as qstashDelete,
} from "./qstash";

// Horários configurados pelo usuário. Guardados no Redis (hash "schedules",
// id -> registro) e sincronizados com o QStash quando ele está configurado.
//
// Um registro fica "ativo de verdade" (dispara na nuvem) apenas quando tem um
// qstashId. Sem o QStash configurado, os horários ficam salvos como pendentes.

const SCHEDULES_KEY = "schedules";
const SEED_KEY = "schedules_seeded";

export interface Schedule {
  id: string;
  time: string; // "HH:mm" no horário de Brasília
  enabled: boolean;
  qstashId?: string; // presente quando sincronizado com o QStash
}

export async function listSchedules(): Promise<Schedule[]> {
  const redis = getRedis();
  const data = await redis.hgetall<Record<string, Schedule>>(SCHEDULES_KEY);
  if (!data) return [];
  return Object.values(data).sort((a, b) => a.time.localeCompare(b.time));
}

async function saveRecord(s: Schedule): Promise<void> {
  const redis = getRedis();
  await redis.hset(SCHEDULES_KEY, { [s.id]: s });
}

async function removeRecord(id: string): Promise<void> {
  const redis = getRedis();
  await redis.hdel(SCHEDULES_KEY, id);
}

// Cria um horário. Se o QStash estiver configurado e o horário ativo,
// já cria o schedule na nuvem. O baseUrl (endereço público) vem do request.
export async function addSchedule(
  time: string,
  enabled = true,
  baseUrl?: string,
): Promise<Schedule> {
  const id = crypto.randomUUID();
  const schedule: Schedule = { id, time, enabled };

  if (enabled && isQstashConfigured()) {
    schedule.qstashId = await qstashCreate(time, baseUrl);
  }

  await saveRecord(schedule);
  return schedule;
}

// Ativa/desativa um horário, sincronizando com o QStash.
export async function setEnabled(
  id: string,
  enabled: boolean,
  baseUrl?: string,
): Promise<Schedule | null> {
  const redis = getRedis();
  const current = await redis.hget<Schedule>(SCHEDULES_KEY, id);
  if (!current) return null;

  if (enabled && !current.qstashId && isQstashConfigured()) {
    current.qstashId = await qstashCreate(current.time, baseUrl);
  } else if (!enabled && current.qstashId) {
    await qstashDelete(current.qstashId);
    current.qstashId = undefined;
  }
  current.enabled = enabled;

  await saveRecord(current);
  return current;
}

// Remove um horário (apaga também do QStash).
export async function removeSchedule(id: string): Promise<void> {
  const redis = getRedis();
  const current = await redis.hget<Schedule>(SCHEDULES_KEY, id);
  if (current?.qstashId) {
    await qstashDelete(current.qstashId);
  }
  await removeRecord(id);
}

// Cria os horários padrão (06:00 e 14:00) uma única vez.
export async function seedDefaults(): Promise<void> {
  const redis = getRedis();
  const seeded = await redis.get<boolean>(SEED_KEY);
  if (seeded) return;
  await redis.set(SEED_KEY, true);
  await addSchedule("06:00", true);
  await addSchedule("14:00", true);
}

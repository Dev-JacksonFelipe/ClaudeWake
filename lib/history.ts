import { getRedis } from "./redis";

// Histórico das execuções (disparos ao Claude), guardado como lista no Redis.
// Mantém os últimos MAX registros, do mais recente para o mais antigo.

const HISTORY_KEY = "history";
const MAX = 50;

export interface HistoryEntry {
  at: string; // ISO timestamp
  trigger: "manual" | "schedule";
  ok: boolean;
  model?: string;
  reply?: string;
  error?: string;
}

export async function addHistory(entry: HistoryEntry): Promise<void> {
  const redis = getRedis();
  await redis.lpush(HISTORY_KEY, entry);
  await redis.ltrim(HISTORY_KEY, 0, MAX - 1);
}

export async function getHistory(): Promise<HistoryEntry[]> {
  const redis = getRedis();
  const items = await redis.lrange<HistoryEntry>(HISTORY_KEY, 0, MAX - 1);
  // O @upstash/redis já desserializa objetos JSON automaticamente.
  return items;
}

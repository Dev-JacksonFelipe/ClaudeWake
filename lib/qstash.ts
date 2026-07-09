import { Client, Receiver } from "@upstash/qstash";

// Integração com o Upstash QStash — o agendador na nuvem.
//
// Cada horário configurado vira um "schedule" no QStash, que faz um POST
// assinado para {APP_URL}/api/trigger no horário certo. Como o QStash roda
// na nuvem, os disparos acontecem mesmo com o PC do usuário desligado.
//
// IMPORTANTE: o cron do QStash é em UTC. O Brasil não tem mais horário de
// verão, então o fuso é fixo em -3. A conversão BRT->UTC fica centralizada aqui.

export function isQstashConfigured(): boolean {
  return Boolean(process.env.QSTASH_TOKEN);
}

function getClient(): Client {
  const token = process.env.QSTASH_TOKEN;
  if (!token) throw new Error("QSTASH_TOKEN não configurado.");
  // A URL depende da região do QStash (ex.: us-east-1 tem endpoint próprio).
  const baseUrl = process.env.QSTASH_URL || "https://qstash.upstash.io";
  return new Client({ token, baseUrl });
}

// Converte "HH:mm" (horário de Brasília, UTC-3) para uma expressão cron em UTC.
// Ex.: "06:00" BRT -> 09:00 UTC -> "0 9 * * *"
export function brtTimeToUtcCron(time: string): string {
  const [hStr, mStr] = time.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (!Number.isInteger(h) || !Number.isInteger(m)) {
    throw new Error(`Horário inválido: ${time}`);
  }
  const utcHour = (h + 3) % 24; // BRT = UTC-3
  return `${m} ${utcHour} * * *`;
}

// Cria um schedule no QStash apontando para {baseUrl}/api/trigger.
// O baseUrl vem do próprio request (ex.: https://claude-alarm.vercel.app),
// então não é preciso configurar APP_URL manualmente. Cai para APP_URL como
// fallback quando o baseUrl não é informado.
// Retorna o scheduleId do QStash (guardado no Redis para depois apagar/editar).
export async function createSchedule(
  time: string,
  baseUrl?: string,
): Promise<string> {
  const appUrl = baseUrl || process.env.APP_URL;
  if (!appUrl) throw new Error("Endereço público (APP_URL) não disponível.");

  const client = getClient();
  const res = await client.schedules.create({
    destination: `${appUrl}/api/trigger`,
    cron: brtTimeToUtcCron(time),
    method: "POST",
    // corpo mínimo; o /api/trigger não depende dele, mas ajuda a validar assinatura
    body: JSON.stringify({ source: "qstash", time }),
    headers: { "Content-Type": "application/json" },
  });
  return res.scheduleId;
}

// Apaga um schedule do QStash.
export async function deleteSchedule(scheduleId: string): Promise<void> {
  const client = getClient();
  await client.schedules.delete(scheduleId);
}

// Verifica a assinatura de uma requisição vinda do QStash (usado no /api/trigger).
export async function verifyQstashSignature(
  signature: string,
  body: string,
): Promise<boolean> {
  const currentKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
  const nextKey = process.env.QSTASH_NEXT_SIGNING_KEY;
  if (!currentKey || !nextKey) return false;

  const receiver = new Receiver({
    currentSigningKey: currentKey,
    nextSigningKey: nextKey,
  });

  try {
    return await receiver.verify({ signature, body });
  } catch {
    return false;
  }
}

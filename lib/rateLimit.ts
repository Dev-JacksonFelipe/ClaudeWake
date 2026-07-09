import { getRedis } from "./redis";

// Limite de tentativas de login (anti-força bruta).
//
// Conta as tentativas falhas por IP dentro de uma janela de tempo. Ao passar do
// limite, bloqueia novas tentativas até a janela expirar. Usa Redis com TTL, então
// funciona igual em serverless (sem estado em memória).

const MAX_ATTEMPTS = 5;
const WINDOW_SECONDS = 15 * 60; // 15 minutos

function keyFor(ip: string): string {
  return `login_attempts:${ip}`;
}

export interface RateLimitResult {
  blocked: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

// Consulta o estado atual sem incrementar.
export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  const redis = getRedis();
  const key = keyFor(ip);
  const count = (await redis.get<number>(key)) ?? 0;
  const blocked = count >= MAX_ATTEMPTS;
  const ttl = blocked ? await redis.ttl(key) : 0;
  return {
    blocked,
    remaining: Math.max(0, MAX_ATTEMPTS - count),
    retryAfterSeconds: ttl > 0 ? ttl : 0,
  };
}

// Registra uma tentativa falha e retorna o novo estado.
export async function registerFailure(ip: string): Promise<RateLimitResult> {
  const redis = getRedis();
  const key = keyFor(ip);
  const count = await redis.incr(key);
  // Define a expiração apenas na primeira falha da janela.
  if (count === 1) {
    await redis.expire(key, WINDOW_SECONDS);
  }
  const blocked = count >= MAX_ATTEMPTS;
  const ttl = await redis.ttl(key);
  return {
    blocked,
    remaining: Math.max(0, MAX_ATTEMPTS - count),
    retryAfterSeconds: ttl > 0 ? ttl : WINDOW_SECONDS,
  };
}

// Zera o contador após login bem-sucedido.
export async function resetRateLimit(ip: string): Promise<void> {
  const redis = getRedis();
  await redis.del(keyFor(ip));
}

// Extrai o IP do cliente a partir dos cabeçalhos (Vercel usa x-forwarded-for).
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") || "local";
}

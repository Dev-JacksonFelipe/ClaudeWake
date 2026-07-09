import { Redis } from "@upstash/redis";

// Cliente único do Upstash Redis, reaproveitado entre requisições.
// As credenciais vêm das variáveis de ambiente UPSTASH_REDIS_REST_URL e
// UPSTASH_REDIS_REST_TOKEN (painel Upstash > seu banco > REST API).

let client: Redis | null = null;

export function getRedis(): Redis {
  if (client) return client;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error(
      "Redis não configurado. Defina UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN.",
    );
  }

  client = new Redis({ url, token });
  return client;
}

// Indica se o Redis está configurado (usado para mensagens amigáveis na UI).
export function isRedisConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

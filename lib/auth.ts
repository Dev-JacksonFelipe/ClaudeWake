// Autenticação simples por senha única.
//
// Como o app fica público na Vercel e guarda o seu token do Claude, protegemos
// o acesso com uma senha (variável de ambiente APP_PASSWORD). Ao acertar a senha,
// geramos um cookie de sessão assinado com HMAC-SHA256 (SESSION_SECRET). O cookie
// não guarda a senha — apenas uma validade assinada que o servidor consegue conferir.
//
// Usamos a Web Crypto API (globalThis.crypto.subtle) para que o mesmo código
// funcione tanto nas rotas de API (Node) quanto no middleware (Edge).

export const SESSION_COOKIE = "claude_alarm_session";

// Duração da sessão: 30 dias.
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET não definido. Configure-o nas variáveis de ambiente.",
    );
  }
  return secret;
}

const encoder = new TextEncoder();

function bytesToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmac(message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(message),
  );
  return bytesToHex(signature);
}

// Comparação em tempo constante para evitar timing attacks.
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

// Gera o valor do cookie: "<validade>.<assinatura>".
export async function createSessionToken(): Promise<string> {
  const expiresAt = (Date.now() + SESSION_TTL_MS).toString();
  const signature = await hmac(expiresAt);
  return `${expiresAt}.${signature}`;
}

// Confere se o cookie é válido e ainda não expirou.
export async function verifySessionToken(
  token: string | undefined,
): Promise<boolean> {
  if (!token) return false;
  const [expiresAt, signature] = token.split(".");
  if (!expiresAt || !signature) return false;

  const expected = await hmac(expiresAt);
  if (!safeEqual(signature, expected)) return false;

  const expiryMs = Number(expiresAt);
  if (!Number.isFinite(expiryMs) || Date.now() > expiryMs) return false;

  return true;
}

// Confere usuário + senha contra APP_USERNAME e APP_PASSWORD.
// As duas comparações usam tempo constante e ambas são sempre executadas,
// para não vazar (por tempo de resposta) se o erro foi no usuário ou na senha.
export function checkCredentials(
  username: string,
  password: string,
): boolean {
  const expectedUser = process.env.APP_USERNAME;
  const expectedPass = process.env.APP_PASSWORD;
  if (!expectedUser || !expectedPass) {
    throw new Error(
      "APP_USERNAME/APP_PASSWORD não definidos. Configure-os nas variáveis de ambiente.",
    );
  }
  const userOk = safeEqual(username, expectedUser);
  const passOk = safeEqual(password, expectedPass);
  return userOk && passOk;
}

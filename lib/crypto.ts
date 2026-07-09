// Criptografia do token do Claude antes de guardar no Redis.
//
// Mesmo que alguém obtenha acesso ao banco, o token fica embaralhado (AES-256-GCM).
// A chave vem de TOKEN_ENCRYPTION_KEY (derivada via SHA-256 para 256 bits).
// Cada valor criptografado usa um IV aleatório, guardado junto no formato:
//   base64(iv).base64(ciphertext+tag)

const encoder = new TextEncoder();
const decoder = new TextDecoder();

async function getKey(): Promise<CryptoKey> {
  const secret = process.env.TOKEN_ENCRYPTION_KEY;
  if (!secret) {
    throw new Error(
      "TOKEN_ENCRYPTION_KEY não definido. Configure-o nas variáveis de ambiente.",
    );
  }
  // Deriva uma chave de 256 bits a partir do segredo.
  const hash = await crypto.subtle.digest("SHA-256", encoder.encode(secret));
  return crypto.subtle.importKey("raw", hash, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function encrypt(plaintext: string): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    encoder.encode(plaintext) as BufferSource,
  );
  return `${toBase64(iv)}.${toBase64(new Uint8Array(ciphertext))}`;
}

export async function decrypt(payload: string): Promise<string> {
  const [ivB64, dataB64] = payload.split(".");
  if (!ivB64 || !dataB64) {
    throw new Error("Formato de valor criptografado inválido.");
  }
  const key = await getKey();
  const iv = fromBase64(ivB64);
  const data = fromBase64(dataB64);
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    data as BufferSource,
  );
  return decoder.decode(plaintext);
}

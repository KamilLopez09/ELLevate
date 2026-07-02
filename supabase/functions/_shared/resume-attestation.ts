const encoder = new TextEncoder();

export interface CreateTokenPayload {
  camper_id: string;
  session_started_at: number;
  exp: number;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (padded.length % 4)) % 4;
  const binary = atob(padded + "=".repeat(padLen));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function signPayload(
  secret: string,
  payloadJson: string,
): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payloadJson),
  );
  return base64UrlEncode(new Uint8Array(signature));
}

async function verifySignature(
  secret: string,
  payloadJson: string,
  signature: string,
): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  try {
    return await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlDecode(signature),
      encoder.encode(payloadJson),
    );
  } catch {
    return false;
  }
}

export async function issueCreateToken(
  secret: string,
  camperId: string,
  sessionStartedAt: number,
  ttlMs: number,
): Promise<string> {
  const payload: CreateTokenPayload = {
    camper_id: camperId,
    session_started_at: sessionStartedAt,
    exp: Date.now() + ttlMs,
  };
  const payloadJson = JSON.stringify(payload);
  const payloadPart = base64UrlEncode(encoder.encode(payloadJson));
  const signature = await signPayload(secret, payloadJson);
  return `${payloadPart}.${signature}`;
}

export async function verifyCreateToken(
  secret: string,
  token: string,
  camperId: string,
  sessionStartedAt: number | undefined,
): Promise<boolean> {
  const parts = token.split(".");
  if (parts.length !== 2) {
    return false;
  }

  const [payloadPart, signature] = parts;
  if (!payloadPart || !signature) {
    return false;
  }

  let payloadJson: string;
  try {
    payloadJson = new TextDecoder().decode(base64UrlDecode(payloadPart));
  } catch {
    return false;
  }

  const validSig = await verifySignature(secret, payloadJson, signature);
  if (!validSig) {
    return false;
  }

  let payload: CreateTokenPayload;
  try {
    payload = JSON.parse(payloadJson) as CreateTokenPayload;
  } catch {
    return false;
  }

  if (payload.camper_id !== camperId) {
    return false;
  }
  if (payload.exp < Date.now()) {
    return false;
  }
  if (
    sessionStartedAt !== undefined &&
    payload.session_started_at !== sessionStartedAt
  ) {
    return false;
  }

  return true;
}

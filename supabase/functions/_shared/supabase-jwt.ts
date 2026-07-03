const encoder = new TextEncoder();

export interface OrganizerWallJwtClaims {
  aud: string;
  exp: number;
  iat: number;
  iss: string;
  sub: string;
  role: string;
  ref?: string;
  wall_topic: string;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Signs a short-lived Supabase-compatible JWT for private Realtime subscribe. */
export async function issueOrganizerWallJwt(
  jwtSecret: string,
  wallTopic: string,
  ttlSeconds: number,
  projectRef?: string,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(encoder.encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const payload: OrganizerWallJwtClaims = {
    aud: "authenticated",
    exp: now + ttlSeconds,
    iat: now,
    iss: "supabase",
    sub: "00000000-0000-4000-8000-000000000001",
    role: "authenticated",
    wall_topic: wallTopic,
  };
  if (projectRef) {
    payload.ref = projectRef;
  }
  const payloadPart = base64UrlEncode(encoder.encode(JSON.stringify(payload)));

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(jwtSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`${header}.${payloadPart}`),
  );

  return `${header}.${payloadPart}.${base64UrlEncode(new Uint8Array(signature))}`;
}

const encoder = new TextEncoder();

async function sha256(value: string): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return new Uint8Array(digest);
}

/** Constant-time string compare via SHA-256 digests. */
export async function secureCompare(
  provided: string,
  expected: string,
): Promise<boolean> {
  const [providedHash, expectedHash] = await Promise.all([
    sha256(provided),
    sha256(expected),
  ]);

  if (providedHash.length !== expectedHash.length) {
    return false;
  }

  let diff = 0;
  for (let i = 0; i < providedHash.length; i += 1) {
    diff |= providedHash[i]! ^ expectedHash[i]!;
  }
  return diff === 0;
}

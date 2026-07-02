/**
 * Cross-platform deploy for ELLevate Supabase Edge Functions.
 * Uses process.env so PowerShell $env:VAR works on Windows.
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing ${name}.`);
    if (name === "SUPABASE_ACCESS_TOKEN") {
      console.error(
        "Create one at https://supabase.com/dashboard/account/tokens",
      );
      console.error('PowerShell: $env:SUPABASE_ACCESS_TOKEN = "sbp_..."');
    } else if (name === "SUPABASE_PROJECT_REF") {
      console.error("From your project URL: https://YOUR_REF.supabase.co");
      console.error('PowerShell: $env:SUPABASE_PROJECT_REF = "your-ref"');
    } else if (name === "ORGANIZER_PASSWORD") {
      console.error("Camp-only password for /admin sign-in.");
      console.error('PowerShell: $env:ORGANIZER_PASSWORD = "your-password"');
    } else if (name === "COUNSELOR_RESET_PIN") {
      console.error("Camp-only PIN for counselor quick-reset on shared tablets.");
      console.error('PowerShell: $env:COUNSELOR_RESET_PIN = "your-pin"');
    } else if (name === "RESUME_ATTESTATION_SECRET") {
      console.error("HMAC secret for resume-code create attestation (32+ random chars).");
      console.error('PowerShell: $env:RESUME_ATTESTATION_SECRET = "your-secret"');
    }
    process.exit(1);
  }
  return value;
}

function run(command, args) {
  console.log(`> ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

requireEnv("SUPABASE_ACCESS_TOKEN");
requireEnv("SUPABASE_PROJECT_REF");
const organizerPassword = requireEnv("ORGANIZER_PASSWORD");
const counselorPin = requireEnv("COUNSELOR_RESET_PIN");
const resumeAttestationSecret = requireEnv("RESUME_ATTESTATION_SECRET");

run("npx", ["supabase", "link", "--project-ref", process.env.SUPABASE_PROJECT_REF, "--yes"]);
run("npx", [
  "supabase",
  "secrets",
  "set",
  `ORGANIZER_PASSWORD=${organizerPassword}`,
  `COUNSELOR_RESET_PIN=${counselorPin}`,
  `RESUME_ATTESTATION_SECRET=${resumeAttestationSecret}`,
]);

const functions = [
  "camper-telemetry",
  "organizer-telemetry",
  "camper-resume",
  "counselor-reset",
];

for (const name of functions) {
  run("npx", ["supabase", "functions", "deploy", name, "--no-verify-jwt"]);
}

console.log("");
console.log("Done.");
console.log("- Apply migration 010_camper_resume_snapshots.sql if not yet applied.");
console.log("- Telemetry writes through camper-telemetry.");
console.log("- Resume codes through camper-resume.");
console.log("- Counselor quick-reset through counselor-reset (COUNSELOR_RESET_PIN).");

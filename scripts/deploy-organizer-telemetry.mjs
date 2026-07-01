/**
 * Cross-platform deploy for camper-telemetry + organizer-telemetry.
 * Uses process.env so PowerShell $env:VAR works on Windows (unlike bash/WSL).
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
      console.error(
        "From your project URL: https://YOUR_REF.supabase.co",
      );
      console.error('PowerShell: $env:SUPABASE_PROJECT_REF = "your-ref"');
    } else if (name === "ORGANIZER_PASSWORD") {
      console.error("Camp-only password for /admin sign-in.");
      console.error('PowerShell: $env:ORGANIZER_PASSWORD = "your-password"');
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

run("npx", ["supabase", "link", "--project-ref", process.env.SUPABASE_PROJECT_REF, "--yes"]);
run("npx", [
  "supabase",
  "secrets",
  "set",
  `ORGANIZER_PASSWORD=${organizerPassword}`,
]);
run("npx", [
  "supabase",
  "functions",
  "deploy",
  "camper-telemetry",
  "--no-verify-jwt",
]);
run("npx", [
  "supabase",
  "functions",
  "deploy",
  "organizer-telemetry",
  "--no-verify-jwt",
]);

console.log("");
console.log("Done.");
console.log("- Telemetry writes through the camper-telemetry Edge Function.");
console.log("- Open https://YOUR-SITE/admin and sign in with ORGANIZER_PASSWORD.");

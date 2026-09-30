export type ResumeRateLimitAction = "token" | "create";

export const RESUME_TOKEN_ISSUE_LIMIT_PER_CAMPER = 10;
export const RESUME_CREATE_LIMIT_PER_CAMPER = 5;
export const RESUME_TOKEN_ISSUE_IP_LIMIT = 200;
export const RESUME_CREATE_IP_LIMIT = 200;

export function resumeIpRateKey(
  action: ResumeRateLimitAction,
  clientIp: string,
): string {
  return `resume-${action}:ip:${clientIp}`;
}

export function resumeCamperRateKey(
  action: ResumeRateLimitAction,
  clientIp: string,
  camperId: string,
): string {
  return `resume-${action}:camper:${clientIp}:${camperId}`;
}

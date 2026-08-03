import "server-only";
import { timingSafeEqual } from "node:crypto";

const LOCAL_ADMIN_KEY = "local-admin";

export function getAdminUrlKey(): string | null {
  const configuredKey = process.env.ADMIN_URL_KEY?.trim();

  if (configuredKey) {
    return configuredKey;
  }

  return process.env.NODE_ENV === "production" ? null : LOCAL_ADMIN_KEY;
}

export function isValidAdminUrlKey(candidate: string): boolean {
  const configuredKey = getAdminUrlKey();

  if (!configuredKey) {
    return false;
  }

  const candidateBuffer = Buffer.from(candidate);
  const configuredBuffer = Buffer.from(configuredKey);

  return (
    candidateBuffer.length === configuredBuffer.length &&
    timingSafeEqual(candidateBuffer, configuredBuffer)
  );
}

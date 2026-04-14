/** Session keys for the external signing + passkey prototype (no backend). */

export const GITHUB_SIGNING_PUB_KEY_STORAGE =
  "ome-prototype-github-signing-public-key";

const PASSKEY_ENROLLMENT_STORAGE = "ome-prototype-passkey-enrollment-complete";

export function isPasskeyEnrollmentComplete(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  try {
    return sessionStorage.getItem(PASSKEY_ENROLLMENT_STORAGE) === "1";
  } catch {
    return false;
  }
}

export function setPasskeyEnrollmentComplete(): void {
  try {
    sessionStorage.setItem(PASSKEY_ENROLLMENT_STORAGE, "1");
  } catch {
    /* ignore */
  }
}

/** Call when the user regenerates the SSH-style signing key so passkey must be set up again. */
export function clearPasskeyEnrollment(): void {
  try {
    sessionStorage.removeItem(PASSKEY_ENROLLMENT_STORAGE);
  } catch {
    /* ignore */
  }
}

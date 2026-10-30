export type SyncVerification = {
  explorerStatus: "PASS" | "FAIL" | "UNVERIFIED";
};

export function syncExitCode(verification: SyncVerification): 0 | 2 {
  return verification.explorerStatus === "PASS" ? 0 : 2;
}

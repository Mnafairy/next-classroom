// getRandomValues works on classroom HTTP addresses as well as localhost/HTTPS.
export function createRunId(
  provider: Pick<Crypto, "getRandomValues"> = crypto,
): string {
  const bytes = provider.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

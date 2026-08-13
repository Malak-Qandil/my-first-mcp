const ALLOWED_HOSTS = new Set<string>([]);

export async function fetchJson(
  url: string,
  { timeoutMs = 8000 } = {},
) {
  const parsedUrl = new URL(url);

  if (!ALLOWED_HOSTS.has(parsedUrl.hostname)) {
    throw new Error("Host is not allowed");
  }

  const response = await fetch(parsedUrl, {
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}
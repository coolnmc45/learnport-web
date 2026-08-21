export const SESSION_CHECK_TIMEOUT_MS = 8_000;

export function buildOAuthLoginUrl(apiBaseUrl: string, currentUrl: string) {
  const base = apiBaseUrl.replace(/\/$/, '');
  const url = new URL(`${base}/api/oauth/login`, currentUrl);
  url.searchParams.set('returnTo', currentUrl);
  return url.toString();
}

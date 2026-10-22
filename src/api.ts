import { requestNewAccessToken } from "./googleToken";

const API_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// GET from the Ecosystem API with the Google access token.
// If the token has expired, gets a fresh one and retries once.
export async function apiGet<T>(
  path: string,
  accessToken: string,
  onNewAccessToken: (token: string) => void
): Promise<T> {
  const get = (token: string) =>
    fetch(`${API_URL}${path}`, { headers: { Authorization: `Bearer ${token}` } });

  let response = await get(accessToken);
  if (response.status === 401) {
    const newToken = await requestNewAccessToken();
    onNewAccessToken(newToken);
    response = await get(newToken);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = typeof body?.detail === "string" ? body.detail : null;
    throw new ApiError(response.status, detail ?? `API request failed (${response.status})`);
  }
  return response.json();
}

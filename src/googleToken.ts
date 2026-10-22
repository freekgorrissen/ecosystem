// Minimal typing for the Google Identity Services token client (loaded by @react-oauth/google)
interface TokenResponse {
  access_token?: string;
  expires_in?: number;
  error?: string;
}

interface GoogleIdentity {
  accounts: {
    oauth2: {
      initTokenClient: (config: {
        client_id: string;
        scope: string;
        callback: (response: TokenResponse) => void;
        error_callback?: (error: { type: string }) => void;
      }) => { requestAccessToken: (options?: { prompt?: string }) => void };
    };
  };
}

export const GOOGLE_SCOPES =
  "openid email profile https://www.googleapis.com/auth/calendar.readonly";

let pendingRequest: Promise<string> | null = null;

// Silently ask Google for a fresh access token, e.g. after the old one expired.
// Requests made at the same time share one token request.
export function requestNewAccessToken(): Promise<string> {
  if (pendingRequest) return pendingRequest;

  const google = (window as unknown as { google?: GoogleIdentity }).google;
  if (!google?.accounts?.oauth2) {
    return Promise.reject(new Error("Google sign-in isn't loaded"));
  }

  pendingRequest = new Promise<string>((resolve, reject) => {
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: GOOGLE_SCOPES,
      callback: (response) => {
        if (!response.access_token) {
          reject(new Error(response.error ?? "Google didn't return an access token"));
          return;
        }
        localStorage.setItem("accessToken", response.access_token);
        if (response.expires_in) {
          localStorage.setItem(
            "accessTokenExpiresAt",
            (Date.now() + response.expires_in * 1000).toString()
          );
        }
        resolve(response.access_token);
      },
      error_callback: (error) => reject(new Error(`Google sign-in failed (${error.type})`)),
    });
    tokenClient.requestAccessToken({ prompt: "" });
  }).finally(() => {
    pendingRequest = null;
  });
  return pendingRequest;
}

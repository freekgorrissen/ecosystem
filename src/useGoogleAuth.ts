import { useEffect, useRef } from "react";
import { useGoogleLogin } from "@react-oauth/google";

interface UseGoogleAuthOptions {
  setUser: (user: Record<string, unknown>) => void;
  setAccessToken: (token: string | null) => void;
}

// Type for the Google Token Client (from GIS)
type GoogleTokenClient = {
  requestAccessToken: (options?: { prompt?: string }) => void;
};

export function useGoogleAuth({ setUser, setAccessToken }: UseGoogleAuthOptions) {
  // Use number for browser timer
  const refreshTimer = useRef<number | null>(null);
  const tokenClientRef = useRef<GoogleTokenClient | null>(null);

  // Helper to schedule token refresh
  const scheduleTokenRefresh = (expiresIn: number) => {
    if (refreshTimer.current) window.clearTimeout(refreshTimer.current);
    // Refresh 1 minute before expiry
    refreshTimer.current = window.setTimeout(() => {
      if (tokenClientRef.current) {
        tokenClientRef.current.requestAccessToken({ prompt: "" });
      }
    }, (expiresIn - 60) * 1000);
  };

  // Setup Google login
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      if (tokenResponse.access_token) {
        setAccessToken(tokenResponse.access_token);
        localStorage.setItem("accessToken", tokenResponse.access_token);
        // Store expiry time
        if (tokenResponse.expires_in) {
          localStorage.setItem("accessTokenExpiresAt", (Date.now() + tokenResponse.expires_in * 1000).toString());
          scheduleTokenRefresh(tokenResponse.expires_in);
        }
        // Fetch user info with access_token
        fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        })
          .then((res) => res.json())
          .then((profile) => {
            setUser(profile);
            localStorage.setItem("user", JSON.stringify(profile));
          });
      }
    },
    onError: () => {
      console.log("Login Failed");
    },
    scope: "openid email profile https://www.googleapis.com/auth/calendar.readonly",
    flow: "implicit",
  });

  // Setup GIS token client for silent refresh
  useEffect(() => {
    // @ts-expect-error: google.accounts.oauth2 may not be typed
    if (window.google && window.google.accounts && window.google.accounts.oauth2) {
      // @ts-expect-error: google.accounts.oauth2 may not be typed
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: "openid email profile https://www.googleapis.com/auth/calendar.readonly",
        callback: (tokenResponse: { access_token: string; expires_in: number }) => {
          if (tokenResponse.access_token) {
            setAccessToken(tokenResponse.access_token);
            localStorage.setItem("accessToken", tokenResponse.access_token);
            if (tokenResponse.expires_in) {
              localStorage.setItem("accessTokenExpiresAt", (Date.now() + tokenResponse.expires_in * 1000).toString());
              scheduleTokenRefresh(tokenResponse.expires_in);
            }
          }
        },
      });
    }
    return () => {
      if (refreshTimer.current) window.clearTimeout(refreshTimer.current);
    };
  }, [setAccessToken]);

  // On mount, if accessToken exists and is not expired, schedule refresh
  useEffect(() => {
    const expiresAt = localStorage.getItem("accessTokenExpiresAt");
    if (expiresAt) {
      const msLeft = parseInt(expiresAt) - Date.now();
      if (msLeft > 0) {
        scheduleTokenRefresh(msLeft / 1000);
      }
    }
  }, []);

  return login;
}

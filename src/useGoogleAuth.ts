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
  const tokenClientRef = useRef<GoogleTokenClient | null>(null);

  // Setup Google login
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      if (tokenResponse.access_token) {
        setAccessToken(tokenResponse.access_token);
        localStorage.setItem("accessToken", tokenResponse.access_token);
        // Store expiry time
        if (tokenResponse.expires_in) {
          localStorage.setItem("accessTokenExpiresAt", (Date.now() + tokenResponse.expires_in * 1000).toString());
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
            }
          }
        },
      });
    }
  }, [setAccessToken]);

  // On mount, check if token is expired and refresh if needed
  useEffect(() => {
    const expiresAt = localStorage.getItem("accessTokenExpiresAt");
    if (expiresAt) {
      const msLeft = parseInt(expiresAt) - Date.now();
      if (msLeft <= 0 && tokenClientRef.current) {
        // Token is expired, refresh it immediately
        tokenClientRef.current.requestAccessToken({ prompt: '' });
      }
    }
  }, []);

  return login;
}

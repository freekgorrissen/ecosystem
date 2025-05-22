import { useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Header from "./Header";
import Calendar from "./Calendar";
import { Container } from "@mui/material";

interface UserInfoType {
  picture?: string;
  [key: string]: unknown;
}

function App() {
  const [user, setUser] = useState<UserInfoType | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem("accessToken");
  });

  // Keep localStorage in sync on logout
  const handleSetUser = (u: UserInfoType | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem("user", JSON.stringify(u));
    } else {
      localStorage.removeItem("user");
    }
  };
  const handleSetAccessToken = (t: string | null) => {
    setAccessToken(t);
    if (t) {
      localStorage.setItem("accessToken", t);
    } else {
      localStorage.removeItem("accessToken");
    }
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Header
          user={user}
          setUser={handleSetUser}
          setAccessToken={handleSetAccessToken}
        />
        <Container>
        <main style={{ width: "100%", boxSizing: "border-box", marginTop: "80px", flex: 1 }}>
          {user && accessToken && <Calendar accessToken={accessToken} />}
        </main>

        </Container>
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;

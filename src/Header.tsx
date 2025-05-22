import { useRef, useState, useEffect } from "react";
import { useGoogleAuth } from "./useGoogleAuth";

interface UserInfoType {
  picture?: string;
  [key: string]: unknown;
}

interface HeaderProps {
  user: UserInfoType | null;
  setUser: (user: UserInfoType | null) => void;
  setAccessToken: (token: string | null) => void;
}

const Header = ({ user, setUser, setAccessToken }: HeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  // Extract user name (try name, fallback to email, else unknown)
  const userName = user?.name || user?.email || "Unknown";

  // useGoogleLogin for implicit flow
  const login = useGoogleAuth({ setUser, setAccessToken });

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem 2rem",
        background: "teal",
        width: "100vw",
        boxSizing: "border-box",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
      }}
    >
      <span
        style={{
          fontWeight: "bold",
          fontSize: "1.5rem",
          color: "black",
        }}
      >
        EcoSystem
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {!user && (
          <button
            onClick={() => login()}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "1rem",
              borderRadius: 4,
              border: "none",
              background: "#fff",
              color: "teal",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Login with Google
          </button>
        )}
        {user && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              position: "relative",
            }}
            ref={menuRef}
          >
            <span style={{ fontSize: "1rem", color: "black" }}>{`Ingelogd als ${userName}`}</span>
            <img
              src={user.picture as string}
              alt="User"
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                objectFit: "cover",
                cursor: "pointer",
              }}
              onClick={() => setMenuOpen((open) => !open)}
            />
            {menuOpen && (
              <div
                style={{
                  position: "absolute",
                  top: 50,
                  right: 0,
                  background: "#fff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  borderRadius: 6,
                  minWidth: 120,
                  zIndex: 2000,
                  padding: "0.5rem 0",
                }}
              >
                <button
                  style={{
                    width: "100%",
                    background: "none",
                    border: "none",
                    padding: "0.5rem 1rem",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: "1rem",
                    color: "black",
                  }}
                  onClick={() => {
                    setUser(null);
                    setAccessToken(null); // Clear access token on logout
                    setMenuOpen(false);
                  }}
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

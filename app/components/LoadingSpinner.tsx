import { useEffect, useState } from "react";

// How long to wait before showing a "taking too long" message.
// Wallet provider SDKs (Privy, WalletConnect) can take several seconds
// to initialize, but hanging beyond 12 s usually means a config issue
// (e.g. domain not authorized in the Privy or WalletConnect dashboard).
const LOADING_TIMEOUT_MS = 12000;

export const LoadingSpinner = () => {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), LOADING_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  if (timedOut) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100vh",
          background: "rgb(8 8 20)",
          gap: "20px",
          padding: "2rem",
          boxSizing: "border-box",
          fontFamily: "Manrope, Inter, sans-serif",
          textAlign: "center",
        }}
      >
        <img
          src="/logo.svg"
          alt="Virgos"
          style={{ height: "52px", opacity: 0.92 }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div style={{ color: "rgba(255,255,255,0.85)", fontSize: "16px", fontWeight: 600 }}>
          Taking longer than expected…
        </div>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", maxWidth: "420px", lineHeight: "1.6" }}>
          The app is having trouble initializing. This is often caused by a
          wallet provider configuration issue. Please check your browser console
          for errors, then try refreshing the page.
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: "8px",
            padding: "10px 28px",
            background: "rgb(109, 92, 246)",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          Reload
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100vh",
        background: "rgb(8 8 20)",
        gap: "28px",
      }}
    >
      <img
        src="/logo.svg"
        alt="Virgos"
        style={{
          height: "52px",
          animation: "virgos-pulse 1.8s ease-in-out infinite",
        }}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>
        Connecting to wallet providers…
      </div>
      <style>{`
        @keyframes virgos-pulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.04); }
        }
      `}</style>
    </div>
  );
};



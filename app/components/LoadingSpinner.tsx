export const LoadingSpinner = () => (
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
      src="/logo.webp"
      alt="Virgos"
      style={{ height: "52px", opacity: 0.92 }}
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = "none";
      }}
    />
    <div
      style={{
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        border: "3px solid rgba(109, 92, 246, 0.18)",
        borderTopColor: "rgb(109, 92, 246)",
        animation: "virgos-spin 0.75s linear infinite",
      }}
    />
    <style>{`
      @keyframes virgos-spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);



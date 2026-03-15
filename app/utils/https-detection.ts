export function canUseEmbeddedWallet(): boolean {
  if (typeof window === "undefined") {
    return true;
  }

  return !!(window.crypto && window.crypto.subtle);
}

export function isHttpsOrLocalhost(): boolean {
  if (typeof window === "undefined") {
    return true;
  }

  return (
    window.location.protocol === "https:" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "0.0.0.0"
  );
}

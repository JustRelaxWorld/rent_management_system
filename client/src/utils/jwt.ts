// Browser-compatible JWT decoding (not verification)
// This only decodes the token to read its contents, it doesn't verify the signature

export interface DecodedToken {
  exp?: number;
  iat?: number;
  [key: string]: any;
}

export const decodeToken = (token: string): DecodedToken | null => {
  try {
    // JWT format is: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Base64Url decode the payload
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }
  
  // exp is in seconds, Date.now() is in milliseconds
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
};

export const getTokenExpirationTime = (token: string): number | null => {
  const decoded = decodeToken(token);
  return decoded?.exp || null;
}; 
// Browser-compatible JWT decoding (not verification)
// This only decodes the token to read its contents, it doesn't verify the signature

import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  id?: number;
  role?: string;
  exp?: number;
  iat?: number;
  [key: string]: any; // Other potential fields
}

// Decode a token and return its payload
export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwtDecode<JwtPayload>(token);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Check if a token is expired based on its exp claim
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = jwtDecode<JwtPayload>(token);
    const expiry = payload.exp;
    
    if (!expiry) {
      console.error('Token has no expiration date');
      return true; // Consider tokens without expiry as expired
    }
    
    // Check if current time is past token expiry
    // exp is in seconds, Date.now() is in milliseconds
    const now = Math.floor(Date.now() / 1000);
    
    // Add 5 seconds buffer to avoid edge cases
    return now > expiry + 5;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true; // If we can't decode the token, consider it expired
  }
};

// Get user id from token
export const getUserIdFromToken = (token: string): number | null => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.id || null;
  } catch (error) {
    console.error('Error getting user ID from token:', error);
    return null;
  }
};

// Get user role from token
export const getUserRoleFromToken = (token: string): string | null => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.role || null;
  } catch (error) {
    console.error('Error getting user role from token:', error);
    return null;
  }
};

// Extract token from URL search params
export const extractTokenFromUrl = (search: string): string | null => {
  try {
    const params = new URLSearchParams(search);
    const token = params.get('token');
    
    if (!token) {
      return null;
    }
    
    // Basic validation - check if it looks like a JWT (has two dots)
    if (token.split('.').length !== 3) {
      console.error('Invalid token format in URL');
      return null;
    }
    
    return token;
  } catch (error) {
    console.error('Error extracting token from URL:', error);
    return null;
  }
};

export const getTokenExpirationTime = (token: string): number | null => {
  const decoded = decodeToken(token);
  return decoded?.exp || null;
}; 
import { decodeToken, isTokenExpired, getTokenExpirationTime } from './jwt';
import { v4 as uuidv4 } from 'uuid';

// Create a simple JWT-like token
const createToken = (expiresIn: number = 3600) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    id: 'test-user',
    role: 'tenant',
    exp: Math.floor(Date.now() / 1000) + expiresIn // seconds from now
  }));
  const signature = btoa(uuidv4());
  
  return `${header}.${payload}.${signature}`;
};

// Test valid token
const validToken = createToken();
console.log('Valid token:', validToken);
console.log('Decoded token:', decodeToken(validToken));
console.log('Is token expired?', isTokenExpired(validToken));
console.log('Token expiration time:', new Date(getTokenExpirationTime(validToken)! * 1000).toLocaleString());

// Test expired token
const expiredToken = createToken(-3600); // expired 1 hour ago
console.log('\nExpired token:', expiredToken);
console.log('Decoded token:', decodeToken(expiredToken));
console.log('Is token expired?', isTokenExpired(expiredToken));
console.log('Token expiration time:', new Date(getTokenExpirationTime(expiredToken)! * 1000).toLocaleString());

// Test invalid token
const invalidToken = 'invalid.token.format';
console.log('\nInvalid token:', invalidToken);
console.log('Decoded token:', decodeToken(invalidToken));
console.log('Is token expired?', isTokenExpired(invalidToken)); 
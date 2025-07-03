// This file is kept for compatibility with existing code
// but we're using our browser-compatible JWT solution from utils/jwt.ts instead

declare module 'jsonwebtoken' {
  // These are stubs that will be replaced by our browser-compatible implementation
  export function sign(
    payload: string | object | Buffer,
    secretOrPrivateKey: string | Buffer,
    options?: object
  ): string;
  
  export function verify(
    token: string,
    secretOrPublicKey: string | Buffer,
    options?: object
  ): object | string;
  
  export function decode(
    token: string,
    options?: object
  ): null | { [key: string]: any } | string;
} 
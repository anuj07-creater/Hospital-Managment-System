import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'rhms_super_secret_jwt_key_2026_change_in_production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

export interface TokenPayload {
  id: string;
  role: string;
  email: string;
}

export function generateToken(payload: TokenPayload): string {
  return (jwt.sign as any)(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

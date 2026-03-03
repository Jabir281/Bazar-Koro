import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { UserPublic, UserRole } from '@bazar-koro/shared'

import { env } from './env.js'

export interface JwtClaims {
  sub: string
  roles: UserRole[]
}

export function signToken(user: UserPublic): string {
  const claims: JwtClaims = { sub: user.id, roles: user.roles }
  return jwt.sign(claims, env.jwtSecret, { expiresIn: '7d' })
}

export function verifyToken(token: string): JwtClaims {
  return jwt.verify(token, env.jwtSecret) as JwtClaims
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

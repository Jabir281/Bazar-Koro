import type { NextFunction, Request, Response } from 'express'
import type { UserRole } from '@bazar-koro/shared'

import { verifyToken } from '../auth.js'
import { getUserById } from '../storage.js'

export interface AuthedRequest extends Request {
  user?: {
    id: string
    roles: UserRole[]
    activeRole: UserRole
  }
}

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.header('authorization')
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null

  if (!token) {
    return res.status(401).json({ error: 'Missing Bearer token' })
  }

  try {
    const claims = verifyToken(token)
    const user = await getUserById(claims.sub)
    if (!user) return res.status(401).json({ error: 'User not found' })

    const requestedRole = (req.header('x-active-role') ?? '').toLowerCase() as UserRole
    const activeRole = (requestedRole && user.roles.includes(requestedRole))
      ? requestedRole
      : user.roles[0]

    if (!activeRole) return res.status(403).json({ error: 'User has no roles' })

    req.user = { id: user.id, roles: user.roles, activeRole }
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export function requireRole(roles: UserRole | UserRole[]) {
  const required = Array.isArray(roles) ? roles : [roles]
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' })
    if (!required.includes(req.user.activeRole)) {
      return res.status(403).json({ error: 'Insufficient role', details: { required, active: req.user.activeRole } })
    }
    next()
  }
}

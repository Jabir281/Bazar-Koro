import type { Request, Response } from 'express'

export function healthRoute(_req: Request, res: Response) {
  res.json({ ok: true, service: 'bazar-koro-api', time: new Date().toISOString() })
}

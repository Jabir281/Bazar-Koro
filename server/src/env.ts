import dotenv from 'dotenv'

dotenv.config()

export const env = {
  port: Number(process.env.PORT ?? 3000),
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
  mongoUri: process.env.MongoDB_URI ?? '',
  sendgridApiKey: process.env.SENDGRID_API_KEY ?? '',
  fromEmail: process.env.FROM_EMAIL ?? '',
} as const

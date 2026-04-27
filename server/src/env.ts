
import dotenv from 'dotenv'

dotenv.config()

export const env = {
  port: Number(process.env.PORT ?? 3000),
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
  mongoUri: process.env.MONGODB_URI ?? '',
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? '',
  googleClientId: process.env.Outh_GOOGLE_CLIENT_ID ?? '',
} as const

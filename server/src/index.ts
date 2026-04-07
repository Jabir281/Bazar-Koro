import mongoose from 'mongoose'
import { createApp } from './app.js'
import { env } from './env.js'

async function startServer() {
  if (!env.mongoUri) {
    console.error('Fatal: No MongoDB_URI provided in .env file. Exiting.')
    process.exit(1)
  }

  try {
    await mongoose.connect(env.mongoUri, {
      maxPoolSize: 50,
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    })
    console.log('Connected to MongoDB')
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err)
    process.exit(1)
  }

  const app = createApp()

  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${env.port}`)
  })
}

startServer()

import { createApp } from './app.js'
import { env } from './env.js'

const app = createApp()

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${env.port}`)
})

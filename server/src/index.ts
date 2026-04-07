import { createApp } from './app.js'
import { env } from './env.js'
import 'dotenv/config'; // This line forces Node to read your .env file
import mongoose from 'mongoose';
import { getProductRoute } from './routes/products.js';

const app = createApp()

// Grab the URI from the environment variables
const mongoUri = process.env.MONGODB_URI;

// Connect to MongoDB Atlas
if (mongoUri) {
  mongoose.connect(mongoUri)
    .then(() => console.log('✅ Successfully connected to MongoDB Atlas!'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));
} else {
  console.error('❌ MONGODB_URI is missing from your .env file!');
}
app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${env.port}`)
})

app.get('/api/products/:id', getProductRoute);

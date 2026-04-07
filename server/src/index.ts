import mongoose from 'mongoose';
import { createApp } from './app.js'
import { env } from './env.js'
import 'dotenv/config'; // This line forces Node to read your .env file
import mongoose from 'mongoose';
import { getProductRoute } from './routes/products.js';

async function startServer() {
  if (!env.mongoUri) {
    console.error('Fatal: No MongoDB_URI provided in .env file. Exiting.');
    process.exit(1);
  }

<<<<<<< HEAD
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
=======
  try {
    // mongodb-connection skill guidelines: 
    // maxPoolSize 50 for max concurrent requests with some headroom.
    // use timeouts for failing fast if the DB is unreachable.
    await mongoose.connect(env.mongoUri, {
      maxPoolSize: 50,
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  }

  const app = createApp()

  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${env.port}`)
  })
}

startServer();
>>>>>>> 2fef71fe83e9cf94cd8925093b644a31cb050982

import 'dotenv/config';
import mongoose from 'mongoose';
import Product from './models/Product'; 

// Create a fake valid MongoDB ObjectId for the store
const fakeStoreId = new mongoose.Types.ObjectId();

const dummyProducts = [
  { 
    name: "Asus ROG Gaming Laptop", 
    price: 1200, 
    category: "electronics",
    storeId: fakeStoreId,
    location: { type: "Point", coordinates: [90.4125, 23.8103] } // Dhaka coords
  },
  { 
    name: "Nike Running Shoes", 
    price: 80, 
    category: "clothing",
    storeId: fakeStoreId,
    location: { type: "Point", coordinates: [90.4125, 23.8103] }
  },
  { 
    name: "Miniket Rice 5kg", 
    price: 10, 
    category: "groceries",
    storeId: fakeStoreId,
    location: { type: "Point", coordinates: [90.4125, 23.8103] }
  },
  { 
    name: "Paracetamol 500mg", 
    price: 1, 
    category: "pharmacy",
    storeId: fakeStoreId,
    location: { type: "Point", coordinates: [90.4125, 23.8103] }
  }
];

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error("MONGODB_URI is missing in .env");
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas');

    await Product.deleteMany({});
    console.log('🧹 Cleared existing products');

    await Product.insertMany(dummyProducts);
    console.log(`🌱 Successfully injected ${dummyProducts.length} products!`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
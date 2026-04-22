import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from './models/User.js';
import Product from './models/Product.js';
import { hashPassword } from './auth.js';

async function seedTestData() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error("MONGODB_URI is missing in .env");

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas');

    // Create test admin user
    const adminPasswordHash = await hashPassword('admin123');
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@test.com',
      passwordHash: adminPasswordHash,
      roles: ['admin', 'buyer'],
      neighborhood: 'Dhaka'
    });
    await adminUser.save();
    console.log('✅ Created admin user: admin@test.com / admin123');

    // Create test buyers with neighborhoods
    const buyers = [
      { name: 'Buyer 1', email: 'buyer1@test.com', neighborhood: 'Dhaka' },
      { name: 'Buyer 2', email: 'buyer2@test.com', neighborhood: 'Dhaka' },
      { name: 'Buyer 3', email: 'buyer3@test.com', neighborhood: 'Chittagong' },
      { name: 'Buyer 4', email: 'buyer4@test.com', neighborhood: 'Chittagong' }
    ];

    for (const buyer of buyers) {
      const passwordHash = await hashPassword('buyer123');
      const user = new User({
        name: buyer.name,
        email: buyer.email,
        passwordHash,
        roles: ['buyer'],
        neighborhood: buyer.neighborhood
      });
      await user.save();
    }
    console.log('✅ Created test buyers');

    // Update existing products to be sponsored
    await Product.updateMany({}, { sponsored: true });
    console.log('✅ Marked all products as sponsored');

    await mongoose.disconnect();
    console.log('✅ Test data seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    process.exit(1);
  }
}

seedTestData();
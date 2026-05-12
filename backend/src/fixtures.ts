import mongoose from 'mongoose';
import config from './config.js';
import User from './model/user/User.js';
import Category from './model/category/Category.js';


const run = async () => {
  await mongoose.connect(config.db);
  const db = mongoose.connection;

  const collections = ['users', 'categories'];

  for (const collectionName of collections) {
    try {
      await db.dropCollection(collectionName);
    } catch (e) {
      console.log(
        `Collection ${collectionName} was not present, skipping drop...`,
      );
    }
  }

  const admin = new User({
    fullName: 'admin',
    phone: '0555172032',
    password: 'admin123',
    role: 'ADMIN',
  });
  await admin.save();

  const manager = new User({
    fullName: 'manager',
    phone: '0555172043',
    password: 'manager123',
    role: 'MANAGER',
  });
  await manager.save();

  const client = new User({
    fullName: 'client',
    phone: '0555172011',
    password: 'client123',
    role: 'CLIENT',
  });
  await client.save();

  const categoryOne = new Category({
    title: 'Hot countries',
  });
  await categoryOne.save();

  const categoryTwo = new Category({
    title: 'Cold countries',
  });
  await categoryTwo.save();

  console.log('Fixtures created successfully!');
  await db.close();
};

run().catch(console.error);

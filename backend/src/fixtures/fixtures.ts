import mongoose from 'mongoose';
import config from '../config.js';
import User from '../model/user/User.js';
import Category from '../model/category/Category.js';
import News from '../model/New/News.js';
import Tour from '../model/tour/Tour.js';
import TourSet from '../model/tourSet/TourSet.js';
import Order from '../model/order/Order.js';
import Review from '../model/review/Review.js';
import ContactSettings from '../model/contactSettings/ContactSettings.js';
import AboutUs from '../model/aboutUs/AboutUs.js';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { GridFSBucket } from 'mongodb';
import seedImageToGridFs from './helpers/seedImageToGridFs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getJson = async (fileName: string) => {
  const filePath = path.join(__dirname, 'data', fileName);
  const data = await fs.readFile(filePath, 'utf8');

  return JSON.parse(data);
};

const run = async () => {
  await mongoose.connect(config.db);
  const db = mongoose.connection;

  let bucket: GridFSBucket | undefined | null;

  if (db.db) {
    bucket = new GridFSBucket(db.db, {
      bucketName: 'uploads',
    });
  }

  try {
    const collections = [
      'users',
      'categories',
      'news',
      'tours',
      'toursets',
      'orders',
      'reviews',
      'contactsettings',
      'aboutus',
    ];

    for (const collectionName of collections) {
      try {
        await db.dropCollection(collectionName);
        await db.dropCollection('uploads.files');
        await db.dropCollection('uploads.chunks');
      } catch (e) {
        const err = e as { code?: number };
        if (err.code === 26) {
          console.log(
            `Коллекция ${collectionName} отсутствовала, пропускаем...`,
          );
          continue;
        }
        throw e;
      }
    }

    for (const collectionName of collections) {
      try {
        switch (collectionName) {
          case 'users':
            const usersData = await getJson(collectionName + '.json');

            for (const userData of usersData) {
              const user = new User(userData);
              await user.save();
            }
            console.log('Пользователи успешно созданы');
            break;
          case 'categories':
            const categoriesData = await getJson(collectionName + '.json');

            for (const categoryData of categoriesData) {
              const category = new Category(categoryData);
              await category.save();
            }
            console.log('Категории успешно созданы');
            break;
          case 'news':
            const newsData = await getJson(collectionName + '.json');

            for (const newData of newsData) {
              if (newData.image && bucket) {
                newData.image = await seedImageToGridFs(bucket, newData.image);
              }
              const news = new News(newData);
              await news.save();
            }
            console.log('Новости успешно созданы');
            break;
          case 'tours':
            const toursData = await getJson(collectionName + '.json');

            for (const tourData of toursData) {
              const tour = new Tour(tourData);
              await tour.save();
            }

            console.log('Туры успешно созданы');
            break;
          case 'toursets':
            const toursetsData = await getJson(collectionName + '.json');

            for (const toursetData of toursetsData) {
              const tourset = new TourSet(toursetData);
              await tourset.save();
            }
            console.log('Турсеты успешно созданы');
            break;
          case 'orders':
            const ordersData = await getJson(collectionName + '.json');

            for (const orderData of ordersData) {
              const order = new Order(orderData);
              await order.save();
            }
            console.log('Заявки успешно созданы');
            break;
          case 'reviews':
            const reviewsData = await getJson(collectionName + '.json');

            for (const reviewData of reviewsData) {
              const review = new Review(reviewData);
              await review.save();
            }
            console.log('Отзывы успешно созданы');
            break;
          case 'contactsettings':
            const contactSettingsData = await getJson(collectionName + '.json');

            for (const settingData of contactSettingsData) {
              const contactSetting = new ContactSettings(settingData);
              await contactSetting.save();
            }
            console.log('Настройки контактов успешно созданы');
            break;

          case 'aboutus':
            const aboutUsData = await getJson(collectionName + '.json');

            for (const aboutData of aboutUsData) {
              const aboutUs = new AboutUs(aboutData);
              await aboutUs.save();
            }
            console.log('О нас успешно создано');
            break;
        }
      } catch (e) {
        const err = e as { code?: number };
        if (err.code === 26) {
          console.log(
            `Коллекция ${collectionName} отсутствовала, пропускаем...`,
          );
          continue;
        }
        throw e;
      }
    }

    console.log('Fixtures created successfully!');
  } finally {
    await db.close();
  }
};

run().catch(console.error);

import config from '@/config.js';
import Category from '@/model/category/Category.js';
import TourSet from '@/model/tourSet/TourSet.js';
import type { Types } from 'mongoose';


interface TourCategoryType {
  _id: string;
  title: string;
}

export interface TourDocumentType {
  _id: Types.ObjectId;
  title: string;
  countryCode: string;
  description: string;
  images: string[];
  category: Types.ObjectId;
  baseAdvantages: string[];
  rating: number;
  ratingCount: number;
  isPublished: boolean;
  createdAt: string;
}

export interface TourType extends Omit<TourDocumentType, 'category'> {
  category: TourCategoryType;
}

export interface ITourWithTourSetFields extends TourType {
  isHot: boolean;
  minPrice: number;
  hotelLocation: string;
  nextStartDate: string;
  durationDays: number;
} 


export default async function telegramMessage(tour: ITourWithTourSetFields) {

    const text = formatTourText(tour);
    const url = `${config.tgApi}${config.botToken}/sendMessage`;

    const result = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chat_id: config.channelId,
        text,
        parse_mode: "HTML",
        reply_markup: {
            inline_keyboard: [[
            { text: "🌍 Подробнее о туре", url: `https://yoursite.com/tour/${tour._id}` }
            ]]
        }
      }),
    });
}

function formatTourText(tour: ITourWithTourSetFields): string {
  const date = new Date(tour.nextStartDate);
  const formattedDate = date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const formattedPrice = tour.minPrice.toLocaleString('ru-RU');
  const hotPrefix = tour.isHot ? '🔥 ' : '';

  return (
    `${hotPrefix}<b>${tour.title}</b> [<i>${tour.category.title}</i>]\n\n` +
    `📝 <b>Описание:</b> ${tour.description}\n` +
    `📍 <b>Локация:</b> ${tour.hotelLocation}\n` +
    `📅 <b>Старт:</b> ${formattedDate} (${tour.durationDays} дней)\n` +
    `⭐️ <b>Рейтинг:</b> ${tour.rating} (${tour.ratingCount} отз.)\n\n` +
    `💳 <b>Стоимость от:</b> ${formattedPrice} ₽`
  );
}


export async function aggregate_tour(tour: TourDocumentType): Promise<ITourWithTourSetFields> {
  const tourSets = await TourSet.find({ tour: tour._id }).lean();
  const category = await Category.findById(tour.category).lean() as unknown as TourCategoryType;
  const isHot = tourSets.some((s) => s.isHot);
  const minPrice = tourSets.length
    ? Math.min(...tourSets.map((s) => s.price))
    : 0;
  const hotelLocation = tourSets[0]?.hotelLocation ?? '';
  const nextStartDate = tourSets.length
    ? new Date(
        Math.min(...tourSets.map((s) => new Date(s.startDate).getTime())),
      ).toString()
    : '';

  const durationDays =
    tourSets[0]?.startDate && tourSets[0]?.endDate
      ? Math.ceil(
          (new Date(tourSets[0].endDate).getTime() -
            new Date(tourSets[0].startDate).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

  return {
    ...tour,
    category,
    isHot,
    minPrice,
    hotelLocation,
    nextStartDate,
    durationDays,
  };
}
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
  tourSetId?: string;
  isHot: boolean;
  minPrice: number | null;
  hotelLocation: string | null;
  nextStartDate: string | null;
  durationDays: number | null;
}

export default async function telegramMessage(tour: ITourWithTourSetFields) {
  const text = formatTourText(tour);
  const photo_url = `${config.corsOrigin}/api/tours/image/${tour.images[0]}`;
  const url = `${config.tgApi}${config.botToken}/sendPhoto`;

  const keyboard = tour.tourSetId
    ? {
        inline_keyboard: [
          [
            {
              text: '🎒 Хочу поехать!',
              callback_data: `book:${tour.tourSetId}`,
            },
          ],
        ],
      }
    : undefined;

  const result = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: config.channelId,
      photo: photo_url,
      caption: text,
      parse_mode: 'HTML',
      reply_markup: keyboard,
    }),
  });
  if (!result.ok) {
    const errorBody = (await result.json().catch(() => null)) as {
      description: string;
    };
    console.error(
      `Не удалось отправить тур ${tour._id}:`,
      result.status,
      errorBody?.description ?? 'unknown error',
    );
  }
}

function truncate(str: string, maxLength: number): string {
  return str.length > maxLength ? str.slice(0, maxLength - 1) + '…' : str;
}

function formatTourText(tour: ITourWithTourSetFields): string {
  const hotPrefix = tour.isHot ? '🔥 ' : '';

  let text =
    `${hotPrefix}<b>${tour.title}</b> [<i>${tour.category.title}</i>]\n\n` +
    `📝 <b>Описание:</b> ${truncate(tour.description, 400)}\n`;

  if (tour.nextStartDate && tour.minPrice) {
    const date = new Date(tour.nextStartDate);
    const formattedDate = date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const formattedPrice = tour.minPrice.toLocaleString('ru-RU');

    text +=
      `📅 <b>Старт:</b> ${formattedDate} (${tour.durationDays} дней)\n` +
      `⭐️ <b>Рейтинг:</b> ${tour.rating} (${tour.ratingCount} отз.)\n\n` +
      `💳 <b>Стоимость от:</b> ${formattedPrice} ₽\n` +
      `📍 <b>Локация:</b> ${tour.hotelLocation}\n`;
  } else {
    text +=
      `📅 <b>В ближайшее время не планируется посещение данного места</b>\n` +
      `⭐️ <b>Рейтинг:</b> ${tour.rating} (${tour.ratingCount} отз.)\n\n`;
  }
  return text;
}

export async function aggregate_tour(
  tour: TourDocumentType,
): Promise<ITourWithTourSetFields> {
  const tourSets = await TourSet.find({ tourId: tour._id }).lean();

  const category = (await Category.findById(
    tour.category,
  ).lean()) as unknown as TourCategoryType | null;
  if (!category) {
    throw new Error(
      `Категория ${tour.category} не найдена для тура ${tour._id}`,
    );
  }

  const isHot = tourSets.some((s) => s.isHot);

  const minPrice = tourSets.length
    ? Math.min(...tourSets.map((s) => s.price))
    : null;
  const hotelLocation = tourSets[0]?.hotelLocation ?? null;

  const nextStartDate = tourSets.length
    ? new Date(
        Math.min(...tourSets.map((s) => new Date(s.startDate).getTime())),
      ).toISOString()
    : null;

  const durationDays =
    tourSets[0]?.startDate && tourSets[0]?.endDate
      ? Math.ceil(
          (new Date(tourSets[0].endDate).getTime() -
            new Date(tourSets[0].startDate).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : null;

  const tourSetId = tourSets[0]?._id?.toString();

  return {
    ...tour,
    category,
    isHot,
    minPrice,
    hotelLocation,
    nextStartDate,
    durationDays,
    ...(tourSetId && { tourSetId }),
  };
}

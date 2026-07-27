import type { AboutUsFields, AboutUsFieldsMutation } from '@/types/aboutUs';
import type { Faq } from '@/types/faq';
import type { IContactSettings } from '@/types/contactSettings';
import type { IUser } from '@/types/user';
import type { CategoryTypeResponse, TourCategoryType } from '@/types/tour';

export const aboutUsStub: AboutUsFields = {
  _id: 'about-1',
  pageTitle: 'О нас',
  description: 'Virgin Travel помогает выбрать тур без лишнего стресса',
  contentBlocks: [{ title: 'Надёжность', body: 'Собираем детали тура в одном месте' }],
  missionTitle: 'Мы делаем выбор тура понятнее',
  ideaBlocks: [{ title: 'Прозрачность', body: 'Показываем детали до принятия решения' }],
  steps: ['Выберите направление', 'Оставьте заявку'],
};

export const aboutUsMutationStub: AboutUsFieldsMutation = (() => {
  const { _id, ...rest } = aboutUsStub;
  void _id;
  return rest;
})();

export const faqStub: Faq = {
  _id: 'faq-1',
  question: 'Как оплатить тур?',
  answer: 'Онлайн или в офисе',
  isPublished: true,
  order: 1,
  createdAt: '2026-07-01T10:00:00Z',
  updatedAt: '2026-07-01T10:00:00Z',
};

export const contactsStub: IContactSettings = {
  phone: '+996700123456',
  email: 'info@vts.kg',
  address: 'г. Бишкек, ул. Токтогула 1',
  workingHours: {
    weekdays: { from: '09:00', to: '18:00' },
    saturday: { isClosed: false, from: '10:00', to: '15:00' },
    sunday: { isClosed: true, from: '', to: '' },
  },
};

export const userStub: IUser = {
  _id: 'u1',
  fullName: 'Админ Тестовый',
  phone: '+996700000001',
  status: 'active',
  role: 'ADMIN',
  createdAt: '2026-07-01T10:00:00Z',
  updatedAt: '2026-07-01T10:00:00Z',
};

export const managerStub: IUser = {
  ...userStub,
  _id: 'u2',
  fullName: 'Менеджер Тестовый',
  phone: '+996700000002',
  role: 'MANAGER',
};

export const categoryStub: TourCategoryType = { _id: 'c1', title: 'Походы' };

export const categoriesResponseStub: CategoryTypeResponse = {
  categories: [categoryStub],
  meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
};

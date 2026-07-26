import {
  MapPin,
  Calendar,
  User,
  Car,
  Building2,
  Telescope,
    Umbrella,
    Castle,
    Mountain,
    UtensilsCrossed,
    Sticker,
    Baby
} from 'lucide-react';

export const tags = [
  { icon: MapPin, label: 'Любое направление' },
  { icon: Calendar, label: 'Ваши даты' },
  { icon: User, label: 'Личный менеджер' },
  { icon: Car, label: 'Трансфер включён' },
  { icon: Building2, label: 'Отель на выбор' },
  { icon: Telescope, label: 'Экскурсии по желанию' },
];

export const CUSTOM_TOUR_ACTIVITIES = [
  {value: 'beach', label: 'Пляж', icon: Umbrella},
  {value: 'excursion', label: 'Экскурсии', icon: Castle},
  {value: 'active', label: 'Актив', icon: Mountain},
  {value: 'gastro', label: 'Гастро', icon: UtensilsCrossed},
  {value: 'calm', label: 'Спокойствие', icon: Sticker},
  {value: 'kids', label: 'С детьми', icon: Baby}
]

export const steps = [
  { title: 'Оставляете заявку', description: 'Куда, когда и что хотите' },
  { title: 'Менеджер подбирает', description: 'Варианты отелей, рейсов, цены' },
  { title: 'Согласуем маршрут', description: 'Дорабатываем под вас' },
  { title: 'В путь!', description: 'Всё готово к поездке' },
];
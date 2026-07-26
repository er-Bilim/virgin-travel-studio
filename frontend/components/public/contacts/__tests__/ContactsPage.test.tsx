import { render, screen } from '@testing-library/react';
import { useContacts } from '@/lib/hooks/contactSettings';
import { usePublicFaqs } from '@/lib/hooks/faq';
import ContactsPage from "@/components/public/contacts/ContactsPage";

vi.mock('@/lib/hooks/contactSettings', () => ({
  useContacts: vi.fn(),
}));

vi.mock('@/lib/hooks/faq', () => ({
  usePublicFaqs: vi.fn(),
}));

vi.mock('@/components/shared/Breadcrumbs', () => ({
  Breadcrumbs: () => <div data-testid="breadcrumbs" />,
}));

vi.mock('@/components/public/buttons/share/ShareButton', () => ({
  default: ({ platform }: { platform: string }) => (
    <button data-testid={`share-${platform}`}>{platform}</button>
  ),
}));

vi.mock('@/components/shared/StateCard', () => ({
  default: ({ title }: { title: string }) => (
    <div data-testid="state-card">{title}</div>
  ),
}));

const mockSettings = {
  email: 'info@travel.kg',
  phone: '+996555123456',
  address: 'г. Бишкек, ул. Киевская 123',
  whatsapp: '+996555123456',
  telegram: '@travel_admin',
  instagram: 'https://instagram.com/travel',
  mapEmbedUrl: 'https://maps.google.com/embed/123',
  workingHours: {
    weekdays: { from: '09:00', to: '18:00' },
    saturday: { isClosed: false, from: '10:00', to: '15:00' },
    sunday: { isClosed: true, from: '', to: '' },
  },
};

const mockFaqs = [
  {
    _id: 'faq-1',
    question: 'Как забронировать тур?',
    answer: 'Отправьте заявку через сайт.',
  },
];

const setup = ({
                 isLoadingContacts = false,
                 isErrorContacts = false,
                 settingsData = mockSettings as never,
                 isPendingFaq = false,
                 isErrorFaq = false,
                 faqsData = mockFaqs as never,
               } = {}) => {
  vi.mocked(useContacts).mockReturnValue({
    data: settingsData,
    isLoading: isLoadingContacts,
    isError: isErrorContacts,
  } as never);

  vi.mocked(usePublicFaqs).mockReturnValue({
    data: faqsData,
    isPending: isPendingFaq,
    isError: isErrorFaq,
  } as never);

  return render(<ContactsPage />);
};

describe('ContactsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('отображает скелетон при загрузке контактов или FAQ', () => {
    const { container } = setup({ isLoadingContacts: true });

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('отображает карточку ошибки, если запуск завершился с ошибкой', () => {
    setup({ isErrorContacts: true });

    expect(screen.getByTestId('state-card')).toBeInTheDocument();
    expect(screen.getByText('Упс, что-то пошло не так')).toBeInTheDocument();
  });

  it('отображает сообщение, если контакты отсутствуют', () => {
    setup({ settingsData: null as never });

    expect(
      screen.getByText('К сожалению, контактная информация временно не заполнена.'),
    ).toBeInTheDocument();
  });

  it('успешно рендерит контактную информацию, режим работы и FAQ', () => {
    setup();

    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
    expect(screen.getByText('Офис в Бишкеке')).toBeInTheDocument();
    expect(screen.getByText('info@travel.kg')).toBeInTheDocument();
    expect(screen.getByText('+996555123456')).toBeInTheDocument();
    expect(screen.getByText('г. Бишкек, ул. Киевская 123')).toBeInTheDocument();

    expect(screen.getByText('Пн-Пт: 09:00 - 18:00')).toBeInTheDocument();
    expect(screen.getByText('Сб: 10:00 - 15:00')).toBeInTheDocument();
    expect(screen.getByText('Вс: Выходной')).toBeInTheDocument();

    expect(screen.getByTestId('share-telegram')).toBeInTheDocument();
    expect(screen.getByTestId('share-whatsapp')).toBeInTheDocument();
    expect(screen.getByTestId('share-instagram')).toBeInTheDocument();

    expect(screen.getByText('Как забронировать тур?')).toBeInTheDocument();
    expect(screen.getByTitle('Карта местоположения офиса')).toBeInTheDocument();
  });

  it('отображает заглушку для карты, если ссылка на карту отсутствует', () => {
    const settingsWithoutMap = { ...mockSettings, mapEmbedUrl: '' };
    setup({ settingsData: settingsWithoutMap as never });

    expect(
      screen.getByText('Карта временно недоступна'),
    ).toBeInTheDocument();
  });

  it('отображает сообщение "Вопросов пока нет", если список FAQ пуст', () => {
    setup({ faqsData: [] as never });

    expect(screen.getByText('Вопросов пока нет.')).toBeInTheDocument();
  });
});
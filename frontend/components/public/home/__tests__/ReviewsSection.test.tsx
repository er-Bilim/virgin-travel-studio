import { render, screen } from '@testing-library/react';
import ReviewsSection from '../ReviewsSection';
import { useHomepageSettings } from '@/lib/hooks/homepageSettingsHooks';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/lib/hooks/homepageSettingsHooks');

vi.mock('@/components/public/reviews/ReviewsCarousel', () => ({
  default: () => <div data-testid="reviews-carousel-component">Reviews Carousel</div>,
}));

describe('ReviewsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('показывает скелетон во время загрузки настроек заголовка (Loading state)', () => {
    vi.mocked(useHomepageSettings).mockReturnValue({
      data: undefined,
      isPending: true,
    } as any);

    render(<ReviewsSection />);

    expect(screen.queryByText('Что говорят путешественники')).not.toBeInTheDocument();
  });

  it('отображает дефолтные заголовок и подзаголовок, если данные отсутствуют (Fallback state)', () => {
    vi.mocked(useHomepageSettings).mockReturnValue({
      data: undefined,
      isPending: false,
    } as any);

    render(<ReviewsSection />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Что говорят путешественники' })
    ).toBeInTheDocument();

    expect(
      screen.getByText('Реальные впечатления тех, кто уже съездил с нами')
    ).toBeInTheDocument();
  });

  it('отображает кастомные заголовок и подзаголовок из настроек', () => {
    const mockSettings = {
      reviewsPage: {
        title: 'Отзывы наших клиентов',
        subtitle: 'Впечатления и эмоции наших путешественников',
      },
    };

    vi.mocked(useHomepageSettings).mockReturnValue({
      data: mockSettings,
      isPending: false,
    } as any);

    render(<ReviewsSection />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Отзывы наших клиентов' })
    ).toBeInTheDocument();

    expect(
      screen.getByText('Впечатления и эмоции наших путешественников')
    ).toBeInTheDocument();
  });

  it('успешно рендерит дочерний компонент карусели отзывов', () => {
    vi.mocked(useHomepageSettings).mockReturnValue({
      data: undefined,
      isPending: false,
    } as any);

    render(<ReviewsSection />);

    expect(screen.getByTestId('reviews-carousel-component')).toBeInTheDocument();
  });
});
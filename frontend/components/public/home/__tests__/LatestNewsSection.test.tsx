import { render, screen } from '@testing-library/react';
import LatestNewsSection from '../LatestNewsSection';
import { useHomepageSettings } from '@/lib/hooks/homepageSettingsHooks';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/lib/hooks/homepageSettingsHooks');

vi.mock('@/components/public/news/LatestNews', () => ({
  default: () => <div data-testid="latest-news-component">Latest News List</div>,
}));

describe('LatestNewsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('показывает скелетон во время загрузки настроек заголовка (Loading state)', () => {
    vi.mocked(useHomepageSettings).mockReturnValue({
      data: undefined,
      isPending: true,
    } as any);

    render(<LatestNewsSection />);

    expect(screen.queryByText('Последние новости')).not.toBeInTheDocument();
  });

  it('отображает дефолтные заголовок и подзаголовок, если данные отсутствуют (Fallback state)', () => {
    vi.mocked(useHomepageSettings).mockReturnValue({
      data: undefined,
      isPending: false,
    } as any);

    render(<LatestNewsSection />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Последние новости' })
    ).toBeInTheDocument();

    expect(
      screen.getByText('Свежие обновления, полезные заметки и вдохновение для будущих путешествий')
    ).toBeInTheDocument();
  });

  it('отображает кастомные заголовок и подзаголовок из настроек', () => {
    const mockSettings = {
      mainLatestNews: {
        title: 'Наш Журнал',
        subtitle: 'Интересные статьи о туризме и путешествиях',
      },
    };

    vi.mocked(useHomepageSettings).mockReturnValue({
      data: mockSettings,
      isPending: false,
    } as any);

    render(<LatestNewsSection />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Наш Журнал' })
    ).toBeInTheDocument();

    expect(
      screen.getByText('Интересные статьи о туризме и путешествиях')
    ).toBeInTheDocument();
  });

  it('содержит корректную ссылку "Все новости" на страницу /news', () => {
    vi.mocked(useHomepageSettings).mockReturnValue({
      data: undefined,
      isPending: false,
    } as any);

    render(<LatestNewsSection />);

    const link = screen.getByRole('link', { name: /Все новости/i });
    expect(link).toHaveAttribute('href', '/news');
  });

  it('успешно рендерит дочернюю секцию новостей', () => {
    vi.mocked(useHomepageSettings).mockReturnValue({
      data: undefined,
      isPending: false,
    } as any);

    render(<LatestNewsSection />);

    expect(screen.getByTestId('latest-news-component')).toBeInTheDocument();
  });
});
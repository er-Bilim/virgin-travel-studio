import { render, screen } from '@testing-library/react';
import NewsDetailedInfo from '../NewsDetailedInfo';
import type { NewsFields } from '@/types/news';

const baseNews = {
  _id: 'n1',
  title: 'Раннее бронирование открыто',
  content: 'Первый абзац.\nВторой абзац.',
  image: 'photo.png',
  tags: ['турция', 'акции'],
  isPublished: true,
  author: { fullName: 'admin' },
  createdAt: '2026-06-01T10:00:00Z',
  updatedAt: '2026-06-02T15:30:00Z',
} as unknown as NewsFields;

const renderNews = (overrides: Partial<NewsFields> = {}) =>
  render(<NewsDetailedInfo oneNews={{ ...baseNews, ...overrides }} />);

describe('NewsDetailedInfo', () => {
  it('показывает заголовок, автора и контент', () => {
    renderNews();
    expect(
      screen.getByRole('heading', { name: 'Раннее бронирование открыто' }),
    ).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText(/Первый абзац/)).toBeInTheDocument();
  });

  it('показывает статус "Опубликовано"', () => {
    renderNews({ isPublished: true });
    expect(screen.getByText('Опубликовано')).toBeInTheDocument();
    expect(screen.queryByText('Черновик')).not.toBeInTheDocument();
  });

  it('показывает статус "Черновик"', () => {
    renderNews({ isPublished: false });
    expect(screen.getByText('Черновик')).toBeInTheDocument();
    expect(screen.queryByText('Опубликовано')).not.toBeInTheDocument();
  });

  it('рендерит теги с решёткой', () => {
    renderNews();
    expect(screen.getByText('#турция')).toBeInTheDocument();
    expect(screen.getByText('#акции')).toBeInTheDocument();
  });

  it('не рендерит блок тегов при пустом массиве', () => {
    renderNews({ tags: [] });
    expect(screen.queryByText(/^#/)).not.toBeInTheDocument();
  });

  it('рендерит изображение с alt по заголовку', () => {
    renderNews();
    expect(
      screen.getByAltText('Раннее бронирование открыто'),
    ).toBeInTheDocument();
  });

  it('не рендерит изображение без image', () => {
    renderNews({ image: undefined });
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('показывает даты создания и обновления', () => {
    renderNews();
    expect(screen.getByText(/Создано:/)).toBeInTheDocument();
    expect(screen.getByText(/Обновлено:/)).toBeInTheDocument();
  });
});

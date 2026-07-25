import { render, screen } from '@testing-library/react';
import Review from '../Review';
import type { IReview } from '@/types/review';

const baseReview = {
  _id: 'r1',
  clientName: 'Людмила Андреева',
  comment: 'Отличный тур, всё понравилось',
  rating: 5,
  createdAt: '2026-06-15T12:00:00Z',
  image: null,
  companyReply: null,
} as unknown as IReview;

const renderReview = (overrides: Partial<IReview> = {}) =>
  render(<Review review={{ ...baseReview, ...overrides }} />);

describe('Review', () => {
  it('показывает имя клиента и комментарий', () => {
    renderReview();
    expect(screen.getByText('Людмила Андреева')).toBeInTheDocument();
    expect(
      screen.getByText('Отличный тур, всё понравилось'),
    ).toBeInTheDocument();
  });

  it('показывает дату отзыва', () => {
    renderReview();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('июня')).toBeInTheDocument();
    expect(screen.getByText('2026')).toBeInTheDocument();
  });

  it('рендерит аватар с первой буквой имени', () => {
    renderReview();
    expect(screen.getByText('Л')).toBeInTheDocument();
  });

  it('рендерит рейтинг', () => {
    renderReview({ rating: 5 });
    expect(screen.getAllByRole('button', { name: 'звезда' })).toHaveLength(5);
  });

  it('не рендерит фото без image', () => {
    renderReview({ image: null });
    expect(screen.queryByTestId('review-photo')).not.toBeInTheDocument();
  });

  it('рендерит фото при наличии image', () => {
    renderReview({ image: 'photo.png' });
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('не рендерит ответ компании без companyReply', () => {
    renderReview({ companyReply: null });
    expect(screen.queryByText('Ответ Virgin Travel')).not.toBeInTheDocument();
  });

  it('рендерит ответ компании при наличии companyReply', () => {
    renderReview({ companyReply: 'Спасибо за отзыв!' });
    expect(screen.getByText('Ответ Virgin Travel')).toBeInTheDocument();
    expect(screen.getByText('Спасибо за отзыв!')).toBeInTheDocument();
  });
});

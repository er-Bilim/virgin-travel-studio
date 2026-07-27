import { render, screen } from '@testing-library/react';
import OrderCustomWishesCard from '../OrderCustomWishesCard';
import { CUSTOM_TOUR_ACTIVITIES } from '@/lib/customTour/constants';

describe('OrderCustomWishesCard', () => {
  it('показывает заголовок карточки', () => {
    render(<OrderCustomWishesCard description="Хочу отель у моря" />);
    expect(screen.getByText('Пожелания клиента')).toBeInTheDocument();
  });

  it('показывает комментарий клиента', () => {
    render(<OrderCustomWishesCard description="Хочу отель у моря" />);
    expect(screen.getByText('Комментарий')).toBeInTheDocument();
    expect(screen.getByText('Хочу отель у моря')).toBeInTheDocument();
  });

  it('рендерится без activities', () => {
    render(<OrderCustomWishesCard description="Текст" />);
    expect(screen.getByText('Текст')).toBeInTheDocument();
  });

  it('не рендерит блок активностей при пустом массиве', () => {
    const firstLabel = CUSTOM_TOUR_ACTIVITIES[0].label;
    render(<OrderCustomWishesCard description="Текст" activities={[]} />);
    expect(screen.queryByText(firstLabel)).not.toBeInTheDocument();
  });

  it('показывает подписи выбранных активностей', () => {
    const [first, second] = CUSTOM_TOUR_ACTIVITIES;
    render(
      <OrderCustomWishesCard
        description="Текст"
        activities={[first.value, second.value]}
      />,
    );
    expect(screen.getByText(first.label)).toBeInTheDocument();
    expect(screen.getByText(second.label)).toBeInTheDocument();
  });

  it('не падает на неизвестном значении активности', () => {
    expect(() =>
      render(
        <OrderCustomWishesCard
          description="Текст"
          activities={['unknown-value']}
        />,
      ),
    ).not.toThrow();
  });

  it('показывает пояснение под комментарием', () => {
    render(<OrderCustomWishesCard description="Текст" />);
    expect(screen.getByText(/Свободное описание/)).toBeInTheDocument();
  });

  it('рендерится с пустым описанием', () => {
    expect(() =>
      render(<OrderCustomWishesCard description="" />),
    ).not.toThrow();
  });
});

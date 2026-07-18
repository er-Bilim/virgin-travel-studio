import { render, screen, within } from '@testing-library/react';
import OrderSummaryCard from '@/components/dashboard/orders/OrderSummaryCard';

describe('OrderSummaryCard', () => {
  it('компонент успешно рендерится', () => {
    const props = {
      eyebrow: 'тур',
      title: 'Большое сафари в Кении',
      rows: [
        {
          label: 'Категория',
          value: 'Сафари',
        },
        {
          label: 'Отель',
          value: 'Keekorok Lodge',
        },
      ],
      priceInfo: {
        price: '1000',
        currency: 'сом',
      },
    };
    render(<OrderSummaryCard {...props} />);
    expect(
      screen.getByRole('heading', { name: 'тур', level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByText('Большое сафари в Кении')).toBeInTheDocument();
    props.rows.forEach(({ label, value }) => {
      const row = screen.getByText(label).closest('div')!;
      expect(screen.getByText(label)).toBeInTheDocument();
      expect(within(row).getByText(value)).toBeInTheDocument();
    });
    expect(screen.getByText('1000', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('сом', { exact: false })).toBeInTheDocument();
  });

  it('компонент успешно рендерится без необязательного свойства (rows?)', () => {
    const props = {
      eyebrow: 'тур',
      title: 'Большое сафари в Кении',
      priceInfo: {
        price: '1000',
        currency: 'сом',
      },
    };
    render(<OrderSummaryCard {...props} />);
    expect(
      screen.getByRole('heading', { name: 'тур', level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByText('Большое сафари в Кении')).toBeInTheDocument();
    expect(screen.getByText('1000', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('сом', { exact: false })).toBeInTheDocument();
  });

  it('компонент успешно рендерится без необязательного свойства (priceInfo?)', () => {
    const props = {
      eyebrow: 'тур',
      title: 'Большое сафари в Кении',
      rows: [
        {
          label: 'Категория',
          value: 'Сафари',
        },
        {
          label: 'Отель',
          value: 'Keekorok Lodge',
        },
      ],
    };
    render(<OrderSummaryCard {...props} />);
    expect(
      screen.getByRole('heading', { name: 'тур', level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByText('Большое сафари в Кении')).toBeInTheDocument();
    props.rows.forEach(({ label, value }) => {
      const row = screen.getByText(label).closest('div')!;
      expect(screen.getByText(label)).toBeInTheDocument();
      expect(within(row).getByText(value)).toBeInTheDocument();
    });
  });

  it('компонент успешно рендерится без необязательных свойств (priceInfo, rows?)', () => {
    const props = {
      eyebrow: 'тур',
      title: 'Большое сафари в Кении',
    };
    render(<OrderSummaryCard {...props} />);
    expect(
      screen.getByRole('heading', { name: 'тур', level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByText('Большое сафари в Кении')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import CustomTourCard from '../tourGroupCard';

describe('CustomTourCard', () => {
  it('показывает заголовок и описание', () => {
    render(<CustomTourCard />);
    expect(
      screen.getByRole('heading', { name: 'Составь свой кастомный тур' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Выберите направление, даты, отель/),
    ).toBeInTheDocument();
  });

  it('показывает бейдж категории', () => {
    render(<CustomTourCard />);
    expect(screen.getByText('✦ Кастомные туры')).toBeInTheDocument();
  });

  it('рендерит все теги преимуществ', () => {
    render(<CustomTourCard />);
    const labels = [
      'Любое направление',
      'Ваши даты',
      'Личный менеджер',
      'Трансфер включён',
      'Отель на выбор',
      'Экскурсии по желанию',
    ];
    labels.forEach((label) => {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    });
  });

  it('рендерит все шаги процесса', () => {
    render(<CustomTourCard />);
    ['Заявка', 'Подбор', 'Маршрут', 'Оплата', 'В путь!'].forEach((step) => {
      expect(screen.getByText(step)).toBeInTheDocument();
    });
  });

  it('рендерит CTA-кнопки для мобильной и десктопной вёрстки', () => {
    render(<CustomTourCard />);
    expect(
      screen.getByRole('button', { name: /Составить тур/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Составить свой тур/ }),
    ).toBeInTheDocument();
  });

  it('показывает пометку о бесплатной консультации', () => {
    render(<CustomTourCard />);
    expect(screen.getAllByText('Бесплатно').length).toBeGreaterThan(0);
  });
});

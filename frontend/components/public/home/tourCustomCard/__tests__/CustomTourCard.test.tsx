import { render, screen } from '@testing-library/react';
import CustomTourCard from '../CustomTourCard';
import { tags, steps } from '@/lib/customTour/constants';

describe('CustomTourCard', () => {
  it('показывает eyebrow, заголовок и описание', () => {
    render(<CustomTourCard />);
    expect(screen.getByText('Индивидуальный маршрут')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Тур, которого ещё нет' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Расскажите, куда мечтаете поехать/),
    ).toBeInTheDocument();
  });

  it('рендерит все теги из констант', () => {
    render(<CustomTourCard />);
    tags.forEach((tag) => {
      expect(screen.getByText(tag.label)).toBeInTheDocument();
    });
  });

  it('рендерит все шаги с заголовками и описаниями', () => {
    render(<CustomTourCard />);
    steps.forEach((step) => {
      expect(screen.getByText(step.title)).toBeInTheDocument();
      expect(screen.getByText(step.description)).toBeInTheDocument();
    });
  });

  it('нумерует шаги по порядку', () => {
    render(<CustomTourCard />);
    steps.forEach((_, index) => {
      expect(screen.getByText(String(index + 1))).toBeInTheDocument();
    });
  });

  it('рендерит список шагов как ol', () => {
    render(<CustomTourCard />);
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(steps.length);
  });

  it('показывает блок доступности и бесплатной консультации', () => {
    render(<CustomTourCard />);
    expect(screen.getByText('Доступно круглый год')).toBeInTheDocument();
    expect(screen.getByText('бесплатно')).toBeInTheDocument();
  });

  it('ведёт на страницу создания кастомного тура', () => {
    render(<CustomTourCard />);
    expect(
      screen.getByRole('link', { name: /Составить свой тур/ }),
    ).toHaveAttribute('href', '/tours/custom');
  });
});

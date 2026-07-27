import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Sort from '../Sort';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { CalendarPlus2, ArrowBigUp, ArrowBigDown, Star } from 'lucide-react';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
  useRouter: vi.fn(),
}));

const push = vi.fn();

const options = [
  { value: 'newest', label: 'Новые сверху', icon: CalendarPlus2 },
  { value: 'price-asc', label: 'Сначала дешевле', icon: ArrowBigUp },
  { value: 'price-desc', label: 'Сначала дороже', icon: ArrowBigDown },
  { value: 'rating', label: 'По рейтингу', icon: Star },
];

const setup = ({ params = '' } = {}) => {
  vi.mocked(usePathname).mockReturnValue('/tours');
  vi.mocked(useSearchParams).mockReturnValue(
    new URLSearchParams(params) as never,
  );
  vi.mocked(useRouter).mockReturnValue({ push } as never);
  render(<Sort options={options} />);
};

describe('Sort', () => {
  beforeEach(() => vi.clearAllMocks());

  it('по умолчанию показывает "Новые сверху"', () => {
    setup();
    expect(screen.getByRole('combobox')).toHaveTextContent('Новые сверху');
  });

  it('показывает текущую сортировку из URL', () => {
    setup({ params: 'sort=rating' });
    expect(screen.getByRole('combobox')).toHaveTextContent('По рейтингу');
  });

  it('открывает список опций', async () => {
    setup();
    await userEvent.click(screen.getByRole('combobox'));

    expect(await screen.findByText('Сначала дешевле')).toBeInTheDocument();
    expect(screen.getByText('Сначала дороже')).toBeInTheDocument();
    expect(screen.getByText('По рейтингу')).toBeInTheDocument();
  });

  it('пишет выбранную сортировку в URL', async () => {
    setup();
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByText('Сначала дешевле'));

    expect(push).toHaveBeenCalledWith('/tours?sort=price-asc');
  });

  it('удаляет параметр sort при выборе "newest"', async () => {
    setup({ params: 'sort=rating' });
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByText('Новые сверху'));

    expect(push).toHaveBeenCalledWith('/tours');
  });

  it('сбрасывает page при смене сортировки', async () => {
    setup({ params: 'page=3&sort=rating' });
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByText('Сначала дороже'));

    const url = push.mock.calls[0][0] as string;
    expect(url).not.toContain('page=');
    expect(url).toContain('sort=price-desc');
  });

  it('сохраняет прочие query-параметры', async () => {
    setup({ params: 'countryCode=TR' });
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByText('По рейтингу'));

    const url = push.mock.calls[0][0] as string;
    expect(url).toContain('countryCode=TR');
    expect(url).toContain('sort=rating');
  });

  it('заменяет предыдущее значение sort', async () => {
    setup({ params: 'sort=price-asc' });
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByText('По рейтингу'));

    const url = push.mock.calls[0][0] as string;
    expect(url).toContain('sort=rating');
    expect(url).not.toContain('price-asc');
  });
});

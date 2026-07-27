import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterCombobox from '../FilterCombobox';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
  useRouter: vi.fn(),
}));

const push = vi.fn();

const settings = {
  title: 'Все страны',
  icon: Globe,
  queryParamsName: 'countryCode',
  searchPlaceholder: 'Поиск страны',
};

const options = [
  { _id: '1', name: 'Турция', code: 'TR' },
  { _id: '2', name: 'Грузия', code: 'GE' },
  { _id: '3', name: 'Армения', code: 'AM' },
];

const setup = ({ selected = null as string | null, params = '' } = {}) => {
  vi.mocked(usePathname).mockReturnValue('/tours');
  vi.mocked(useSearchParams).mockReturnValue(
    new URLSearchParams(params) as never,
  );
  vi.mocked(useRouter).mockReturnValue({ push } as never);

  render(
    <FilterCombobox
      labelKey="name"
      options={options}
      queryParamsKey="code"
      settings={settings}
      selected={selected}
    />,
  );
};

describe('FilterCombobox', () => {
  beforeEach(() => vi.clearAllMocks());

  it('показывает title, когда ничего не выбрано', () => {
    setup();
    expect(
      screen.getByRole('button', { name: /Все страны/ }),
    ).toBeInTheDocument();
  });

  it('показывает выбранное значение вместо title', () => {
    setup({ selected: 'Турция' });
    expect(screen.getByRole('button', { name: /Турция/ })).toBeInTheDocument();
    expect(screen.queryByText('Все страны')).not.toBeInTheDocument();
  });

  it('открывает список опций по клику', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: /Все страны/ }));

    expect(
      await screen.findByPlaceholderText('Поиск страны'),
    ).toBeInTheDocument();
    expect(screen.getByText('Турция')).toBeInTheDocument();
    expect(screen.getByText('Грузия')).toBeInTheDocument();
    expect(screen.getByText('Армения')).toBeInTheDocument();
  });

  it('выбирает опцию и пишет параметр в URL', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: /Все страны/ }));
    await userEvent.click(await screen.findByText('Турция'));

    expect(push).toHaveBeenCalledWith('/tours?countryCode=TR');
  });

  it('сбрасывает фильтр по клику на title-опцию', async () => {
    setup({ selected: 'Турция', params: 'countryCode=TR' });
    await userEvent.click(screen.getByRole('button', { name: /Турция/ }));

    const resetItem = await screen.findByRole('option', { name: 'Все страны' });
    await userEvent.click(resetItem);

    expect(push).toHaveBeenCalledWith('/tours?');
  });

  it('сохраняет прочие query-параметры при выборе', async () => {
    setup({ params: 'sort=price-asc' });
    await userEvent.click(screen.getByRole('button', { name: /Все страны/ }));
    await userEvent.click(await screen.findByText('Грузия'));

    const url = push.mock.calls[0][0] as string;
    expect(url).toContain('sort=price-asc');
    expect(url).toContain('countryCode=GE');
  });

  it('заменяет значение того же параметра', async () => {
    setup({ params: 'countryCode=TR' });
    await userEvent.click(screen.getByRole('button', { name: /Все страны/ }));
    await userEvent.click(await screen.findByText('Армения'));

    const url = push.mock.calls[0][0] as string;
    expect(url).toContain('countryCode=AM');
    expect(url).not.toContain('countryCode=TR');
  });

  it('фильтрует опции по вводу', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: /Все страны/ }));
    await userEvent.type(
      await screen.findByPlaceholderText('Поиск страны'),
      'Груз',
    );

    expect(screen.getByText('Грузия')).toBeInTheDocument();
    expect(screen.queryByText('Турция')).not.toBeInTheDocument();
  });

  it('показывает "Ничего не найдено" при отсутствии совпадений', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: /Все страны/ }));
    await userEvent.type(
      await screen.findByPlaceholderText('Поиск страны'),
      'зззз',
    );

    expect(await screen.findByText('Ничего не найдено')).toBeInTheDocument();
  });

  it('рендерит иконку из настроек', () => {
    setup();
    const button = screen.getByRole('button', { name: /Все страны/ });
    expect(button.querySelector('svg')).toBeInTheDocument();
  });
});

import { renderHook, waitFor } from '@testing-library/react';
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
} from '@/lib/hooks/categoryHooks';
import {
  getCategories,
  createCategory,
  deleteCategory,
} from '@/services/categories';
import { createWrapper } from './testUtils';
import { categoriesResponseStub, categoryStub } from './fixtures';

vi.mock('@/services/categories', () => ({
  getCategories: vi.fn(),
  createCategory: vi.fn(),
  deleteCategory: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('useCategories', () => {
  it('без параметров: ключ ["categories", undefined, undefined], сервис вызван с пустыми page/limit', async () => {
    vi.mocked(getCategories).mockResolvedValue(categoriesResponseStub);
    const { wrapper, queryClient } = createWrapper();

    const { result } = renderHook(() => useCategories(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getCategories).toHaveBeenCalledWith({ page: undefined, limit: undefined });
    expect(queryClient.getQueryData(['categories', undefined, undefined])).toEqual(categoriesResponseStub);
  });

  it('с пагинацией: page и limit входят в query key и уходят в сервис', async () => {
    vi.mocked(getCategories).mockResolvedValue(categoriesResponseStub);
    const { wrapper, queryClient } = createWrapper();

    const { result } = renderHook(() => useCategories({ page: 2, limit: 10 }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getCategories).toHaveBeenCalledWith({ page: 2, limit: 10 });
    expect(queryClient.getQueryData(['categories', 2, 10])).toEqual(categoriesResponseStub);
  });

  it('переходит в error-состояние при падении сервиса', async () => {
    vi.mocked(getCategories).mockRejectedValue(new Error('network'));
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useCategories(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useCreateCategory', () => {
  it('вызывает createCategory с title и инвалидирует ["categories"]', async () => {
    vi.mocked(createCategory).mockResolvedValue({ ...categoryStub, _id: 'c2', title: 'Сплавы' });
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateCategory(), { wrapper });
    result.current.mutate({ title: 'Сплавы' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(createCategory).toHaveBeenCalledWith({ title: 'Сплавы' }, expect.anything());
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['categories'] });
  });

  it('в error-ветке кэш не инвалидируется', async () => {
    vi.mocked(createCategory).mockRejectedValue(new Error('duplicate'));
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateCategory(), { wrapper });
    result.current.mutate({ title: 'Походы' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});

describe('useDeleteCategory', () => {
  it('вызывает deleteCategory с id и инвалидирует ["categories"]', async () => {
    vi.mocked(deleteCategory).mockResolvedValue({ message: 'deleted' });
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useDeleteCategory(), { wrapper });
    result.current.mutate('c1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(deleteCategory).toHaveBeenCalledWith('c1', expect.anything());
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['categories'] });
  });

  it('переходит в error-состояние при падении сервиса', async () => {
    vi.mocked(deleteCategory).mockRejectedValue(new Error('in use'));
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useDeleteCategory(), { wrapper });
    result.current.mutate('c1');

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

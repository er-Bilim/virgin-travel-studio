import { renderHook, waitFor } from '@testing-library/react';
import {
  useAboutUsData,
  useEditAboutUsData,
  useCreateAboutUsData,
} from '@/lib/hooks/aboutUs';
import {
  getAboutUsData,
  putAboutUsData,
  postAboutUsData,
} from '@/services/aboutUs';
import { createWrapper } from './testUtils';
import { aboutUsStub, aboutUsMutationStub } from './fixtures';

vi.mock('@/services/aboutUs', () => ({
  getAboutUsData: vi.fn(),
  putAboutUsData: vi.fn(),
  postAboutUsData: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('useAboutUsData', () => {
  it('загружает данные и кладёт их в кэш по ключу ["aboutUs"]', async () => {
    vi.mocked(getAboutUsData).mockResolvedValue(aboutUsStub);
    const { wrapper, queryClient } = createWrapper();

    const { result } = renderHook(() => useAboutUsData(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getAboutUsData).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(aboutUsStub);
    expect(queryClient.getQueryData(['aboutUs'])).toEqual(aboutUsStub);
  });

  it('переходит в error-состояние при падении сервиса', async () => {
    vi.mocked(getAboutUsData).mockRejectedValue(new Error('network'));
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useAboutUsData(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

describe('useEditAboutUsData', () => {
  it('вызывает putAboutUsData с переданными данными и инвалидирует ["aboutUs"]', async () => {
    vi.mocked(putAboutUsData).mockResolvedValue(aboutUsStub);
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useEditAboutUsData(), { wrapper });
    result.current.mutate(aboutUsMutationStub);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(putAboutUsData).toHaveBeenCalledWith(aboutUsMutationStub, expect.anything());
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['aboutUs'] });
  });

  it('в error-ветке не инвалидирует кэш', async () => {
    vi.mocked(putAboutUsData).mockRejectedValue(new Error('403'));
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useEditAboutUsData(), { wrapper });
    result.current.mutate(aboutUsMutationStub);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});

describe('useCreateAboutUsData', () => {
  it('вызывает postAboutUsData и инвалидирует ["aboutUs"] после успеха', async () => {
    vi.mocked(postAboutUsData).mockResolvedValue(aboutUsStub);
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateAboutUsData(), { wrapper });
    result.current.mutate(aboutUsMutationStub);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(postAboutUsData).toHaveBeenCalledWith(aboutUsMutationStub, expect.anything());
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['aboutUs'] });
  });

  it('переходит в error-состояние при падении сервиса', async () => {
    vi.mocked(postAboutUsData).mockRejectedValue(new Error('500'));
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useCreateAboutUsData(), { wrapper });
    result.current.mutate(aboutUsMutationStub);

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

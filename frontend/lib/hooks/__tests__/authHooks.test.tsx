import { renderHook, waitFor } from '@testing-library/react';
import { useUser, useLogin, useLogout } from '@/lib/hooks/authHooks';
import { getMe, login, logout } from '@/services/auth';
import { createWrapper } from './testUtils';
import { userStub } from './fixtures';

vi.mock('@/services/auth', () => ({
  getMe: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('useUser', () => {
  it('запрашивает текущего пользователя и кладёт его в кэш по ключу ["me"]', async () => {
    vi.mocked(getMe).mockResolvedValue(userStub);
    const { wrapper, queryClient } = createWrapper();

    const { result } = renderHook(() => useUser(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getMe).toHaveBeenCalledTimes(1);
    expect(queryClient.getQueryData(['me'])).toEqual(userStub);
  });

  it('при 401 переходит в error без ретраев (retry: false)', async () => {
    vi.mocked(getMe).mockRejectedValue(new Error('401'));
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useUser(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(getMe).toHaveBeenCalledTimes(1);
  });
});

describe('useLogin', () => {
  it('вызывает login с кредами и после успеха кладёт user в кэш ["me"]', async () => {
    vi.mocked(login).mockResolvedValue({ user: userStub, message: 'ok' });
    const { wrapper, queryClient } = createWrapper();
    const creds = { phone: '+996700000001', password: 'secret' };

    const { result } = renderHook(() => useLogin(), { wrapper });
    result.current.mutate(creds);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(login).toHaveBeenCalledWith(creds, expect.anything());
    expect(queryClient.getQueryData(['me'])).toEqual(userStub);
  });

  it('при неверных кредах — isError, кэш ["me"] не заполняется', async () => {
    vi.mocked(login).mockRejectedValue(new Error('invalid credentials'));
    const { wrapper, queryClient } = createWrapper();

    const { result } = renderHook(() => useLogin(), { wrapper });
    result.current.mutate({ phone: '+996700000009', password: 'wrong' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(queryClient.getQueryData(['me'])).toBeUndefined();
  });
});

describe('useLogout', () => {
  it('вызывает logout и чистит весь кэш в onSettled', async () => {
    vi.mocked(logout).mockResolvedValue({ message: 'bye' });
    const { wrapper, queryClient } = createWrapper();
    queryClient.setQueryData(['me'], userStub);
    const clearSpy = vi.spyOn(queryClient, 'clear');

    const { result } = renderHook(() => useLogout(), { wrapper });
    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(logout).toHaveBeenCalledTimes(1);
    expect(clearSpy).toHaveBeenCalled();
    expect(queryClient.getQueryData(['me'])).toBeUndefined();
  });

  it('onSettled чистит кэш даже если logout упал', async () => {
    vi.mocked(logout).mockRejectedValue(new Error('network'));
    const { wrapper, queryClient } = createWrapper();
    const clearSpy = vi.spyOn(queryClient, 'clear');

    const { result } = renderHook(() => useLogout(), { wrapper });
    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(clearSpy).toHaveBeenCalled();
  });
});

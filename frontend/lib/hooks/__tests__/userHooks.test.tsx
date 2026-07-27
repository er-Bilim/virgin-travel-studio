import { renderHook, waitFor } from '@testing-library/react';
import { useUsers } from '@/lib/hooks/userHooks';
import { getUsers } from '@/services/user';
import { createWrapper } from './testUtils';
import { userStub, managerStub } from './fixtures';

vi.mock('@/services/user', () => ({
  getUsers: vi.fn(),
}));

const usersStub = [userStub, managerStub];

afterEach(() => {
  vi.clearAllMocks();
});

describe('useUsers', () => {
  it('загружает пользователей и кладёт их в кэш по ключу ["users"]', async () => {
    vi.mocked(getUsers).mockResolvedValue(usersStub);
    const { wrapper, queryClient } = createWrapper();

    const { result } = renderHook(() => useUsers(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getUsers).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(usersStub);
    expect(queryClient.getQueryData(['users'])).toEqual(usersStub);
  });

  it('переходит в error-состояние при падении сервиса', async () => {
    vi.mocked(getUsers).mockRejectedValue(new Error('401'));
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useUsers(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

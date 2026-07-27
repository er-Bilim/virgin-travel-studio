import { renderHook, waitFor } from '@testing-library/react';
import {
  useContacts,
  mutateContacts,
  mutateCreateContacts,
} from '@/lib/hooks/contactSettings';
import {
  fetchContacts,
  editContacts,
  createContacts,
} from '@/services/contactSettings';
import { createWrapper } from './testUtils';
import { contactsStub } from './fixtures';

vi.mock('@/services/contactSettings', () => ({
  fetchContacts: vi.fn(),
  editContacts: vi.fn(),
  createContacts: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('useContacts', () => {
  it('загружает контакты и кладёт их в кэш по ключу ["contacts"]', async () => {
    vi.mocked(fetchContacts).mockResolvedValue(contactsStub);
    const { wrapper, queryClient } = createWrapper();

    const { result } = renderHook(() => useContacts(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchContacts).toHaveBeenCalledTimes(1);
    expect(queryClient.getQueryData(['contacts'])).toEqual(contactsStub);
  });

  it('переходит в error-состояние при падении сервиса', async () => {
    vi.mocked(fetchContacts).mockRejectedValue(new Error('network'));
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useContacts(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('mutateContacts', () => {
  it('вызывает editContacts с данными и инвалидирует ["contacts"]', async () => {
    vi.mocked(editContacts).mockResolvedValue(contactsStub);
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const formData = new FormData();
    formData.append('phone', contactsStub.phone);

    const { result } = renderHook(() => mutateContacts(), { wrapper });
    result.current.mutate(formData);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(editContacts).toHaveBeenCalledWith(formData, expect.anything());
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['contacts'] });
  });

  it('в error-ветке кэш не инвалидируется', async () => {
    vi.mocked(editContacts).mockRejectedValue(new Error('403'));
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => mutateContacts(), { wrapper });
    result.current.mutate(new FormData());

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});

describe('mutateCreateContacts', () => {
  it('вызывает createContacts и инвалидирует ["contacts"] после успеха', async () => {
    vi.mocked(createContacts).mockResolvedValue(contactsStub);
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const formData = new FormData();
    formData.append('email', contactsStub.email);

    const { result } = renderHook(() => mutateCreateContacts(), { wrapper });
    result.current.mutate(formData);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(createContacts).toHaveBeenCalledWith(formData, expect.anything());
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['contacts'] });
  });

  it('переходит в error-состояние при падении сервиса', async () => {
    vi.mocked(createContacts).mockRejectedValue(new Error('500'));
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => mutateCreateContacts(), { wrapper });
    result.current.mutate(new FormData());

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

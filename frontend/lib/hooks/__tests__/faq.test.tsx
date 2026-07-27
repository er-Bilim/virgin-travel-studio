import { renderHook, waitFor } from '@testing-library/react';
import {
  usePublicFaqs,
  useAdminFaqs,
  mutateCreateFaq,
  mutateReorderFaqs,
  mutateTogglePublishFaq,
  mutateEditFaq,
  mutateDeleteFaq,
} from '@/lib/hooks/faq';
import {
  fetchPublicFaqs,
  fetchAdminFaqs,
  createFaq,
  reorderFaqs,
  togglePublishFaq,
  editFaq,
  deleteFaq,
} from '@/services/faq';
import { createWrapper } from './testUtils';
import { faqStub } from './fixtures';

vi.mock('@/services/faq', () => ({
  fetchPublicFaqs: vi.fn(),
  fetchAdminFaqs: vi.fn(),
  createFaq: vi.fn(),
  reorderFaqs: vi.fn(),
  togglePublishFaq: vi.fn(),
  editFaq: vi.fn(),
  deleteFaq: vi.fn(),
}));

const faqsStub = [faqStub];

afterEach(() => {
  vi.clearAllMocks();
});

describe('usePublicFaqs', () => {
  it('загружает публичные FAQ и кладёт их в кэш по ключу ["faqs","public"]', async () => {
    vi.mocked(fetchPublicFaqs).mockResolvedValue(faqsStub);
    const { wrapper, queryClient } = createWrapper();

    const { result } = renderHook(() => usePublicFaqs(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchPublicFaqs).toHaveBeenCalledTimes(1);
    expect(queryClient.getQueryData(['faqs', 'public'])).toEqual(faqsStub);
  });

  it('переходит в error-состояние при падении сервиса', async () => {
    vi.mocked(fetchPublicFaqs).mockRejectedValue(new Error('network'));
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => usePublicFaqs(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useAdminFaqs', () => {
  it('загружает админский список по ключу ["faqs","admin"]', async () => {
    vi.mocked(fetchAdminFaqs).mockResolvedValue(faqsStub);
    const { wrapper, queryClient } = createWrapper();

    const { result } = renderHook(() => useAdminFaqs(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchAdminFaqs).toHaveBeenCalledTimes(1);
    expect(queryClient.getQueryData(['faqs', 'admin'])).toEqual(faqsStub);
  });

  it('переходит в error-состояние при падении сервиса', async () => {
    vi.mocked(fetchAdminFaqs).mockRejectedValue(new Error('401'));
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useAdminFaqs(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

const faqResponse = { message: 'ok', faq: faqStub };

const mutationCases = [
  {
    name: 'mutateCreateFaq',
    useHook: mutateCreateFaq,
    service: createFaq as ReturnType<typeof vi.fn>,
    vars: { question: 'Новый вопрос', answer: 'Ответ' },
    resolved: faqResponse,
  },
  {
    name: 'mutateReorderFaqs',
    useHook: mutateReorderFaqs,
    service: reorderFaqs as ReturnType<typeof vi.fn>,
    vars: ['f2', 'f1'],
    resolved: { message: 'ok' },
  },
  {
    name: 'mutateTogglePublishFaq',
    useHook: mutateTogglePublishFaq,
    service: togglePublishFaq as ReturnType<typeof vi.fn>,
    vars: 'f1',
    resolved: faqStub,
  },
  {
    name: 'mutateEditFaq',
    useHook: mutateEditFaq,
    service: editFaq as ReturnType<typeof vi.fn>,
    vars: { id: 'f1', data: { question: 'Правка' } },
    resolved: faqResponse,
  },
  {
    name: 'mutateDeleteFaq',
    useHook: mutateDeleteFaq,
    service: deleteFaq as ReturnType<typeof vi.fn>,
    vars: 'f1',
    resolved: { message: 'deleted' },
  },
];

describe.each(mutationCases)('$name', ({ useHook, service, vars, resolved }) => {
  it('вызывает сервис с переданными аргументами и инвалидирует ["faqs"]', async () => {
    service.mockResolvedValue(resolved);
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useHook(), { wrapper });
    result.current.mutate(vars as never);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(service).toHaveBeenCalledWith(vars, expect.anything());
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['faqs'] });
  });

  it('в error-ветке выставляет isError и не трогает кэш', async () => {
    service.mockRejectedValue(new Error('fail'));
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useHook(), { wrapper });
    result.current.mutate(vars as never);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});

import { renderHook } from '@testing-library/react';
import useObjectUrl from '@/lib/hooks/useObjectUrl';

const createSpy = vi.fn((_: File) => `blob:mock-${createSpy.mock.calls.length + 1}`);
const revokeSpy = vi.fn();

beforeAll(() => {
  URL.createObjectURL = createSpy as unknown as typeof URL.createObjectURL;
  URL.revokeObjectURL = revokeSpy as unknown as typeof URL.revokeObjectURL;
});

afterEach(() => {
  createSpy.mockClear();
  revokeSpy.mockClear();
});

const makeFile = (name: string) => new File(['x'], name, { type: 'image/png' });

describe('useObjectUrl', () => {
  it('возвращает object URL для переданного File', () => {
    const file = makeFile('avatar.png');

    const { result } = renderHook(() => useObjectUrl(file));

    expect(createSpy).toHaveBeenCalledWith(file);
    expect(result.current).toMatch(/^blob:mock-/);
  });

  it('возвращает null для null и undefined и не создаёт URL', () => {
    const { result: r1 } = renderHook(() => useObjectUrl(null));
    const { result: r2 } = renderHook(() => useObjectUrl(undefined));

    expect(r1.current).toBeNull();
    expect(r2.current).toBeNull();
    expect(createSpy).not.toHaveBeenCalled();
  });

  it('возвращает null для значения, которое не является File', () => {
    const { result } = renderHook(() =>
      useObjectUrl({ name: 'fake.png' } as unknown as File),
    );

    expect(result.current).toBeNull();
    expect(createSpy).not.toHaveBeenCalled();
  });

  it('при смене файла создаёт новый URL и отзывает предыдущий', () => {
    const first = makeFile('first.png');
    const second = makeFile('second.png');

    const { result, rerender } = renderHook(({ f }) => useObjectUrl(f), {
      initialProps: { f: first },
    });
    const firstUrl = result.current;

    rerender({ f: second });

    expect(createSpy).toHaveBeenCalledTimes(2);
    expect(revokeSpy).toHaveBeenCalledWith(firstUrl);
    expect(result.current).not.toBe(firstUrl);
  });

  it('отзывает URL при размонтировании (нет утечки blob-ссылок)', () => {
    const file = makeFile('gallery.png');

    const { result, unmount } = renderHook(() => useObjectUrl(file));
    const url = result.current;

    unmount();

    expect(revokeSpy).toHaveBeenCalledWith(url);
  });
});

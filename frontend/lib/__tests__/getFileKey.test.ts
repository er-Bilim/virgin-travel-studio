import { getFileKey } from '../utils';

describe('getFileKey', () => {
  it('возвращает ключ файла для строки', () => {
    expect(getFileKey('test.txt')).toBe('test.txt');
  });

  it('возвращает ключ файла для File', () => {
    const file = new File(['content'], 'test.txt', {
      type: 'txt',
      lastModified: 1784292239362,
    });
    expect(getFileKey(file)).toBe('test.txt-7-1784292239362');
  });
  it('даёт разные ключи для файлов с разным содержимым (разный size)', () => {
    const a = new File(['a'], 'test.txt', {
      type: 'txt',
      lastModified: 1784292239362,
    });
    const b = new File(['ab'], 'test.txt', {
      type: 'txt',
      lastModified: 1784292239362,
    });

    expect(getFileKey(a)).not.toBe(getFileKey(b));
  });
  it('возвращает пустую строку как есть', () => {
    expect(getFileKey('')).toBe('');
  });
});

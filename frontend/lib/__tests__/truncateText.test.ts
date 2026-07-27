import { truncateText } from '../utils';

describe('truncateText', () => {
  it('обрезает текст до максимальной длины', () => {
    expect(truncateText('Hello, world!', 5)).toBe('Hello...');
  });
  it('возвращает исходный текст, если длина максимальная больше длины текста', () => {
    expect(truncateText('Hello', 10)).toBe('Hello');
  });
  it('возвращает пустую строку, если длина максимальная равна 0', () => {
    expect(truncateText('Hello', 0)).toBe('');
  });
  it('возвращает исходный текст, если длина ровна длине текста', () => {
    expect(truncateText('Hello', 5)).toBe('Hello');
  });
  it('возвращает пустую строку для пустого входа', () => {
    expect(truncateText('', 5)).toBe('');
  });
  it('не падает на undefined', () => {
    expect(truncateText(undefined as never, 5)).toBe('');
  });
});

import { formatToReadablePrice } from '../utils';

describe('formatToReadablePrice', () => {
  it('форматирует цену в читаемаый формат (1000 -> 1 000 сом)', () => {
    const result = formatToReadablePrice(1000);

    expect(result.currency).toBe('сом');
    expect(result.price.replace(/\s/g, ' ').trim()).toBe('1 000');
  });

  it('округляет вверх и форматирует дробное значение (1000.5 -> 1001 сом)', () => {
    const result = formatToReadablePrice(1000.5);

    expect(result.currency).toBe('сом');
    expect(result.price.replace(/\s/g, ' ').trim()).toBe('1 001');
  });

  it('округляет вниз и форматирует дробное значение (1000.4 -> 1000 сом)', () => {
    const result = formatToReadablePrice(1000.4);

    expect(result.currency).toBe('сом');
    expect(result.price.replace(/\s/g, ' ').trim()).toBe('1 000');
  });

  it('возвращает "уточняется" для отрицательных значений', () => {
    const result = formatToReadablePrice(-1000);

    expect(result.currency).toBe('');
    expect(result.price).toBe('уточняется');
  });

  it('возвращает "уточняется" для нуля', () => {
    const result = formatToReadablePrice(0);

    expect(result.currency).toBe('');
    expect(result.price).toBe('уточняется');
  });

  it('форматирует null (null -> уточняется)', () => {
    const result = formatToReadablePrice(null as never);

    expect(result.price).toBe('уточняется');
    expect(result.currency).toBe('');
  });

  it('форматирует NaN (NaN -> уточняется)', () => {
    const result = formatToReadablePrice(NaN);

    expect(result.price).toBe('уточняется');
    expect(result.currency).toBe('');
  });

  it('возвращает "уточняется" для undefined', () => {
    const result = formatToReadablePrice(undefined as never);

    expect(result.price).toBe('уточняется');
    expect(result.currency).toBe('');
  });
});

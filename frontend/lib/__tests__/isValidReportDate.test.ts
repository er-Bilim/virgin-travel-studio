import { isValidReportDate } from '../utils';

describe('isValidReportDate', () => {
  it('возвращает null для корректного диапазона дат', () => {
    const date = { from: new Date('2023-01-01'), to: new Date('2023-02-01') };
    expect(isValidReportDate(date)).toBeNull();
  });

  it('возвращает "Выберите дату" если from и to undefined', () => {
    const date = { from: undefined, to: undefined };
    expect(isValidReportDate(date)).toBe('Выберите дату');
  });
  it('возвращает "Выберите дату" если from и to null', () => {
    const date = { from: null as never, to: null as never };
    expect(isValidReportDate(date)).toBe('Выберите дату');
  });
  it('возвращает "Выберите дату" если выбран только from', () => {
    expect(
      isValidReportDate({ from: new Date('2023-01-01'), to: undefined }),
    ).toBe('Выберите дату');
  });
  it('возвращает "Выберите дату" для undefined', () => {
    expect(isValidReportDate(undefined)).toBe('Выберите дату');
  });
  it('возвращает "Выберите дату" если выбран только to', () => {
    expect(
      isValidReportDate({ from: undefined, to: new Date('2023-01-01') }),
    ).toBe('Выберите дату');
  });
  it('возвращает сообщение о том, что диапазон дат слишком большой для корректного диапазона дат', () => {
    const date = { from: new Date('2023-01-01'), to: new Date('2023-05-01') };
    expect(isValidReportDate(date)).toBe(
      'Диапазон дат слишком большой (максимум 3 месяца)',
    );
  });
  it('возвращает сообщение о том, что диапазон дат слишком большой для корректного диапазона дат', () => {
    const date = { from: new Date('2023-01-01'), to: new Date('2023-06-01') };
    expect(isValidReportDate(date)).toBe(
      'Диапазон дат слишком большой (максимум 3 месяца)',
    );
  });
  it('возвращает null ровно на границе (93 дня)', () => {
    const from = new Date('2023-01-01T00:00:00Z');
    const to = new Date(from.getTime() + 1000 * 60 * 60 * 24 * 93);
    expect(isValidReportDate({ from, to })).toBeNull();
  });
  it('возвращает ошибку чуть за границей (93 дня + 1мс)', () => {
    const from = new Date('2023-01-01T00:00:00Z');
    const to = new Date(from.getTime() + 1000 * 60 * 60 * 24 * 93 + 1);
    expect(isValidReportDate({ from, to })).toBe(
      'Диапазон дат слишком большой (максимум 3 месяца)',
    );
  });
  it('обратный диапазон (to раньше from)', () => {
    const date = { from: new Date('2023-05-01'), to: new Date('2023-01-01') };
    expect(isValidReportDate(date)).toBeNull();
  });
  it('один день валиден', () => {
    const d = new Date('2023-01-01');
    expect(isValidReportDate({ from: d, to: d })).toBeNull();
  });
});

import { formatDayAndMonthWords, formatDate } from '../utils';

describe('formatDayAndMonthWords', () => {
  it('форматирует дату, месяц полный (2021-01-15 -> { day: "1", month: "января", year: "2021" })', () => {
    expect(formatDayAndMonthWords('2021-01-15T12:00:00Z')).toEqual({
      day: '15',
      month: 'января',
      year: '2021',
    });
  });

  it("форматирует дату, месяц короткий (2021-01-15 -> { day: '1', month: 'янв', year: '2021' })", () => {
    expect(formatDayAndMonthWords('2021-01-15T12:00:00Z', true)).toEqual({
      day: '15',
      month: 'янв',
      year: '2021',
    });
  });

  it('возвращает { day: "даты уточняется", month: "", year: "" }, если дата некорректна', () => {
    expect(formatDayAndMonthWords('invalid-date')).toEqual({
      day: 'даты уточняются',
      month: '',
      year: '',
    });
  });

  it('возвращает { day: "даты уточняется", month: "", year: "" }, если дата null', () => {
    expect(formatDayAndMonthWords(null as never)).toEqual({
      day: 'даты уточняются',
      month: '',
      year: '',
    });
  });

  it('возвращает { day: "даты уточняется", month: "", year: "" }, если дата undefined', () => {
    expect(formatDayAndMonthWords(undefined as never)).toEqual({
      day: 'даты уточняются',
      month: '',
      year: '',
    });
  });
});

describe('formatDate', () => {
  it('форматирует дату в русский формат "D MMMM YYYY"', () => {
    expect(formatDate('2026-01-15')).toBe('15 января 2026');
  });

  it('форматирует одноразрядный день без ведущего нуля', () => {
    expect(formatDate('2026-01-05')).toBe('5 января 2026');
  });

  it('правильно склоняет месяц (май)', () => {
    expect(formatDate('2026-05-15')).toBe('15 мая 2026');
  });

  it('форматирует декабрь', () => {
    expect(formatDate('2026-12-31')).toBe('31 декабря 2026');
  });

  it('форматирует ISO-строку с временем', () => {
    expect(formatDate('2026-07-10T11:34:58.780Z')).toBe('10 июля 2026');
  });
});

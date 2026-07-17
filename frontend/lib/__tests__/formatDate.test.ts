import { formatDayAndMonthWords } from '../utils';

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

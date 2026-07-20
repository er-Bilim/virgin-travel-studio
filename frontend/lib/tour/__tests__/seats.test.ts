import getSeatsLevel from '../seats';

describe('getSeatsLevel', () => {
  it('возвращает available при большом числе свободных мес', () => {
    expect(getSeatsLevel(10, 10)).toBe('available');
  });

  it('возвращает low при среднем числе свободных мест', () => {
    expect(getSeatsLevel(5, 10)).toBe('low');
  });

  it('возвращает critical при малом числе свободных мест', () => {
    expect(getSeatsLevel(2, 10)).toBe('critical');
  });

  it('возвращает sold-out при нулевом числе свободных мест', () => {
    expect(getSeatsLevel(0, 10)).toBe('sold-out');
  });

  it('возвращает sold-out при null freeSeats', () => {
    expect(getSeatsLevel(null as never, 10)).toBe('sold-out');
  });

  it('возвращает sold-out при null total', () => {
    expect(getSeatsLevel(10, null as never)).toBe('sold-out');
  });
});

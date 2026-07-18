import { getCountryOptions } from '../utils';

describe('getCountryOptions', () => {
  const options = getCountryOptions();
  it('возвращает массив стран', () => {
    expect(Array.isArray(options)).toBe(true);
    expect(options.length).toBeGreaterThan(0);
  });

  it('возвращает массив стран с правильными полями', () => {
    expect(options[0]).toHaveProperty('code');
    expect(options[0]).toHaveProperty('name');
  });

  it('коды в формате alpha-3 (3 буквы)', () => {
    options.forEach((opt) => {
      expect(opt.code).toMatch(/^[A-Z]{3}$/);
    });
  });
  it('отсортирован по name (по алфавиту, ru)', () => {
    const names = options.map((option) => option.name);
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });
  it('содержит известную страну (Азербайджан → AZE)', () => {
    const az = options.find((option) => option.code === 'AZE');
    expect(az).toBeDefined();
    expect(az?.name).toContain('Азербайджан');
  });
  it('не содержит дубликатов по коду', () => {
    const codes = options.map((option) => option.code);
    expect(new Set(codes).size).toBe(codes.length);
  });
});

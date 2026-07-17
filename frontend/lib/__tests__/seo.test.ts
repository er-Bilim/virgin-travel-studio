import { buildMetadata, SITE_URL } from '../seo';

describe('buildMetadata', () => {
  it('возвращает title и description как переданы', () => {
    const meta = buildMetadata('Туры', 'Описание туров', '/tours');
    expect(meta.title).toBe('Туры');
    expect(meta.description).toBe('Описание туров');
  });
  it('строит canoncial для обычного пути', () => {
    const meta = buildMetadata('Туры', 'Описание туров', '/tours');
    expect(meta.alternates?.canonical).toBe(`${SITE_URL}/tours`);
  });
  it('для корня "/" canonical равен SITE_URL без хвостового слеша', () => {
    const meta = buildMetadata('Главная', 'Описание', '/');
    expect(meta.alternates?.canonical).toBe(SITE_URL);
  });

  it('нормализует путь перед сборкой canonical', () => {
    const a = buildMetadata('tour', 'desc', '/tours');
    const b = buildMetadata('tour', 'desc', '/tours/');
    expect(a.alternates?.canonical).toBe(b.alternates?.canonical);
  });

  it('структура соответствует Metadata (alternates.canonical на месте)', () => {
    const meta = buildMetadata('t', 'd', '/about');
    expect(meta).toEqual({
      title: 't',
      description: 'd',
      alternates: { canonical: `${SITE_URL}/about` },
    });
  });
});
import { createFormData } from '../utils';

describe('createFormData', () => {
  it('добавляет строковые значения', () => {
    const fd = createFormData({ name: 'Straw' });
    expect(fd.get('name')).toBe('Straw');
  });

  it('преобразует числовые значения в строки', () => {
    const fd = createFormData({ age: 30 });
    expect(fd.get('age')).toBe('30');
  });

  it('преобразует boolean значения в строки', () => {
    const fd = createFormData({ isActive: true });
    expect(fd.get('isActive')).toBe('true');
  });

  it('пропускает null значения', () => {
    const fd = createFormData({});
    expect(fd.get('')).toBe(null);
  });

  it('пропускает undefined значения', () => {
    const fd = createFormData({ name: undefined });
    expect(fd.has('name')).toBe(false);
  });

  it('добавляет каждый элемент массива под одним ключом', () => {
    const fd = createFormData({ tags: ['турция', 'акции'] });
    expect(fd.getAll('tags')).toEqual(['турция', 'акции']);
  });

  it('добавляет File как есть, без String()', () => {
    const file = new File(['content'], 'photo.png', { type: 'image/png' });
    const fd = createFormData({ image: file });

    const result = fd.get('image');
    expect(result).toBeInstanceOf(File);
    expect((result as File).name).toBe('photo.png');
  });

  it('обрабатывает несколько полей разных типов вместе', () => {
    const file = new File(['x'], 'a.png');
    const fd = createFormData({
      name: 'Тур',
      price: 1000,
      tags: ['a', 'b'],
      image: file,
      empty: null,
    });

    expect(fd.get('name')).toBe('Тур');
    expect(fd.get('price')).toBe('1000');
    expect(fd.getAll('tags')).toEqual(['a', 'b']);
    expect(fd.get('image')).toBeInstanceOf(File);
    expect(fd.has('empty')).toBe(false);
  });
});

import { IMAGE_UPLOAD } from '../constants';
import { validateImageFile } from '../utils';

const makeFile = (type: string, sizeBytes: number): File => {
  const file = new File(['content'], 'test.jpg', { type: type });
  Object.defineProperty(file, 'size', { value: sizeBytes });
  return file;
};

describe('validateImageFile', () => {
  it('возвращает валидный результат для валидного изображения', () => {
    const file = makeFile('image/jpeg', IMAGE_UPLOAD.MAX_FILE_SIZE_BYTES);
    expect(validateImageFile(file)).toEqual({ valid: true });
  });
  it('возвращает невалидный результат для невалидного изображения', () => {
    const file = makeFile('text/plain', IMAGE_UPLOAD.MAX_FILE_SIZE_BYTES);
    expect(validateImageFile(file)).toEqual({
      valid: false,
      error: 'Допустимые форматы: JPEG, PNG, WEBP',
    });
  });
  it('возвращает невалидный результат для слишком большого изображения', () => {
    const file = makeFile('image/jpeg', IMAGE_UPLOAD.MAX_FILE_SIZE_BYTES + 1);
    expect(validateImageFile(file)).toEqual({
      valid: false,
      error: `Файл больше ${IMAGE_UPLOAD.MAX_FILE_SIZE_BYTES / (1024 * 1024)} МБ`,
    });
  });

  it('принимает PNG', () => {
    expect(validateImageFile(makeFile('image/png', 1024)).valid).toBe(true);
  });
  it('принимает WEBP', () => {
    expect(validateImageFile(makeFile('image/webp', 1024)).valid).toBe(true);
  });
  it('отклоняет недопустимый тип (gif)', () => {
    const result = validateImageFile(makeFile('image/gif', 1024));
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Допустимые форматы: JPEG, PNG, WEBP');
  });
  it('отклоняет не-изображение (pdf)', () => {
    expect(validateImageFile(makeFile('application/pdf', 1024)).valid).toBe(
      false,
    );
  });
  it('отклоняет файл с пустым типом', () => {
    expect(validateImageFile(makeFile('', 1024)).valid).toBe(false);
  });
  it('принимает файл РОВНО на лимите (граница)', () => {
    const exact = makeFile('image/jpeg', IMAGE_UPLOAD.MAX_FILE_SIZE_BYTES);
    expect(validateImageFile(exact).valid).toBe(true);
  });
  it('проверяет тип ДО размера (большой файл неверного типа -> ошибка типа)', () => {
    const big = makeFile('image/gif', IMAGE_UPLOAD.MAX_FILE_SIZE_BYTES + 999);
    expect(validateImageFile(big).error).toBe(
      'Допустимые форматы: JPEG, PNG, WEBP',
    );
  });
});

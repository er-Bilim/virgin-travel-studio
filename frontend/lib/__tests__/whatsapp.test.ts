import { openWhatsApp, buildTourInquiryMessage } from '../whatsapp';

describe('buildTourInquiryMessage', () => {
  it('подставляет название тура и дату в сообщение', () => {
    const msg = buildTourInquiryMessage('Уикенд в Стамбуле', '10 сентября');
    expect(msg).toContain('Уикенд в Стамбуле');
    expect(msg).toContain('10 сентября');
  });

  it('возвращает полный текст запроса', () => {
    const msg = buildTourInquiryMessage('Тур', '1 мая');
    expect(msg).toBe(
      'Здравствуйте! Меня интересует Тур, начиная с 1 мая. Не могли бы вы предоставить более подробную информацию?',
    );
  });
});

describe('openWhatsApp', () => {
  beforeEach(() => {
    vi.spyOn(window, 'open').mockImplementation(() => null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('открывает wa.me с правильным номером', () => {
    openWhatsApp('Привет', '996550176420');
    expect(window.open).toHaveBeenCalledOnce();
    const url = (window.open as any).mock.calls[0][0];
    expect(url).toContain('https://wa.me/996550176420');
  });

  it('кодирует сообщение в URL (encodeURIComponent)', () => {
    openWhatsApp('привет мир & всё');
    const url = (window.open as any).mock.calls[0][0];
    expect(url).toContain('%20');
    expect(url).toContain('%26');
    expect(url).not.toContain(' ');
  });

  it('открывает в новой вкладке с noopener,noreferrer', () => {
    openWhatsApp('текст');
    expect(window.open).toHaveBeenCalledWith(
      expect.any(String),
      '_blank',
      'noopener,noreferrer',
    );
  });
});

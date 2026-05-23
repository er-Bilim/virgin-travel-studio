const WHATSAPP_PHONE = '996550176420';

export function openWhatsApp(message: string) {
  const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function buildTourInquiryMessage(tourTitle: string, startDate: string) {
  return `Здравствуйте! Меня интересует ${tourTitle}, начиная с ${startDate}. Не могли бы вы предоставить более подробную информацию?`;
}
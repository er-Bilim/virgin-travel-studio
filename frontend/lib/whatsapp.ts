export function openWhatsApp(message: string, whatsapp_phone: string) {
  const url = `https://wa.me/${whatsapp_phone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function buildTourInquiryMessage(tourTitle: string, startDate: string) {
  return `Здравствуйте! Меня интересует ${tourTitle}, начиная с ${startDate}. Не могли бы вы предоставить более подробную информацию?`;
}
import { render, screen } from '@testing-library/react';
import HeroSection from '../HeroSection';
import { useHomepageSettings } from '@/lib/hooks/homepageSettingsHooks';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/lib/hooks/homepageSettingsHooks');

describe('HeroSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('отображает дефолтные заголовок, подзаголовок и видео, если настройки отсутствуют (Fallback state)', () => {
    vi.mocked(useHomepageSettings).mockReturnValue({
      data: undefined,
    } as any);

    render(<HeroSection />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Путешествуй с нами' }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        'Наша компания занимается проектированием премиальных туров.',
      ),
    ).toBeInTheDocument();

    const video = document.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute(
      'src',
      'http://localhost:8000/videos/default.mp4',
    );
  });

  it('отображает кастомные заголовок, подзаголовок и видео из настроек', () => {
    const mockHeroData = {
      hero: {
        title: 'Уникальные путешествия',
        subtitle: 'Индивидуальные маршруты по всему миру',
        videoUrl: 'hero-custom.mp4',
      },
    };

    vi.mocked(useHomepageSettings).mockReturnValue({
      data: mockHeroData,
    } as any);

    render(<HeroSection />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Уникальные путешествия' }),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Индивидуальные маршруты по всему миру'),
    ).toBeInTheDocument();

    const video = document.querySelector('video');
    expect(video).toHaveAttribute(
      'src',
      'http://localhost:8000/api/homepage-settings/video/hero-custom.mp4',
    );
  });

  it('содержит корректные атрибуты фонового видео (autoplay, muted, loop)', () => {
    vi.mocked(useHomepageSettings).mockReturnValue({
      data: undefined,
    } as any);

    render(<HeroSection />);

    const video = document.querySelector('video');

    expect(video).toHaveProperty('autoplay', true);
    expect(video).toHaveProperty('muted', true);
    expect(video).toHaveProperty('loop', true);
  });
});

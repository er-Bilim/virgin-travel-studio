'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Flame,
  MapPin,
  Calendar,
  User,
  Car,
  Building2,
  Telescope,
  ChevronRight,
} from 'lucide-react';

const steps = [
  { label: 'Заявка' },
  { label: 'Подбор' },
  { label: 'Маршрут' },
  { label: 'Оплата' },
  { label: 'В путь!' },
];

const tags = [
  { icon: MapPin, label: 'Любое направление' },
  { icon: Calendar, label: 'Ваши даты' },
  { icon: User, label: 'Личный менеджер' },
  { icon: Car, label: 'Трансфер включён' },
  { icon: Building2, label: 'Отель на выбор' },
  { icon: Telescope, label: 'Экскурсии по желанию' },
];

export default function CustomTourCard() {
  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      <Card className="overflow-hidden rounded-2xl border border-border shadow-lg">
        {/* ── Hero ── */}
        <div className="relative bg-[#0c3a68] overflow-hidden flex flex-col pt-4 pb-6 min-h-[150px]">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-40px] right-[-60px] w-80 h-72 rounded-full bg-[#1a6e9e] opacity-40 blur-2xl" />
            <div className="absolute bottom-[-20px] left-[-40px] w-64 h-48 rounded-full bg-[#082244] opacity-60 blur-2xl" />
            <div className="absolute top-4 left-1/3 w-48 h-32 rounded-full bg-[#1d7aab] opacity-20 blur-xl" />
          </div>

          <div className="relative z-10 px-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-white bg-white/15 border border-white/30">
              ✦ Кастомные туры
            </span>
          </div>

          <div className="relative z-10 px-5 mt-4">
            <h2 className="text-xl md:text-2xl font-semibold text-white leading-snug mb-1.5">
              Составь свой кастомный тур
            </h2>
            <p className="text-sm text-white/70 leading-relaxed max-w-lg">
              Выберите направление, даты, отель и активности — мы соберём
              маршрут специально для вас. Никаких шаблонов, только ваши желания.
            </p>
          </div>
        </div>

        {/* ── Body ── */}
        <CardContent className="p-0">
          {/* Mobile layout: stacked tags + CTA side by side */}
          <div className="md:hidden p-4 flex flex-col gap-4">
            {/* Tags — simple 2-col grid */}
            <div className="grid grid-cols-2 gap-2">
              {tags.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted border border-border text-xs text-muted-foreground"
                >
                  <Icon className="w-3.5 h-3.5 shrink-0 text-[#1a6e9e]" />
                  <span className="truncate">{label}</span>
                </div>
              ))}
            </div>

            {/* CTA block inline on mobile */}
            <div className="rounded-xl bg-[#0f2a4a] p-4 text-white flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-white/50 mb-0.5">
                  Доступно круглый год
                </p>
                <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                  <Flame className="w-2.5 h-2.5" />
                  НОТ
                </span>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Button className="bg-[#d4a32a] hover:bg-[#c0912a] text-[#1a1000] font-medium text-sm h-9 px-4 rounded-lg">
                  Составить тур
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
                <p className="text-[10px] text-white/40">
                  Консультация:{' '}
                  <span className="text-[#f0c040]">Бесплатно</span>
                </p>
              </div>
            </div>
          </div>

          {/* Desktop layout: left tags+steps / right CTA */}
          <div className="hidden md:flex flex-row">
            <div className="flex-1 p-5 border-r border-border">
              <div className="flex flex-wrap gap-2 mb-5">
                {tags.map(({ icon: Icon, label }) => (
                  <Badge
                    key={label}
                    variant="secondary"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-normal text-muted-foreground bg-muted border border-border"
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    {label}
                  </Badge>
                ))}
              </div>

              <p className="text-[10px] uppercase tracking-widest font-medium text-muted-foreground mb-3">
                Как это работает
              </p>
              <div className="flex items-start">
                {steps.map((step, i) => (
                  <div key={step.label} className="flex items-start">
                    <div className="flex flex-col items-center gap-1.5 w-14">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5"
                        style={{
                          backgroundColor:
                            i === steps.length - 1
                              ? '#d4a32a'
                              : `hsl(${200 + i * 8}, 60%, ${45 + i * 4}%)`,
                        }}
                      />
                      <span className="text-[11px] text-muted-foreground text-center leading-tight">
                        {step.label}
                      </span>
                    </div>
                    {i < steps.length - 1 && (
                      <div className="h-px w-5 bg-border mt-[5px] shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="w-64 shrink-0 p-5 flex items-center">
              <div className="w-full rounded-xl bg-[#0f2a4a] p-4 text-white">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-white/55">
                    Доступно круглый год
                  </span>
                  <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-md">
                    <Flame className="w-3 h-3" />
                    НОТ
                  </span>
                </div>
                <Button className="w-full bg-[#d4a32a] hover:bg-[#c0912a] text-[#1a1000] font-medium text-sm h-10 rounded-lg">
                  Составить свой тур
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
                <p className="text-center text-[11px] text-white/40 mt-3">
                  Консультация:{' '}
                  <span className="text-[#f0c040] font-medium">Бесплатно</span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

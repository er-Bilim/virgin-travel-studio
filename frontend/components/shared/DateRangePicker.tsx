'use client';

import {useState} from 'react';
import {type DateRange} from 'react-day-picker';
import {Calendar} from '@/components/ui/calendar';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {Button} from '@/components/ui/button';
import {CalendarIcon, X} from 'lucide-react';
import {cn} from '@/lib/utils';
import {ru} from 'date-fns/locale';

interface Props {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
}

const formatDate = (date: Date) =>
  date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });

export const DateRangePicker = ({
  value,
  onChange,
  placeholder = 'Выберите период',
  className,
}: Props) => {
  const [open, setOpen] = useState(false);

  const label = value?.from
    ? value.to
      ? `${formatDate(value.from)} – ${formatDate(value.to)}`
      : formatDate(value.from)
    : placeholder;

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(undefined);
    setOpen(false);
  };

  const handleSelect = (range: DateRange | undefined) => {
      if (range?.from && range?.to && range.from.getTime() === range.to.getTime()) {
          onChange({ from: range.from, to: undefined });
          return;
      }
      onChange(range);
  };

  return (
    <div className={cn('relative flex items-center', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'justify-start gap-2 font-normal text-sm w-full',
              !value && 'text-muted-foreground',
              value?.from && 'pr-8',
            )}
          >
            <CalendarIcon className="size-4 shrink-0" />
            <span>{label}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={value}
            onSelect={handleSelect}
            locale={ru}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      {value?.from && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 z-10 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
};
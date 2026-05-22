'use client';

import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

interface Props {
  value: number;
  max?: number;
  onChangeStarValue?: (starValue: number) => void;
  isDisabled?: boolean;
  ratingOptions?: { label: string; color: string }[];
  className?: string;
  error?: string;
  starSize?: number
}

const Rating = ({
  max = 5,
  value,
  onChangeStarValue,
  isDisabled = true,
  ratingOptions,
  className,
  error,
  starSize = 8
}: Props) => {
  return (
    <div className={cn(`p-2 ${error && 'border-red-500 border-1 bg-red-100 rounded-2xl'}`, className)}>
      <div className={cn('flex flex-row gap-3 ${className} items-center p-2')}>
        <div className="flex flex-row gap-2">
          {Array.from({ length: max }).map((_num, index) => {
            const starValue: number = index + 1;
            const active = value >= starValue;

            return (
              <button
                type="button"
                key={index}
                aria-label="звезда"
                onClick={() => onChangeStarValue?.(starValue)}
                disabled={isDisabled}
                className="cursor-pointer"
              >
                <Star
                  className={cn(
                    `size-${starSize} stroke-2`,
                    active
                      ? 'stroke-yellow-500 text-yellow-500'
                      : 'stroke-slate-500',
                  )}
                />
              </button>
            );
          })}
        </div>
        {ratingOptions && ratingOptions[value] && (
          <p className={`${ratingOptions[value].color} text-sm font-bold`}>
            {ratingOptions[value].label}
          </p>
        )}
      </div>
        {error && <p className="text-sm text-red-500 mt-1 p-2">{error}</p>}
    </div>
  );
};

export default Rating;

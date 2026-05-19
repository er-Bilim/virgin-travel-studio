'use client';

import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

interface Props {
  value: number;
  max?: number;
  onChangeStarValue?: (starValue: number) => void;
  isDisabled?: boolean;
  ratingOptions? : { label: string; color: string }[]
  className?: string;
}

const Rating = ({
  max = 5,
  value,
  onChangeStarValue,
  isDisabled = true,
  ratingOptions,
  className
}: Props) => {

  return (
    <div className={`flex flex-row gap-3 ${className} items-center`}>
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
                'size-8 stroke-2',
                active
                  ? 'stroke-yellow-400 text-yellow-400'
                  : 'stroke-slate-500',
              )}
            />
          </button>
        );
      })}
      </div>
      {ratingOptions && (
        <p className={`${ratingOptions[value].color} text-sm font-bold`}>{ratingOptions[value].label}</p>
      )}
    </div>
  );
};

export default Rating;

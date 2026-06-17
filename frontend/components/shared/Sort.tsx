'use client';

import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Option = {
  value: string;
  label: string;
  icon?: LucideIcon;
};

interface Props {
  options: Option[];
  setSort: (sort: string) => void;
}

const Sort = ({ options, setSort }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort') ?? 'newest';

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams);

    if (value === 'newest') {
      params.delete('sort');
    } else {
      params.set('sort', value);
    }

    params.delete('page');

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);

    setSort(value);
  };

  return (
    <>
      <div className="flex gap-2 flex-col font-medium">
        <Select value={currentSort} onValueChange={handleChange}>
          <SelectTrigger className="gap-2 cursor-pointer border-1 border-slate-300 py-6 px-4 max-w-[194px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className='p-3 border-1 border-cyan-400'>
            {options.map((option) => {
              const Icon = option.icon;

              return (
                <SelectItem key={option.value} value={option.value} className='cursor-pointer py-3 px-6'>
                  <div className="flex items-center gap-2">
                    {Icon && (
                      <Icon
                        aria-hidden="true"
                        className={cn(
                          'size-3.5 text-cyan-800',
                        )}
                      />
                    )}
                    <span className="pe-3">{option.label}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default Sort;

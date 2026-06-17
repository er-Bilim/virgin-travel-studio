'use client';

import { useState } from 'react';
import { Globe } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

type FilterItemCombobox<K extends string> = {_id?: string} & Record<K, string>;

interface Props<K extends string> {
  value?: string | null;
  onChange: (val: string | null) => void;
  selected?: {name: string};
  labelKey: K;
  options: FilterItemCombobox<K>[];
};

const FilterCombobox = <K extends string>({ value, onChange, selected, labelKey, options }: Props<K>) => {
  const [open, setOpen] = useState(false);

  // const countryOptions = useMemo(() => {
  //   const countries = Object.keys(countriesLib.getAlpha2Codes());

  //   return countries.map((code) => ({
  //     code,
  //     name: countriesLib.getName(code, 'ru') ?? code,
  //   }));
  // }, []);

  // const selected = countryOptions.find((c) => c.code === value);

  return (
    <div className="flex items-center gap-2 ">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-[210px] justify-between gap-2',
              'border border-slate-300 px-4 py-6',
              'hover:bg-cyan-50 cursor-pointer overflow-hidden',
            )}
          >
            <div className="flex items-center gap-2">
              <Globe className="size-4 text-cyan-800" />
              <span className="truncate text-sm">
                {selected ? selected.name : 'Все страны'}
              </span>
            </div>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[210px] p-0 border border-cyan-400"
          align="start"
        >
          <Command>
            <CommandInput placeholder="Поиск страны..." />

            <CommandList>
              <CommandEmpty>Ничего не найдено</CommandEmpty>

              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    onChange(null);
                    setOpen(false);
                  }}
                  className="cursor-pointer py-3"
                >
                  Все страны
                </CommandItem>

                {options && options.map((option) => (
                  <CommandItem
                    key={option[labelKey]}
                    value={option[labelKey]}
                    onSelect={() => {
                      onChange(option[labelKey]);
                      setOpen(false);
                    }}
                    className="cursor-pointer py-3"
                  >
                    {option[labelKey]}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default FilterCombobox;
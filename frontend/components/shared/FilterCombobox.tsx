'use client';

import { useState } from 'react';
import { type LucideIcon } from 'lucide-react';
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
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

type FilterItemCombobox<K extends string, V extends string> = {
  _id?: string;
} & Record<K | V, string>;

type settingsType = {
  title: string;
  icon: LucideIcon;
  queryParamsName: string;
  searchPlaceholder: string;
};

interface Props<K extends string, V extends string> {
  labelKey: K;
  options: FilterItemCombobox<K, V>[];
  queryParamsKey: V;
  settings: settingsType;
  selected: string | null;
}

const FilterCombobox = <K extends string, V extends string>({
  labelKey,
  options,
  queryParamsKey,
  settings,
  selected,
}: Props<K, V>) => {
  const [open, setOpen] = useState(false);
  const Icon = settings?.icon;

  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const path = usePathname();
  const router = useRouter();

  const handleOnChange = (value: string | null) => {
    if (!value) {
      params.delete(settings?.queryParamsName);
    } else {
      params.set(settings?.queryParamsName, value);
    }

    router.push(`${path}?${params.toString()}`);
  };

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
              {Icon && <Icon className="size-4 text-cyan-800" />}
              <span className="truncate text-sm">
                {selected ? selected : settings?.title}
              </span>
            </div>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[210px] p-0 border border-cyan-400"
          align="start"
        >
          <Command>
            <CommandInput placeholder={settings.searchPlaceholder} />

            <CommandList>
              <CommandEmpty>Ничего не найдено</CommandEmpty>

              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    handleOnChange(null);
                    setOpen(false);
                  }}
                  className="cursor-pointer py-3"
                >
                  {settings?.title}
                </CommandItem>

                {options &&
                  options.map((option) => (
                    <CommandItem
                      key={option[labelKey]}
                      value={option[labelKey]}
                      onSelect={() => {
                        handleOnChange(option[queryParamsKey]);
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
};

export default FilterCombobox;

'use client';

import { useState } from 'react';
import {Globe} from 'lucide-react';

import countriesLib from 'i18n-iso-countries';
import ru from 'i18n-iso-countries/langs/ru.json';
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";


countriesLib.registerLocale(ru);

type Props = {
    value?: string | null;
    onChange: (val: string | null) => void;
};

export default function CountryCombobox({ value, onChange }: Props) {
    const [open, setOpen] = useState(false);

    const countries = Object.keys(countriesLib.getAlpha2Codes());

    const countryOptions = countries.map((code) => ({
        code,
        name: countriesLib.getName(code, 'ru') ?? code,
    }));

    const selected = countryOptions.find((c) => c.code === value);

    return (
        <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
        Страна:
      </span>

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            'w-[220px] justify-between gap-2',
                            'border border-cyan-900 px-4 py-3',
                            'hover:bg-cyan-50 cursor-pointer',
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
                    className="w-[220px] p-0 border border-cyan-400"
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

                                {countryOptions.map((c) => (
                                    <CommandItem
                                        key={c.code}
                                        value={c.name}
                                        onSelect={() => {
                                            onChange(c.code);
                                            setOpen(false);
                                        }}
                                        className="cursor-pointer py-3"
                                    >
                                        {c.name}
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
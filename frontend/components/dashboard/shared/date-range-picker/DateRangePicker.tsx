'use client';

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import type { DateRange } from "react-day-picker";

type Props = {
    value: DateRange | undefined;
    onChange: (range: DateRange | undefined) => void;
    placeholder?: string;
    disableFuture?: boolean;
    maxDate?: Date;
    minDate?: Date;
};

export function DateRangePicker({
                                    value,
                                    onChange,
                                    placeholder = "Выберите диапазон дат",
                                    disableFuture,
                                    maxDate,
                                    minDate,
                                }: Props) {
    const today = new Date();
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full justify-start text-left font-normal bg-gray-50/50 rounded-xl border-gray-200 h-11 px-3 focus:ring-2 focus:ring-[#1E2B6D]",
                        !value && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />

                    {value?.from ? (
                        value.to ? (
                            <>
                                {format(value.from, "dd.MM.yyyy", { locale: ru })} –{" "}
                                {format(value.to, "dd.MM.yyyy", { locale: ru })}
                            </>
                        ) : (
                            format(value.from, "dd.MM.yyyy", { locale: ru })
                        )
                    ) : (
                        <span>{placeholder}</span>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent
                className="w-auto p-0 rounded-2xl shadow-lg border-gray-100"
                align="start"
            >
                <Calendar
                    autoFocus
                    mode="range"
                    selected={value}
                    onSelect={onChange}
                    numberOfMonths={2}
                    disabled={(date) => {
                        if (disableFuture && date > today) return true;
                        if (minDate && date < minDate) return true;
                        if (maxDate && date > maxDate) return true;
                        return false;
                    }}
                />
            </PopoverContent>
        </Popover>
    );
}
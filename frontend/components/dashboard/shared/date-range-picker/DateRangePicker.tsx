'use client';

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import {useState} from "react";

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
    const [open, setOpen] = useState(false);
    const today = new Date();
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full justify-start text-left font-normal bg-gray-50/50 rounded-xl border-gray-200 h-11 px-3",
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
                align="end"
            >
                <div className="flex justify-end p-2 border-b">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setOpen(false)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

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
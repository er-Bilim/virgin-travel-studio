'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { Info } from 'lucide-react';

interface TooltipCustomProps {
  children: React.ReactNode;
  title: string;
  delayDuration?: number;
  side?: 'top' | 'bottom' | 'left' | 'right';
  color?: string;
}

export function TooltipCustom({
  children,
  title,
  delayDuration = 150,
  side = 'top',
  color = '#1E2B6D',
}: TooltipCustomProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger
          asChild
          className="w-full max-w-60 truncate cursor-default"
        >
          {children}
        </TooltipPrimitive.Trigger>

        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={5}
            style={{ backgroundColor: color }}
            className="z-50 max-w-xs rounded-xl p-2 text-white drop-shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2
                       data-[side=top]:[&_svg]:-translate-y-[1px]
                       data-[side=bottom]:[&_svg]:translate-y-[1px]
                       data-[side=left]:[&_svg]:-translate-x-[1px]
                       data-[side=right]:[&_svg]:translate-x-[1px]"
          >
            <div className="flex gap-2 items-start">
              <Info className="w-4 h-4 mt-0.5 shrink-0 text-cyan-400" />
              <p className="text-xs font-medium leading-relaxed whitespace-normal break-words">
                {title}
              </p>
            </div>

            <TooltipPrimitive.Arrow
              style={{ fill: color }}
              className="stroke-none"
            />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

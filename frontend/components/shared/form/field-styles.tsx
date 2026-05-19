import type { ComponentProps } from 'react';
import { Input } from '../../ui/input';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

const fieldClassName =
  "border border-[var(--border)] text-[var(--card-foreground)] focus-visible:border-[var(--ring)] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"

export function StyledInput ({ className, ...props }: ComponentProps<typeof Input>) {
  return (
    <Input className={cn(fieldClassName, className)} {...props}/>
  )
};

export function StyledTextarea ({ className, ...props }: ComponentProps<typeof Textarea>) {
  return (
    <Textarea className={cn(fieldClassName, className)} {...props}/>
  )
};
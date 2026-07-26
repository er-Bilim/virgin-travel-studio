import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

type Action =
  | {
      type: 'link';
      href: string;
      label: string;
      icon?: LucideIcon;
      iconClassName?: string;
      variant?: 'primary' | 'secondary';
    }
  | {
      type: 'button';
      onClick: () => void;
      label: string;
      icon?: LucideIcon;
      iconClassName?: string;
      variant?: 'primary' | 'secondary';
    };

interface Props {
  icon: LucideIcon;
  iconClassName?: string;
  title: string;
  description: string;
  actions?: Action[];
}

const primaryClassName =
  'group inline-flex items-center justify-center gap-2 rounded-xl bg-navy-800 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-navy-700 cursor-pointer';
const secondaryClassName =
  'group inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 cursor-pointer';

const StateCard = ({
  icon: Icon,
  iconClassName,
  title,
  description,
  actions = [],
}: Props) => {
  return (
    <div className="mx-auto flex max-w-[500px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <div
        className={
          iconClassName ??
          'mb-5 flex size-16 items-center justify-center rounded-[18px] bg-slate-100 text-slate-400'
        }
      >
        <Icon className="size-7" />
      </div>

      <h1 className="mb-2 text-xl font-extrabold text-navy-800">{title}</h1>

      <p className="mb-7 max-w-[380px] text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>

      {actions.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {actions.map((action) => {
            const ActionIcon = action.icon;
            const className =
              action.variant === 'secondary'
                ? secondaryClassName
                : primaryClassName;

            if (action.type === 'link') {
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className={className}
                >
                  {ActionIcon && (
                    <ActionIcon className={action.iconClassName ?? 'size-4'} />
                  )}
                  {action.label}
                </Link>
              );
            }

            return (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className={className}
              >
                {ActionIcon && (
                  <ActionIcon className={action.iconClassName ?? 'size-4'} />
                )}
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StateCard;

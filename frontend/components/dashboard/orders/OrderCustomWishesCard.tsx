import { CUSTOM_TOUR_ACTIVITIES } from '@/lib/customTour/constants';
import { MessagesSquare } from 'lucide-react';

interface Props {
  description: string;
  activities?: string[];
}

const OrderCustomWishesCard = ({ description, activities }: Props) => {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
      <h3 className="text-[12px] font-bold uppercase tracking-wide text-navy-700 mb-4 flex items-center gap-2">
        <MessagesSquare className="text-cyan-800 size-4 sm:size-5" />
        Пожелания клиента
      </h3>
      <div>
        {activities && activities.length > 0 && (
          <div className="flex flex-wrap gap-3 text-navy-800 text-xs text-left">
            {activities.map((value, index) => {
              const activity = CUSTOM_TOUR_ACTIVITIES.find(
                (item) => item.value === value,
              );
              const Icon = activity?.icon;
              return (
                <span
                  key={index}
                  className=" border-slate-300 bg-slate-100 rounded-xl p-3 inline-flex gap-3 items-center"
                >
                  {Icon && <Icon className="size-4" />}
                  {activity?.label}
                </span>
              );
            })}
          </div>
        )}
        <p className="text-[14px] text-navy-900 mt-5 mb-3">Комментарий</p>
        <div className="flex items-end gap-1.5 mb-2.5">
          <div className="text-navy-800 text-base sm:text-sm border-slate-300 bg-slate-100 rounded-xl w-full text-left p-5">
            <span>{description}</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl p-3.5 flex items-start gap-3">
        <p className="text-[12px] text-slate-400">
          Свободное описание, которое клиент оставил при заявке на
          индивидуальный тур.
        </p>
      </div>
    </section>
  );
};

export default OrderCustomWishesCard;

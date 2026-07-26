interface Props {
  eyebrow: string;
  title: string;
  rows?: {
    label: string;
    value: string;
  }[];
  priceInfo?: {
    price: string;
    currency: string;
  };
}

const OrderSummaryCard = ({ eyebrow, title, rows, priceInfo }: Props) => {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="bg-[#031633] px-4 py-3.5 text-white">
        <h2 className="text-[10px] uppercase tracking-wide text-cyan-300 font-bold mb-0.5">
          {eyebrow}
        </h2>
        <p className="font-extrabold text-md sm:text-lg leading-snug truncate">
          {title}
        </p>
      </div>
      <div className="p-4 sm:p-5 space-y-3 text-[13px] sm:text-[14px]">
        {rows && (
          <div className="space-y-3">
            {rows.map((row, index) => (
              <div
                className="flex items-center justify-between gap-2"
                key={row.label + index}
              >
                <span className="text-slate-500 shrink-0">{row.label}</span>
                <span className="font-semibold text-navy-800 truncate">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        )}
        {priceInfo && (
          <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-100">
            <span className="text-slate-500">Стоимость</span>
            <p className="font-black text-navy-800 flex gap-1 text-base sm:text-lg items-center">
              <span>{priceInfo.price}</span>
              <span className="text-xs font-bold text-slate-400">
                {priceInfo.currency}
              </span>
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default OrderSummaryCard;

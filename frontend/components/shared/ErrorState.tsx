import { CloudOff, RotateCw } from 'lucide-react';

interface Props {
  onRetry: () => void;
}

const ErrorState = ({ onRetry }: Props) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <div className="mb-5 flex size-16 items-center justify-center rounded-[18px] bg-red-50 text-red-500">
        <CloudOff className="size-7" />
      </div>

      <h3 className="mb-2 text-xl font-extrabold text-navy-800">
        Не удалось загрузить
      </h3>

      <p className="mb-7 max-w-[380px] text-sm leading-relaxed text-muted-foreground">
        Что-то пошло не так при загрузке. Проверьте подключение к интернету и
        попробуйте ещё раз
      </p>

      <button
        onClick={onRetry}
        type="button"
        className="group inline-flex items-center gap-2 rounded-xl bg-navy-800 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-navy-700 cursor-pointer"
      >
        <RotateCw className="size-[17px] transition-transform duration-600 group-hover:rotate-360" />
        Повторить
      </button>
    </div>
  );
};

export default ErrorState;

import { CloudOff, RotateCw } from 'lucide-react';
import StateCard from '@/components/shared/StateCard';

interface Props {
  onRetry: () => void;
}

const ErrorState = ({ onRetry }: Props) => {
  return (
    <StateCard
      icon={CloudOff}
      iconClassName="mb-5 flex size-16 items-center justify-center rounded-[18px] bg-red-50 text-red-500"
      title="Не удалось загрузить"
      description="Что-то пошло не так при загрузке. Проверьте подключение к интернету и попробуйте ещё раз"
      actions={[
        {
          type: 'button',
          onClick: onRetry,
          label: 'Повторить',
          icon: RotateCw,
          iconClassName: 'size-[17px] transition-transform duration-600 group-hover:rotate-360',
        },
      ]}
    />
  );
};

export default ErrorState;
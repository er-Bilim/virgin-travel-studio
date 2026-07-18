import { Compass, MapPinOff } from 'lucide-react';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import StateCard from '@/components/shared/StateCard';

const TourNotFound = () => {
  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Туры', href: '/tours' },
          { label: 'Тур не найден' },
        ]}
        className="mt-5"
      />

      <section className="my-10 sm:my-16">
        <StateCard
          icon={MapPinOff}
          title="Этот тур не найден"
          description="Возможно, тур сняли с продажи, или ссылка, по которой вы перешли, устарела. Загляните в каталог — там точно найдётся что-то интересное."
          actions={[
            { type: 'link', href: '/tours', label: 'Смотреть все туры', icon: Compass },
            { type: 'link', href: '/tours/custom', label: 'Собрать тур под себя', variant: 'secondary' },
          ]}
        />
      </section>
    </>
  );
};

export default TourNotFound;
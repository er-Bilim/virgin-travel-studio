import { ArrowLeft, Newspaper } from 'lucide-react';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import StateCard from '@/components/shared/StateCard';

const NewsNotFound = () => {
  return (
    <section className="mt-5">
      <Breadcrumbs
        items={[
          { label: 'Новости', href: '/news' },
          { label: 'Новость не найдена' },
        ]}
      />

      <div className="my-10 sm:my-16">
        <StateCard
          icon={Newspaper}
          title="Новость не найдена"
          description="Похоже, эта новость была удалена, или ссылка, по которой вы перешли, больше не актуальна. Вернитесь к ленте новостей — там всегда есть что почитать."
          actions={[
            { type: 'link', href: '/news', label: 'Ко всем новостям', icon: ArrowLeft },
          ]}
        />
      </div>
    </section>
  );
};

export default NewsNotFound;
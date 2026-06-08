import Link from 'next/link';
import {ArrowRight, CalendarDays} from 'lucide-react';
import {useNews} from '@/lib/hooks/newsHooks';
import {imageUrl} from '@/lib/constants';

const stripHtml = (text: string) => {
    return text.replace(/<[^>]*>/g, '').slice(0, 120);
};

const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date(date));
};

const LatestNewsSection = () => {
    const {data, isLoading, isError} = useNews({
        page: 1,
        limit: 5,
        isPublished: 'true',
    });

    const news = data?.allNews || [];

    if (isLoading) {
        return (
            <section className="my-24">
                <p className="text-center text-muted-foreground">
                    Загрузка новостей...
                </p>
            </section>
        );
    }

    if (isError || news.length === 0) {
        return null;
    }

    return (
        <section className="my-24">
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-cyan-800">
                        Журнал путешествий
                    </p>

                    <h2 className="text-3xl font-black text-navy-700 md:text-4xl">
                        Последние новости
                    </h2>

                    <p className="mt-3 max-w-xl text-muted-foreground">
                        Свежие обновления, полезные заметки и вдохновение для будущих
                        путешествий.
                    </p>
                </div>

                <Link
                    href="/news"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-navy-700 transition hover:-translate-y-0.5 hover:border-cyan-800"
                >
                    Все новости
                    <ArrowRight className="h-4 w-4"/>
                </Link>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                {news.map((item, index) => (
                    <Link
                        key={item._id}
                        href={`/news/${item._id}`}
                        className={
                            index === 0
                                ? 'group overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-xl md:col-span-2 lg:col-span-2 lg:row-span-2'
                                : 'group overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-xl'
                        }
                    >
                        <div className={index === 0 ? 'h-64' : 'h-44'}>
                            {item.image ? (
                                <img
                                    src={imageUrl + item.image}
                                    alt={item.title}
                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                />
                            ) : (
                                <div
                                    className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                                    Нет изображения
                                </div>
                            )}
                        </div>

                        <div className="p-5">
                            <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                                <CalendarDays className="h-4 w-4"/>
                                {formatDate(item.createdAt)}
                            </div>

                            <h3 className="line-clamp-2 text-lg font-bold text-navy-700">
                                {item.title}
                            </h3>

                            <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                                {stripHtml(item.content)}
                            </p>

                            {item.tags.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {item.tags.slice(0, 2).map((tag) => (
                                        <span
                                            key={tag}
                                            className="rounded-full bg-muted px-3 py-1 text-xs font-semibold capitalize text-cyan-800"
                                        >
                                        {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default LatestNewsSection;
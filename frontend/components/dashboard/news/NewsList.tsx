"use client";
import CreateNewsForm from '@/components/dashboard/news/CreateNewsForm';
import {useDeleteNews, useNews, usePublicateNews} from '@/lib/hooks/newsHooks';
import {Button} from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {useEffect, useMemo, useState} from 'react';
import {
  getNewsColumns
} from '@/components/dashboard/shared/data-table/columns/createColumnInTable/new-column';
import type {NewsFields} from '@/types/news';
import {DataTable} from '@/components/dashboard/shared/data-table/data-table';
import {
  ConfirmDialog
} from '@/components/dashboard/ConfirmDialog/ConfirmDialog';
import {
  headerRowClassName,
  rowClassName,
  tableClassName
} from '@/lib/constants';
import {Input} from '@/components/ui/input';
import {Search} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {useUsers} from '@/lib/hooks/userHooks';
import {PaginationCustom} from '@/components/pagination/PaginationCustom';

export default function NewsList() {
  const [searchNews, setSearchNews] = useState("");
  const [searchNewsWithDelay, setSearchNewsWithDelay] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [authorFilter, setAuthorFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;


  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      setSearchNewsWithDelay(searchNews);
    }, 700);

    return () => clearTimeout(timeout);
  }, [searchNews]);

  useEffect(() => {
    const changePage = () => {
      setPage(1);
    }

    void changePage();
  }, [statusFilter, authorFilter]);

  const {
    data: newsData,
    isLoading,
    isError,
    refetch: refetchNews,
  } = useNews({page, limit, searchText: searchNewsWithDelay, isPublished: statusFilter, authorId: authorFilter});
  const {mutate: deleteNews, isPending: isDeleting} = useDeleteNews();
  const {mutate: togglePublicate} = usePublicateNews();
  const news = newsData?.allNews;
  const meta = newsData?.metadata
  const {
    data: users,
    isLoading: loadingUsers,
    refetch: refetchUser
  } = useUsers();

  const [newsToDelete, setNewsToDelete] = useState<string | null>(null);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [, setView] = useState<NewsFields | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const columns = useMemo(() => getNewsColumns({
    onView: (news: NewsFields) => setView(news),
    onDelete: (news: NewsFields) => setNewsToDelete(news._id),
    onEdit: (news: NewsFields) => setEditingNewsId(news._id),
    onTogglePublish: (news: NewsFields) => togglePublicate(news._id),
  }), [togglePublicate]);

  const confirmDelete = () => {
    if (newsToDelete) {
      deleteNews(newsToDelete, {
        onSuccess: () => setNewsToDelete(null),
      });
    }
  };

  const editingNews = news?.find(
    (item) => item._id === editingNewsId
  );

  const handlePageChange = (page: number) => {
    setPage(page);
    window.scrollTo(0, 0);
  }

  const handleRefetch = async () => {
    await refetchNews();
    await refetchUser()
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col gap-4">
  <div className="flex items-center justify-between">
    <h1 className="text-3xl font-bold tracking-tight">Новости</h1>
    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
      <DialogTrigger asChild>
        <Button className="shrink-0">+ Добавить новость</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <CreateNewsForm onSuccess={() => setIsCreateOpen(false)} />
      </DialogContent>
    </Dialog>
  </div>

  <div className="flex flex-col md:flex-row md:items-center gap-3">
    <div className="relative w-full md:flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        value={searchNews}
        onChange={(e) => setSearchNews(e.target.value)}
        placeholder="Поиск по названию..."
        className="pl-9 bg-white border-gray-300 focus-visible:ring-1 focus-visible:ring-offset-0 transition-colors focus-visible:border-primary h-8"
      />{isError && (
  <div className="my-10 text-center">
    <p className="mb-4 text-lg font-semibold text-red-500">
      Не удалось загрузить новости
    </p>
    <button
      type="button"
      className="rounded-2xl border px-5 py-3 font-semibold"
      onClick={handleRefetch}
    >
      Повторить
    </button>
  </div>
)}
    </div>
    <Select value={statusFilter} onValueChange={setStatusFilter}>
      <SelectTrigger className="w-full md:w-75 bg-white border-gray-300">
        <SelectValue placeholder="Статус" />
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectItem value="all">Все статусы</SelectItem>
        <SelectItem value="true">Опубликовано</SelectItem>
        <SelectItem value="false">Не опубликовано</SelectItem>
      </SelectContent>
    </Select>
    <Select value={authorFilter} onValueChange={setAuthorFilter} disabled={loadingUsers}>
      <SelectTrigger className="w-full md:w-75 bg-white border-gray-300">
        <SelectValue placeholder={loadingUsers ? "Загрузка..." : "Авторы"} />
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectItem value="all">Все авторы</SelectItem>
        {users?.map((user) => (
          <SelectItem key={user._id} value={user._id}>
            {user.fullName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
</div>

      {isError && (
          <div className="my-10 text-center">
            <p className="mb-4 text-lg font-semibold text-red-500">
              Не удалось загрузить новости
            </p>
            <button
                type="button"
                className="rounded-2xl border px-5 py-3 font-semibold"
                onClick={handleRefetch}
            >
              Повторить
            </button>
          </div>
      )}

      <DataTable
          data={news || []}
          columns={columns}
          isError={isError}
          isLoading={isLoading}
          headerRowClassName={headerRowClassName}
          rowClassName={rowClassName}
          className={tableClassName}
          onRowClick={(news) => setView(news)}
      />


      {meta && news && news.length > 0 && (
        <div className="my-8">
          <PaginationCustom
            page={page}
            limit={meta.limit}
            totalPage={meta.totalPages}
            onChange={handlePageChange}
          />
        </div>
      )}

      <ConfirmDialog
        open={!!newsToDelete}
        title="Вы уверенны что хотите удалить новость?"
        description="Это действие нельзя отменить"
        loading={isDeleting}
        confirmText="Удалить"
        onCancel={() => setNewsToDelete(null)}
        onConfirm={confirmDelete}
      />

      <Dialog
        open={!!editingNewsId}
        onOpenChange={() => setEditingNewsId(null)}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Редактировать новости</DialogTitle>
          </DialogHeader>

          {editingNews && (
            <CreateNewsForm
              key={editingNews._id}
              isEdit={true}
              initialValues={{
                title: editingNews.title,
                content: editingNews.content,
                tags: editingNews.tags,
                image: null
              }}
              editImage={editingNews.image}
              editedId={editingNews._id}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

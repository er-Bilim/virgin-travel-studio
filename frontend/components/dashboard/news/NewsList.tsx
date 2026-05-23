"use client";
import CreateNewsForm from "@/components/dashboard/news/CreateNewsForm";
import {useDeleteNews, useNews, usePublicateNews} from "@/lib/hooks/newsHooks";
import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {useEffect, useMemo, useState} from "react";
import {
  getNewsColumns
} from "@/components/dashboard/shared/data-table/columns/createColumnInTable/new-column";
import type {NewsFields} from "@/types/news";
import {DataTable} from "@/components/dashboard/shared/data-table/data-table";
import {
  ConfirmDialog
} from "@/components/dashboard/ConfirmDialog/ConfirmDialog";
import {
  headerRowClassName,
  rowClassName,
  tableClassName
} from "@/lib/constants";
import {Input} from "@/components/ui/input";
import {Search} from "lucide-react";

export default function NewsList() {
  const [searchNews, setSearchNews] = useState("");
  const [searchNewsWithDelay, setSearchNewsWithDelay] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchNewsWithDelay(searchNews);
    }, 700);

    return () => clearTimeout(timeout);
  },[searchNews]);

  const {data: news, isLoading, isError} = useNews(searchNewsWithDelay);
  const {mutate: deleteNews, isPending: isDeleting} = useDeleteNews();
  const {mutate: togglePublicate} = usePublicateNews();

  const [newsToDelete, setNewsToDelete] = useState<string | null>(null);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [, setView] = useState<NewsFields | null>(null);

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


  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Новости</h1>

        <div className="flex items-center justify-around gap-5">
          <div className="relative w-full sm:max-w-xs ">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchNews}
              onChange={(e) => setSearchNews(e.target.value)}
              placeholder="Поиск по названию..."
              className="pl-9 bg-white border-gray-300 focus-visible:ring-1 focus-visible:ring-offset-0 transition-colors focus-visible:border-primary h-10"
            />
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>+ Добавить новость</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <CreateNewsForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <DataTable
        data={news || []}
        columns={columns}
        isError={isError}
        isLoading={isLoading}
        headerRowClassName={headerRowClassName}
        rowClassName={rowClassName}
        className={tableClassName}
      />

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

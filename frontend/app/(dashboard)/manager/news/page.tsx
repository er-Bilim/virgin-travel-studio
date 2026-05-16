"use client";
import CreateNewsForm from "@/components/dashboard/news/CreateNewsForm";
import {useDeleteNews, useNews, usePublicateNews} from "@/lib/hooks/newsHooks";
import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {Edit, Trash2} from "lucide-react";
import {useState} from "react";
import {imageUrl} from "@/lib/constants";

export default function News() {
  const {data: news, isLoading} = useNews();
  const {mutate: deleteNews, isPending: isDeleting} = useDeleteNews();
  const {mutate: togglePublicate, isPending: isPublishing} = usePublicateNews();

  const [newsToDelete, setNewsToDelete] = useState<string | null>(null);

  const confirmDelete = () => {
    if (newsToDelete) {
      deleteNews(newsToDelete, {
        onSuccess: () => setNewsToDelete(null),
      });
    }
  };


  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Новости</h1>
        <Dialog >
          <DialogTrigger asChild>
            <Button>+ Добавить новость</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <CreateNewsForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Загрузка...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground border-b">
                <tr>
                  <th className="p-4 font-medium">Картинка</th>
                  <th className="p-4 font-medium">Название</th>
                  <th className="p-4 font-medium">Автор</th>
                  <th className="p-4 font-medium">Дата</th>
                  <th className="p-4 font-medium text-center">Опубликовано ли</th>
                  <th className="p-4 font-medium text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {news?.map((newEl) => (
                  <tr
                    key={newEl._id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4">
                      {newEl.image
                        ? <Dialog>
                          <DialogTrigger asChild>
                            <button
                              type="button"
                              className="text-blue-600 hover:underline cursor-pointer"
                            >
                              Посмотреть на картинку
                            </button>
                          </DialogTrigger>
                          <DialogContent className="flex justify-center items-center">
                            <DialogHeader>
                              <DialogTitle className="sr-only">Просмотр изображения</DialogTitle>
                            </DialogHeader>
                            <img
                              src={imageUrl + newEl.image}
                              alt={newEl.title}
                              className="w-48 h-48 rounded object-cover border"
                            />
                          </DialogContent>
                        </Dialog>
                        :
                        <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center text-xs text-gray-400">Нет картинки</div>
                      }
                    </td>
                    <td
                      className="p-4 font-medium text-gray-900 max-w-[200px] truncate"
                      title={newEl.title}
                    >
                      {newEl.title}
                    </td>
                    <td className="p-4 text-gray-500">{newEl.author?.fullName}</td>
                    <td className="p-4 text-gray-500">
                      {new Date(newEl.updatedAt).toLocaleDateString()}
                    </td>
                    <td
                      className="p-4 text-center"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isPublishing}
                        onClick={() => togglePublicate(newEl._id)}
                        className={`w-[155px]  ${newEl.isPublished ? "text-orange-600 hover:bg-orange-50" : "text-blue-600 hover:bg-blue-50"}`}
                      >
                        {newEl.isPublished ? "Снять с публикации" : "Опубликовать"}
                      </Button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Редактировать
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Редактировать новости</DialogTitle>
                            </DialogHeader>
                            <CreateNewsForm
                              isEdit={true}
                              initialValues={{
                                title: newEl.title,
                                content: newEl.content,
                                tags: newEl.tags,
                                image: null
                              }}
                              editImage={newEl.image}
                              editedId={newEl._id}
                            />
                          </DialogContent>
                        </Dialog>

                        <Dialog
                          open={newsToDelete === newEl._id}
                          onOpenChange={(isOpen) => !isOpen && setNewsToDelete(null)}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setNewsToDelete(newEl._id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Вы абсолютно уверены что хотите удалить?</DialogTitle>
                            </DialogHeader>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setNewsToDelete(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={confirmDelete}
                                disabled={isDeleting}
                              >
                                {isDeleting ? "Deleting..." : "Yes, delete"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </td>
                  </tr>
                ))}
                {news?.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-gray-500"
                    >
                      Новости не были найдены. Добавьте их.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

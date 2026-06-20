'use client';

import { useState, useEffect } from 'react';
import { Plus, Move, Check } from 'lucide-react';


import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Modal } from '@/components/shared/Modal';
import { useModalStore } from '@/lib/stores/modalStore';
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog/ConfirmDialog';

import {
  useAdminFaqs,
  mutateDeleteFaq,
  mutateTogglePublishFaq,
  mutateReorderFaqs
} from '@/lib/hooks/faq';

import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import type { Faq } from '@/types/faq';
import { FaqForm } from '@/components/dashboard/faqSettings/FaqForm';
import { SortableFaqItem } from '@/components/dashboard/faqSettings/SortableFaqItem';

export default function FaqManagement() {
  const { openModal, closeModal } = useModalStore();
  const { data: serverFaqs, isPending: isFetching } = useAdminFaqs();

  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [isReorderMode, setIsReorderMode] = useState(false);

  const [selectedFaq, setSelectedFaq] = useState<Faq | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [togglePublishData, setTogglePublishData] = useState<{ id: string; currentStatus: boolean } | null>(null);

  const { mutate: deleteFaq, isPending: isDeleting } = mutateDeleteFaq();
  const { mutate: togglePublish, isPending: isToggling } = mutateTogglePublishFaq();
  const { mutate: saveOrder, isPending: isOrdering } = mutateReorderFaqs();

  useEffect(() => {
    if (serverFaqs) {
      setFaqs(serverFaqs);
    }
  }, [serverFaqs]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFaqs((items) => {
        const oldIndex = items.findIndex((item) => item._id === active.id);
        const newIndex = items.findIndex((item) => item._id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSaveOrder = () => {
    const ids = faqs.map((f) => f._id);
    saveOrder(ids, {
      onSuccess: () => setIsReorderMode(false)
    });
  };

  if (isFetching) {
    return (
      <div className="h-48 flex flex-col items-center justify-center gap-2">
        <Spinner className="w-8 h-8 text-[#1E2B6D]" />
        <span className="text-sm text-gray-500 font-medium">Загрузка вопросов FAQ...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-4">
        <div>
          <h2 className="text-xl font-semibold text-[#1E2B6D]">Часто задаваемые вопросы (FAQ)</h2>
          <p className="text-xs text-gray-500 mt-1">
            {isReorderMode
              ? "Перетаскивайте элементы вертикально за иконку слева для изменения порядка отображения на сайте."
              : "Управляйте списком вопросов, изменяйте их статус видимости и порядок."}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isReorderMode ? (
            <>
              <Button
                variant="outline"
                onClick={() => { setIsReorderMode(false); setFaqs(serverFaqs || []); }}
                className="rounded-xl px-4 text-gray-600 border-gray-200"
                disabled={isOrdering}
              >
                Отмена
              </Button>
              <Button
                onClick={handleSaveOrder}
                className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-4 flex items-center gap-2"
                disabled={isOrdering}
              >
                {isOrdering ? <Spinner className="w-4 h-4 text-white" /> : <Check className="w-4 h-4" />}
                Сохранить порядок
              </Button>
            </>
          ) : (
            <>
              {faqs.length > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setIsReorderMode(true)}
                  className="rounded-xl px-4 text-[#1E2B6D] border-gray-200 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Move className="w-4 h-4" /> Изменить порядок
                </Button>
              )}
              <Button
                onClick={() => { setSelectedFaq(null); openModal('faqForm'); }}
                className="bg-[#1E2B6D] hover:bg-[#162356] text-white rounded-xl px-4 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Добавить вопрос
              </Button>
            </>
          )}
        </div>
      </div>

      {faqs.length === 0 && (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <p className="text-gray-500 font-medium">Список вопросов пуст</p>
          <p className="text-xs text-gray-400 mt-1">Создайте свой первый FAQ, нажав на кнопку выше</p>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis]} onDragEnd={handleDragEnd}>
        <SortableContext items={faqs.map((f) => f._id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <SortableFaqItem
                key={faq._id}
                faq={faq}
                isReorderMode={isReorderMode}
                onEdit={() => { setSelectedFaq(faq); openModal('faqForm'); }}
                onDelete={() => setDeleteId(faq._id)}
                onTogglePublish={() => setTogglePublishData({ id: faq._id, currentStatus: faq.isPublished })}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Modal id="faqForm" title={selectedFaq ? "Редактирование вопроса" : "Новый вопрос FAQ"}>
        <FaqForm faq={selectedFaq} onClose={closeModal} />
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Удалить этот вопрос?"
        description="Вы собираетесь безвозвратно удалить этот вопрос из базы данных. Пользователи сайта больше не смогут его увидеть."
        loading={isDeleting}
        confirmText="Удалить"
        onCancel={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteFaq(deleteId, { onSuccess: () => setDeleteId(null) })}
      />

      <ConfirmDialog
        open={!!togglePublishData}
        title={togglePublishData?.currentStatus ? "Снять с публикации?" : "Опубликовать вопрос?"}
        description={
          togglePublishData?.currentStatus
            ? "Вопрос будет перемещен в черновики и скрыт со страницы публичного сайта."
            : "Вопрос сразу же появится на сайте и станет доступен всем посетителям."
        }
        loading={isToggling}
        confirmText={togglePublishData?.currentStatus ? "Скрыть" : "Опубликовать"}
        onCancel={() => setTogglePublishData(null)}
        onConfirm={() =>
          togglePublishData && togglePublish(togglePublishData.id, { onSuccess: () => setTogglePublishData(null) })
        }
      />
    </div>
  );
}
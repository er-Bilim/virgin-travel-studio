'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2, GlobeOff, Globe } from 'lucide-react';
import type { Faq } from '@/types/faq';

interface SortableFaqItemProps {
  faq: Faq;
  isReorderMode: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
}

export function SortableFaqItem({ faq, isReorderMode, onEdit, onDelete, onTogglePublish }: SortableFaqItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: faq._id, disabled: !isReorderMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center justify-between p-4 bg-gray-50/60 hover:bg-gray-50 border border-gray-100 rounded-2xl transition-all ${
        isDragging ? 'shadow-md border-[#1E2B6D]/30 bg-white scale-[1.01]' : ''
      }`}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1 mr-4">
        {isReorderMode ? (
          <div
            {...attributes}
            {...listeners}
            className="mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-200/50 transition-colors shrink-0"
          >
            <GripVertical className="w-5 h-5" />
          </div>
        ) : (
          <div className="mt-1.5 shrink-0">
            <span className={`w-2 h-2 rounded-full block ${faq.isPublished ? 'bg-green-500' : 'bg-amber-400'}`} />
          </div>
        )}

        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-gray-800 line-clamp-1">{faq.question}</h4>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{faq.answer}</p>
        </div>
      </div>

      {!isReorderMode && (
        <div className="flex items-center gap-1 shrink-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            type="button"
            onClick={onTogglePublish}
            title={faq.isPublished ? 'В черновик' : 'Опубликовать'}
            className={`p-2 rounded-xl transition-colors ${
              faq.isPublished
                ? 'text-green-600 hover:bg-green-50'
                : 'text-amber-600 hover:bg-amber-50'
            }`}
          >
            {faq.isPublished ? <Globe className="w-4 h-4" /> : <GlobeOff className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onEdit}
            title="Редактировать"
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onDelete}
            title="Удалить"
            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
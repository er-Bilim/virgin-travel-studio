import { CreateTourForm } from '@/components/dashboard/tours/CreateTourForm';

export default function NewTourPage() {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-[#1E2B6D]">
          Добавление нового тура
        </h1>
        <CreateTourForm />
      </div>
    </div>
  );
}

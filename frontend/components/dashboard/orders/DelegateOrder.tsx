import {useState} from 'react';
import {useManagers} from '@/lib/hooks/managerHook';
import {useDelegateOrder} from '@/lib/hooks/orderHooks';
import {useModalStore} from '@/lib/stores/modalStore';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {Button} from '@/components/ui/button';

interface Props {
    orderId: string;
    currentManagerId?: string;
}

export function DelegateOrder({ orderId, currentManagerId }: Props) {
    const { closeModal } = useModalStore();
    const [selectedManagerId, setSelectedManagerId] = useState<string>('');

    const { data: managers = [], isLoading } = useManagers({ status: 'active'});
    const { mutate: delegate, isPending } = useDelegateOrder();

    const availableManagers = managers.filter((manager) => manager._id !== currentManagerId);
    const hasAvailableManagers = availableManagers.length > 0;

    const handleConfirm = () => {
        if (!selectedManagerId) return;

        delegate(
            { id: orderId, managerId: selectedManagerId },
            {
                onSuccess: () => {
                    setSelectedManagerId('');
                    closeModal();
                },
            },
        )
    };

      if (!isLoading && !hasAvailableManagers) {
        return (
            <div className="space-y-4">
                <p className="text-sm text-gray-500">
                    Нет доступных активных менеджеров для переназначения.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
            <Select
                value={selectedManagerId}
                onValueChange={setSelectedManagerId}
                disabled={isLoading}
            >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Выберите менеджера" />
                </SelectTrigger>
                <SelectContent>
                    {availableManagers.map((manager) => (
                        <SelectItem key={manager._id} value={manager._id}>
                            {manager.fullName}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Button
                className="w-full bg-[#1E2B6D] hover:bg-[#162356]"
                onClick={handleConfirm}
                disabled={!selectedManagerId || isPending}
            >
                {isPending ? 'Переназначаем...' : 'Переназначить'}
            </Button>
        </div>
        </>
    )
}
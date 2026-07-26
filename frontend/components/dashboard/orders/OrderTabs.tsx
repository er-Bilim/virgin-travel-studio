import {Tabs, TabsList, TabsTrigger} from '@/components/ui/tabs';

interface Props {
    role?: string,
    onChangeTab: (value: string) => void,
    currentTab: string,
}

export function OrderTabs({ onChangeTab, currentTab, role } : Props) {
    return (
        <Tabs value={currentTab} onValueChange={onChangeTab} className="w-full sm:w-auto">
            <TabsList className="bg-gray-200/60 p-1 rounded-xl">
                <TabsTrigger
                    value='my'
                    className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-[#1E2B6D] text-sm font-medium text-gray-600"
                >
                    Мои заявки
                </TabsTrigger>

                <TabsTrigger
                    value='all'
                    className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-[#1E2B6D] text-sm font-medium text-gray-600"
                >
                    {role === 'ADMIN' ? 'Все заявки' : 'Новые заявки'}
                </TabsTrigger>
            </TabsList>
        </Tabs>
    )
}
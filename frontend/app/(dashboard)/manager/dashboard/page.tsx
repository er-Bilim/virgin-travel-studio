import {StatsWidgets} from '@/components/dashboard/managers/StatsWidgets';

const ManagerDashboardPage = async () => {
    return (
        <div>
            <h1 className="text-2xl font-bold text-[#1E2B6D]">
                Панель менеджера
            </h1>
            <StatsWidgets />
        </div>
    );
};

export default ManagerDashboardPage;
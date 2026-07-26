import {StatsWidgets} from '@/components/dashboard/managers/StatsWidgets';

const AdminDashboardPage = () => {
    return (
        <div>
            <h1 className="text-2xl font-bold text-[#1E2B6D]">
                Панель администратора
            </h1>

            <StatsWidgets />
        </div>
    );
};

export default AdminDashboardPage;
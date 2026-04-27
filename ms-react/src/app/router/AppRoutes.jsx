import { Route, Routes } from 'react-router-dom';
import { AuthPage } from '../../features/auth/pages/AuthPage.jsx';
import { DashboardPage } from '../../features/dashboard/pages/DashboardPage.jsx';

export const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<AuthPage />} />
            <Route path="/dashboard" element={<DashboardPage />} >
            </Route>
        </Routes>
    )
}  
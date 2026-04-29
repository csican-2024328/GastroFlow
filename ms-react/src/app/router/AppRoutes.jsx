import { Route, Routes } from 'react-router-dom';
import { AuthPage } from '../../features/auth/pages/AuthPage.jsx';
import { RegisterPage } from '../../features/auth/pages/RegisterPage.jsx';
import { VerifyEmailPage } from '../../features/auth/pages/VerifyEmailPage.jsx';
import { ResetPasswordPage } from '../../features/auth/pages/ResetPasswordPage.jsx';
import { ClientPage } from '../layouts/ClientPage.jsx';
import { DashboardPage } from '../layouts/DashboardPage.jsx';
import { ProfilePage } from '../../features/auth/pages/ProfilePage.jsx';
export const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<AuthPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verificar-email" element={<VerifyEmailPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/cliente" element={<ClientPage />} />
            <Route path="/dashboard" element={<DashboardPage />} >
            
            </Route>
            <Route path="/profile" element={<ProfilePage />} />
        </Routes>
    )
}  

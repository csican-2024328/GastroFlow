import { Navigate, Route, Routes } from 'react-router-dom';
import { LandingPage } from '../layouts/LandingPage.jsx';
import { AuthPage } from '../../features/auth/pages/AuthPage.jsx';
import { RegisterPage } from '../../features/auth/pages/RegisterPage.jsx';
import { VerifyEmailPage } from '../../features/auth/pages/VerifyEmailPage.jsx';
import { ResetPasswordPage } from '../../features/auth/pages/ResetPasswordPage.jsx';
import { ClientPage } from '../layouts/ClientPage.jsx';
import { DashboardPage } from '../layouts/DashboardPage.jsx';
import { RestaurantsPage } from '../../features/restaurants/pages/RestaurantsPage.jsx';
import { TablesPage } from '../../features/tables/pages/TablesPage.jsx';
import { IngredientsPage } from '../../features/ingredients/pages/IngredientsPage.jsx';
import { DishesPage } from '../../features/dishes/pages/DishesPage.jsx';
import { ProtectedRoute } from '../../shared/components/auth/ProtectedRoute.jsx';
import { RoleGuard } from '../../shared/components/auth/RoleGuard.jsx';
import { ClientOrdersPage } from '../../features/orders/pages/ClientOrdersPage.jsx';
import { ClientMakeOrderPage } from '../../features/orders/pages/ClientMakeOrderPage.jsx';
import { ClientMyOrdersPage } from '../../features/orders/pages/ClientMyOrdersPage.jsx';
import { EventsPage } from '../../features/events/pages/EventsPage.jsx';
import { ReservationsPage } from '../../features/reservations/pages/ReservationsPage.jsx';
import { CouponsPage } from '../../features/coupons/pages/CouponsPage.jsx';
import { ClientOrderTrackingPage } from '../../features/orders/pages/ClientOrderTrackingPage.jsx';
export const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verificar-email" element={<VerifyEmailPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/cliente" element={<ClientPage />} />
            <Route path="/cliente/pedidos" element={<Navigate to="/cliente/pedidos/hacer" replace />} />
            <Route path="/cliente/pedidos/hacer" element={<ClientMakeOrderPage />} />
            <Route path="/cliente/pedidos/mis" element={<ClientMyOrdersPage />} />
            <Route path="/cliente/pedidos/:orderId" element={<ClientOrderTrackingPage />} />
            <Route path="/cliente/pedidos/legacy" element={<ClientOrdersPage />} />
            <Route path="/cliente/eventos" element={<EventsPage />} />
            <Route path="/cliente/reservaciones" element={<ReservationsPage />} />
            <Route path="/cliente/cupones" element={<CouponsPage />} />
            <Route 
                path="/dashboard" 
                element={
                    <ProtectedRoute>
                        <RoleGuard allowedRoles={['PLATFORM_ADMIN', 'RESTAURANT_ADMIN']}>
                            <DashboardPage />
                        </RoleGuard>
                    </ProtectedRoute>
                }
            >
                <Route path="mesas" element={<TablesPage />} />
                <Route path="restaurantes" element={<RestaurantsPage />} />
                 <Route path="ingredientes" element={<IngredientsPage />} />
                 <Route path="platos" element={<DishesPage />} />
            </Route>
            {/* Profile is shown as an in-app modal (ProfileModal) — no standalone route to avoid redirecting users to a separate page. */}
        </Routes>
    )
}  

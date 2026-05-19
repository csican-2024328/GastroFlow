import { Navigate, Route, Routes } from 'react-router-dom';
import { LandingPage } from '../layouts/LandingPage.jsx';
import { AuthPage } from '../../features/auth/pages/AuthPage.jsx';
import { RegisterPage } from '../../features/auth/pages/RegisterPage.jsx';
import { VerifyEmailPage } from '../../features/auth/pages/VerifyEmailPage.jsx';
import { ResetPasswordPage } from '../../features/auth/pages/ResetPasswordPage.jsx';
import { ClientPage } from '../layouts/ClientPage.jsx';
import { DashboardPage } from '../layouts/DashboardPage.jsx';
import { RestaurantDashboardPage } from '../layouts/RestaurantDashboardPage.jsx';
import { RestaurantsPage } from '../../features/restaurants/pages/RestaurantsPage.jsx';
import { TablesPage } from '../../features/tables/pages/TablesPage.jsx';
import { IngredientsPage } from '../../features/ingredients/pages/IngredientsPage.jsx';
import { RestaurantIngredientsPage } from '../../features/ingredients/pages/RestaurantIngredientsPage.jsx';
import { InventoryAuditPage } from '../../features/inventory-audit/pages/InventoryAuditPage.jsx';
import { DishesPage } from '../../features/dishes/pages/DishesPage.jsx';
import { MenusPage } from '../../features/dishes/pages/MenusPage.jsx';
import OrderManagement  from '../../features/orders/views/OrderManagement.jsx';
import RestaurantReportsPage from '../../features/reports/pages/RestaurantReportsPage.jsx';
import { Users } from '../../features/users/components/Users.jsx';
import { ProtectedRoute } from '../../shared/components/auth/ProtectedRoute.jsx';
import { RoleGuard } from '../../shared/components/auth/RoleGuard.jsx';
import { ClientOrdersPage } from '../../features/orders/pages/ClientOrdersPage.jsx';
import { ClientMakeOrderPage } from '../../features/orders/pages/ClientMakeOrderPage.jsx';
import { ClientMyOrdersPage } from '../../features/orders/pages/ClientMyOrdersPage.jsx';
import { EventsPage } from '../../features/events/pages/EventsPage.jsx';
import { EventsAdminPage } from '../../features/events/pages/EventsAdminPage.jsx';
import { ReservationsPage } from '../../features/reservations/pages/ReservationsPage.jsx';
import ReservationManagement from '../../features/reservations/pages/ReservationManagement.jsx';
import { CouponsPage } from '../../features/coupons/pages/CouponsPage.jsx';
import { ClientOrderTrackingPage } from '../../features/orders/pages/ClientOrderTrackingPage.jsx';
import InvoicesPage from '../../features/invoices/pages/InvoicesPage.jsx';
import { AssignmentsPage } from '../../features/assignments/pages/AssignmentsPage.jsx';
import { ClientRestaurantReviewsPage, ClientDishReviewsPage, AdminReviewsPage } from '../../features/reviews/pages/index.js';
import { ClientReviewsHistoryPage } from '../../features/reviews/pages/index.js';
export const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verificar-email" element={<VerifyEmailPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route
                path="/cliente"
                element={
                    <ProtectedRoute>
                        <RoleGuard allowedRoles={['CLIENT']}>
                            <ClientPage />
                        </RoleGuard>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/cliente/pedidos"
                element={
                    <ProtectedRoute>
                        <RoleGuard allowedRoles={['CLIENT']}>
                            <Navigate to="/cliente/pedidos/hacer" replace />
                        </RoleGuard>
                    </ProtectedRoute>
                }
            />
            <Route path="/cliente/pedidos/hacer" element={<ProtectedRoute><RoleGuard allowedRoles={['CLIENT']}><ClientMakeOrderPage /></RoleGuard></ProtectedRoute>} />
            <Route path="/cliente/pedidos/mis" element={<ProtectedRoute><RoleGuard allowedRoles={['CLIENT']}><ClientMyOrdersPage /></RoleGuard></ProtectedRoute>} />
            <Route path="/cliente/pedidos/:orderId" element={<ProtectedRoute><RoleGuard allowedRoles={['CLIENT']}><ClientOrderTrackingPage /></RoleGuard></ProtectedRoute>} />
            <Route path="/cliente/pedidos/legacy" element={<ProtectedRoute><RoleGuard allowedRoles={['CLIENT']}><ClientOrdersPage /></RoleGuard></ProtectedRoute>} />
            <Route path="/cliente/eventos" element={<ProtectedRoute><RoleGuard allowedRoles={['CLIENT']}><EventsPage /></RoleGuard></ProtectedRoute>} />
            <Route path="/cliente/reservaciones" element={<ProtectedRoute><RoleGuard allowedRoles={['CLIENT']}><ReservationsPage /></RoleGuard></ProtectedRoute>} />
            <Route path="/cliente/cupones" element={<ProtectedRoute><RoleGuard allowedRoles={['CLIENT']}><CouponsPage /></RoleGuard></ProtectedRoute>} />
            <Route path="/cliente/resenas" element={<ProtectedRoute><RoleGuard allowedRoles={['CLIENT']}><ClientReviewsHistoryPage /></RoleGuard></ProtectedRoute>} />
            <Route path="/cliente/restaurante/:restaurantId/resenas" element={<ProtectedRoute><RoleGuard allowedRoles={['CLIENT']}><ClientRestaurantReviewsPage /></RoleGuard></ProtectedRoute>} />
            <Route path="/cliente/restaurante/:restaurantId/plato/:dishId/resenas" element={<ProtectedRoute><RoleGuard allowedRoles={['CLIENT']}><ClientDishReviewsPage /></RoleGuard></ProtectedRoute>} />
            <Route
                path="/restaurant-dashboard"
                element={
                    <ProtectedRoute>
                        <RoleGuard allowedRoles={['RESTAURANT_ADMIN']}>
                            <RestaurantDashboardPage />
                        </RoleGuard>
                    </ProtectedRoute>
                }
            >
                <Route path="pedidos" element={<OrderManagement />} />
                <Route path="reservaciones" element={<ReservationManagement />} />
                <Route path="mesas" element={<TablesPage />} />
                <Route path="ingredientes" element={<RestaurantIngredientsPage />} />
                <Route path="inventario" element={<InventoryAuditPage />} />
                <Route path="platos" element={<DishesPage />} />
                <Route path="menus" element={<MenusPage />} />
                <Route path="reportes" element={<RestaurantReportsPage />} />
                <Route path="facturas" element={<InvoicesPage />} />
                <Route path="cupones" element={<CouponsPage />} />
                <Route path="eventos" element={<EventsAdminPage />} />
                <Route path="resenas" element={<AdminReviewsPage />} />
            </Route>
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <RoleGuard allowedRoles={['PLATFORM_ADMIN']}>
                            <DashboardPage />
                        </RoleGuard>
                    </ProtectedRoute>
                }
            >
                <Route path="mesas" element={<TablesPage />} />
                <Route path="restaurantes" element={<RestaurantsPage />} />
                <Route path="ingredientes" element={<IngredientsPage />} />
                <Route path="auditoria-inventario" element={<InventoryAuditPage />} />
                <Route path="platos" element={<DishesPage />} />
                <Route path="menus" element={<MenusPage />} />
                <Route path="pedidos" element={<OrderManagement />} />
                <Route path="reservas" element={<ReservationManagement />} />
                <Route path="facturas" element={<InvoicesPage />} />
                <Route path="cupones" element={<CouponsPage />} />
                <Route path="eventos" element={<EventsAdminPage />} />
                <Route path="asignacion" element={<AssignmentsPage />} />
                <Route path="resenas" element={<AdminReviewsPage />} />
                <Route
                    path="users"
                    element={
                        <RoleGuard allowedRoles={['PLATFORM_ADMIN']}>
                            <Users />
                        </RoleGuard>
                    }
                />
            </Route>
            {/* Profile is shown as an in-app modal (ProfileModal) — no standalone route to avoid redirecting users to a separate page. */}
        </Routes>
    )
}  

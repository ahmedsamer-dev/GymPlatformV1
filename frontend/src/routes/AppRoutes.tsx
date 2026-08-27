import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';

// Layouts
import { AppLayout } from '../layouts/AppLayout';
import { AppShell } from '../layouts/AppShell';

// Public Pages
import { LandingPage } from '../pages/public/LandingPage';
import { ApplyPage } from '../pages/public/ApplyPage';
import { LoginPage } from '../pages/auth/LoginPage';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';

// Owner Pages
import { OwnerDashboard } from '../pages/owner/OwnerDashboard';
import { TrainersPage } from '../pages/owner/TrainersPage';
import { MembershipPlansPage as OwnerPlansPage } from '../pages/owner/MembershipPlansPage';
import { OwnerMemberDetailsPage } from '../pages/owner/OwnerMemberDetailsPage';

// Trainer Pages
import { TrainerDashboard } from '../pages/trainer/TrainerDashboard';
import { MembersPage } from '../pages/trainer/MembersPage';
import { SubscriptionsPage } from '../pages/trainer/SubscriptionsPage';
import { TrainerMemberDetailsPage } from '../pages/trainer/TrainerMemberDetailsPage';

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/apply" element={<ApplyPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Protected Routes — All use the shared AppShell */}
        <Route element={<ProtectedRoute />}>
          {/* Admin Routes */}
          <Route element={<RoleRoute allowedRole="Admin" />}>
            <Route element={<AppShell />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/applications" element={<AdminDashboard />} />
            </Route>
          </Route>

          {/* Owner Routes */}
          <Route element={<RoleRoute allowedRole="GymOwner" />}>
            <Route element={<AppShell />}>
              <Route path="/owner" element={<OwnerDashboard />} />
              <Route path="/owner/trainers" element={<TrainersPage />} />
              <Route path="/owner/membership-plans" element={<OwnerPlansPage />} />
              <Route path="/owner/members" element={<OwnerDashboard />} />
              <Route path="/owner/members/:memberId" element={<OwnerMemberDetailsPage />} />
            </Route>
          </Route>

          {/* Trainer Routes */}
          <Route element={<RoleRoute allowedRole="Trainer" />}>
            <Route element={<AppShell />}>
              <Route path="/trainer" element={<TrainerDashboard />} />
              <Route path="/trainer/members" element={<MembersPage />} />
              <Route path="/trainer/members/:memberId" element={<TrainerMemberDetailsPage />} />
              <Route path="/trainer/subscriptions" element={<SubscriptionsPage />} />
            </Route>
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

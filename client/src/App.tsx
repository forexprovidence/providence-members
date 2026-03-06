import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import ConfirmEmail from "@/pages/ConfirmEmail";
import EmailUnconfirmed from "@/pages/EmailUnconfirmed";
import DashboardHome from "@/pages/DashboardHome";
import AccountsPage from "@/pages/AccountsPage";
import StrategiesPage from "@/pages/StrategiesPage";
import FinancialRecordsPage from "@/pages/FinancialRecordsPage";
import AdminHome from "@/pages/admin/AdminHome";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminStrategies from "@/pages/admin/AdminStrategies";
import AdminStrategyHistory from "@/pages/admin/AdminStrategyHistory";
import AdminAccounts from "@/pages/admin/AdminAccounts";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (user && !user.emailConfirmed) {
    return <Redirect to="/email-unconfirmed" />;
  }

  return <Component />;
}

function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (!user?.isAdmin) {
    return <Redirect to="/" />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/landing" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/confirm-email" component={ConfirmEmail} />
      <Route path="/email-unconfirmed" component={EmailUnconfirmed} />
      
      <Route path="/">
        <ProtectedRoute component={DashboardHome} />
      </Route>
      <Route path="/accounts">
        <ProtectedRoute component={AccountsPage} />
      </Route>
      <Route path="/strategies">
        <ProtectedRoute component={StrategiesPage} />
      </Route>
      <Route path="/financial-records">
        <ProtectedRoute component={FinancialRecordsPage} />
      </Route>
      
      <Route path="/admin">
        <AdminRoute component={AdminHome} />
      </Route>
      <Route path="/admin/users">
        <AdminRoute component={AdminUsers} />
      </Route>
      <Route path="/admin/strategies">
        <AdminRoute component={AdminStrategies} />
      </Route>
      <Route path="/admin/strategy-history">
        <AdminRoute component={AdminStrategyHistory} />
      </Route>
      <Route path="/admin/accounts">
        <AdminRoute component={AdminAccounts} />
      </Route>
      <Route path="/admin/financial-records">
        <AdminRoute component={AdminAccounts} />
      </Route>
      <Route path="/admin/settings">
        <AdminRoute component={AdminHome} />
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

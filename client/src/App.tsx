
import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch, Redirect } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import Layout from "@/components/layout";
import LoginPage from "@/pages/login";
import Students from "@/pages/students";
import Sections from "@/pages/sections";
import Attendance from "@/pages/attendance";
import Reports from "@/pages/reports";

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }
  
  return <Component {...rest} />;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route>{() => <Redirect to="/login" />}</Route>
      </Switch>
    );
  }

  return (
    <Layout>
      <Switch>
        <Route path="/sections" component={Sections} />
        <Route path="/students" component={Students} />
        <Route path="/attendance" component={Attendance} />
        <Route path="/reports" component={Reports} />
        <Route path="/">{() => <Redirect to="/sections" />}</Route>
      </Switch>
    </Layout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

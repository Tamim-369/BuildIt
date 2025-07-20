import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { getAuthToken, getAuthHeaders, type AuthUser } from "./lib/auth";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import { Skeleton } from "@/components/ui/skeleton";

function AuthChecker({ children }: { children: React.ReactNode }) {
  const token = getAuthToken();
  
  const { data: user, isLoading, error } = useQuery<AuthUser>({
    queryKey: ['/api/auth/verify'],
    enabled: !!token,
    queryFn: async () => {
      const headers = getAuthHeaders();
      const response = await fetch('/api/auth/verify', {
        headers: Object.keys(headers).length > 0 ? headers : undefined
      });
      if (!response.ok) {
        throw new Error('Authentication failed');
      }
      const data = await response.json();
      return data.user;
    }
  });

  if (!token) {
    return <Login />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-md w-full mx-4">
          <div className="flex items-center space-x-3 mb-6">
            <Skeleton className="w-12 h-12 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return <Login />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        <AuthChecker>
          <Dashboard />
        </AuthChecker>
      </Route>
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

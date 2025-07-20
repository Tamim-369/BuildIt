import { useQuery } from "@tanstack/react-query";
import { getAuthHeaders, type AuthUser } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface WelcomeDashboardProps {
  user: AuthUser;
}

interface DashboardStats {
  symptomsToday: number;
  adherenceRate: string;
  contentViewed: number;
}

export default function WelcomeDashboard({ user }: WelcomeDashboardProps) {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/stats', {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="bg-gradient-to-r from-primary to-blue-600 rounded-xl p-6 text-white">
          <Skeleton className="h-8 w-64 mb-2 bg-white/20" />
          <Skeleton className="h-5 w-48 mb-4 bg-white/10" />
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/10 rounded-lg p-4">
                <Skeleton className="h-6 w-32 mb-2 bg-white/20" />
                <Skeleton className="h-8 w-16 mb-1 bg-white/30" />
                <Skeleton className="h-4 w-20 bg-white/10" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-primary to-blue-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">
          Welcome back, {user.firstName}!
        </h2>
        <p className="text-blue-100 mb-4">Here's your health progress for today</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-white/10 border-white/20 p-4">
            <h3 className="text-lg font-semibold text-white">Symptoms Logged</h3>
            <p className="text-2xl font-bold text-white">
              {stats?.symptomsToday ?? 0}
            </p>
            <span className="text-sm text-blue-100">Today</span>
          </Card>
          
          <Card className="bg-white/10 border-white/20 p-4">
            <h3 className="text-lg font-semibold text-white">Medication Adherence</h3>
            <p className="text-2xl font-bold text-white">
              {stats?.adherenceRate ?? "0%"}
            </p>
            <span className="text-sm text-blue-100">This week</span>
          </Card>
          
          <Card className="bg-white/10 border-white/20 p-4">
            <h3 className="text-lg font-semibold text-white">Content Viewed</h3>
            <p className="text-2xl font-bold text-white">
              {stats?.contentViewed ?? 0}
            </p>
            <span className="text-sm text-blue-100">This week</span>
          </Card>
        </div>
      </div>
    </div>
  );
}

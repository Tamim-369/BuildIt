import { useQuery } from "@tanstack/react-query";
import { getAuthHeaders, type AuthUser } from "@/lib/auth";
import Navigation from "@/components/navigation";
import WelcomeDashboard from "@/components/welcome-dashboard";
import EducationalContent from "@/components/educational-content";
import SymptomTracker from "@/components/symptom-tracker";
import MedicationReminders from "@/components/medication-reminders";
import ProgressChart from "@/components/progress-chart";
import QuickActions from "@/components/quick-actions";

export default function Dashboard() {
  const { data: user } = useQuery<AuthUser>({
    queryKey: ['/api/auth/verify'],
    queryFn: async () => {
      const response = await fetch('/api/auth/verify', {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Authentication failed');
      const data = await response.json();
      return data.user;
    }
  });

  if (!user) {
    return null; // This shouldn't happen due to AuthChecker in App.tsx
  }

  return (
    <div className="min-h-screen bg-light-gray">
      <Navigation user={user} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WelcomeDashboard user={user} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <EducationalContent />
            <SymptomTracker />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <MedicationReminders />
            <ProgressChart />
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { removeAuthToken, type AuthUser } from "@/lib/auth";
import { Heart, Bell } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface NavigationProps {
  user: AuthUser;
}

export default function Navigation({ user }: NavigationProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogout = () => {
    removeAuthToken();
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    });
    setLocation("/login");
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatCondition = (condition?: string) => {
    if (!condition) return "";
    return condition.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-primary p-2 rounded-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-dark-gray">Metabolic Health Coach</h1>
              <p className="text-sm text-muted-foreground">GLP-1 Treatment Support</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-dark-gray focus-ring"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {getInitials(user.firstName, user.lastName)}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-dark-gray">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatCondition(user.condition)}
                </p>
              </div>
            </div>
            
            <Button
              onClick={handleLogout}
              variant="destructive"
              size="sm"
              className="focus-ring"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

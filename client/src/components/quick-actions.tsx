import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Phone, MessageCircle, Download, FileText, Headphones, MapPin } from "lucide-react";

export default function QuickActions() {
  const { toast } = useToast();

  const handleEmergencyContact = () => {
    toast({
      title: "Emergency Contact",
      description: "In a real emergency, call 911 immediately. For medication-related concerns, contact your healthcare provider.",
      variant: "destructive",
    });
  };

  const handleChatWithNurse = () => {
    toast({
      title: "Chat Feature",
      description: "This feature will connect you with a qualified healthcare professional. Coming soon!",
    });
  };

  const handleDownloadReport = () => {
    toast({
      title: "Download Report",
      description: "Your health report is being generated. This feature will provide comprehensive symptom and medication tracking data.",
    });
  };

  return (
    <section>
      <h2 className="text-xl font-bold text-dark-gray mb-6">Quick Actions</h2>
      
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            <Button
              onClick={handleEmergencyContact}
              className="w-full bg-destructive text-destructive-foreground p-3 h-auto hover:bg-destructive/90 focus-ring transition-colors flex items-center justify-center space-x-2"
            >
              <Phone className="w-5 h-5" />
              <span>Emergency Contact</span>
            </Button>
            
            <Button
              onClick={handleChatWithNurse}
              className="w-full bg-primary text-primary-foreground p-3 h-auto hover:bg-primary/90 focus-ring transition-colors flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Chat with Nurse</span>
            </Button>
            
            <Button
              onClick={handleDownloadReport}
              variant="outline"
              className="w-full p-3 h-auto hover:bg-secondary focus-ring transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>Download Report</span>
            </Button>
          </div>
          
          {/* Support Resources */}
          <div className="mt-6 pt-4 border-t border-border">
            <h4 className="font-semibold text-dark-gray mb-3">Resources</h4>
            <div className="space-y-2">
              <a
                href="#"
                className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80 focus-ring rounded p-1 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  toast({
                    title: "Treatment Guidelines",
                    description: "Comprehensive GLP-1 treatment guidelines and best practices.",
                  });
                }}
              >
                <FileText className="w-4 h-4" />
                <span>Treatment Guidelines</span>
              </a>
              
              <a
                href="#"
                className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80 focus-ring rounded p-1 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  toast({
                    title: "Patient Support Hotline",
                    description: "24/7 support available at 1-800-SUPPORT for medication-related questions.",
                  });
                }}
              >
                <Headphones className="w-4 h-4" />
                <span>Patient Support Hotline</span>
              </a>
              
              <a
                href="#"
                className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80 focus-ring rounded p-1 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  toast({
                    title: "Find Healthcare Provider",
                    description: "Locate qualified healthcare providers in your area specializing in metabolic health.",
                  });
                }}
              >
                <MapPin className="w-4 h-4" />
                <span>Find Healthcare Provider</span>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

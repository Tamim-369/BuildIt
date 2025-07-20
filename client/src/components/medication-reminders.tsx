import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getAuthHeaders } from "@/lib/auth";
import { type Medication } from "@shared/schema";
import { Clock, Plus, Edit, Check } from "lucide-react";

export default function MedicationReminders() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    dose: "",
    frequency: "",
    time: ""
  });

  const { data: medications, isLoading } = useQuery<Medication[]>({
    queryKey: ['/api/medications'],
    queryFn: async () => {
      const response = await fetch('/api/medications', {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch medications');
      return response.json();
    }
  });

  const addMedicationMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/medications", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/medications'] });
      setFormData({ name: "", dose: "", frequency: "", time: "" });
      setIsDialogOpen(false);
      toast({
        title: "Medication added",
        description: "Your medication has been added to your schedule.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add medication",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  });

  const markTakenMutation = useMutation({
    mutationFn: async (medicationId: number) => {
      // For MVP, we'll just show a success message
      // In a real app, this would update a "doses_taken" table
      return Promise.resolve();
    },
    onSuccess: () => {
      toast({
        title: "Dose marked as taken",
        description: "Great job staying on track with your medication!",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.dose || !formData.frequency || !formData.time) {
      toast({
        title: "Please fill all fields",
        description: "All medication details are required.",
        variant: "destructive",
      });
      return;
    }
    addMedicationMutation.mutate(formData);
  };

  const getNextDoseTime = (time: string, frequency: string) => {
    const today = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    
    if (frequency === 'daily') {
      const nextDose = new Date(today);
      nextDose.setHours(hours, minutes, 0, 0);
      
      if (nextDose <= today) {
        nextDose.setDate(nextDose.getDate() + 1);
      }
      
      return nextDose.toLocaleDateString('en-US', { 
        weekday: 'long', 
        hour: 'numeric', 
        minute: '2-digit' 
      });
    } else if (frequency === 'weekly') {
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      nextWeek.setHours(hours, minutes, 0, 0);
      
      return nextWeek.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric', 
        minute: '2-digit' 
      });
    }
    
    return 'Next dose scheduled';
  };

  if (isLoading) {
    return (
      <section>
        <Skeleton className="h-7 w-48 mb-6" />
        
        <Card>
          <CardContent className="p-6">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </div>
            
            <Skeleton className="h-6 w-40 mb-4" />
            
            <div className="space-y-4">
              <div className="medication-card bg-secondary rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-44" />
                </div>
                <div className="flex space-x-2 mt-3">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-28" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  const activeMedications = medications?.filter(med => med.isActive) ?? [];
  const nextDoseMedication = activeMedications[0]; // For demo, use first medication

  return (
    <section>
      <h2 className="text-xl font-bold text-dark-gray mb-6">Medication Schedule</h2>
      
      <Card>
        <CardContent className="p-6">
          {/* Next Dose Alert */}
          {nextDoseMedication && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-primary p-2 rounded-full">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-dark-gray">Next Dose Due</p>
                  <p className="text-sm text-muted-foreground">
                    {nextDoseMedication.name} - {nextDoseMedication.dose} in 2 hours
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Current Medications */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-dark-gray">Current Medications</h3>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="focus-ring">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Medication
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Medication</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="med-name">Medication Name</Label>
                    <Input
                      id="med-name"
                      placeholder="e.g., Semaglutide (Ozempic)"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="focus-ring"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="med-dose">Dose</Label>
                    <Input
                      id="med-dose"
                      placeholder="e.g., 0.5mg"
                      value={formData.dose}
                      onChange={(e) => setFormData({ ...formData, dose: e.target.value })}
                      className="focus-ring"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="med-frequency">Frequency</Label>
                      <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value })}>
                        <SelectTrigger className="focus-ring">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="med-time">Time</Label>
                      <Input
                        id="med-time"
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="focus-ring"
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 pt-4">
                    <Button
                      type="submit"
                      className="flex-1 bg-primary hover:bg-primary/90 focus-ring"
                      disabled={addMedicationMutation.isPending}
                    >
                      {addMedicationMutation.isPending ? "Adding..." : "Add Medication"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="focus-ring"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          {activeMedications.length > 0 ? (
            <div className="space-y-4">
              {activeMedications.map((medication) => (
                <div key={medication.id} className="medication-card bg-secondary rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-dark-gray">{medication.name}</h4>
                    <Badge className="bg-success text-success-foreground">Active</Badge>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><span className="font-medium">Dose:</span> {medication.dose}</p>
                    <p><span className="font-medium">Frequency:</span> {medication.frequency}</p>
                    <p><span className="font-medium">Next dose:</span> {getNextDoseTime(medication.time, medication.frequency)}</p>
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <Button
                      size="sm"
                      onClick={() => markTakenMutation.mutate(medication.id)}
                      disabled={markTakenMutation.isPending}
                      className="bg-primary hover:bg-primary/90 focus-ring"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Mark Taken
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="focus-ring"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit Schedule
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No medications added yet.</p>
              <p className="text-sm">Add your first medication to get started with reminders.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

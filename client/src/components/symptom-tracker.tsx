import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getAuthHeaders } from "@/lib/auth";
import { type SideEffect } from "@shared/schema";
import { format } from "date-fns";

export default function SymptomTracker() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    symptom: "",
    severity: 5,
    notes: ""
  });

  const { data: recentSymptoms, isLoading } = useQuery<SideEffect[]>({
    queryKey: ['/api/side-effects', { limit: 5 }],
    queryFn: async () => {
      const response = await fetch('/api/side-effects?limit=5', {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch side effects');
      return response.json();
    }
  });

  const logSymptomMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/side-effects", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/side-effects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      setFormData({ symptom: "", severity: 5, notes: "" });
      toast({
        title: "Symptom logged",
        description: "Your symptom has been recorded successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to log symptom",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.symptom) {
      toast({
        title: "Please select a symptom",
        description: "You must select a symptom type to continue.",
        variant: "destructive",
      });
      return;
    }
    logSymptomMutation.mutate(formData);
  };

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return "bg-success";
    if (severity <= 6) return "bg-warning";
    return "bg-destructive";
  };

  const getSeverityLabel = (severity: number) => {
    if (severity <= 3) return "Mild";
    if (severity <= 6) return "Moderate";
    return "Severe";
  };

  return (
    <section>
      <h2 className="text-2xl font-bold text-dark-gray mb-6">Symptom Tracker</h2>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Log Today's Symptoms</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="symptom-select">Symptom Type</Label>
                <Select
                  value={formData.symptom}
                  onValueChange={(value) => setFormData({ ...formData, symptom: value })}
                >
                  <SelectTrigger id="symptom-select" className="focus-ring">
                    <SelectValue placeholder="Select a symptom" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nausea">Nausea</SelectItem>
                    <SelectItem value="fatigue">Fatigue</SelectItem>
                    <SelectItem value="muscle-loss">Muscle Loss</SelectItem>
                    <SelectItem value="digestive">Digestive Issues</SelectItem>
                    <SelectItem value="headache">Headache</SelectItem>
                    <SelectItem value="dizziness">Dizziness</SelectItem>
                    <SelectItem value="injection-site">Injection Site Reaction</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="severity-slider">
                  Severity Level:
                  <span className="font-bold text-primary ml-1">
                    {formData.severity}/10
                  </span>
                </Label>
                <div className="px-2">
                  <Slider
                    id="severity-slider"
                    min={1}
                    max={10}
                    step={1}
                    value={[formData.severity]}
                    onValueChange={(value) => setFormData({ ...formData, severity: value[0] })}
                    className="symptom-severity focus-ring"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Mild</span>
                    <span>Moderate</span>
                    <span>Severe</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="symptom-notes">Additional Notes (Optional)</Label>
              <Textarea
                id="symptom-notes"
                rows={3}
                placeholder="Describe any additional details about your symptoms..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="focus-ring"
              />
            </div>

            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 focus-ring"
              disabled={logSymptomMutation.isPending}
            >
              {logSymptomMutation.isPending ? "Logging..." : "Log Symptom"}
            </Button>
          </form>

          {/* Recent Symptoms */}
          <div className="mt-8 pt-6 border-t border-border">
            <h4 className="text-lg font-semibold text-dark-gray mb-4">Recent Entries</h4>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="w-3 h-3 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-4 w-8 mb-1" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentSymptoms && recentSymptoms.length > 0 ? (
              <div className="space-y-3">
                {recentSymptoms.map((symptom) => (
                  <div key={symptom.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 ${getSeverityColor(symptom.severity)} rounded-full`}></div>
                      <div>
                        <p className="font-medium text-dark-gray capitalize">
                          {symptom.symptom.replace('-', ' ')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {symptom.timestamp ? format(new Date(symptom.timestamp), 'MMM d, h:mm a') : 'Unknown time'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{symptom.severity}/10</p>
                      <p className="text-xs text-muted-foreground">
                        {getSeverityLabel(symptom.severity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No symptoms logged yet.</p>
                <p className="text-sm">Start tracking your symptoms to see them here.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

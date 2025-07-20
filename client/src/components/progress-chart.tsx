import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { getAuthHeaders } from "@/lib/auth";
import { type SideEffect } from "@shared/schema";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function ProgressChart() {
  const { data: sideEffects, isLoading } = useQuery<SideEffect[]>({
    queryKey: ['/api/side-effects'],
    queryFn: async () => {
      const response = await fetch('/api/side-effects', {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch side effects');
      return response.json();
    }
  });

  const calculateSymptomProgress = (symptomType: string) => {
    if (!sideEffects) return { progress: 0, trend: 'stable', avgSeverity: 0 };

    const symptomData = sideEffects.filter(effect => effect.symptom === symptomType);
    if (symptomData.length === 0) return { progress: 0, trend: 'stable', avgSeverity: 0 };

    // Calculate average severity for trend analysis
    const avgSeverity = symptomData.reduce((sum, effect) => sum + effect.severity, 0) / symptomData.length;
    
    // Calculate recent vs older severity for trend
    const sortedData = symptomData.sort((a, b) => 
      new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime()
    );
    
    const recentData = sortedData.slice(0, Math.ceil(sortedData.length / 2));
    const olderData = sortedData.slice(Math.ceil(sortedData.length / 2));
    
    const recentAvg = recentData.reduce((sum, effect) => sum + effect.severity, 0) / recentData.length;
    const olderAvg = olderData.length > 0 
      ? olderData.reduce((sum, effect) => sum + effect.severity, 0) / olderData.length 
      : recentAvg;

    // Calculate progress (lower severity = better progress)
    const progress = Math.max(0, 100 - (avgSeverity * 10));
    
    // Determine trend
    let trend: 'improving' | 'stable' | 'worsening' = 'stable';
    if (recentAvg < olderAvg - 0.5) trend = 'improving';
    else if (recentAvg > olderAvg + 0.5) trend = 'worsening';

    return { progress, trend, avgSeverity };
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-success" />;
      case 'worsening':
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTrendText = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'Improving';
      case 'worsening':
        return 'Needs Attention';
      default:
        return 'Stable';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 70) return 'bg-success';
    if (progress >= 40) return 'bg-warning';
    return 'bg-destructive';
  };

  if (isLoading) {
    return (
      <section>
        <Skeleton className="h-7 w-40 mb-6" />
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-2">
                    <Skeleton className="h-4 w-16" />
                    <div className="flex items-center space-x-2">
                      <Skeleton className="w-4 h-4" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-border">
              <Skeleton className="h-6 w-32 mb-3" />
              <div className="space-y-2">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  const commonSymptoms = ['nausea', 'fatigue', 'digestive'];
  const progressData = commonSymptoms.map(symptom => ({
    symptom,
    ...calculateSymptomProgress(symptom)
  }));

  return (
    <section>
      <h2 className="text-xl font-bold text-dark-gray mb-6">Progress Overview</h2>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Symptom Trends</CardTitle>
            <Select defaultValue="7days">
              <SelectTrigger className="w-32 focus-ring">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="3months">Last 3 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {progressData.map(({ symptom, progress, trend }) => (
              <div key={symptom}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {symptom.replace('-', ' ')}
                  </span>
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(trend)}
                    <span className="text-sm text-muted-foreground">
                      {getTrendText(trend)}
                    </span>
                  </div>
                </div>
                <Progress 
                  value={progress} 
                  className="h-2"
                  // @ts-ignore - Custom class for color
                  indicatorClassName={getProgressColor(progress)}
                />
              </div>
            ))}
            
            {progressData.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No symptom data available yet.</p>
                <p className="text-sm">Start logging symptoms to see your progress trends.</p>
              </div>
            )}
          </div>
          
          {/* Health Insights */}
          {sideEffects && sideEffects.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border">
              <h4 className="font-semibold text-dark-gray mb-3">Weekly Insights</h4>
              <div className="space-y-2">
                {progressData.some(data => data.trend === 'improving') && (
                  <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                    <p className="text-sm text-success font-medium">
                      🎉 Your symptoms are showing improvement this week
                    </p>
                  </div>
                )}
                
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                  <p className="text-sm text-primary font-medium">
                    💡 Consider viewing nutrition content for sustained energy
                  </p>
                </div>
                
                {progressData.some(data => data.trend === 'worsening') && (
                  <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                    <p className="text-sm text-warning font-medium">
                      ⚠️ Some symptoms may need attention - consider contacting your healthcare provider
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

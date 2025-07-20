import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bookmark, Play } from "lucide-react";
import { type Content } from "@shared/schema";

export default function EducationalContent() {
  const { data: content, isLoading } = useQuery<Content[]>({
    queryKey: ['/api/content'],
    queryFn: async () => {
      const response = await fetch('/api/content');
      if (!response.ok) throw new Error('Failed to fetch content');
      return response.json();
    }
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'nutrition':
        return 'bg-success/10 text-success hover:bg-success/20';
      case 'exercise':
        return 'bg-warning/10 text-warning hover:bg-warning/20';
      case 'behavioral':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
      default:
        return 'bg-secondary text-secondary-foreground hover:bg-secondary/80';
    }
  };

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'nausea':
        return 'bg-orange-100 text-orange-700 hover:bg-orange-200';
      case 'fatigue':
        return 'bg-purple-100 text-purple-700 hover:bg-purple-200';
      case 'plateau':
        return 'bg-red-100 text-red-700 hover:bg-red-200';
      default:
        return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
    }
  };

  if (isLoading) {
    return (
      <section>
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-16" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-12 w-full mb-3" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-12" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-dark-gray">Recommended for You</h2>
        <Button variant="link" className="text-primary hover:text-primary/80 focus-ring">
          View All
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {content?.map((item) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
            {item.url && (
              <div className="video-container">
                <iframe
                  src={item.url}
                  title={item.title}
                  frameBorder="0"
                  allowFullScreen
                  className="rounded-t-lg"
                  aria-label={`Educational video: ${item.title}`}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                  <Play className="w-12 h-12 text-white" />
                </div>
              </div>
            )}
            
            <CardContent className="p-4">
              <div className="flex items-center flex-wrap gap-2 mb-2">
                <Badge className={getTypeColor(item.type)}>
                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </Badge>
                {item.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className={getTagColor(tag)}>
                    {tag.replace('-', ' ')}
                  </Badge>
                ))}
              </div>
              
              <h3 className="font-semibold text-dark-gray mb-2 line-clamp-2">
                {item.title}
              </h3>
              
              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                {item.description}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {item.duration}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary/80 focus-ring"
                >
                  <Bookmark className="w-4 h-4 mr-1" />
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Route } from "lucide-react";
import NavigationHeader from "@/components/navigation-header";
import { EvacuationRoutePlanner } from "@/components/evacuation-route-planner";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import type { User, Village } from "@shared/schema";

export default function EvacuationPlanningPage() {
  const { user: authUser } = useAuth();
  
  const { data: user } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    enabled: !!authUser,
  });

  const { data: villages } = useQuery<Village[]>({
    queryKey: ['/api/villages'],
  });

  if (!user || !villages) {
    return (
      <div className="font-inter bg-neutral-100 min-h-screen">
        <NavigationHeader />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="font-inter bg-neutral-100 min-h-screen">
      <NavigationHeader />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Route className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-neutral-700">Evacuation Planning</h1>
            </div>
          </div>
          <p className="text-neutral-500">
            Plan and manage emergency evacuation routes for your village. Only available to village administrators.
          </p>
        </div>

        <EvacuationRoutePlanner user={user} villages={villages} />
      </main>
    </div>
  );
}
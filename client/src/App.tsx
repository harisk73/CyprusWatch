import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Profile from "@/pages/profile";
import EmergencyReport from "@/pages/emergency-report";
import EmergencyServices from "@/pages/emergency-services";
import EvacuationPlanning from "@/pages/evacuation-planning";
import SmsAlerts from "@/pages/sms-alerts";
import Users from "@/pages/users";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/profile" component={Profile} />
          <Route path="/emergency-report" component={EmergencyReport} />
          <Route path="/emergency-services" component={EmergencyServices} />
          <Route path="/evacuation-planning" component={EvacuationPlanning} />
          <Route path="/sms-alerts" component={SmsAlerts} />
          <Route path="/users" component={Users} />
        </>
      )}
      <Route component={NotFound} />
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

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Admin from "@/pages/admin";
import EventPage from "@/pages/event";
import GalleryPage from "@/pages/gallery";
import LegalPage from "@/pages/legal";
import AccessPage from "@/pages/access";
import AccessPassportPage from "@/pages/access-passport";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/event" component={EventPage} />
      <Route path="/gallery" component={GalleryPage} />
      <Route path="/terms" component={LegalPage} />
      <Route path="/privacy" component={LegalPage} />
      <Route path="/refund" component={LegalPage} />
      <Route path="/age-requirements" component={LegalPage} />
      <Route path="/admin" component={Admin} />
      <Route path="/access" component={AccessPage} />
      <Route path="/access-passport" component={AccessPassportPage} />
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

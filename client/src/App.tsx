import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import AboutPage from "@/pages/about";
import ServicesPage from "@/pages/services";
import ContactPage from "@/pages/contact";
import EventsPage from "@/pages/events";
import EventsPastPage from "@/pages/events-past";
import EventDetailPage from "@/pages/event-detail";
import GalleryPage from "@/pages/gallery";
import AccessPage from "@/pages/access";
import LegalPage from "@/pages/legal";
import AdminDashboardPage from "@/pages/admin-dashboard";
import AdminEventsPage from "@/pages/admin-events";
import AdminEventsNewPage from "@/pages/admin-events-new";
import AdminEventDetailPage from "@/pages/admin-event-detail";
import AdminOrdersPage from "@/pages/admin-orders";
import AdminScanPage from "@/pages/admin-scan";
import AdminAccessPage from "@/pages/admin-access";
import AdminAccessEventsPage from "@/pages/admin-access-events";
import AdminAccessGalleryPage from "@/pages/admin-access-gallery";
import AdminGalleryPage from "@/pages/admin-gallery";
import AdminHeroPage from "@/pages/admin-hero";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={Home} />
      <Route path="/about" component={AboutPage} />
      <Route path="/services" component={ServicesPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/events" component={EventsPage} />
      <Route path="/events/past" component={EventsPastPage} />
      <Route path="/events/:id" component={EventDetailPage} />
      <Route path="/gallery" component={GalleryPage} />
      <Route path="/access" component={AccessPage} />
      {/* Legal */}
      <Route path="/terms" component={LegalPage} />
      <Route path="/privacy" component={LegalPage} />
      <Route path="/refund" component={LegalPage} />
      <Route path="/age-requirements" component={LegalPage} />
      {/* Admin — specific sub-routes before catch-all */}
      <Route path="/admin/events/new" component={AdminEventsNewPage} />
      <Route path="/admin/events/:id" component={AdminEventDetailPage} />
      <Route path="/admin/events" component={AdminEventsPage} />
      <Route path="/admin/orders" component={AdminOrdersPage} />
      <Route path="/admin/scan" component={AdminScanPage} />
      <Route path="/admin/access/events" component={AdminAccessEventsPage} />
      <Route path="/admin/access/gallery" component={AdminAccessGalleryPage} />
      <Route path="/admin/access" component={AdminAccessPage} />
      <Route path="/admin/gallery" component={AdminGalleryPage} />
      <Route path="/admin/hero" component={AdminHeroPage} />
      <Route path="/admin" component={AdminDashboardPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

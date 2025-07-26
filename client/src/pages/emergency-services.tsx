import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone } from "lucide-react";
import NavigationHeader from "@/components/navigation-header";
import { EmergencyServicesPanel } from "@/components/emergency-services-panel";

export default function EmergencyServicesPage() {
  return (
    <div className="font-inter bg-neutral-100 min-h-screen">
      <NavigationHeader />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <Phone className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-neutral-700">Emergency Services</h1>
            </div>
          </div>
          <p className="text-neutral-500">
            Quick access to Cyprus emergency services. All calls are logged for your safety.
          </p>
        </div>

        <EmergencyServicesPanel />
      </main>
    </div>
  );
}
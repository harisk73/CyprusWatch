import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, MapPin, Bell, Users } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="text-primary text-2xl" />
              <h1 className="text-xl font-bold text-neutral-600">Cyprus Emergency Alert</h1>
            </div>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-primary hover:bg-primary/90"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-neutral-600 mb-4">
            Stay Safe, Stay Informed
          </h2>
          <p className="text-xl text-neutral-500 mb-8 max-w-3xl mx-auto">
            Cyprus Emergency Alert System provides real-time emergency notifications, 
            interactive mapping, and community-based safety features for all villages across Cyprus.
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = '/api/login'}
            className="bg-primary hover:bg-primary/90 text-lg px-8 py-4"
          >
            Get Started - Sign In Now
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-lg">Interactive Mapping</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-500">
                Report emergencies and view incidents on an interactive map of Cyprus with village boundaries.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Bell className="h-12 w-12 text-warning mx-auto mb-4" />
              <CardTitle className="text-lg">Real-time Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-500">
                Receive instant notifications about emergencies, weather warnings, and community updates.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-success mx-auto mb-4" />
              <CardTitle className="text-lg">Village Communities</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-500">
                Connect with your village community and receive location-specific emergency information.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 text-emergency mx-auto mb-4" />
              <CardTitle className="text-lg">Emergency Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-500">
                Manage your emergency contacts and access quick dial numbers for emergency services.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-neutral-600 mb-4">
            Join Your Village Community Today
          </h3>
          <p className="text-neutral-500 mb-6 max-w-2xl mx-auto">
            Sign in to access village-specific emergency alerts, report incidents in your area, 
            and connect with your local emergency response network.
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = '/api/login'}
            className="bg-primary hover:bg-primary/90"
          >
            Sign In to Continue
          </Button>
        </div>
      </main>
    </div>
  );
}

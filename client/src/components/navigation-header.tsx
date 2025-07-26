import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Shield, Menu } from "lucide-react";

export default function NavigationHeader() {
  const { user } = useAuth();
  const [location] = useLocation();

  const getStatusColor = () => {
    // This would be based on active alerts for the user's village
    return "bg-success";
  };

  const getStatusText = () => {
    // This would be based on active alerts for the user's village
    return "All Clear";
  };

  return (
    <header className="bg-white shadow-lg border-b border-neutral-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <Shield className="text-primary text-2xl" />
              <h1 className="text-xl font-bold text-neutral-600">Cyprus Emergency Alert</h1>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/">
              <a className={`text-neutral-600 hover:text-primary transition-colors font-medium ${
                location === "/" ? "text-primary" : ""
              }`}>
                Dashboard
              </a>
            </Link>
            <a href="#map" className="text-neutral-600 hover:text-primary transition-colors font-medium">
              Emergency Map
            </a>
            <a href="#alerts" className="text-neutral-600 hover:text-primary transition-colors font-medium">
              Active Alerts
            </a>
            <Link href="/profile">
              <a className={`text-neutral-600 hover:text-primary transition-colors font-medium ${
                location === "/profile" ? "text-primary" : ""
              }`}>
                Profile
              </a>
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {/* Emergency Status Indicator */}
            <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
              <div className={`w-2 h-2 ${getStatusColor()} rounded-full mr-2`}></div>
              {getStatusText()}
            </Badge>
            
            {/* User Avatar */}
            <div className="flex items-center space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.profileImageUrl || ""} alt="User profile" />
                <AvatarFallback>
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-neutral-600 hidden sm:block">
                {user?.firstName} {user?.lastName}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = "/api/logout"}
                className="text-neutral-500 hover:text-neutral-700"
              >
                Logout
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

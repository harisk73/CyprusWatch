import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Phone, Clock, User, AlertTriangle, CheckCircle, Eye, UserCheck } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

export default function AntiFraudInfo() {
  const { t } = useLanguage();

  const antifraudMeasures = [
    {
      icon: Phone,
      title: "Phone Verification",
      description: "All users must verify their phone number via SMS before posting emergency alerts",
      status: "active",
      color: "text-green-600 bg-green-50 border-green-200"
    },
    {
      icon: User,
      title: "User Authentication", 
      description: "Only registered users with verified Replit accounts can access the system",
      status: "active",
      color: "text-blue-600 bg-blue-50 border-blue-200"
    },
    {
      icon: Clock,
      title: "Rate Limiting",
      description: "Users are limited to posting one emergency alert per 15-minute period",
      status: "recommended",
      color: "text-amber-600 bg-amber-50 border-amber-200"
    },
    {
      icon: Eye,
      title: "Audit Trail",
      description: "All emergency reports are logged with user ID, timestamp, and location data",
      status: "active",
      color: "text-purple-600 bg-purple-50 border-purple-200"
    },
    {
      icon: UserCheck,
      title: "Admin Moderation",
      description: "Village administrators can review and moderate emergency reports in real-time",
      status: "active",
      color: "text-indigo-600 bg-indigo-50 border-indigo-200"
    },
    {
      icon: Shield,
      title: "Location Verification",
      description: "GPS coordinates are cross-checked with reported village boundaries",
      status: "recommended",
      color: "text-red-600 bg-red-50 border-red-200"
    }
  ];

  const additionalRecommendations = [
    "📱 SMS Confirmation: Send confirmation SMS to verified phone numbers for high-priority alerts",
    "🔍 Pattern Detection: Monitor for suspicious patterns like multiple reports from same location",
    "⏰ Time-based Restrictions: Limit emergency reports during non-emergency hours with additional verification",
    "🏘️ Community Validation: Allow village residents to confirm or dispute emergency reports",
    "📸 Photo Evidence: Enable users to attach photos to emergency reports for verification",
    "🚨 False Report Penalties: Implement temporary account restrictions for verified false reports",
    "🔐 Two-Factor Authentication: Require 2FA for critical emergency system access",
    "📊 Behavioral Analytics: Track user behavior patterns to identify potential misuse",
    "🌍 IP Geolocation: Cross-reference user IP location with reported emergency location",
    "👥 Witness Verification: Allow multiple users to corroborate the same emergency incident"
  ];

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Shield className="w-5 h-5" />
            Anti-Fraud Security Measures
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-blue-100 rounded-lg border border-blue-200">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Current Protection Status</p>
                <p>Our emergency alert system includes multiple layers of security to prevent false reports and maintain system integrity.</p>
              </div>
            </div>

            <div className="grid gap-3">
              {antifraudMeasures.map((measure, index) => {
                const IconComponent = measure.icon;
                return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${measure.color}`}
                  >
                    <div className="flex items-start gap-3">
                      <IconComponent className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-sm">{measure.title}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            measure.status === 'active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {measure.status === 'active' ? 'Active' : 'Recommended'}
                          </span>
                        </div>
                        <p className="text-xs opacity-90">{measure.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="w-5 h-5" />
            Additional Anti-Fraud Recommendations
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-amber-800 mb-3">
              <p className="font-medium mb-1">Enhanced Security Suggestions</p>
              <p>These additional measures could further strengthen the system against false reports:</p>
            </div>

            <div className="grid gap-2">
              {additionalRecommendations.map((recommendation, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-2 bg-amber-100 rounded border border-amber-200"
                >
                  <span className="text-amber-600 text-xs mt-0.5">•</span>
                  <span className="text-xs text-amber-800">{recommendation}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-amber-100 rounded-lg border border-amber-200">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-amber-800">
                  <p className="font-medium mb-1">Implementation Priority</p>
                  <p>For immediate deployment, phone verification provides the best balance of security and user experience. Additional measures can be implemented based on usage patterns and threat assessment.</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, MapPin, Bell, Users } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { LanguageSwitcher } from "@/components/language-switcher";
import { DisclaimerBanner } from "@/components/disclaimer-banner";

export default function Landing() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="text-primary text-2xl" />
              <h1 className="text-xl font-bold text-neutral-600 hidden sm:block">Cyprus Emergency Alert</h1>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="bg-primary hover:bg-primary/90"
              >
                {t('landing.signIn')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Disclaimer Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <DisclaimerBanner />
      </div>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-neutral-600 mb-4">
            {t('landing.heroTitle')}
          </h2>
          <p className="text-xl text-neutral-500 mb-8 max-w-3xl mx-auto">
            {t('landing.heroDescription')}
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = '/api/login'}
            className="bg-primary hover:bg-primary/90 text-lg px-8 py-4"
          >
            {t('landing.getStarted')}
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-lg">{t('landing.feature1Title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-500">
                {t('landing.feature1Description')}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Bell className="h-12 w-12 text-warning mx-auto mb-4" />
              <CardTitle className="text-lg">{t('landing.feature2Title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-500">
                {t('landing.feature2Description')}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-success mx-auto mb-4" />
              <CardTitle className="text-lg">{t('landing.feature3Title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-500">
                {t('landing.feature3Description')}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 text-emergency mx-auto mb-4" />
              <CardTitle className="text-lg">{t('landing.feature4Title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-500">
                {t('landing.feature4Description')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-neutral-600 mb-4">
            {t('landing.callToActionTitle')}
          </h3>
          <p className="text-neutral-500 mb-6 max-w-2xl mx-auto">
            {t('landing.callToActionDescription')}
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = '/api/login'}
            className="bg-primary hover:bg-primary/90"
          >
            {t('landing.signInToContinue')}
          </Button>
        </div>
      </main>
    </div>
  );
}

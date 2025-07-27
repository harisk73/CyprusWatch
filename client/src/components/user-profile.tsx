import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/language-context";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Village, User } from "@shared/schema";

export default function UserProfile() {
  const { user } = useAuth() as { user: User | undefined };
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    villageId: user?.villageId || "",
    address: user?.address || "",
    emergencyContactName: user?.emergencyContactName || "",
    emergencyContactPhone: user?.emergencyContactPhone || "",
    emergencyContactRelationship: user?.emergencyContactRelationship || "",
    emergencyContactSecondary: user?.emergencyContactSecondary || "",
    notificationPreferences: user?.notificationPreferences || {
      emergency: true,
      weather: true,
      roadClosures: true,
      community: false,
      browserNotifications: true,
      smsNotifications: true,
      emailNotifications: false,
      quietHoursFrom: "22:00",
      quietHoursTo: "07:00"
    },
  });

  const { data: villages } = useQuery<Village[]>({
    queryKey: ["/api/villages"],
  });

  // Update form when user data becomes available
  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        villageId: user.villageId || "",
        address: user.address || "",
        emergencyContactName: user.emergencyContactName || "",
        emergencyContactPhone: user.emergencyContactPhone || "",
        emergencyContactRelationship: user.emergencyContactRelationship || "",
        emergencyContactSecondary: user.emergencyContactSecondary || "",
        notificationPreferences: user.notificationPreferences || {
          emergency: true,
          weather: true,
          roadClosures: true,
          community: false,
          browserNotifications: true,
          smsNotifications: true,
          emailNotifications: false,
          quietHoursFrom: "22:00",
          quietHoursTo: "07:00"
        },
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      const res = await apiRequest("PUT", "/api/user/profile", profileData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: t('profile.updated'),
        description: t('profile.updatedDesc'),
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: t('common.unauthorized'),
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: t('common.error'),
        description: t('profile.updateError'),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileForm);
  };

  const handleNotificationChange = (key: string, value: any) => {
    setProfileForm(prev => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [key]: value,
      },
    }));
  };

  const selectedVillage = villages?.find(v => v.id === profileForm.villageId);

  return (
    <section id="profile">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xl font-bold text-neutral-600">{t('profile.title')}</CardTitle>
              <Button
                form="profile-form"
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateProfileMutation.isPending ? t('profile.saving') : t('profile.saveChanges')}
              </Button>
            </CardHeader>

            <CardContent>
              <form id="profile-form" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="font-semibold text-neutral-600 mb-4">{t('profile.personalInfo')}</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="firstName">{t('profile.firstName')}</Label>
                        <Input
                          id="firstName"
                          value={profileForm.firstName}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">{t('profile.lastName')}</Label>
                        <Input
                          id="lastName"
                          value={profileForm.lastName}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">{t('profile.email')}</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">{t('profile.phone')}</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location Settings */}
                  <div>
                    <h3 className="font-semibold text-neutral-600 mb-4">{t('profile.locationSettings')}</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="village">{t('profile.yourVillage')}</Label>
                        <Select
                          value={profileForm.villageId}
                          onValueChange={(value) => setProfileForm(prev => ({ ...prev, villageId: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('profile.selectVillage')} />
                          </SelectTrigger>
                          <SelectContent>
                            {villages?.map((village) => (
                              <SelectItem key={village.id} value={village.id}>
                                {village.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="district">{t('profile.district')}</Label>
                        <Input
                          id="district"
                          value={selectedVillage?.district || ""}
                          readOnly
                          className="bg-neutral-50 text-neutral-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="address">{t('profile.address')}</Label>
                        <Textarea
                          id="address"
                          value={profileForm.address}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                          placeholder={t('profile.addressPlaceholder')}
                          rows={3}
                          className="resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emergency Contacts */}
                <div className="mt-8">
                  <h3 className="font-semibold text-neutral-600 mb-4">{t('profile.emergencyContacts')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emergencyContactName">{t('profile.primaryContactName')}</Label>
                      <Input
                        id="emergencyContactName"
                        value={profileForm.emergencyContactName}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyContactPhone">{t('profile.primaryContactPhone')}</Label>
                      <Input
                        id="emergencyContactPhone"
                        type="tel"
                        value={profileForm.emergencyContactPhone}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="relationship">{t('profile.relationship')}</Label>
                      <Select
                        value={profileForm.emergencyContactRelationship}
                        onValueChange={(value) => setProfileForm(prev => ({ ...prev, emergencyContactRelationship: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('profile.selectRelationship')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spouse">{t('profile.relationshipSpouse')}</SelectItem>
                          <SelectItem value="parent">{t('profile.relationshipParent')}</SelectItem>
                          <SelectItem value="sibling">{t('profile.relationshipSibling')}</SelectItem>
                          <SelectItem value="child">{t('profile.relationshipChild')}</SelectItem>
                          <SelectItem value="friend">{t('profile.relationshipFriend')}</SelectItem>
                          <SelectItem value="other">{t('profile.relationshipOther')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="emergencyContactSecondary">{t('profile.secondaryContactPhone')}</Label>
                      <Input
                        id="emergencyContactSecondary"
                        type="tel"
                        value={profileForm.emergencyContactSecondary}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, emergencyContactSecondary: e.target.value }))}
                        placeholder="+357 ..."
                      />
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-neutral-600">{t('profile.notificationPreferences')}</CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-neutral-600 mb-3">{t('profile.alertTypes')}</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emergency-alerts" className="text-sm text-neutral-600">
                      {t('profile.emergencyAlerts')}
                    </Label>
                    <Checkbox
                      id="emergency-alerts"
                      checked={profileForm.notificationPreferences.emergency}
                      disabled
                      className="border-emergency data-[state=checked]:bg-emergency"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="weather-alerts" className="text-sm text-neutral-600">
                      {t('profile.weatherWarnings')}
                    </Label>
                    <Checkbox
                      id="weather-alerts"
                      checked={profileForm.notificationPreferences.weather}
                      onCheckedChange={(checked) => handleNotificationChange("weather", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="road-alerts" className="text-sm text-neutral-600">
                      {t('profile.roadClosures')}
                    </Label>
                    <Checkbox
                      id="road-alerts"
                      checked={profileForm.notificationPreferences.roadClosures}
                      onCheckedChange={(checked) => handleNotificationChange("roadClosures", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="community-alerts" className="text-sm text-neutral-600">
                      {t('profile.communityUpdates')}
                    </Label>
                    <Checkbox
                      id="community-alerts"
                      checked={profileForm.notificationPreferences.community}
                      onCheckedChange={(checked) => handleNotificationChange("community", checked)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-neutral-600 mb-3">{t('profile.notificationMethods')}</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="browser-notifications" className="text-sm text-neutral-600">
                      {t('profile.browserNotifications')}
                    </Label>
                    <Checkbox
                      id="browser-notifications"
                      checked={profileForm.notificationPreferences.browserNotifications}
                      onCheckedChange={(checked) => handleNotificationChange("browserNotifications", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sms-notifications" className="text-sm text-neutral-600">
                      {t('profile.smsNotifications')}
                    </Label>
                    <Checkbox
                      id="sms-notifications"
                      checked={profileForm.notificationPreferences.smsNotifications}
                      onCheckedChange={(checked) => handleNotificationChange("smsNotifications", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-notifications" className="text-sm text-neutral-600">
                      {t('profile.emailNotifications')}
                    </Label>
                    <Checkbox
                      id="email-notifications"
                      checked={profileForm.notificationPreferences.emailNotifications}
                      onCheckedChange={(checked) => handleNotificationChange("emailNotifications", checked)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-neutral-600 mb-3">{t('profile.quietHours')}</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="quiet-from" className="text-xs text-neutral-500">{t('profile.from')}</Label>
                    <Input
                      id="quiet-from"
                      type="time"
                      value={profileForm.notificationPreferences.quietHoursFrom}
                      onChange={(e) => handleNotificationChange("quietHoursFrom", e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quiet-to" className="text-xs text-neutral-500">{t('profile.to')}</Label>
                    <Input
                      id="quiet-to"
                      type="time"
                      value={profileForm.notificationPreferences.quietHoursTo}
                      onChange={(e) => handleNotificationChange("quietHoursTo", e.target.value)}
                      className="text-sm"
                    />
                  </div>
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  {t('profile.emergencyOverride')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

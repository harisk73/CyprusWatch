import { useState } from "react";
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
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Village, User } from "@shared/schema";

export default function UserProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
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

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      const res = await apiRequest("PUT", "/api/user/profile", profileData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
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
              <CardTitle className="text-xl font-bold text-neutral-600">Profile Settings</CardTitle>
              <Button
                form="profile-form"
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </CardHeader>

            <CardContent>
              <form id="profile-form" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="font-semibold text-neutral-600 mb-4">Personal Information</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={profileForm.firstName}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={profileForm.lastName}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
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
                    <h3 className="font-semibold text-neutral-600 mb-4">Location Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="village">Your Village</Label>
                        <Select
                          value={profileForm.villageId}
                          onValueChange={(value) => setProfileForm(prev => ({ ...prev, villageId: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your village..." />
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
                        <Label htmlFor="district">District</Label>
                        <Input
                          id="district"
                          value={selectedVillage?.district || ""}
                          readOnly
                          className="bg-neutral-50 text-neutral-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="address">Address (Optional)</Label>
                        <Textarea
                          id="address"
                          value={profileForm.address}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="Enter your address..."
                          rows={3}
                          className="resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emergency Contacts */}
                <div className="mt-8">
                  <h3 className="font-semibold text-neutral-600 mb-4">Emergency Contacts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emergencyContactName">Primary Contact Name</Label>
                      <Input
                        id="emergencyContactName"
                        value={profileForm.emergencyContactName}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyContactPhone">Primary Contact Phone</Label>
                      <Input
                        id="emergencyContactPhone"
                        type="tel"
                        value={profileForm.emergencyContactPhone}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="relationship">Relationship</Label>
                      <Select
                        value={profileForm.emergencyContactRelationship}
                        onValueChange={(value) => setProfileForm(prev => ({ ...prev, emergencyContactRelationship: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spouse">Spouse</SelectItem>
                          <SelectItem value="parent">Parent</SelectItem>
                          <SelectItem value="sibling">Sibling</SelectItem>
                          <SelectItem value="child">Child</SelectItem>
                          <SelectItem value="friend">Friend</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="emergencyContactSecondary">Secondary Contact Phone</Label>
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
            <CardTitle className="text-xl font-bold text-neutral-600">Notification Preferences</CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-neutral-600 mb-3">Alert Types</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emergency-alerts" className="text-sm text-neutral-600">
                      Emergency Alerts
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
                      Weather Warnings
                    </Label>
                    <Checkbox
                      id="weather-alerts"
                      checked={profileForm.notificationPreferences.weather}
                      onCheckedChange={(checked) => handleNotificationChange("weather", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="road-alerts" className="text-sm text-neutral-600">
                      Road Closures
                    </Label>
                    <Checkbox
                      id="road-alerts"
                      checked={profileForm.notificationPreferences.roadClosures}
                      onCheckedChange={(checked) => handleNotificationChange("roadClosures", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="community-alerts" className="text-sm text-neutral-600">
                      Community Updates
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
                <h4 className="font-medium text-neutral-600 mb-3">Notification Methods</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="browser-notifications" className="text-sm text-neutral-600">
                      Browser Notifications
                    </Label>
                    <Checkbox
                      id="browser-notifications"
                      checked={profileForm.notificationPreferences.browserNotifications}
                      onCheckedChange={(checked) => handleNotificationChange("browserNotifications", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sms-notifications" className="text-sm text-neutral-600">
                      SMS Notifications
                    </Label>
                    <Checkbox
                      id="sms-notifications"
                      checked={profileForm.notificationPreferences.smsNotifications}
                      onCheckedChange={(checked) => handleNotificationChange("smsNotifications", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-notifications" className="text-sm text-neutral-600">
                      Email Notifications
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
                <h4 className="font-medium text-neutral-600 mb-3">Quiet Hours</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="quiet-from" className="text-xs text-neutral-500">From</Label>
                    <Input
                      id="quiet-from"
                      type="time"
                      value={profileForm.notificationPreferences.quietHoursFrom}
                      onChange={(e) => handleNotificationChange("quietHoursFrom", e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quiet-to" className="text-xs text-neutral-500">To</Label>
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
                  Emergency alerts will override quiet hours
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

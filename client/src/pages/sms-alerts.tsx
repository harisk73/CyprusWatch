import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import NavigationHeader from "@/components/navigation-header";
import { useAuth } from "@/hooks/useAuth";
import { 
  ArrowLeft, MessageSquare, Send, Clock, Users, CheckCircle, 
  AlertTriangle, Info, Phone 
} from "lucide-react";
import type { User, Village, SmsAlert, InsertSmsAlert } from "@shared/schema";

export default function SmsAlertsPage() {
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [smsForm, setSmsForm] = useState<Partial<InsertSmsAlert>>({
    message: '',
    alertType: 'info',
    targetVillages: [],
    priority: 'normal',
  });

  const { data: user } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    enabled: !!authUser,
  });

  const { data: villages } = useQuery<Village[]>({
    queryKey: ['/api/villages'],
  });

  const { data: smsAlerts, isLoading } = useQuery<SmsAlert[]>({
    queryKey: ['/api/sms-alerts'],
    enabled: !!user?.isVillageAdmin,
  });

  const sendSmsAlertMutation = useMutation({
    mutationFn: async (data: InsertSmsAlert) => {
      return await apiRequest('POST', '/api/sms-alerts', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sms-alerts'] });
      toast({
        title: "SMS Alert Sent",
        description: "Your emergency SMS notification has been sent successfully.",
      });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error("Error sending SMS alert:", error);
      toast({
        title: "Error",
        description: "Failed to send SMS alert. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSmsForm({
      message: '',
      alertType: 'info',
      targetVillages: [],
      priority: 'normal',
    });
  };

  const handleSendSms = () => {
    if (!smsForm.message?.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a message to send.",
        variant: "destructive",
      });
      return;
    }

    sendSmsAlertMutation.mutate(smsForm as InsertSmsAlert);
  };

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-orange-100 text-orange-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'normal': return 'bg-green-100 text-green-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || !user.isVillageAdmin) {
    return (
      <div className="font-inter bg-neutral-100 min-h-screen">
        <NavigationHeader />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You need administrator privileges to access SMS alert functionality.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="font-inter bg-neutral-100 min-h-screen">
        <NavigationHeader />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="font-inter bg-neutral-100 min-h-screen">
      <NavigationHeader />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <MessageSquare className="h-8 w-8 text-green-600" />
              <h1 className="text-3xl font-bold text-neutral-700">SMS Emergency Alerts</h1>
            </div>
          </div>
          <p className="text-neutral-500">
            Send emergency SMS notifications to residents. 
            {user.villageId ? " As a village admin, you can send to your village residents only." : " As a super admin, you can send to all villages."}
          </p>
        </div>

        {/* Send SMS Alert Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Send className="h-5 w-5 text-green-600" />
                <span>Send SMS Alert</span>
              </CardTitle>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Compose SMS
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Send Emergency SMS Alert</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="alertType">Alert Type</Label>
                        <Select 
                          value={smsForm.alertType} 
                          onValueChange={(value) => setSmsForm(prev => ({ ...prev, alertType: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="emergency">🚨 Emergency</SelectItem>
                            <SelectItem value="warning">⚠️ Warning</SelectItem>
                            <SelectItem value="info">ℹ️ Information</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="priority">Priority</Label>
                        <Select 
                          value={smsForm.priority || 'normal'} 
                          onValueChange={(value) => setSmsForm(prev => ({ ...prev, priority: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="urgent">🔴 Urgent</SelectItem>
                            <SelectItem value="normal">🟢 Normal</SelectItem>
                            <SelectItem value="low">⚪ Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        value={smsForm.message || ''}
                        onChange={(e) => setSmsForm(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Enter your emergency message here..."
                        className="min-h-[100px]"
                        maxLength={160}
                      />
                      <p className="text-xs text-neutral-500 mt-1">
                        {(smsForm.message || '').length}/160 characters
                      </p>
                    </div>

                    <Alert>
                      <Phone className="h-4 w-4" />
                      <AlertDescription>
                        <strong>SMS Delivery:</strong> In a production environment, this would integrate with an SMS service provider like Twilio. 
                        The message will be sent to all residents' registered phone numbers in the target villages.
                      </AlertDescription>
                    </Alert>

                    <div className="flex space-x-3 justify-end">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSendSms} disabled={sendSmsAlertMutation.isPending}>
                        {sendSmsAlertMutation.isPending ? "Sending..." : "Send SMS Alert"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="font-semibold text-blue-800">Instant Delivery</p>
                <p className="text-sm text-blue-600">SMS sent immediately to all residents</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="font-semibold text-green-800">Village Coverage</p>
                <p className="text-sm text-green-600">Reaches all registered residents</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="font-semibold text-orange-800">Delivery Tracking</p>
                <p className="text-sm text-orange-600">Monitor message delivery status</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SMS History */}
        <Card>
          <CardHeader>
            <CardTitle>SMS Alert History</CardTitle>
          </CardHeader>
          <CardContent>
            {!smsAlerts || smsAlerts.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
                <p>No SMS alerts sent yet</p>
                <p className="text-sm">Use the button above to send your first SMS alert</p>
              </div>
            ) : (
              <div className="space-y-4">
                {smsAlerts.map((alert) => (
                  <div key={alert.id} className="p-4 border rounded-lg bg-white">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge className={getAlertTypeColor(alert.alertType)}>
                            {alert.alertType}
                          </Badge>
                          <Badge className={getPriorityColor(alert.priority)}>
                            {alert.priority} priority
                          </Badge>
                          <Badge className={getDeliveryStatusColor(alert.deliveryStatus)}>
                            {alert.deliveryStatus}
                          </Badge>
                        </div>
                        <p className="text-gray-700 mb-2">{alert.message}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{alert.sentAt ? new Date(alert.sentAt).toLocaleString() : 'Unknown'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{alert.recipientCount} recipients</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
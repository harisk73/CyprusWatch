import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, CheckCircle, Phone, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface PhoneVerificationProps {
  userPhone?: string;
  onVerificationComplete: () => void;
}

export default function PhoneVerification({ userPhone, onVerificationComplete }: PhoneVerificationProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [phone, setPhone] = useState(userPhone || "");
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [sentCode, setSentCode] = useState<string>("");

  const sendVerificationMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      const res = await apiRequest("POST", "/api/auth/send-verification", { phone: phoneNumber });
      return res.json();
    },
    onSuccess: (data) => {
      setStep('code');
      setSentCode(data.verificationCode || ""); // For development only
      toast({
        title: "Verification Code Sent",
        description: `A verification code has been sent to ${phone}`,
      });
    },
    onError: async (error) => {
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
      
      // Try to get the error message from the response
      let errorMessage = "Failed to send verification code. Please try again.";
      try {
        if (error instanceof Response) {
          const errorData = await error.json();
          errorMessage = errorData.message || errorMessage;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
      } catch (e) {
        // Use default message if parsing fails
      }
      
      toast({
        title: "SMS Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const verifyCodeMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await apiRequest("POST", "/api/auth/verify-phone", { code });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Phone Verified!",
        description: "Your phone number has been verified. You can now post emergency alerts.",
        variant: "default",
      });
      onVerificationComplete();
    },
    onError: async (error) => {
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
      
      // Try to get the error message from the response
      let errorMessage = "Invalid or expired verification code. Please try again.";
      try {
        if (error instanceof Response) {
          const errorData = await error.json();
          errorMessage = errorData.message || errorMessage;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
      } catch (e) {
        // Use default message if parsing fails
      }
      
      toast({
        title: "Verification Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast({
        title: "Phone Required",
        description: "Please enter your phone number.",
        variant: "destructive",
      });
      return;
    }
    sendVerificationMutation.mutate(phone);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      toast({
        title: "Code Required",
        description: "Please enter the verification code.",
        variant: "destructive",
      });
      return;
    }
    verifyCodeMutation.mutate(verificationCode);
  };

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-800">
          <Shield className="w-5 h-5" />
          Phone Verification Required
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-amber-100 rounded-lg border border-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Verification Required for Emergency Alerts</p>
              <p>To prevent false alerts, only users with verified phone numbers can post emergency reports. This helps maintain the integrity of our emergency response system.</p>
            </div>
          </div>

          {step === 'phone' && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <Label htmlFor="phone" className="text-amber-800">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-amber-600" />
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+357 99 123 456"
                    className="pl-10 border-amber-200 focus:border-amber-400"
                  />
                </div>
                <p className="text-xs text-amber-600 mt-1">
                  Include country code (e.g., +357 for Cyprus)
                </p>
              </div>
              
              <Button
                type="submit"
                disabled={sendVerificationMutation.isPending}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              >
                {sendVerificationMutation.isPending ? "Sending..." : "Send Verification Code"}
              </Button>
            </form>
          )}

          {step === 'code' && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <Label htmlFor="code" className="text-amber-800">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="border-amber-200 focus:border-amber-400 text-center text-lg tracking-widest"
                />
                <p className="text-xs text-amber-600 mt-1">
                  Code sent to {phone}
                  {sentCode && process.env.NODE_ENV === 'development' && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      Demo code: {sentCode}
                    </span>
                  )}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('phone')}
                  className="flex-1 border-amber-200 text-amber-800 hover:bg-amber-50"
                >
                  Change Number
                </Button>
                <Button
                  type="submit"
                  disabled={verifyCodeMutation.isPending}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {verifyCodeMutation.isPending ? "Verifying..." : "Verify Code"}
                </Button>
              </div>
            </form>
          )}

          <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
            <CheckCircle className="w-4 h-4" />
            <span>Your phone number will be kept secure and only used for emergency verification</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
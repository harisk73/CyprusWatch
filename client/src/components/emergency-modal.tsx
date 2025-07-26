import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertTriangle, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function EmergencyModal() {
  const [open, setOpen] = useState(false);
  const [reportForm, setReportForm] = useState({
    type: "",
    location: "",
    description: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createReportMutation = useMutation({
    mutationFn: async (reportData: any) => {
      // For now, we'll use default coordinates (center of Cyprus)
      // In a real app, we'd get user's current location
      const res = await apiRequest("POST", "/api/emergency-pins", {
        ...reportData,
        latitude: "35.1264",
        longitude: "33.4299",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/emergency-pins"] });
      toast({
        title: "Emergency Report Submitted",
        description: "Your emergency report has been submitted successfully. Authorities have been notified.",
      });
      setReportForm({ type: "", location: "", description: "" });
      setOpen(false);
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
        description: "Failed to submit emergency report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reportForm.type || !reportForm.location.trim() || !reportForm.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    createReportMutation.mutate(reportForm);
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="w-14 h-14 rounded-full bg-emergency hover:bg-emergency/90 shadow-lg hover:scale-110 transition-all duration-300"
              title="Quick Emergency Report"
            >
              <AlertTriangle className="h-6 w-6" />
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="text-center mb-4">
                <AlertTriangle className="h-12 w-12 text-emergency mx-auto mb-4" />
                <DialogTitle className="text-xl font-bold text-neutral-600">
                  Quick Emergency Report
                </DialogTitle>
                <p className="text-neutral-500 text-sm mt-2">
                  Report an emergency in your area quickly
                </p>
              </div>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="emergency-type">Emergency Type</Label>
                <Select
                  value={reportForm.type}
                  onValueChange={(value) => setReportForm(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select emergency type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fire">🔥 Fire</SelectItem>
                    <SelectItem value="medical">🚑 Medical Emergency</SelectItem>
                    <SelectItem value="accident">🚗 Traffic Accident</SelectItem>
                    <SelectItem value="weather">🌪️ Severe Weather</SelectItem>
                    <SelectItem value="security">🚨 Security Issue</SelectItem>
                    <SelectItem value="other">⚠️ Other Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={reportForm.location}
                  onChange={(e) => setReportForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Describe the location..."
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={reportForm.description}
                  onChange={(e) => setReportForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Briefly describe what you see..."
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="flex space-x-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createReportMutation.isPending}
                  className="flex-1 bg-emergency hover:bg-emergency/90"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {createReportMutation.isPending ? "Reporting..." : "Report Now"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

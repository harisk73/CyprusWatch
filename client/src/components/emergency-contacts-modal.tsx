import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Phone, Shield, Hospital, Flame, Car } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface EmergencyContactsModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export default function EmergencyContactsModal({ open, onOpenChange, children }: EmergencyContactsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const actualOpen = open !== undefined ? open : isOpen;
  const actualOnOpenChange = onOpenChange || setIsOpen;

  const emergencyContacts = [
    {
      name: "Police",
      number: "199",
      icon: Shield,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "General emergency police services"
    },
    {
      name: "Fire Department",
      number: "199",
      icon: Flame,
      color: "text-red-600",
      bgColor: "bg-red-50",
      description: "Fire emergencies and rescue services"
    },
    {
      name: "Ambulance",
      number: "199",
      icon: Hospital,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Medical emergencies and ambulance"
    },
    {
      name: "Traffic Police",
      number: "22804000",
      icon: Car,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "Traffic accidents and road incidents"
    },
    {
      name: "Forestry Department",
      number: "1407",
      icon: Flame,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      description: "Forest fires and wildlife emergencies"
    },
    {
      name: "Civil Defense",
      number: "22403964",
      icon: Shield,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Civil protection and disaster response"
    }
  ];

  const handleCall = (number: string) => {
    window.open(`tel:${number}`, '_self');
  };

  return (
    <Dialog open={actualOpen} onOpenChange={actualOnOpenChange}>
      {children && (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="text-center mb-4">
            <Phone className="h-12 w-12 text-info mx-auto mb-4" />
            <DialogTitle className="text-xl font-bold text-neutral-700">
              Emergency Contacts
            </DialogTitle>
            <p className="text-neutral-500 text-sm mt-2">
              Important emergency numbers for Cyprus
            </p>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emergencyContacts.map((contact) => {
            const IconComponent = contact.icon;
            return (
              <Card key={contact.name} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className={`${contact.bgColor} rounded-lg p-3 mb-3`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <IconComponent className={`h-6 w-6 ${contact.color}`} />
                        <div>
                          <h3 className="font-semibold text-neutral-700">{contact.name}</h3>
                          <p className="text-lg font-bold text-neutral-800">{contact.number}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-500 mb-3">{contact.description}</p>
                  <Button
                    onClick={() => handleCall(contact.number)}
                    className="w-full"
                    size="sm"
                    variant="outline"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800">Important Note</h4>
              <p className="text-sm text-yellow-700">
                For immediate life-threatening emergencies, call <strong>199</strong> (Police, Fire, Ambulance).
                This is the main emergency number in Cyprus.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button
            variant="outline"
            onClick={() => actualOnOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
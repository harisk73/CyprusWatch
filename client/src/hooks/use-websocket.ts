import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function useWebSocket() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case "emergency_pin_created":
            queryClient.invalidateQueries({ queryKey: ["/api/emergency-pins"] });
            toast({
              title: "New Emergency Report",
              description: "A new emergency has been reported in your area.",
              variant: "destructive",
            });
            break;
            
          case "emergency_pin_updated":
            queryClient.invalidateQueries({ queryKey: ["/api/emergency-pins"] });
            break;
            
          case "alert_created":
            queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
            toast({
              title: "New Alert",
              description: "A new alert has been issued for your area.",
              variant: "default",
            });
            break;
            
          default:
            console.log("Unknown WebSocket message type:", data.type);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.current.onclose = () => {
      console.log("WebSocket disconnected");
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (ws.current?.readyState === WebSocket.CLOSED) {
          // Reconnect logic could be implemented here
        }
      }, 5000);
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [queryClient, toast]);

  return ws.current;
}

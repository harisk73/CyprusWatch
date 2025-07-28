import { useLanguage } from "@/contexts/language-context";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export function DisclaimerBanner() {
  const { t } = useLanguage();

  return (
    <Alert className="bg-orange-50 border-orange-200 text-orange-800 mb-4">
      <Info className="h-4 w-4" />
      <AlertDescription className="text-[16px]">
        {t('disclaimer.text')}
      </AlertDescription>
    </Alert>
  );
}
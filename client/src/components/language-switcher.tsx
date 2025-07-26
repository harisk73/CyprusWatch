import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/language-context";
import { Languages } from "lucide-react";

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="flex items-center space-x-2">
      <Languages className="h-4 w-4 text-neutral-500" />
      <Select value={language} onValueChange={setLanguage}>
        <SelectTrigger className="w-[100px] border-none bg-transparent">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">🇬🇧 EN</SelectItem>
          <SelectItem value="el">🇬🇷 EL</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
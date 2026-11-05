import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InstallButton() {
  const [evt, setEvt] = useState<any>(null);
  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setEvt(e); };
    window.addEventListener("beforeinstallprompt", h);
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);
  if (!evt) return null;
  return (
    <Button size="sm" variant="ghost" className="h-8 gap-1 text-xs" onClick={async () => { await evt.prompt(); setEvt(null); }}>
      <Download className="h-3.5 w-3.5" /> Instalar
    </Button>
  );
}

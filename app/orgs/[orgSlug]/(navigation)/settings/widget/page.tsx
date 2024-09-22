import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

export function WidgetScriptGenerator({ userId }: { userId: string }) {
  const [script, setScript] = useState("");
  const { toast } = useToast();

  const generateScript = async () => {
    try {
      const response = await fetch(
        `/api/widget/generate-script?userId=${userId}`,
      );
      const data = await response.json();
      setScript(data.script);
    } catch (error) {
      console.error("Error generating widget script:", error);
      toast({
        title: "Error",
        description: "Failed to generate widget script. Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(script);
    toast({
      title: "Copied!",
      description: "Widget script copied to clipboard.",
    });
  };

  return (
    <div className="space-y-4">
      <Button onClick={generateScript}>Generate Widget Script</Button>
      {script && (
        <>
          <Input value={script} readOnly />
          <Button onClick={copyToClipboard}>Copy to Clipboard</Button>
        </>
      )}
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

function WidgetScriptGenerator({ userId }: { userId: string }) {
  const [script, setScript] = useState("");
  const { toast } = useToast();

  const generateScript = async () => {
    try {
      const response = await fetch(
        `/api/widget/generate-script?userId=${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // We're using POST to send the request securely
        },
      );
      const data = await response.json();
      if (data.script && data.token) {
        setScript(
          `<script src="${process.env.NEXT_PUBLIC_WIDGET_URL}/nownownow-widget-bundle.js" data-user-id="${userId}" data-token="${data.token}"></script>`,
        );
      } else {
        throw new Error("Invalid response from server");
      }
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

export default function WidgetPage({ params }: { params: { userId: string } }) {
  return <WidgetScriptGenerator userId={params.userId} />;
}

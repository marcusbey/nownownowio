"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Check } from "lucide-react";
import { useState } from "react";

function WidgetScriptGenerator({ userId }: { userId: string }) {
  const [script, setScript] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateScript = async () => {
    try {
      const response = await fetch("/api/widget/generate-script", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      if (data.script) {
        setScript(data.script);
        setCopied(false);
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
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Widget script copied to clipboard.",
    });
  };

  return (
    <div className="space-y-4">
      <Button onClick={generateScript}>Generate Widget Script</Button>
      {script && (
        <div className="flex space-x-2">
          <Input value={script} readOnly className="grow" />
          <Button
            onClick={copyToClipboard}
            className={copied ? "bg-green-500 hover:bg-green-600" : ""}
          >
            {copied ? <Check className="size-4" /> : "Copy"}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function WidgetPage({
  params,
}: {
  params: { orgSlug: string };
}) {
  return <WidgetScriptGenerator userId={params.orgSlug} />;
}

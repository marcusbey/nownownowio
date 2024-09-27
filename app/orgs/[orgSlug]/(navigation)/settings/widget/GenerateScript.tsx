"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Check } from "lucide-react";
import { useState } from "react";

export function WidgetScriptGenerator({ orgSlug }: { orgSlug: string }) {
  const [script, setScript] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateScript = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/widget/generate-script", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orgSlug }),
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
    } finally {
      setLoading(false);
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
      <Button
        onClick={generateScript}
        disabled={loading}
        className="relative overflow-hidden"
      >
        <span className="relative z-10">Generate Widget Script</span>
        {loading && (
          <span className="absolute inset-0 size-full animate-fill-left-to-right bg-primary/50" />
        )}
      </Button>
      {script && (
        <div className="flex space-x-2">
          <Input value={script} readOnly className="grow" />
          <Button
            onClick={copyToClipboard}
            className={copied ? "bg-yellow-500 hover:bg-yellow-600" : ""}
          >
            {copied ? <Check className="size-4" /> : "Copy"}
          </Button>
        </div>
      )}
    </div>
  );
}

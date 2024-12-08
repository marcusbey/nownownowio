"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Check } from "lucide-react";
import { useState } from "react";
import { WidgetSettings, WidgetSettingsForm } from "./WidgetSettingsForm";

export function WidgetScriptGenerator({ orgSlug }: { orgSlug: string }) {
  const [script, setScript] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<WidgetSettings>({
    theme: "dark",
    position: "left",
    buttonColor: "#1a73e8",
    buttonSize: "90",
  });
  const { toast } = useToast();

  const generateScript = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/widget/generate-script", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orgSlug, settings }),
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

  const handleSettingsChange = (newSettings: WidgetSettings) => {
    setSettings(newSettings);
    if (script) {
      generateScript();
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-lg border p-4 space-y-6">
        <h3 className="text-lg font-medium">Widget Settings</h3>
        <WidgetSettingsForm onSettingsChange={handleSettingsChange} />
      </div>

      <div className="space-y-4">
        <Button
          onClick={generateScript}
          disabled={loading}
          className="relative overflow-hidden"
        >
          <span className="relative z-10">Generate Widget Script</span>
          {loading && (
            <span className="animate-fill-left-to-right absolute inset-0 size-full bg-primary/50" />
          )}
        </Button>
        {script && (
          <div className="flex space-x-2">
            <Input value={script} readOnly className="grow font-mono text-sm" />
            <Button
              onClick={copyToClipboard}
              className={copied ? "bg-yellow-500 hover:bg-yellow-600" : ""}
            >
              {copied ? <Check className="size-4" /> : "Copy"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

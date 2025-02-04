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
    buttonSize: 90,
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
    <div className="space-y-6">
      <WidgetSettingsForm settings={settings} onChange={setSettings} />
      
      <div className="mt-8 p-4 bg-muted/50 rounded-lg space-y-3">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={generateScript}
            disabled={loading}
            className="h-8"
          >
            {loading ? "Generating..." : "Generate Script"}
          </Button>
          
          {script && (
            <Button
              size="sm"
              variant="outline"
              onClick={copyToClipboard}
              className="h-8"
            >
              {copied ? <Check className="h-3 w-3" /> : "Copy"}
            </Button>
          )}
        </div>

        {script && (
          <Input
            value={script}
            readOnly
            className="h-8 text-xs font-mono bg-background"
          />
        )}
      </div>
    </div>
  );
}

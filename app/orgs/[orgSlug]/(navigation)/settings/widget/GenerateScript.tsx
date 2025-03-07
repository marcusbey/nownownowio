"use client";

import { Button } from "@/components/core/button";
import { Input } from "@/components/core/input";
import { useToast } from "@/components/feedback/use-toast";
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
      const response = await fetch("/api/v1/widget/generate-script", {
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
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <h3 className="text-lg font-medium">Widget Integration</h3>
        <Button
          size="default"
          onClick={generateScript}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? "Generating..." : "Generate Script"}
        </Button>
      </div>
      
      <WidgetSettingsForm settings={settings} onChange={setSettings} />
      
      <div className="mt-8 p-6 bg-muted/20 rounded-lg space-y-4 border">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-medium">Widget Script</h4>
          
          {script && (
            <Button
              size="sm"
              variant="outline"
              onClick={copyToClipboard}
              className="h-9 flex items-center gap-1"
            >
              {copied ? <Check className="h-4 w-4 mr-1" /> : null}
              {copied ? "Copied!" : "Copy to Clipboard"}
            </Button>
          )}
        </div>

        {script ? (
          <pre className="p-4 bg-background rounded-md text-xs font-mono overflow-x-auto">
            {script}
          </pre>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-6">
            Click "Generate Script" to create your widget integration code
          </div>
        )}
      </div>
    </div>
  );
}

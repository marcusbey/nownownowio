"use client";

import { Button } from "@/components/core/button";
import { Input } from "@/components/core/input";
import { useToast } from "@/components/feedback/use-toast";
import { Check, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { WidgetSettings, WidgetSettingsForm } from "./WidgetSettingsForm";
import { Label } from "@/components/core/label";
import { FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/core/form";
import { useSession } from "next-auth/react";

export function WidgetScriptGenerator({ orgSlug }: { orgSlug: string }) {
  const [script, setScript] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isLoadingOrgData, setIsLoadingOrgData] = useState(true);
  const [isSavingWebsiteUrl, setIsSavingWebsiteUrl] = useState(false);
  const [settings, setSettings] = useState<WidgetSettings>({
    theme: "dark",
    position: "left",
    buttonColor: "#1a73e8",
    buttonSize: 90,
  });
  const { toast } = useToast();
  const { data: session } = useSession();
  
  // Get the base URL for API requests
  // Use relative URLs to avoid cross-origin issues and port mismatches
  // This ensures requests go to the same server the app is running on
  
  // Load organization data when component mounts
  useEffect(() => {
    async function loadOrgData() {
      setIsLoadingOrgData(true);
      try {
        // Use relative URL for API requests to work in all environments
        const response = await fetch(`/api/v1/widget/org-data?slug=${orgSlug}`);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        // Check if response has content before parsing JSON
        const text = await response.text();
        if (!text) {
          throw new Error('Empty response received from server');
        }
        
        // Parse the JSON text
        const data = JSON.parse(text);
        
        if (data.organization) {
          setWebsiteUrl(data.organization.websiteUrl || "");
        }
      } catch (error) {
        console.error("Error loading organization data:", error);
        toast({
          title: "Error",
          description: "Failed to load organization data.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingOrgData(false);
      }
    }
    
    loadOrgData();
  }, [orgSlug, toast]);

  // Validate website URL with comprehensive checks
  const validateUrl = (url: string): boolean => {
    if (!url) {
      setUrlError('Website URL is required');
      return false;
    }
    
    // Check if URL has protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setUrlError('URL must start with http:// or https://');
      return false;
    }
    
    try {
      // Try to construct a URL object to validate
      const urlObj = new URL(url);
      
      // Check if hostname is valid (not empty and has at least one dot)
      if (!urlObj.hostname || !urlObj.hostname.includes('.')) {
        setUrlError('Please enter a valid domain name');
        return false;
      }
      
      return true;
    } catch (error) {
      setUrlError('Please enter a valid URL');
      return false;
    }
  };
  
  // Save website URL to organization profile
  const saveWebsiteUrl = async () => {
    if (!validateUrl(websiteUrl)) {
      toast({
        title: "Invalid Website URL",
        description: urlError || "Please enter a valid website URL before saving.",
        variant: "destructive",
      });
      return false;
    }
    
    setIsSavingWebsiteUrl(true);
    try {
      const response = await fetch(`/api/v1/widget/update-website-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orgSlug, websiteUrl }),
      });
      
      if (!response.ok) {
        // Safely parse the error response
        const text = await response.text();
        let errorMessage = "Failed to save website URL";
        let errorDetails = "";
        
        if (text) {
          try {
            const data = JSON.parse(text);
            console.error("API Error Response:", data);
            errorMessage = data.message || data.error || errorMessage;
            errorDetails = data.details ? `: ${data.details}` : '';
          } catch (parseError) {
            console.error("Error parsing error response:", parseError);
            console.error("Raw response text:", text);
          }
        }
        
        throw new Error(`${errorMessage}${errorDetails}`);
      }
      
      toast({
        title: "Website URL Saved",
        description: "Your website URL has been updated successfully.",
      });
      return true;
    } catch (error) {
      console.error("Error saving website URL:", error);
      
      // Create a more user-friendly error message
      let errorMessage = "Failed to save website URL";
      if (error instanceof Error) {
        console.error("Error details:", error.message);
        errorMessage = error.message;
      }
      
      toast({
        title: "Error Saving URL",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSavingWebsiteUrl(false);
    }
  };

  const generateScript = async () => {
    // First validate the website URL
    if (!validateUrl(websiteUrl)) {
      toast({
        title: "Invalid Website URL",
        description: urlError || "Please enter a valid website URL before generating the widget script.",
        variant: "destructive",
      });
      return;
    }
    
    // Save the URL first if it has been modified
    const urlSaved = await saveWebsiteUrl();
    if (!urlSaved) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/widget/generate-script`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orgSlug, settings }),
      });
      
      // Safely parse the response
      const text = await response.text();
      if (!text) {
        throw new Error('Empty response received from server');
      }
      
      // Check if the response is HTML (error page) instead of JSON
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        throw new Error('Received HTML response instead of JSON. The server might be returning an error page.');
      }
      
      // Parse the JSON text
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('Failed to parse server response:', text.substring(0, 200));
        throw new Error('Invalid JSON response from server');
      }
      
      if (!response.ok) {
        // Handle specific error cases
        if (data.error === 'Missing website URL' || data.error === 'Invalid website URL') {
          toast({
            title: "Website URL Issue",
            description: data.message || "There's an issue with your website URL. Please check and try again.",
            variant: "destructive",
          });
          return;
        } else {
          throw new Error(data.message || "An error occurred");
        }
      }
      
      if (data.script) {
        setScript(data.script);
        setCopied(false);
        
        // Show success message with domain information
        if (data.allowedDomain) {
          toast({
            title: "Widget Script Generated",
            description: `Your widget will only work on ${data.allowedDomain}. If you need to use it on another domain, update your website URL above.`,
            variant: "default",
          });
        }
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error generating widget script:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate widget script. Please try again.",
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
    <div className="space-y-8 max-w-3xl mx-auto pt-6">
      {/* Website URL Field */}
      <div className="rounded-lg p-6 bg-card border border-border shadow-sm">
        <h4 className="text-base font-medium mb-2 flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Website URL
        </h4>
        <p className="text-sm text-muted-foreground mb-4">
          Enter the website URL where you'll install the widget. The widget will only work on this domain.
        </p>
        
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Input
              id="website-url"
              placeholder="https://yourdomain.com"
              value={websiteUrl}
              onChange={(e) => {
                const value = e.target.value;
                setWebsiteUrl(value);
                
                // Clear error when user starts typing
                if (urlError) setUrlError(null);
              }}
              onBlur={() => {
                // Only validate when the user leaves the field
                if (websiteUrl) validateUrl(websiteUrl);
              }}
              disabled={isLoadingOrgData || isSavingWebsiteUrl}
              className={`w-full bg-background ${urlError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
            />
            {urlError ? (
              <p className="text-xs text-destructive flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-circle">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {urlError}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Include the full URL with http:// or https://
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="rounded-lg p-6 bg-card border border-border shadow-sm">
        <h4 className="text-base font-medium mb-2">Widget Settings</h4>
        <WidgetSettingsForm
          settings={settings}
          onChange={handleSettingsChange}
        />
      </div>
      
      <div className="mt-8 p-6 bg-card rounded-lg space-y-4 border border-border shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-medium">Widget Script</h4>
          
          <div className="flex items-center gap-2">
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
            
            <Button
              size="sm"
              onClick={generateScript}
              disabled={loading || isLoadingOrgData || isSavingWebsiteUrl || !websiteUrl}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {loading ? "Generating..." : "Generate Script"}
            </Button>
          </div>

        </div>

        {script ? (
          <pre className="p-3 bg-background border border-border rounded-md text-xs font-mono overflow-x-auto max-h-[200px] overflow-y-auto">
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

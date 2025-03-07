"use client";

import { Button } from "@/components/core/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/core/form";
import { Input } from "@/components/core/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/core/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const widgetSettingsSchema = z.object({
  theme: z.enum(["light", "dark"]),
  position: z.enum(["left", "right"]),
  buttonColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, {
    message: "Must be a valid hex color (e.g., #1a73e8)",
  }),
  buttonSize: z.number().min(40).max(120),
});

export type WidgetSettings = z.infer<typeof widgetSettingsSchema>;

const defaultValues: WidgetSettings = {
  theme: "dark",
  position: "left",
  buttonColor: "#1a73e8",
  buttonSize: 90,
};

interface WidgetSettingsFormProps {
  settings: WidgetSettings;
  onChange: (settings: WidgetSettings) => void;
}

export function WidgetSettingsForm({ settings, onChange }: WidgetSettingsFormProps) {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Theme</label>
            <Select value={settings.theme} onValueChange={(value) => onChange({ ...settings, theme: value as 'light' | 'dark' })}>
              <SelectTrigger className="h-9 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Button Size</label>
            <Input
              className="h-9 bg-background"
              type="number"
              min="40"
              max="120"
              value={settings.buttonSize}
              onChange={(e) => {
                // Allow any input during typing, even if invalid
                const rawValue = e.target.value;
                if (rawValue === '') {
                  // Handle empty input
                  onChange({ ...settings, buttonSize: 40 });
                } else {
                  // Try to parse as number but don't validate yet
                  const parsedValue = parseInt(rawValue);
                  if (!isNaN(parsedValue)) {
                    onChange({ ...settings, buttonSize: parsedValue });
                  }
                  // If it's not a number, just keep the current value
                }
              }}
              onBlur={(e) => {
                // Validate and correct on blur
                let value = parseInt(e.target.value);
                // Ensure value is within allowed range
                if (isNaN(value)) {
                  value = 90; // Default value if not a number
                } else if (value > 120) {
                  value = 120; // Cap at maximum
                } else if (value < 40) {
                  value = 40; // Set to minimum
                }
                onChange({ ...settings, buttonSize: value });
              }}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Position</label>
            <Select value={settings.position} onValueChange={(value) => onChange({ ...settings, position: value as 'left' | 'right' })}>
              <SelectTrigger className="h-9 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Button Color</label>
            <div className="flex gap-2 items-center">
              <Input
                className="h-9 bg-background"
                value={settings.buttonColor}
                onChange={(e) => {
                  // Allow any input during typing
                  let value = e.target.value;
                  
                  // Ensure it starts with # if user types without it
                  if (value && !value.startsWith('#')) {
                    value = '#' + value;
                  }
                  
                  // Update without validation during typing
                  onChange({ ...settings, buttonColor: value });
                }}
                onBlur={(e) => {
                  // Validate on blur
                  let value = e.target.value;
                  
                  // Ensure it starts with #
                  if (value && !value.startsWith('#')) {
                    value = '#' + value;
                  }
                  
                  // Validate hex color format
                  const isValidHex = /^#[0-9A-Fa-f]{6}$/.test(value);
                  if (!isValidHex) {
                    // Reset to default if invalid
                    value = '#1a73e8';
                  }
                  
                  onChange({ ...settings, buttonColor: value });
                }}
                placeholder="#1a73e8"
              />
              <label 
                htmlFor="colorPicker" 
                className="h-9 w-9 rounded border border-input cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center"
                style={{ backgroundColor: settings.buttonColor }}
              >
                <input
                  id="colorPicker"
                  type="color"
                  className="sr-only"
                  value={settings.buttonColor}
                  onChange={(e) => onChange({ ...settings, buttonColor: e.target.value })}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

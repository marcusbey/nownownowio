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
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium">Theme</label>
            <Select value={settings.theme} onValueChange={(value) => onChange({ ...settings, theme: value as 'light' | 'dark' })}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">Button Size</label>
            <Input
              className="h-8"
              type="number"
              min="40"
              max="120"
              value={settings.buttonSize}
              onChange={(e) => onChange({ ...settings, buttonSize: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium">Position</label>
            <Select value={settings.position} onValueChange={(value) => onChange({ ...settings, position: value as 'left' | 'right' })}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">Button Color</label>
            <div className="flex gap-2 items-center">
              <Input
                className="h-8"
                value={settings.buttonColor}
                onChange={(e) => onChange({ ...settings, buttonColor: e.target.value })}
                placeholder="#1a73e8"
              />
              <label 
                htmlFor="colorPicker" 
                className="h-8 w-8 rounded border cursor-pointer hover:opacity-90 transition-opacity"
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

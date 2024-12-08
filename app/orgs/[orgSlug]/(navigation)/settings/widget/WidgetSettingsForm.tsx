"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const widgetSettingsSchema = z.object({
  theme: z.enum(["light", "dark"]),
  position: z.enum(["left", "right"]),
  buttonColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, {
    message: "Must be a valid hex color (e.g., #1a73e8)",
  }),
  buttonSize: z.string().transform(Number).pipe(
    z.number().min(40).max(120)
  ),
});

export type WidgetSettings = z.infer<typeof widgetSettingsSchema>;

const defaultValues: WidgetSettings = {
  theme: "dark",
  position: "left",
  buttonColor: "#1a73e8",
  buttonSize: "90",
};

interface WidgetSettingsFormProps {
  onSettingsChange: (settings: WidgetSettings) => void;
}

export function WidgetSettingsForm({ onSettingsChange }: WidgetSettingsFormProps) {
  const form = useForm<WidgetSettings>({
    resolver: zodResolver(widgetSettingsSchema),
    defaultValues,
  });

  const handleFieldChange = () => {
    const values = form.getValues();
    onSettingsChange(values);
  };

  return (
    <Form form={form} onSubmit={() => {}}>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="theme"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Theme</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  handleFieldChange();
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a theme" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Choose the widget theme that matches your website
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Position</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  handleFieldChange();
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a position" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Choose which side of the screen to show the widget
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="buttonColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Button Color</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Input 
                    {...field} 
                    placeholder="#1a73e8" 
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      handleFieldChange();
                    }}
                  />
                  <input
                    type="color"
                    value={field.value}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      handleFieldChange();
                    }}
                    className="h-10 w-10 cursor-pointer rounded border border-input bg-background"
                  />
                </div>
              </FormControl>
              <FormDescription>
                Choose a color that matches your brand (hex format)
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="buttonSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Button Size</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min="40"
                  max="120"
                  placeholder="90"
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    handleFieldChange();
                  }}
                />
              </FormControl>
              <FormDescription>
                Size of the widget button (40-120 pixels)
              </FormDescription>
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
}

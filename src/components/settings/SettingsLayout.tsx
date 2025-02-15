import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SettingsPageProps {
  children: React.ReactNode;
  className?: string;
}

export function SettingsPage({ children, className }: SettingsPageProps) {
  return (
    <div className={cn("mx-auto max-w-4xl space-y-8 px-4 py-8", className)}>
      {children}
    </div>
  );
}

interface SettingsCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

export function SettingsCard({ children, className, title, description }: SettingsCardProps) {
  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  );
}

interface SettingsSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function SettingsSection({ children, className }: SettingsSectionProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {children}
    </div>
  );
}

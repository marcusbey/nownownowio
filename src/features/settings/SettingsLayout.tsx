'use client';

import { cn } from "@/lib/utils";
import { Typography } from "@/components/ui/typography";
import { Layout, LayoutContent, LayoutHeader } from "@/features/page/layout";
import { Card } from "@/components/ui/card";
import type { ReactNode } from "react";

interface SettingsSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function SettingsSection({ title, description, children, className }: SettingsSectionProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {(title || description) && (
        <div className="space-y-1.5">
          {title && (
            <Typography variant="h3" className="text-lg font-medium">{title}</Typography>
          )}
          {description && (
            <Typography variant="muted" className="text-sm">
              {description}
            </Typography>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

interface SettingsCardProps {
  children: ReactNode;
  className?: string;
}

export function SettingsCard({ children, className }: SettingsCardProps) {
  return (
    <Card className={cn("border-border bg-card p-6", className)}>
      {children}
    </Card>
  );
}

interface SettingsPageProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function SettingsPage({ title, description, children, className }: SettingsPageProps) {
  return (
    <Layout>
      {(title || description) && (
        <LayoutHeader>
          {title && <Typography variant="h2">{title}</Typography>}
          {description && (
            <Typography variant="muted">
              {description}
            </Typography>
          )}
        </LayoutHeader>
      )}
      <LayoutContent className={cn("space-y-10", className)}>
        {children}
      </LayoutContent>
    </Layout>
  );
}

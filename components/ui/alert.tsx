import * as React from "react";
import { AlertCircleIcon, CheckCircle2Icon, InfoIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type AlertVariant = "default" | "destructive" | "success";

interface AlertProps extends React.ComponentProps<"div"> {
  variant?: AlertVariant;
  title?: string;
}

const variantStyles: Record<AlertVariant, string> = {
  default:
    "border-border bg-muted/40 text-foreground [&_svg]:text-muted-foreground",
  destructive:
    "border-destructive/30 bg-destructive/10 text-destructive [&_svg]:text-destructive",
  success:
    "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-900/20 dark:text-emerald-200 [&_svg]:text-emerald-600 dark:[&_svg]:text-emerald-300",
};

const variantIcon: Record<AlertVariant, React.ComponentType<{ className?: string }>> = {
  default: InfoIcon,
  destructive: AlertCircleIcon,
  success: CheckCircle2Icon,
};

export function Alert({
  className,
  variant = "default",
  title,
  children,
  ...props
}: AlertProps) {
  const Icon = variantIcon[variant];
  return (
    <div
      role={variant === "destructive" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 rounded-lg border px-3 py-2 text-sm",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      <Icon className="size-4 mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1 space-y-0.5">
        {title ? <p className="font-medium">{title}</p> : null}
        {children ? (
          <div className="text-sm leading-snug [&_a]:underline [&_a]:underline-offset-2">
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
}

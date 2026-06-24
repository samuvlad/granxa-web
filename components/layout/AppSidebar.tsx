"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DropletIcon,
  HeartHandshakeIcon,
  HomeIcon,
  MapIcon,
  PackageIcon,
  PawPrintIcon,
  RotateCwIcon,
  SproutIcon,
  StethoscopeIcon,
  UsersIcon,
  WalletIcon,
  WheatIcon,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Vista xeral",
    items: [
      { href: "/", label: "Dashboard", icon: HomeIcon },
      { href: "/parcelas", label: "Parcelas", icon: MapIcon },
    ],
  },
  {
    label: "Gando",
    items: [
      { href: "/lotes", label: "Lotes", icon: UsersIcon },
      { href: "/rebanho", label: "Rebaño", icon: PawPrintIcon },
      { href: "/pastoreo", label: "Pastoreo", icon: RotateCwIcon },
      { href: "/sanidade", label: "Sanidade", icon: StethoscopeIcon, disabled: true },
      { href: "/reproducion", label: "Reprodución", icon: HeartHandshakeIcon, disabled: true },
    ],
  },
  {
    label: "Operacións",
    items: [
      { href: "/alimentacion", label: "Alimentación", icon: WheatIcon, disabled: true },
      { href: "/produccion", label: "Produción", icon: DropletIcon, disabled: true },
      { href: "/inventario", label: "Inventario", icon: PackageIcon, disabled: true },
      { href: "/finanzas", label: "Finanzas", icon: WalletIcon, disabled: true },
    ],
  },
];

const APP_VERSION = "0.1.0";

function isActiveRoute(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col h-full overflow-hidden">
      <div className="px-5 py-5 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="size-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <SproutIcon className="size-5" />
          </div>
          <div className="leading-tight">
            <p className="font-semibold text-base">Granxa Maps</p>
            <p className="text-xs text-muted-foreground">Xestión integral</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <NavRow
                  key={item.href}
                  item={item}
                  active={isActiveRoute(pathname, item.href)}
                />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <Separator />
      <div className="px-5 py-3 text-xs text-muted-foreground">
        <p>Granxa Maps · v{APP_VERSION}</p>
      </div>
    </aside>
  );
}

function NavRow({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  if (item.disabled) {
    return (
      <li>
        <span
          className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-muted-foreground/60 cursor-not-allowed"
          aria-disabled="true"
        >
          <Icon className="size-4 shrink-0" />
          <span className="flex-1 truncate">{item.label}</span>
          <span className="text-[10px] font-medium uppercase tracking-wide">
            Logo
          </span>
        </span>
      </li>
    );
  }
  return (
    <li>
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
          active
            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
            : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
        )}
      >
        <Icon className="size-4 shrink-0" />
        <span className="flex-1 truncate">{item.label}</span>
      </Link>
    </li>
  );
}

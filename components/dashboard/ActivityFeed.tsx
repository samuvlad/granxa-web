"use client";

import Link from "next/link";
import { ChevronRightIcon, PawPrintIcon } from "lucide-react";

import type { Sheep } from "@/types";

import {
  SexBadge,
  formatDate,
  formatIdade,
} from "@/components/sheep/SheepStatusBadge";

interface ActivityFeedProps {
  sheep: Sheep[];
}

export function ActivityFeed({ sheep }: ActivityFeedProps) {
  const recent = [...sheep]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 5);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Últimas ovellas engadidas</p>
          <p className="text-xs text-muted-foreground">
            As 5 incorporacións máis recentes ao rabaño
          </p>
        </div>
        <Link
          href="/rebanho"
          className="text-xs text-primary hover:underline inline-flex items-center gap-1"
        >
          Ver todo
          <ChevronRightIcon className="size-3" />
        </Link>
      </div>
      {recent.length === 0 ? (
        <p className="px-4 py-8 text-sm text-muted-foreground text-center">
          Aínda non hai ovellas rexistradas.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {recent.map((s) => (
            <li key={s.id}>
              <Link
                href={`/rebanho/${s.id}`}
                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <PawPrintIcon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
                      {s.nome ?? s.crotal}
                    </p>
                    <p className="text-xs text-muted-foreground truncate font-mono">
                      {s.crotal}
                    </p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-3 shrink-0">
                  <SexBadge sexo={s.sexo} />
                  <span className="text-xs text-muted-foreground tabular-nums w-20 text-right">
                    {formatIdade(s.data_nacemento)}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums w-24 text-right">
                    {formatDate(s.created_at)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
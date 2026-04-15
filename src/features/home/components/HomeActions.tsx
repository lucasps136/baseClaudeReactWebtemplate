"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

import type { IHomeAction } from "../types/home.types";

interface IHomeActionsProps {
  actions: IHomeAction[];
}

// SRP: renderiza apenas a fila de botões de ação rápida
export const HomeActions = ({ actions }: IHomeActionsProps): JSX.Element => (
  <div className="flex flex-wrap gap-3">
    {actions.map((action) => (
      <Button key={action.id} variant={action.variant ?? "default"} asChild>
        <Link href={action.href}>{action.label}</Link>
      </Button>
    ))}
  </div>
);

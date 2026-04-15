"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { IHomeStat } from "../types/home.types";

interface IHomeStatsProps {
  stats: IHomeStat[];
}

// SRP: renderiza apenas o grid de cards de estatísticas
export const HomeStats = ({ stats }: IHomeStatsProps): JSX.Element => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {stats.map((stat) => (
      <Card key={stat.id}>
        <CardHeader className="pb-2">
          <CardDescription>{stat.label}</CardDescription>
          <CardTitle className="text-4xl">{stat.value}</CardTitle>
        </CardHeader>
        <CardContent>
          {stat.description && (
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          )}
        </CardContent>
      </Card>
    ))}
  </div>
);

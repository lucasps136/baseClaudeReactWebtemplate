#!/usr/bin/env node

/**
 * docker-start.js
 *
 * Reads SUPABASE from .env and starts the appropriate Docker Compose services:
 *   SUPABASE=local  → activates --profile local (Next.js + full Supabase stack)
 *   SUPABASE=other  → starts only the Next.js app (uses remote Supabase cloud)
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const envPath = path.join(process.cwd(), ".env");

if (!fs.existsSync(envPath)) {
  console.error(
    "[docker-start] .env file not found. Copy .env.example to .env and configure it.",
  );
  process.exit(1);
}

// Parse .env manually — no external dependencies needed
const envVars = fs
  .readFileSync(envPath, "utf8")
  .split("\n")
  .reduce((acc, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return acc;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) return acc;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed
      .slice(eqIndex + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    acc[key] = value;
    return acc;
  }, {});

const supabaseMode = envVars.SUPABASE;
const isLocal = supabaseMode === "local";

console.log(`[docker-start] SUPABASE=${supabaseMode ?? "(not set)"}`);

if (isLocal) {
  console.log("[docker-start] Starting Next.js + Supabase local stack...");
  console.log(
    "[docker-start] Ports: app=3000, supabase=54321, studio=54323, db=5432",
  );
  execSync("docker compose --profile local up", { stdio: "inherit" });
} else {
  if (!supabaseMode) {
    console.warn(
      "[docker-start] SUPABASE not set in .env — starting Next.js only (remote Supabase).",
    );
  } else {
    console.log(
      "[docker-start] Starting Next.js only (using remote Supabase)...",
    );
  }
  execSync("docker compose up app", { stdio: "inherit" });
}

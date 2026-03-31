"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { redirects, routes } from "@/config/routes";
import {
  type LoginFormValues,
  loginSchema,
} from "@/features/auth/schemas/auth.schemas";
import {
  useAuthActions,
  useAuthState,
} from "@/shared/components/providers/auth-provider";

export function LoginForm(): JSX.Element {
  const router = useRouter();
  const { login } = useAuthActions();
  const { isLoading } = useAuthState();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginFormValues): Promise<void> {
    setServerError(null);
    try {
      await login(values);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.push(redirects.afterLogin as any);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Erro ao fazer login. Tente novamente.";
      setServerError(message);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {serverError && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3">
            <p className="text-sm font-medium text-destructive">
              {serverError}
            </p>
          </div>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-sm font-bold font-body text-on-surface-variant ml-1">
                Email Address
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline select-none">
                    mail
                  </span>
                  <Input
                    {...field}
                    type="email"
                    placeholder="alex@urbanpack.com"
                    className="bg-surface-container-low border-0 rounded-sm py-4 pl-12 pr-4 text-on-surface focus-visible:ring-primary/20 focus-visible:bg-surface-container-lowest transition-all placeholder:text-outline-variant h-auto"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <FormLabel className="text-sm font-bold font-body text-on-surface-variant">
                  Password
                </FormLabel>
                <Link
                  href={routes.auth.forgotPassword}
                  className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <FormControl>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline select-none">
                    lock
                  </span>
                  <Input
                    {...field}
                    type="password"
                    placeholder="••••••••"
                    className="bg-surface-container-low border-0 rounded-sm py-4 pl-12 pr-4 text-on-surface focus-visible:ring-primary/20 focus-visible:bg-surface-container-lowest transition-all placeholder:text-outline-variant h-auto"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary-gradient text-primary-foreground font-heading font-bold py-4 rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all duration-200 uppercase tracking-widest text-sm h-auto disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2"
        >
          <span>{isLoading ? "Entrando..." : "Login"}</span>
          {!isLoading && (
            <span className="material-symbols-outlined text-xl">
              arrow_forward
            </span>
          )}
        </Button>
      </form>

      {/* Divisor */}
      <div className="flex items-center gap-4 py-2">
        <div className="h-px flex-1 bg-surface-container-highest" />
        <span className="text-xs font-bold text-outline-variant font-heading uppercase">
          Or login with
        </span>
        <div className="h-px flex-1 bg-surface-container-highest" />
      </div>

      {/* OAuth buttons — visual only */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          disabled
          className="flex items-center justify-center gap-3 bg-surface-container-low py-3.5 rounded-full opacity-60 cursor-not-allowed"
        >
          <span className="text-base font-bold text-[#4285F4]">G</span>
          <span className="text-sm font-bold text-on-surface font-heading">
            Google
          </span>
        </button>
        <button
          type="button"
          disabled
          className="flex items-center justify-center gap-3 bg-surface-container-low py-3.5 rounded-full opacity-60 cursor-not-allowed"
        >
          <span
            className="material-symbols-outlined text-on-surface text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            phone_iphone
          </span>
          <span className="text-sm font-bold text-on-surface font-heading">
            Apple
          </span>
        </button>
      </div>
    </Form>
  );
}

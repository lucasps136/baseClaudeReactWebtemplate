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
  type RegisterFormValues,
  registerSchema,
} from "@/features/auth/schemas/auth.schemas";
import {
  useAuthActions,
  useAuthState,
} from "@/shared/components/providers/auth-provider";

export function RegisterForm(): JSX.Element {
  const router = useRouter();
  const { register } = useAuthActions();
  const { isLoading } = useAuthState();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      terms: undefined as unknown as true,
    },
  });

  async function onSubmit(values: RegisterFormValues): Promise<void> {
    setServerError(null);
    try {
      await register({ email: values.email, password: values.password });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.push(redirects.afterRegister as any);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Erro ao criar conta. Tente novamente.";
      setServerError(message);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {serverError && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3">
            <p className="text-sm font-medium text-destructive">
              {serverError}
            </p>
          </div>
        )}

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="gap-1.5">
                <FormLabel className="text-sm font-bold text-on-surface-variant ml-1 font-body">
                  Email Address
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="pawsome@example.com"
                    className="bg-surface-container-low border-0 rounded-sm px-4 py-3.5 text-on-surface focus-visible:ring-primary/20 focus-visible:bg-surface-container-lowest transition-all placeholder:text-outline-variant h-auto"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="gap-1.5">
                <FormLabel className="text-sm font-bold text-on-surface-variant ml-1 font-body">
                  Password
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="••••••••"
                    className="bg-surface-container-low border-0 rounded-sm px-4 py-3.5 text-on-surface focus-visible:ring-primary/20 focus-visible:bg-surface-container-lowest transition-all h-auto"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="gap-1.5">
                <FormLabel className="text-sm font-bold text-on-surface-variant ml-1 font-body">
                  Confirm Password
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="••••••••"
                    className="bg-surface-container-low border-0 rounded-sm px-4 py-3.5 text-on-surface focus-visible:ring-primary/20 focus-visible:bg-surface-container-lowest transition-all h-auto"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="terms"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-start gap-3">
                <FormControl>
                  <input
                    type="checkbox"
                    className="mt-1 w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/20 cursor-pointer"
                    checked={field.value === true}
                    onChange={(e) =>
                      field.onChange(e.target.checked || undefined)
                    }
                  />
                </FormControl>
                <span className="text-sm text-on-surface-variant leading-relaxed">
                  I wag my tail for the{" "}
                  <Link
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    href={(routes.legal?.terms ?? "#") as any}
                    className="text-primary font-semibold underline decoration-2 underline-offset-4"
                  >
                    Terms of Service
                  </Link>{" "}
                  and acknowledge the treat-filled Privacy Policy.
                </span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary-gradient text-primary-foreground font-bold py-4 rounded-full shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2 h-auto disabled:opacity-70 disabled:scale-100 font-heading"
        >
          <span>{isLoading ? "Criando conta..." : "Create Account"}</span>
          {!isLoading && (
            <span className="material-symbols-outlined text-xl">
              arrow_forward
            </span>
          )}
        </Button>

        {/* Divisor */}
        <div className="flex items-center gap-4 py-4">
          <div className="h-px flex-1 bg-surface-container-highest" />
          <span className="text-xs font-bold text-outline-variant font-heading uppercase">
            Or join with
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

        <p className="text-center pt-4 text-on-surface-variant text-sm">
          Already a Bebarteer?{" "}
          <Link
            href={routes.auth.login}
            className="text-primary font-bold hover:underline underline-offset-4 ml-1"
          >
            Login
          </Link>
        </p>
      </form>
    </Form>
  );
}

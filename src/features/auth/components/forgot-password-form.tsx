"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
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
import { routes } from "@/config/routes";
import {
  type ForgotPasswordFormValues,
  forgotPasswordSchema,
} from "@/features/auth/schemas/auth.schemas";
import {
  useAuthActions,
  useAuthState,
} from "@/shared/components/providers/auth-provider";

export function ForgotPasswordForm(): JSX.Element {
  const { resetPassword } = useAuthActions();
  const { isLoading } = useAuthState();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordFormValues): Promise<void> {
    setServerError(null);
    try {
      await resetPassword(values);
      setSuccess(true);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Erro ao enviar email. Tente novamente.";
      setServerError(message);
    }
  }

  if (success) {
    return (
      <div className="bg-surface-container-lowest p-8 rounded-lg shadow-[0px_20px_40px_rgba(45,47,49,0.06)] space-y-6">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-on-secondary-container text-3xl">
              mark_email_read
            </span>
          </div>
          <div>
            <h3 className="font-heading font-bold text-on-surface text-xl mb-2">
              Email enviado!
            </h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Verifique sua caixa de entrada. Enviamos um link de redefinição
              para{" "}
              <span className="font-semibold text-on-surface">
                {form.getValues("email")}
              </span>
              .
            </p>
          </div>
        </div>
        <Link
          href={routes.auth.login}
          className="flex items-center justify-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-lg">
            keyboard_backspace
          </span>
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="bg-surface-container-lowest p-8 rounded-lg shadow-[0px_20px_40px_rgba(45,47,49,0.06)] space-y-6 relative overflow-hidden"
      >
        {/* Decorative paw */}
        <span
          className="material-symbols-outlined absolute -right-4 -bottom-4 text-outline-variant opacity-10 text-8xl select-none pointer-events-none"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          pets
        </span>

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
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-bold font-body text-on-surface-variant ml-1">
                Email Address
              </FormLabel>
              <FormControl>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">
                      mail
                    </span>
                  </div>
                  <Input
                    {...field}
                    type="email"
                    placeholder="oliver@pupmail.com"
                    className="pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-md focus-visible:ring-primary/20 focus-visible:bg-surface-container-lowest transition-all duration-200 text-on-surface placeholder:text-outline/50 h-auto"
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
          className="w-full bg-primary-gradient text-primary-foreground font-heading font-bold py-4 rounded-full shadow-lg shadow-primary/20 hover:shadow-xl active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 h-auto disabled:opacity-70 disabled:scale-100"
        >
          <span>{isLoading ? "Enviando..." : "Send Reset Link"}</span>
          {!isLoading && (
            <span className="material-symbols-outlined">arrow_forward</span>
          )}
        </Button>

        <div className="pt-4 text-center">
          <Link
            href={routes.auth.login}
            className="text-sm font-bold text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center gap-2 group"
          >
            <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">
              keyboard_backspace
            </span>
            Back to Login
          </Link>
        </div>
      </form>
    </Form>
  );
}

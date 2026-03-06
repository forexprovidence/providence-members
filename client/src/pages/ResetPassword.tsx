import * as React from "react";
import { useLocation } from "wouter";
import { AppTopNav } from "@/components/AppTopNav";
import { PageShell } from "@/components/PageShell";
import { SectionCard } from "@/components/SectionCard";
import { GradientButton } from "@/components/GradientButton";
import { Input } from "@/components/ui/input";
import { KeyRound, Lock, Save } from "lucide-react";
import { useResetPassword } from "@/hooks/use-auth-actions";
import { useToast } from "@/hooks/use-toast";

function useQueryParam(name: string) {
  const [loc] = useLocation();
  return React.useMemo(() => {
    const url = new URL(window.location.origin + loc);
    return url.searchParams.get(name);
  }, [loc, name]);
}

export default function ResetPassword() {
  const token = useQueryParam("token") ?? "";
  const { toast } = useToast();
  const reset = useResetPassword();
  const [password, setPassword] = React.useState("");
  const [password2, setPassword2] = React.useState("");

  const mismatch = password2.length > 0 && password !== password2;

  return (
    <PageShell>
      <AppTopNav />

      <div className="pb-16">
        <SectionCard
          title={
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <span>Set a new password</span>
            </div>
          }
          description="Choose a strong password. Your token must be valid and unexpired."
          data-testid="reset-password-card"
          right={
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs text-muted-foreground ring-1 ring-white/10">
              <KeyRound className="h-3.5 w-3.5" />
              secure token
            </div>
          }
        >
          {!token ? (
            <div className="rounded-3xl bg-destructive/10 ring-1 ring-destructive/25 p-5">
              <div className="text-sm font-semibold">Missing token</div>
              <div className="mt-1 text-sm text-muted-foreground">
                This reset link is incomplete. Request a new reset email.
              </div>
              <div className="mt-4">
                <GradientButton
                  variant="secondary"
                  onClick={() => (window.location.href = "/forgot-password")}
                  data-testid="reset-missing-token"
                >
                  Request new link
                </GradientButton>
              </div>
            </div>
          ) : (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (mismatch) return;
                reset.mutate(
                  { token, password },
                  {
                    onSuccess: () => {
                      toast({ title: "Password updated", description: "You can now log in." });
                      window.location.href = "/login";
                    },
                    onError: (err: any) => {
                      toast({
                        title: "Reset failed",
                        description: err?.message ?? "Token may be expired.",
                        variant: "destructive",
                      });
                    },
                  },
                );
              }}
              data-testid="reset-password-form"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-5">
                  <label className="text-sm font-semibold" htmlFor="pw1">
                    New password
                  </label>
                  <div className="mt-2">
                    <Input
                      id="pw1"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 rounded-2xl bg-background/40 ring-1 ring-white/10 focus:ring-4 focus:ring-primary/15"
                      data-testid="reset-password"
                      required
                      minLength={8}
                    />
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    Use 12+ characters, mixed case, and symbols.
                  </div>
                </div>

                <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-5">
                  <label className="text-sm font-semibold" htmlFor="pw2">
                    Confirm password
                  </label>
                  <div className="mt-2">
                    <Input
                      id="pw2"
                      type="password"
                      value={password2}
                      onChange={(e) => setPassword2(e.target.value)}
                      className="h-12 rounded-2xl bg-background/40 ring-1 ring-white/10 focus:ring-4 focus:ring-primary/15"
                      data-testid="reset-password-confirm"
                      required
                      minLength={8}
                    />
                  </div>
                  {mismatch ? (
                    <div className="mt-3 text-xs text-destructive" data-testid="reset-mismatch">
                      Passwords do not match.
                    </div>
                  ) : (
                    <div className="mt-3 text-xs text-muted-foreground">Make sure both fields match.</div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <GradientButton
                  type="submit"
                  isLoading={reset.isPending}
                  disabled={mismatch}
                  data-testid="reset-submit"
                >
                  <Save className="h-4 w-4" />
                  Save new password
                </GradientButton>
                <GradientButton
                  variant="secondary"
                  type="button"
                  onClick={() => (window.location.href = "/login")}
                  data-testid="reset-back-login"
                >
                  Back to login
                </GradientButton>
              </div>
            </form>
          )}
        </SectionCard>
      </div>
    </PageShell>
  );
}

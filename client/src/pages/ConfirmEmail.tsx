import * as React from "react";
import { useLocation } from "wouter";
import { AppTopNav } from "@/components/AppTopNav";
import { PageShell } from "@/components/PageShell";
import { SectionCard } from "@/components/SectionCard";
import { GradientButton } from "@/components/GradientButton";
import { useConfirmEmail } from "@/hooks/use-auth-actions";
import { CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function useQueryParam(name: string) {
  const [loc] = useLocation();
  return React.useMemo(() => {
    const url = new URL(window.location.origin + loc);
    return url.searchParams.get(name);
  }, [loc, name]);
}

export default function ConfirmEmail() {
  const token = useQueryParam("token") ?? "";
  const { toast } = useToast();
  const confirm = useConfirmEmail();
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    if (!token) return;
    confirm.mutate(
      { token },
      {
        onSuccess: () => {
          setDone(true);
          toast({ title: "Email confirmed", description: "Welcome—your dashboard is now unlocked." });
        },
        onError: (e: any) => {
          toast({
            title: "Confirmation failed",
            description: e?.message ?? "Your token may be expired.",
            variant: "destructive",
          });
        },
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <PageShell>
      <AppTopNav />

      <div className="pb-16">
        <SectionCard
          title="Email confirmation"
          description="Verifying your token…"
          data-testid="confirm-email-card"
          right={
            token ? (
              <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs text-muted-foreground ring-1 ring-white/10">
                <KeyRound className="h-3.5 w-3.5" />
                token flow
              </div>
            ) : null
          }
        >
          {!token ? (
            <div className="rounded-3xl bg-destructive/10 ring-1 ring-destructive/25 p-5">
              <div className="text-sm font-semibold text-destructive-foreground">Missing token</div>
              <div className="mt-1 text-sm text-muted-foreground">
                This link is incomplete. Please use the confirmation email link again.
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-5">
                <div className="flex items-center gap-3">
                  {confirm.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                  )}
                  <div>
                    <div className="text-sm font-semibold">
                      {confirm.isPending ? "Confirming…" : done ? "Confirmed" : "Ready"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {confirm.isPending
                        ? "Please keep this tab open."
                        : done
                          ? "You can now enter your dashboard."
                          : "Click continue to proceed."}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <GradientButton
                  onClick={() => {
                    window.location.href = "/";
                  }}
                  data-testid="confirm-email-continue"
                >
                  Continue
                </GradientButton>
                <GradientButton
                  variant="secondary"
                  onClick={() => (window.location.href = "/login")}
                  data-testid="confirm-email-login"
                >
                  Login
                </GradientButton>
              </div>
            </div>
          )}
        </SectionCard>
      </div>
    </PageShell>
  );
}

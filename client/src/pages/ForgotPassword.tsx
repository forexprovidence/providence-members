import * as React from "react";
import { AppTopNav } from "@/components/AppTopNav";
import { PageShell } from "@/components/PageShell";
import { SectionCard } from "@/components/SectionCard";
import { GradientButton } from "@/components/GradientButton";
import { Input } from "@/components/ui/input";
import { Mail, Send } from "lucide-react";
import { useForgotPassword } from "@/hooks/use-auth-actions";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPassword() {
  const { toast } = useToast();
  const forgot = useForgotPassword();
  const [email, setEmail] = React.useState("");

  return (
    <PageShell>
      <AppTopNav />

      <div className="pb-16">
        <SectionCard
          title={
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <span>Reset your password</span>
            </div>
          }
          description="We’ll email you a secure link. For safety, we won’t reveal if an email exists."
          data-testid="forgot-password-card"
        >
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              forgot.mutate(
                { email },
                {
                  onSuccess: () => {
                    toast({
                      title: "If that email exists, we sent a link",
                      description: "Check your inbox and spam folder.",
                    });
                  },
                  onError: (err: any) => {
                    toast({
                      title: "Request failed",
                      description: err?.message ?? "Please try again.",
                      variant: "destructive",
                    });
                  },
                },
              );
            }}
            data-testid="forgot-password-form"
          >
            <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-5">
              <label className="text-sm font-semibold" htmlFor="email">
                Email
              </label>
              <div className="mt-2">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  placeholder="you@domain.com"
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-2xl bg-background/40 ring-1 ring-white/10 focus:ring-4 focus:ring-primary/15"
                  data-testid="forgot-email"
                  required
                />
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                Tip: use the same email associated with your member account.
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <GradientButton isLoading={forgot.isPending} type="submit" data-testid="forgot-submit">
                <Send className="h-4 w-4" />
                Send reset link
              </GradientButton>
              <GradientButton
                variant="secondary"
                type="button"
                onClick={() => (window.location.href = "/login")}
                data-testid="forgot-back-login"
              >
                Back to login
              </GradientButton>
            </div>
          </form>
        </SectionCard>
      </div>
    </PageShell>
  );
}

import * as React from "react";
import { AppTopNav } from "@/components/AppTopNav";
import { PageShell } from "@/components/PageShell";
import { SectionCard } from "@/components/SectionCard";
import { GradientButton } from "@/components/GradientButton";
import { useResendConfirmationEmail } from "@/hooks/use-auth-actions";
import { useAuth } from "@/hooks/use-auth";
import { Mail, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function EmailUnconfirmed() {
  const { user } = useAuth();
  const { toast } = useToast();
  const resend = useResendConfirmationEmail();

  const email = (user as any)?.email ?? "";

  return (
    <PageShell>
      <AppTopNav />

      <div className="pb-16">
        <SectionCard
          title={
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <span>Confirm your email to continue</span>
            </div>
          }
          description="For security, your dashboard stays locked until your email is verified."
          data-testid="unconfirmed-card"
        >
          <div className="space-y-4">
            <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-5">
              <div className="text-sm font-semibold">Signed in as</div>
              <div className="mt-1 text-sm text-muted-foreground" data-testid="unconfirmed-email">
                {email || "Your account email"}
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                Check your inbox for a confirmation link. If it’s not there, check spam/junk.
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <GradientButton
                onClick={() => {
                  resend.mutate(
                    { email },
                    {
                      onSuccess: () => {
                        toast({
                          title: "Confirmation email sent",
                          description: "If the email exists, a new link is on its way.",
                        });
                      },
                      onError: (e: any) => {
                        toast({
                          title: "Couldn’t resend",
                          description: e?.message ?? "Please try again.",
                          variant: "destructive",
                        });
                      },
                    },
                  );
                }}
                isLoading={resend.isPending}
                data-testid="resend-confirmation"
              >
                <RefreshCw className="h-4 w-4" />
                Resend confirmation email
              </GradientButton>

              <GradientButton
                variant="secondary"
                onClick={() => {
                  window.location.href = "/api/logout";
                }}
                data-testid="unconfirmed-logout"
              >
                Logout
              </GradientButton>
            </div>

            <div className="text-xs text-muted-foreground">
              Already confirmed? Refresh the page after clicking the email link.
            </div>
          </div>
        </SectionCard>
      </div>
    </PageShell>
  );
}

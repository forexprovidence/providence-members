import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useResendConfirmationEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: unknown) => {
      const validated = api.auth.resendConfirmation.input.parse(input ?? {});
      const res = await apiRequest(api.auth.resendConfirmation.method, api.auth.resendConfirmation.path, validated);
      return parseWithLogging(
        api.auth.resendConfirmation.responses[200],
        await res.json(),
        "auth.resendConfirmation",
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });
}

export function useConfirmEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: unknown) => {
      const validated = api.auth.confirmEmail.input.parse(input);
      const res = await apiRequest(api.auth.confirmEmail.method, api.auth.confirmEmail.path, validated);
      return parseWithLogging(api.auth.confirmEmail.responses[200], await res.json(), "auth.confirmEmail");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (input: unknown) => {
      const validated = api.auth.forgotPassword.input.parse(input);
      const res = await apiRequest(api.auth.forgotPassword.method, api.auth.forgotPassword.path, validated);
      return parseWithLogging(api.auth.forgotPassword.responses[200], await res.json(), "auth.forgotPassword");
    },
  });
}

export function useResetPassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: unknown) => {
      const validated = api.auth.resetPassword.input.parse(input);
      const res = await apiRequest(api.auth.resetPassword.method, api.auth.resetPassword.path, validated);
      return parseWithLogging(api.auth.resetPassword.responses[200], await res.json(), "auth.resetPassword");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });
}

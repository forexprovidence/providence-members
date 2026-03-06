import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
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

export function useAccounts(params?: unknown) {
  return useQuery({
    queryKey: [api.accounts.list.path, params ? JSON.stringify(params) : ""],
    queryFn: async () => {
      const validated = api.accounts.list.input?.safeParse(params);
      const qs =
        validated && validated.success && validated.data
          ? "?" + new URLSearchParams(validated.data as Record<string, string>).toString()
          : "";
      const res = await fetch(`${api.accounts.list.path}${qs}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch accounts");
      return parseWithLogging(api.accounts.list.responses[200], await res.json(), "accounts.list");
    },
  });
}

export function useAccount(id: number) {
  return useQuery({
    queryKey: [api.accounts.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.accounts.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch account");
      return parseWithLogging(api.accounts.get.responses[200], await res.json(), "accounts.get");
    },
  });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: unknown) => {
      const validated = api.accounts.create.input.parse(input);
      const res = await apiRequest(api.accounts.create.method, api.accounts.create.path, validated);
      return parseWithLogging(api.accounts.create.responses[201], await res.json(), "accounts.create");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.accounts.list.path] });
      qc.invalidateQueries({ queryKey: [api.dashboard.overview.path] });
    },
  });
}

export function useUpdateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Record<string, unknown>) => {
      const url = buildUrl(api.accounts.update.path, { id });
      const validated = api.accounts.update.input.parse(updates);
      const res = await apiRequest(api.accounts.update.method, url, validated);
      return parseWithLogging(api.accounts.update.responses[200], await res.json(), "accounts.update");
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: [api.accounts.list.path] });
      qc.invalidateQueries({ queryKey: [api.accounts.get.path, v.id] });
      qc.invalidateQueries({ queryKey: [api.dashboard.overview.path] });
    },
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.accounts.delete.path, { id });
      await apiRequest(api.accounts.delete.method, url);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.accounts.list.path] });
      qc.invalidateQueries({ queryKey: [api.dashboard.overview.path] });
    },
  });
}

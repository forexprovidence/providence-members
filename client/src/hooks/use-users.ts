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

export function useAdminUsers(params?: unknown) {
  return useQuery({
    queryKey: [api.admin.users.list.path, params ? JSON.stringify(params) : ""],
    queryFn: async () => {
      const validated = api.admin.users.list.input?.safeParse(params);
      const qs =
        validated && validated.success && validated.data
          ? "?" + new URLSearchParams(validated.data as Record<string, string>).toString()
          : "";
      const res = await fetch(`${api.admin.users.list.path}${qs}`, { credentials: "include" });
      if (!res.ok) throw new Error(`Failed to fetch users (${res.status})`);
      return parseWithLogging(api.admin.users.list.responses[200], await res.json(), "admin.users.list");
    },
  });
}

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: [api.admin.users.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.admin.users.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`Failed to fetch user (${res.status})`);
      return parseWithLogging(api.admin.users.get.responses[200], await res.json(), "admin.users.get");
    },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Record<string, unknown>) => {
      const url = buildUrl(api.admin.users.update.path, { id });
      const validated = api.admin.users.update.input.parse(updates);
      const res = await apiRequest(api.admin.users.update.method, url, validated);
      return parseWithLogging(api.admin.users.update.responses[200], await res.json(), "admin.users.update");
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [api.admin.users.list.path] });
      qc.invalidateQueries({ queryKey: [api.admin.users.get.path, vars.id] });
    },
  });
}

export function useAdminResetUserPassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string } & Record<string, unknown>) => {
      const url = buildUrl(api.admin.users.resetPassword.path, { id });
      const validated = api.admin.users.resetPassword.input.parse(body);
      const res = await apiRequest(api.admin.users.resetPassword.method, url, validated);
      return parseWithLogging(
        api.admin.users.resetPassword.responses[200],
        await res.json(),
        "admin.users.resetPassword",
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.admin.users.list.path] });
    },
  });
}

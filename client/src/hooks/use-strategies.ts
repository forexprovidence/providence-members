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

export function useStrategies(params?: unknown) {
  return useQuery({
    queryKey: [api.strategies.list.path, params ? JSON.stringify(params) : ""],
    queryFn: async () => {
      const validated = api.strategies.list.input?.safeParse(params);
      const qs =
        validated && validated.success && validated.data
          ? "?" + new URLSearchParams(validated.data as Record<string, string>).toString()
          : "";
      const res = await fetch(`${api.strategies.list.path}${qs}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch strategies");
      return parseWithLogging(api.strategies.list.responses[200], await res.json(), "strategies.list");
    },
  });
}

export function useStrategy(id: number) {
  return useQuery({
    queryKey: [api.strategies.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.strategies.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch strategy");
      return parseWithLogging(api.strategies.get.responses[200], await res.json(), "strategies.get");
    },
  });
}

export function useCreateStrategy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: unknown) => {
      const validated = api.strategies.create.input.parse(input);
      const res = await apiRequest(api.strategies.create.method, api.strategies.create.path, validated);
      return parseWithLogging(api.strategies.create.responses[201], await res.json(), "strategies.create");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [api.strategies.list.path] }),
  });
}

export function useUpdateStrategy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Record<string, unknown>) => {
      const url = buildUrl(api.strategies.update.path, { id });
      const validated = api.strategies.update.input.parse(updates);
      const res = await apiRequest(api.strategies.update.method, url, validated);
      return parseWithLogging(api.strategies.update.responses[200], await res.json(), "strategies.update");
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: [api.strategies.list.path] });
      qc.invalidateQueries({ queryKey: [api.strategies.get.path, v.id] });
    },
  });
}

export function useDeleteStrategy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.strategies.delete.path, { id });
      const res = await apiRequest(api.strategies.delete.method, url);
      if (res.status !== 204 && res.status !== 200) return;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [api.strategies.list.path] }),
  });
}

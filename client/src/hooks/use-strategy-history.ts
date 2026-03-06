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

export function useStrategyHistory(strategyId: number, params?: unknown) {
  return useQuery({
    queryKey: [api.strategyHistory.list.path, strategyId, params ? JSON.stringify(params) : ""],
    queryFn: async () => {
      const url = buildUrl(api.strategyHistory.list.path, { strategyId });
      const validated = api.strategyHistory.list.input?.safeParse(params);
      const qs =
        validated && validated.success && validated.data
          ? "?" + new URLSearchParams(validated.data as Record<string, string>).toString()
          : "";
      const res = await fetch(`${url}${qs}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch strategy history");
      return parseWithLogging(api.strategyHistory.list.responses[200], await res.json(), "strategyHistory.list");
    },
    enabled: Number.isFinite(strategyId),
  });
}

export function useCreateStrategyHistory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: unknown) => {
      const validated = api.strategyHistory.create.input.parse(input);
      const res = await apiRequest(api.strategyHistory.create.method, api.strategyHistory.create.path, validated);
      return parseWithLogging(
        api.strategyHistory.create.responses[201],
        await res.json(),
        "strategyHistory.create",
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.strategyHistory.list.path] });
      qc.invalidateQueries({ queryKey: [api.strategies.list.path] });
    },
  });
}

export function useUpdateStrategyHistory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Record<string, unknown>) => {
      const url = buildUrl(api.strategyHistory.update.path, { id });
      const validated = api.strategyHistory.update.input.parse(updates);
      const res = await apiRequest(api.strategyHistory.update.method, url, validated);
      return parseWithLogging(
        api.strategyHistory.update.responses[200],
        await res.json(),
        "strategyHistory.update",
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.strategyHistory.list.path] });
      qc.invalidateQueries({ queryKey: [api.strategies.list.path] });
    },
  });
}

export function useDeleteStrategyHistory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.strategyHistory.delete.path, { id });
      await apiRequest(api.strategyHistory.delete.method, url);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.strategyHistory.list.path] });
      qc.invalidateQueries({ queryKey: [api.strategies.list.path] });
    },
  });
}

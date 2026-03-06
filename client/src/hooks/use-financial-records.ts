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

export function useFinancialRecords(params?: unknown) {
  return useQuery({
    queryKey: [api.financialRecords.list.path, params ? JSON.stringify(params) : ""],
    queryFn: async () => {
      const validated = api.financialRecords.list.input?.safeParse(params);
      const qs =
        validated && validated.success && validated.data
          ? "?" + new URLSearchParams(validated.data as Record<string, string>).toString()
          : "";
      const res = await fetch(`${api.financialRecords.list.path}${qs}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch financial records");
      return parseWithLogging(api.financialRecords.list.responses[200], await res.json(), "financialRecords.list");
    },
  });
}

export function useCreateFinancialRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: unknown) => {
      const validated = api.financialRecords.create.input.parse(input);
      const res = await apiRequest(
        api.financialRecords.create.method,
        api.financialRecords.create.path,
        validated,
      );
      return parseWithLogging(
        api.financialRecords.create.responses[201],
        await res.json(),
        "financialRecords.create",
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.financialRecords.list.path] });
      qc.invalidateQueries({ queryKey: [api.dashboard.overview.path] });
    },
  });
}

export function useUpdateFinancialRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Record<string, unknown>) => {
      const url = buildUrl(api.financialRecords.update.path, { id });
      const validated = api.financialRecords.update.input.parse(updates);
      const res = await apiRequest(api.financialRecords.update.method, url, validated);
      return parseWithLogging(
        api.financialRecords.update.responses[200],
        await res.json(),
        "financialRecords.update",
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.financialRecords.list.path] });
      qc.invalidateQueries({ queryKey: [api.dashboard.overview.path] });
    },
  });
}

export function useDeleteFinancialRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.financialRecords.delete.path, { id });
      await apiRequest(api.financialRecords.delete.method, url);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.financialRecords.list.path] });
      qc.invalidateQueries({ queryKey: [api.dashboard.overview.path] });
    },
  });
}

import { defineConfig } from "vitest/config";

export default defineConfig({
  // Резолвит алиас "@/*" из tsconfig нативно (Vite поддерживает это без плагина).
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    // Доменный слой — чистый TS без DOM, гоняем в node.
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      // Покрываем ТОЛЬКО чистый доменный слой (логика без фреймворк-glue).
      // RSC/роуты/Supabase/drizzle сознательно вне coverage — 100% по ним
      // требовал бы моков инфраструктуры и проверял бы моки, а не логику.
      include: [
        "src/entities/metric/model/analytics.ts",
        "src/entities/metric/model/timeseries.ts",
        "src/entities/metric/model/mrr-movement.ts",
        "src/entities/event/model/event.generator.ts",
        "src/shared/lib/format.ts",
        "src/features/ai-analyst/model/insight.ts",
        "src/features/ai-analyst/model/extract-json.ts",
      ],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
});

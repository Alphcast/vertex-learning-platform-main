import "server-only";

import { parse, evaluate } from "groq-js";
import seedData from "./seed-data.json";

export async function evaluateGroqQuery<T = unknown>(
  query: string,
  params: Record<string, unknown> = {},
): Promise<T> {
  try {
    const tree = parse(query);
    const result = await evaluate(tree, {
      dataset: seedData as unknown as unknown[],
      params,
    });
    return (await result.get()) as T;
  } catch (error) {
    console.error("[evaluateGroqQuery] GROQ evaluation error:", error);
    throw error;
  }
}

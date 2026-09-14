import "server-only";

import type { QueryParams } from "next-sanity";
import type { ClientReturn } from "@sanity/client";

import { client } from "./client";
import { evaluateGroqQuery } from "./mock-data";

/** Cache tags a Sanity webhook can invalidate. Keep in sync with the document types. */
export const CACHE_TAGS = {
  course: "course",
  lesson: "lesson",
  instructor: "instructor",
  category: "category",
} as const;

const ONE_HOUR = 3600;

interface SanityFetchOptions<Params extends QueryParams> {
  query: string;
  params?: Params;
  /** Tags to invalidate on demand via `revalidateTag`. Supplying tags disables time revalidation. */
  tags?: string[];
  /** Only used when no tags are given. */
  revalidate?: number | false;
}

/**
 * The single way the web app reads content. Server-only by construction — it pulls in the
 * token-bearing client — and typed by TypeGen through `defineQuery`, so callers get the exact
 * projection shape back without hand-written types.
 */
export async function sanityFetch<const QueryString extends string>({
  query,
  params = {} as QueryParams,
  tags = [],
  revalidate = ONE_HOUR,
}: SanityFetchOptions<QueryParams> & { query: QueryString }): Promise<ClientReturn<QueryString>> {
  const hasRealSanityConfig =
    Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) &&
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== "vertex-preview" &&
    Boolean(process.env.SANITY_API_READ_TOKEN);

  if (hasRealSanityConfig) {
    try {
      return (await client.fetch(query, params, {
        next: {
          revalidate: tags.length ? false : revalidate,
          tags,
        },
      })) as ClientReturn<QueryString>;
    } catch (error) {
      console.warn("[sanityFetch] Remote Sanity fetch failed, falling back to local dataset:", error);
    }
  }

  const fallbackData = await evaluateGroqQuery(query, params as Record<string, unknown>);
  return fallbackData as ClientReturn<QueryString>;
}

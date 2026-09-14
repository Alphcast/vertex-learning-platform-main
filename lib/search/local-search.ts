import type { ModelHit } from "./types";
import seedData from "@/sanity/lib/seed-data.json";

interface SeedDoc {
  _id: string;
  _type: string;
  [key: string]: unknown;
}

interface SeedLesson extends SeedDoc {
  _id: string;
  _type: "lesson";
  title?: string;
  keyPoints?: string[];
  notes?: unknown;
}

interface SeedCourseModule {
  lessons?: Array<{ _ref: string }>;
}

interface SeedCourse extends SeedDoc {
  _id: string;
  _type: "course";
  title?: string;
  summary?: string;
  modules?: SeedCourseModule[];
}

export function localDatasetSearch(query: string): { hits: ModelHit[]; reply: string } {
  const norm = (str?: string | null) => (str || "").toLowerCase().replace(/[^a-z0-9]/g, " ");
  const terms = norm(query).split(/\s+/).filter(Boolean);

  const allDocs = seedData as unknown as SeedDoc[];
  const lessons = allDocs.filter((d): d is SeedLesson => d._type === "lesson");
  const courses = allDocs.filter((d): d is SeedCourse => d._type === "course");

  const candidates: { hit: ModelHit; score: number }[] = [];

  for (const lesson of lessons) {
    const parentCourse = courses.find((c) =>
      c.modules?.some((m) => m.lessons?.some((l) => l._ref === lesson._id)),
    );

    const text = norm(
      [
        lesson.title,
        parentCourse?.title,
        parentCourse?.summary,
        ...(lesson.keyPoints || []),
        ...(lesson.notes ? [JSON.stringify(lesson.notes)] : []),
      ].join(" "),
    );

    let score = 0;
    for (const term of terms) {
      if (text.includes(term)) score += 1;
      if (norm(lesson.title).includes(term)) score += 4;
      if (norm(parentCourse?.title || "").includes(term)) score += 2;
    }

    if (score > 0) {
      candidates.push({
        score,
        hit: {
          lessonId: lesson._id,
          kind: "lesson",
          reason: `Covers ${lesson.title ?? "lesson"} in ${parentCourse?.title ?? "curriculum"}.`,
          rank: 0,
          startSeconds: null,
          momentLabel: null,
        },
      });
    }
  }

  // Sort descending by score
  candidates.sort((a, b) => b.score - a.score);

  const topHits = candidates.slice(0, 20).map((c, i) => ({
    ...c.hit,
    rank: i + 1,
  }));

  const reply =
    topHits.length > 0
      ? `Found ${topHits.length} relevant lesson${topHits.length === 1 ? "" : "s"} for "${query}".`
      : `No matching lessons found for "${query}". Try searching for topics like React, Next.js, AI, TypeScript, Python, or Security.`;

  return { hits: topHits, reply };
}

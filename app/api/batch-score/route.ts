import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { enrichBrand } from "@/lib/enrichment";
import { buildScoreFromEnrichment } from "@/lib/scoring";
import { ScoreResult } from "@/lib/types";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { brands } = await req.json();
    if (!Array.isArray(brands) || brands.length === 0) {
      return NextResponse.json(
        { error: "Array of brand names is required" },
        { status: 400 }
      );
    }

    if (brands.length > 25) {
      return NextResponse.json(
        { error: "Maximum 25 brands per batch" },
        { status: 400 }
      );
    }

    // Process in parallel with concurrency limit of 5
    const results: ScoreResult[] = [];
    const errors: { brand: string; error: string }[] = [];

    const chunks: string[][] = [];
    for (let i = 0; i < brands.length; i += 5) {
      chunks.push(brands.slice(i, i + 5));
    }

    for (const chunk of chunks) {
      const chunkResults = await Promise.allSettled(
        chunk.map(async (brand: string) => {
          const enrichment = await enrichBrand(brand.trim());
          return buildScoreFromEnrichment(enrichment);
        })
      );

      chunkResults.forEach((result, idx) => {
        if (result.status === "fulfilled") {
          results.push(result.value);
        } else {
          errors.push({
            brand: chunk[idx],
            error: result.reason?.message || "Unknown error",
          });
        }
      });
    }

    return NextResponse.json({ results, errors });
  } catch (error) {
    console.error("Batch score error:", error);
    return NextResponse.json(
      { error: "Failed to batch score" },
      { status: 500 }
    );
  }
}

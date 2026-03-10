import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { enrichBrand } from "@/lib/enrichment";
import { buildScoreFromEnrichment } from "@/lib/scoring";
import { lookupRoktAdvertiser } from "@/lib/rokt-data";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { brand } = await req.json();
    if (!brand || typeof brand !== "string" || brand.trim().length === 0) {
      return NextResponse.json(
        { error: "Brand name is required" },
        { status: 400 }
      );
    }

    const trimmedBrand = brand.trim();

    // AI enrichment runs async; Rokt data lookup is a local file read (instant)
    const [enrichment] = await Promise.all([enrichBrand(trimmedBrand)]);
    const roktData = lookupRoktAdvertiser(trimmedBrand);

    const result = buildScoreFromEnrichment(enrichment, roktData);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Score error:", error);
    return NextResponse.json(
      { error: "Failed to score brand" },
      { status: 500 }
    );
  }
}

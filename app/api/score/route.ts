import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { enrichBrand } from "@/lib/enrichment";
import { buildScoreFromEnrichment } from "@/lib/scoring";

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

    const enrichment = await enrichBrand(brand.trim());
    const result = buildScoreFromEnrichment(enrichment);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Score error:", error);
    return NextResponse.json(
      { error: "Failed to score brand" },
      { status: 500 }
    );
  }
}

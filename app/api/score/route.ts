import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { enrichBrand } from "@/lib/enrichment";
import { buildScoreFromEnrichment } from "@/lib/scoring";
import { lookupHubSpotBrand } from "@/lib/hubspot";

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

    // Run AI enrichment and HubSpot lookup in parallel
    const [enrichment, hubspotData] = await Promise.all([
      enrichBrand(trimmedBrand),
      lookupHubSpotBrand(trimmedBrand).catch((err) => {
        console.error("HubSpot lookup failed, continuing without CRM data:", err);
        return undefined;
      }),
    ]);

    const result = buildScoreFromEnrichment(enrichment, hubspotData);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Score error:", error);
    return NextResponse.json(
      { error: "Failed to score brand" },
      { status: 500 }
    );
  }
}

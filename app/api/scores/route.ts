import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { saveScore, getAllScores, deleteScore } from "@/lib/db";
import { SavedScore } from "@/lib/types";
import { randomUUID } from "crypto";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scores = getAllScores();
  return NextResponse.json(scores);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { result, notes } = await req.json();

    const saved: SavedScore = {
      id: randomUUID(),
      userId: session.user.email,
      userEmail: session.user.email,
      brand: result.brand,
      totalScore: result.totalScore,
      grade: result.grade,
      churnRisk: result.churnRisk,
      predictedSpendMid: result.predictedAnnualSpend.mid,
      result,
      createdAt: new Date().toISOString(),
      notes,
    };

    saveScore(saved);
    return NextResponse.json(saved);
  } catch (error) {
    console.error("Save score error:", error);
    return NextResponse.json(
      { error: "Failed to save score" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  const deleted = deleteScore(id, session.user.email);
  return NextResponse.json({ deleted });
}

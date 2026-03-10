import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { google } from "googleapis";
import fs from "fs";
import path from "path";
import os from "os";

interface DimensionPayload {
  name: string;
  score: number;
  maxScore: number;
  active: boolean;
}

interface SharePayload {
  spaceId: string;
  brand: string;
  scorePercent: number;
  grade: string;
  churnRisk: string;
  predictedSpend: { low: number; mid: number; high: number };
  redFlagCount: number;
  dimensions: DimensionPayload[];
}

function formatSpend(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}

function buildMessageText(payload: SharePayload, appUrl: string): string {
  const { brand, scorePercent, grade, churnRisk, predictedSpend, redFlagCount, dimensions } =
    payload;

  const riskEmoji = churnRisk === "low" ? "green" : churnRisk === "medium" ? "yellow" : "red";
  const riskLabel =
    churnRisk === "low" ? "Low risk" : churnRisk === "medium" ? "Medium risk" : "High risk";
  void riskEmoji;

  const activeDimensions = dimensions.filter((d) => d.active);
  const dimensionLines = activeDimensions
    .map((d) => `• ${d.name}: ${d.score}/${d.maxScore}`)
    .join("\n");

  const flagLine =
    redFlagCount > 0
      ? `⚠️ ${redFlagCount} red flag${redFlagCount > 1 ? "s" : ""} detected`
      : "✅ No red flags";

  const shareUrl = `${appUrl}?brand=${encodeURIComponent(brand)}`;

  return [
    `🎯 *ICP Score: ${brand}*`,
    `Grade: *${grade}* | Score: ${scorePercent}% | Risk: ${riskLabel}`,
    `Predicted Spend: ${formatSpend(predictedSpend.low)} - ${formatSpend(predictedSpend.high)}`,
    flagLine,
    "",
    "Dimensions:",
    dimensionLines,
    "",
    `🔗 ${shareUrl}`,
  ].join("\n");
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: SharePayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { spaceId, brand, scorePercent, grade, churnRisk, predictedSpend, redFlagCount, dimensions } =
    payload;

  if (!spaceId || !brand || scorePercent == null || !grade) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Load google-docs-mcp credentials
  let oauth2Client: InstanceType<typeof google.auth.OAuth2>;
  try {
    const credentialsPath = path.join(os.homedir(), "google-docs-mcp/credentials.json");
    const tokenPath = path.join(os.homedir(), ".config/google-docs-mcp/token.json");

    const credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf8"));
    const token = JSON.parse(fs.readFileSync(tokenPath, "utf8"));

    const clientId =
      credentials.installed?.client_id ?? credentials.web?.client_id;
    const clientSecret =
      credentials.installed?.client_secret ?? credentials.web?.client_secret;
    const redirectUri =
      credentials.installed?.redirect_uris?.[0] ?? credentials.web?.redirect_uris?.[0];

    oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    oauth2Client.setCredentials(token);
  } catch (err) {
    console.error("GChat share: failed to load credentials", err);
    return NextResponse.json(
      { error: "Server credentials not configured" },
      { status: 500 }
    );
  }

  const appUrl =
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ||
    `${req.headers.get("x-forwarded-proto") ?? "https"}://${req.headers.get("host")}`;

  const messageText = buildMessageText(
    { spaceId, brand, scorePercent, grade, churnRisk, predictedSpend, redFlagCount, dimensions },
    `${appUrl}/dashboard`
  );

  try {
    const chat = google.chat({ version: "v1", auth: oauth2Client });
    await chat.spaces.messages.create({
      parent: `spaces/${spaceId}`,
      requestBody: { text: messageText },
    });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("GChat share: failed to send message", err);
    const message =
      err instanceof Error ? err.message : "Failed to send GChat message";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

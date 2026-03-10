import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { google } from "googleapis";
import fs from "fs";
import path from "path";
import os from "os";

function buildEmailRaw(to: string, subject: string, body: string): string {
  const message = [
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset=utf-8`,
    ``,
    body,
  ].join("\r\n");

  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function getGmailClient() {
  const credPath = path.join(os.homedir(), "google-docs-mcp/credentials.json");
  const tokenPath = path.join(os.homedir(), ".config/google-docs-mcp/token.json");

  const credentials = JSON.parse(fs.readFileSync(credPath, "utf8"));
  const token = JSON.parse(fs.readFileSync(tokenPath, "utf8"));

  const clientCreds = credentials.installed || credentials.web;
  const oauth2Client = new google.auth.OAuth2(
    clientCreds.client_id,
    clientCreds.client_secret,
    clientCreds.redirect_uris[0]
  );
  oauth2Client.setCredentials(token);

  return google.gmail({ version: "v1", auth: oauth2Client });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      type,
      rating,
      brand,
      category,
      message,
    }: {
      type: "general" | "brand_critique";
      rating?: number;
      brand?: string;
      category?: string;
      message: string;
    } = body;

    if (!type || !message?.trim()) {
      return NextResponse.json(
        { error: "type and message are required" },
        { status: 400 }
      );
    }

    const submitter = session.user.email;
    const timestamp = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
      dateStyle: "long",
      timeStyle: "short",
    });

    let subject: string;
    let emailBody: string;

    if (type === "general") {
      subject = "[ICP Dashboard Feedback] General";
      emailBody = [
        `ICP Dashboard Feedback`,
        `${"─".repeat(40)}`,
        `Type:       General`,
        `Submitted:  ${timestamp}`,
        `From:       ${submitter}`,
        rating !== undefined ? `Rating:     ${rating}/5` : null,
        ``,
        `Feedback:`,
        message.trim(),
      ]
        .filter((line) => line !== null)
        .join("\n");
    } else {
      subject = `[ICP Dashboard Feedback] Brand: ${brand || "Unknown"}`;
      emailBody = [
        `ICP Dashboard Feedback`,
        `${"─".repeat(40)}`,
        `Type:       Brand Score Critique`,
        `Submitted:  ${timestamp}`,
        `From:       ${submitter}`,
        `Brand:      ${brand || "Not specified"}`,
        category ? `Issue:      ${category}` : null,
        ``,
        `Details:`,
        message.trim(),
      ]
        .filter((line) => line !== null)
        .join("\n");
    }

    const gmail = getGmailClient();
    const raw = buildEmailRaw("dan.handwerker@rokt.com", subject, emailBody);

    await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Feedback send error:", error);
    return NextResponse.json(
      { error: "Failed to send feedback" },
      { status: 500 }
    );
  }
}

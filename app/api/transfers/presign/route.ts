import { NextRequest } from "next/server";
import { getPresignedUploadUrl } from "@/lib/r2";

const MAX_FILE_SIZE_BYTES = 30 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, fileSize } = body;

    if (!code || typeof code !== "string" || code.length < 4 || code.length > 8) {
      return new Response(JSON.stringify({ error: "Invalid code" }), { status: 400 });
    }

    if (typeof fileSize !== "number" || fileSize <= 0 || fileSize > MAX_FILE_SIZE_BYTES) {
      return new Response(JSON.stringify({ error: "File too large" }), { status: 400 });
    }

    const objectId = crypto.randomUUID();
    const fileKey = `files/${objectId}`;

    const uploadUrl = await getPresignedUploadUrl(fileKey, "application/octet-stream", 600);

    return new Response(JSON.stringify({ uploadUrl, objectId, fileKey }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to generate upload URL" }), { status: 500 });
  }
}

import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { convertToModelMessages } from "ai";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: google("gemini-2.5-flash"),
    system: "You are a helpful assistant",
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}

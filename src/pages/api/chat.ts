// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// import { DustStream } from "@/utils/dustStream";
// import { processInput } from "@/utils/langchain_btc";
import { processInput } from "@/utils/openaiChat";
import type { PageConfig } from "next";

export const config: PageConfig = {
  runtime: "edge",
};

export default async function handler(req: Request): Promise<Response> {
  const { inputs } = (await req.json()) as {
    inputs?: { question: string }[];
  };
  try {
    const result = await processInput(inputs ?? []);
    return new Response(result);
  } catch (err) {
    return new Response(JSON.stringify({ error: "an error occurred" }), {
      status: 500,
    });
  }
}

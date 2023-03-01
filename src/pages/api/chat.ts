// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { DustStream } from "@/utils/dustStream";
import type { PageConfig } from "next";

export const config: PageConfig = {
  runtime: "edge",
};

export default async function handler(req: Request): Promise<Response> {
  const { inputs } = (await req.json()) as {
    inputs?: { question: string }[];
  };
  try {
    const stream = await DustStream(inputs ?? []);
    return new Response(stream);
  } catch (err) {
    return new Response(JSON.stringify({ error: "an error occured" }), {
      status: 500,
    });
  }
}

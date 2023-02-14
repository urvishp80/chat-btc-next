// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { PageConfig } from 'next'


export const config: PageConfig = {
  runtime: "edge"
}

export default async function handler(
  req: Request,
): Promise<Response> {
  const { inputs } = (await req.json()) as {
    inputs?: {question: string}[];
  };
  const response = await fetch(process.env.BASE_URL ?? "", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      "specification_hash": process.env.SPEC_HASH,
      "config": {
        "MODEL_SUMMARIZE": {
          "provider_id":"openai",
          "model_id":"text-davinci-002",
          "use_cache":true
        },
        "ES_SEARCH": {
          "use_cache":true
        },
        "MODEL_ANSWER_WITH_REFS": {
          "provider_id":"openai",
          "model_id":"text-davinci-002",
          "use_cache":true
        }
      },
      blocking: true,
      stream: false,
      inputs
    }),
  });

  const data = await response.json();
  return new Response(JSON.stringify({result: data}))
  // res.status(200).json({ result: data })
}

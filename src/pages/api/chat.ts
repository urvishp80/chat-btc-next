// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse, PageConfig } from 'next'
import { log } from 'next-axiom'

// type Data = {
//   [key]: string;
// }

export const config: PageConfig = {
  runtime: "edge"
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
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
      inputs: req.body.inputs,
    }),
  });

  const data = await response.json();
  log.info("Edge Function: ", {response, data})
  console.log(data)
  res.status(200).json({ result: data })
}

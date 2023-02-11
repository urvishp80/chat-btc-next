// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

// type Data = {
//   [key]: string;
// }

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
        "MODEL_SUMMARIZE":{
            "provider_id":"openai",
            "model_id":"text-davinci-002",
            "use_cache":true
        },
        "WEBCONTENT":{
            "provider_id":"browserlessapi",
            "use_cache":true,
            "error_as_output":false
        },
        "GOOGLE_CUSTOM_SEARCH":{
            "use_cache":true
        },
        "MODEL_ANSWER_WITH_REFS":{
            "provider_id":"openai",
            "model_id":"text-davinci-002",
            "use_cache":true
        }
      },
      stream: false,
      blocking: true,
      inputs: req.body.inputs,
    }),
  });

  const data = await response.json();
  res.status(200).json({ result: data })
}

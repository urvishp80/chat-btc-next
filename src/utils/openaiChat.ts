import { EventEmitter } from "events";
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";

interface ElementType {
  type: "paragraph" | "heading";
  text: string;
}

interface Content {
  title: string;
  snippet: string;
  link: string;
}

interface Result {
  title: {
    raw: string;
  };
  body: {
    raw: string;
  };
  url: {
    raw: string;
  };
  body_type: {
    raw: string;
  };
}

interface SummaryData {
  link: string;
  cleaned_text: string;
}

async function extractKeywords(input: string): Promise<string> {
  async function extractKeywordsCall(
    input: string,
    retry: number = 0
  ): Promise<string> {
    try {
      const payload = {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are helpfull AI assistant" },
          { role: "user", content: `Extract keywords from input: ${input}` },
        ],
        temperature: 0.7,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 1,
        max_tokens: 1000,
        stream: false,
      };
      const response = await fetch("https://api.openai.com/v1/chat/completions",{
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
          },
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
      const jsonResponse = await response.json();

      return (
        jsonResponse?.choices?.[0]?.message?.content
          ?.split(",")
          .map((w: string) => w.trim())
          .join(" ") ||
        jsonResponse?.choices?.[0]?.message?.content.trim() ||
        ""
      );
    } catch (error) {
      if (retry < 2) {
        return extractKeywordsCall(input, retry + 1);
      } else {
        return input;
      }
    }
  }

  return extractKeywordsCall(input);
}

async function extractFromElasticsearch(
  keywords: string
): Promise<any | undefined> {
  try {
    const url = process.env.ES_URL;

    const headers = {
      Authorization: String(process.env.ES_AUTHORIZATION_TOKEN),
      "Content-Type": "application/json",
    };

    const query = keywords;

    const response = await fetch(`${url}/search?query=${query}`, {
      method: "POST",
      headers: headers,
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const { results } = await response.json();

    return results;
  } catch (error) {
    return undefined;
  }
}

function concatenateTextFields(data: any): string {
  let concatenatedText = "";
  try {
    // json data
    const element = JSON.parse(data) as ElementType[];
    element.forEach((element: ElementType) => {
      if (element.type === "paragraph") {
        concatenatedText += element.text + " ";
      } else if (element.type === "heading") {
        concatenatedText += "\n\n" + element.text + "\n\n";
      }
    });
    return concatenatedText.trim();
  } catch (err) {
    // array data
    (data as ElementType[]).forEach((element: ElementType) => {
      if (element.type === "paragraph") {
        concatenatedText += element.text + " ";
      } else if (element.type === "heading") {
        concatenatedText += "\n\n" + element.text + "\n\n";
      }
    });
    return concatenatedText.trim();
  }
}

function cleanText(text: string): string {
  text = text.replace(/[^\w\s.]/g, "").replace(/\s+/g, " ");
  return text;
}

const _example = (question: string, summaries: SummaryData[]): string => {
  let prompt = `QUESTION: ${question}\n`;
  prompt += "CONTENT:\n";
  prompt += '"""\n';
  summaries.forEach((d: SummaryData, i: number) => {
    if (i > 0) {
      prompt += "\n";
    }
    prompt += `link [${i}]: ${d.link}\n`;
    prompt += `content: ${d.cleaned_text.replaceAll("\n", " ")}\n`;
  });
  prompt += '"""\n';
  return prompt;
};

async function SummaryGenerate(question: string, ans: string): Promise<string> {
  async function SummaryGenerateCall(
    question: string,
    ans: string,
    retry: number = 0
  ): Promise<string> {
    try {
      const payload = {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are an AI assistant providing helpful answers." },
          {
            role: "user",
            content: `You are given the following extracted parts of a long document and a question. Provide a conversational answer based on the context provided.You should only provide hyperlinks that reference the context below. Do NOT make up hyperlinks. If you can't find the answer in the context below, just say 'I can not find the proper answer to your question. Although I'm not entirely certain, I have provided some helpful links below for you to explore:' Don't try to make up an answer. If the question is not related to the context, politely respond that 'There is no answer to the question you asked but below are the links that might help you'.Question: ${question} ========= ${ans}=========`,
          },
        ],
        temperature: 0.7,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 1,
        max_tokens: 700,
        stream: false,
      };
      const response = await fetch("https://api.openai.com/v1/chat/completions",{
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
          },
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
      const jsonResponse = await response.json();
      return jsonResponse?.choices?.[0]?.message?.content||"";
    } catch (error) {
      if (retry < 2) {
        return SummaryGenerateCall(question, ans, retry + 1);
      } else {
        return "Currently server is overloaded with API calls, please try again later.";
      }
    }
  }

  return SummaryGenerateCall(question, ans);
}

async function getFinalAnswer(
  question: string,
  summary: string,
  content: SummaryData[]
): Promise<{ question: string; data: string }> {
  let data = summary.trim() + "\n\n";

  content.forEach((d: SummaryData, i: number) => {
    data += `[${i}]: ${d.link}\n`;
  });

  return { question: question, data };
}

export async function processInput(input: { question: string }[]): Promise<string> {
  try {
    const question = input[0].question;

    const keywords = await extractKeywords(question);

    const searchResults = await extractFromElasticsearch(keywords);

    const extractedContent = searchResults.slice(0, 3).map((result: Result) => {
      if (result.body_type.raw === "markdown") {
        return {
          title: result.title.raw,
          snippet: concatenateTextFields(result.body.raw),
          link: result.url.raw,
        };
      } else {
        return {
          title: result.title.raw,
          snippet: result.body.raw,
          link: result.url.raw,
        };
      }
    });

    const cleanedContent = extractedContent.map((content: Content) => ({
      title: cleanText(content.title),
      snippet: cleanText(content.snippet),
      link: content.link,
    }));

    const cleanedTextWithLink = cleanedContent.map((content: Content) => ({
      cleaned_text: content.snippet,
      link: content.link,
    }));

    const slicedTextWithLink = cleanedTextWithLink.map(
      (content: SummaryData) => ({
        cleaned_text: content.cleaned_text.slice(0, 2000),
        link: content.link,
      })
    );

    const prompt = _example(question, slicedTextWithLink);

    const summary = await SummaryGenerate(question, prompt);

    const finalAnswer = await getFinalAnswer(
      question,
      summary,
      slicedTextWithLink
    );

    return finalAnswer.data;
  } catch (error) {
    console.error(error);
    return "The system is overloaded with requests, can you please ask your question in 5 seconds again? Thank you!";
}
}

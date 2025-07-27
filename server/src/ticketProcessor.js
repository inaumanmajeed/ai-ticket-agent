import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

const llm = new ChatOpenAI({
  modelName: "deepseek/deepseek-chat-v3-0324:free",
  temperature: 1.2,
  maxTokens: 400,
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.DEEPSEEK_API_KEY,
  },
});

const CHECK_GREETING_PROMPT = PromptTemplate.fromTemplate(
  "Is the following user message mainly a greeting (like hello, hi, hey, good morning, etc) without any other question? Reply only 'Yes' or 'No'.\nMessage: {text}"
);

const GENERATE_GREETING_RESPONSE_PROMPT = PromptTemplate.fromTemplate(
  "The user greeted. Generate a short, friendly greeting introducing yourself as Mai, an AI agent that helps with ticketing and travel queries. Keep it concise and welcoming."
);

const RELEVANCE_PROMPT = PromptTemplate.fromTemplate(
  "Is this user query about airline ticketing, booking, flights, or travel support? Reply only 'Yes' or 'No'.\nQuery: {text}"
);

const CLASSIFY_PROMPT = PromptTemplate.fromTemplate(
  `Classify this query into one of these categories: Billing, Technical, Account, Other. 
Also estimate your confidence as High, Moderate, or Low. 
High = it's a clear ticket/travel related action (like buying, booking, canceling), 
Moderate = somewhat uncertain, 
Low = you have no clue or it's outside what you can help with.

Format your reply as: 'Category: Confidence'
Query: {text}`
);

const RESPONSE_PROMPT = PromptTemplate.fromTemplate(
  `You are Mai, a helpful AI support agent.

Given the category {category} and confidence {confidence}, 
reply to the user query.

- If confidence is High or Moderate, give a clear, friendly, structured answer. 
  Use bullet points or numbered steps to sort the information logically.
- If confidence is Low, respond exactly: "Your query is forwarded to our team, we will get back to you shortly."

Do NOT mention the category or confidence in your reply.
Only output the user-facing response.

Query: {text}`
);

export async function processTicketWithGraph(text) {
  // 1. Greeting check
  const checkGreeting = await CHECK_GREETING_PROMPT.format({ text });
  const isGreeting = (await llm.invoke(checkGreeting)).content
    .trim()
    .toLowerCase();
  if (isGreeting.startsWith("yes")) {
    const greetPrompt = await GENERATE_GREETING_RESPONSE_PROMPT.format({});
    const greetingResponse = await llm.invoke(greetPrompt);
    return {
      response: greetingResponse.content.trim(),
      confidence: "High",
      category: "Other",
    };
  }

  // 2. Check relevance
  const relevancePrompt = await RELEVANCE_PROMPT.format({ text });
  const isRelevant = (await llm.invoke(relevancePrompt)).content
    .trim()
    .toLowerCase();
  if (!isRelevant.startsWith("yes")) {
    return {
      response:
        "I'm here to assist with ticketing and travel-related queries. For other topics, please contact our general support team.",
      confidence: "Low",
      category: "Other",
    };
  }

  // 3. Classify
  const classifyPrompt = await CLASSIFY_PROMPT.format({ text });
  const classifyResult = await llm.invoke(classifyPrompt);
  const [categoryRaw, confidenceRaw] = classifyResult.content
    .split(/[:\-]/)
    .map((s) => s.trim());

  const category = categoryRaw || "Other";
  const confidence = confidenceRaw || "Low";

  // 4. Generate structured sorted response
  const responsePrompt = await RESPONSE_PROMPT.format({
    category,
    confidence,
    text,
  });
  const finalResponse = await llm.invoke(responsePrompt);

  return {
    response: finalResponse.content.trim(),
    confidence,
    category,
  };
}

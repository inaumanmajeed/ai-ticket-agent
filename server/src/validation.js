import { z } from "zod";

// Define the state schema
export const TicketStateSchema = z.object({
  text: z.string().default(""),
  summary: z.string().default(""),
  category: z.string().default(""),
  confidence: z.string().default(""),
  action: z.string().default(""),
  response: z.string().default(""),
  context: z.string().default(""),
  trace: z.record(z.any()).default({}),
});

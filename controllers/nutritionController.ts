import OpenAI from 'openai';
import type { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function getNutritionSummary(req: AuthRequest, res: Response) {
  try {
    const { text } = req.body || {};
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'text is required' });
    }

    const system =
      "You are a nutrition assistant. Based on the user's description, provide an estimated nutrition summary. " +
      'Respond with a short English paragraph (max 50 words) that includes total calories (kcal) and rough estimates of carbs/protein/fat (in grams). ' +
      'If quantities are unclear, make reasonable assumptions and mention 1-2 key assumptions in parentheses at the end. ' +
      'Do not output lists or JSON; avoid medical advice; keep the tone friendly and concise.';

    const user = `User's meal description: ${text}\nPlease output one paragraph directly.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      temperature: 0.2,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) return res.status(502).json({ error: 'no_content' });

    return res.json({ summary: content });
  } catch (err: any) {
    console.error(err);
    return res
      .status(500)
      .json({ error: 'server_error', detail: err?.message });
  }
}

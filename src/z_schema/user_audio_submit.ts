import z from "zod";

const audio_submit_schema = z.object({
  audio_id: z.number(),
  sentiment_tag: z.string(),
  emotional_intensity: z.string(),
});

export type AudioSubmit = z.infer<typeof audio_submit_schema>;

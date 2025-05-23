import { Hono } from "hono";
import {
  audio_file_metadata_schema,
  emotional_intensity_schema,
  sentiment_tag_schema,
} from "../db/schema.ts";
import { eq } from "drizzle-orm";
import { db } from "../db/index.ts";

const api = new Hono();

api.post("submission/:audio_id", async (c) => {
  //get audio_id from params
  const { audio_id } = c.req.param();
  // get emotional_intensity and sentiment_tag from query and match with db ids
  const { emotion: sentiment_tag, intensity: emotional_intensity } =
    await c.req.parseBody();

  if (!sentiment_tag || !emotional_intensity) {
    return c.text("Missing required fields", 400);
  }

  if (
    typeof sentiment_tag !== "string" ||
    typeof emotional_intensity !== "string"
  ) {
    return c.text("Invalid data types", 400);
  }

  const sentiment_tag_id = await db
    .select({ id: sentiment_tag_schema.id })
    .from(sentiment_tag_schema)
    .where(eq(sentiment_tag_schema.tag, sentiment_tag));

  const emotional_intensity_id = await db
    .select({ id: emotional_intensity_schema.id })
    .from(emotional_intensity_schema)
    .where(eq(emotional_intensity_schema.intensity, emotional_intensity));

  if (sentiment_tag_id.length === 0 || emotional_intensity_id.length === 0) {
    return c.text("Invalid sentiment tag or emotional intensity", 400);
  }
  // insert into audio_file_metadata
  try {
    await db.insert(audio_file_metadata_schema).values({
      file_id: Number(audio_id),
      sentiment_tag_id: sentiment_tag_id[0].id,
      emotional_intensity_id: emotional_intensity_id[0].id,
    });

    return c.redirect("/", 302);
  } catch (error) {
    console.error("Error inserting metadata:", error);
    return c.text("Failed to insert metadata", 500);
  }
  //   // return success or error
});

export default api;

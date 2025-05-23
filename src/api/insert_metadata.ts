import { eq } from "drizzle-orm";
import { db } from "../db/index.ts";
import {
  emotional_intensity_schema,
  sentiment_tag_schema,
  audio_file_metadata_schema,
} from "../db/schema.ts";
import { AudioSubmit } from "../z_schema/user_audio_submit.ts";

export async function insert_metadata(
  submission: AudioSubmit
): Promise<"success" | Error> {
  const { audio_id, sentiment_tag, emotional_intensity } = submission;

  let sentiment_tag_id: number;
  let emotional_intensity_id: number;

  try {
    sentiment_tag_id = (
      await db
        .select({ id: sentiment_tag_schema.id })
        .from(sentiment_tag_schema)
        .where(eq(sentiment_tag_schema.tag, sentiment_tag))
    )[0].id;

    emotional_intensity_id = (
      await db
        .select({ id: emotional_intensity_schema.id })
        .from(emotional_intensity_schema)
        .where(eq(emotional_intensity_schema.intensity, emotional_intensity))
    )[0].id;
  } catch (error) {
    console.error("Error fetching IDs:", error);
    return new Error(
      "Failed to fetch IDs for sentiment tag or emotional intensity"
    );
  }
  try {
    await db.insert(audio_file_metadata_schema).values({
      file_id: audio_id,
      sentiment_tag_id: sentiment_tag_id,
      emotional_intensity_id: emotional_intensity_id,
    });
  } catch (error) {
    console.error("Error inserting metadata:", error);
    return new Error("Failed to insert metadata");
  }

  return "success";
}

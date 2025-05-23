import { foreignKey, integer, timestamp, varchar } from "drizzle-orm/pg-core";
import { pgSchema } from "drizzle-orm/pg-core";

export const auth = pgSchema("auth");
export const training_data = pgSchema("training_data");

export const authentication_phrase_schema = auth.table(
  "authentication_phrase",
  {
    id: integer("id").primaryKey().notNull().generatedAlwaysAsIdentity(),
    phrase: varchar("phrase", { length: 255 }).notNull(),
    created_at: timestamp("created_at", { precision: 6 })
      .defaultNow()
      .notNull()
      .$type<Date>(),
  }
);

export const audio_file_schema = training_data.table("audio_file", {
  id: integer("id").primaryKey().notNull().generatedAlwaysAsIdentity(),
  file_name: varchar("file_name", { length: 255 }).notNull(),
});

export const sentiment_tag_schema = training_data.table("sentiment_tag", {
  id: integer("id").primaryKey().notNull().generatedAlwaysAsIdentity(),
  tag: varchar("tag", { length: 255 }).notNull(),
});

export const audio_file_location_schema = training_data.table(
  "audio_file_location",
  {
    id: integer("id").primaryKey().notNull().generatedAlwaysAsIdentity(),
    file_id: integer("file_id").notNull(),
    bucket_url: varchar("bucket_url", { length: 255 }).notNull(),
    bucket_path: varchar("location", { length: 255 }).notNull(),
    created_at: timestamp("created_at", { precision: 6 })
      .defaultNow()
      .notNull()
      .$type<Date>(),
  },
  (table) => [
    foreignKey({
      columns: [table.file_id],
      foreignColumns: [audio_file_schema.id],
      name: "fk_audio_file_location_file_id",
    }),
  ]
);

export const emotional_intensity_schema = training_data.table(
  "emotional_intensity",
  {
    id: integer("id").primaryKey().notNull().generatedAlwaysAsIdentity(),
    intensity: varchar("intensity", { length: 255 }).notNull(),
  }
);

export const audio_file_metadata_schema = training_data.table(
  "audio_file_metadata",
  {
    id: integer("id").primaryKey().notNull().generatedAlwaysAsIdentity(),
    file_id: integer("file_id"),
    sentiment_tag_id: integer("sentiment_tag_id").notNull(),
    emotional_intensity_id: integer("emotional_intensity_id").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.file_id],
      foreignColumns: [audio_file_schema.id],
      name: "fk_audio_file_metadata_file_id",
    }),
    foreignKey({
      columns: [table.sentiment_tag_id],
      foreignColumns: [sentiment_tag_schema.id],
      name: "fk_audio_file_metadata_sentiment_tag_id",
    }),
    foreignKey({
      columns: [table.emotional_intensity_id],
      foreignColumns: [emotional_intensity_schema.id],
      name: "fk_audio_file_metadata_emotional_intensity_id",
    }),
  ]
);

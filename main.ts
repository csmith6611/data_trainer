import { eq, isNull } from "drizzle-orm";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import type {} from "hono/jsx"; // Import JSX types for Hono
import { sign } from "hono/jwt";
import api from "./src/api/route.ts";
import { auth_middleware } from "./src/auth_middleware/index.ts";
import { db } from "./src/db/index.ts";
import {
  audio_file_metadata_schema,
  audio_file_schema,
  authentication_phrase_schema,
} from "./src/db/schema.ts";
import page from "./src/page/route.tsx";

const app = new Hono();
app.use("/*", auth_middleware);

app.route("/api", api);

app.route("/page", page);

app.use("/", async (c) => {
  const audio_id = await db
    .select({ id: audio_file_schema.id })
    .from(audio_file_schema)
    .leftJoin(
      audio_file_metadata_schema,
      eq(audio_file_metadata_schema.file_id, audio_file_schema.id)
    )
    .where(isNull(audio_file_metadata_schema.file_id))
    .limit(1);

  if (audio_id.length === 0) {
    return c.text("No audio files available for tagging", 404);
  }

  return c.redirect(`/page/${audio_id[0].id}`, 302);
});

app.use("/auth/login", async (c) => {
  const { promo, h } = await c.req.parseBody();

  if (h) {
    return c.redirect("/page/login", 302);
  }

  if (typeof promo !== "string") {
    return c.redirect("/page/login", 302);
  }

  const is_valid_promo = await db
    .select()
    .from(authentication_phrase_schema)
    .where(eq(authentication_phrase_schema.phrase, promo));

  if (is_valid_promo.length === 0) {
    return c.redirect("/page/invalid", 302);
  }

  const payload = { promo, exp: Date.now() + 60 * 60 * 1000 };

  const secret = Deno.env.get("JWT_SECRET") ?? "";

  const token = await sign(payload, secret);

  setCookie(c, "data_trainer_auth", token, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    maxAge: 60 * 60,
  });

  return c.redirect("/", 302);
});

Deno.serve({ port: Number(Deno.env.get("PORT") ?? 5000) }, app.fetch);

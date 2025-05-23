import { verify } from "hono/jwt";
import { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";

export const auth_middleware: MiddlewareHandler = async (c, next) => {
  const token = getCookie(c, "data_trainer_auth");
  if (!token) {
    switch (c.req.path) {
      case "/page/login":
        return await next();
      case "/auth/login":
        return await next();
      default:
        return c.redirect("/page/login", 302);
    }
  }

  try {
    await verify(token, Deno.env.get("JWT_SECRET") ?? "");

    return await next();
  } catch (err) {
    console.error(err);
    return c.json({ message: "Unauthorized" }, 401);
  }
};

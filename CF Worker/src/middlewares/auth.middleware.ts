import { createMiddleware } from "hono/factory";
import { verify } from "hono/utils/jwt/jwt";
import {
  JWTPayload,
  JwtTokenExpired,
  JwtTokenInvalid,
  JwtTokenSignatureMismatched,
} from "hono/utils/jwt/types";

export const authenticateClient = createMiddleware(async (c, next) => {
  try {
    // Fetch the token
    const token = c.req.header("Authorization");
    // Checking presence of the token
    if (!token) {
      return c.json({ message: "Unauthorized - No token provided" }, 400);
    }
    // Verify the token
    const payload = (await verify(token, c.env.JWT_SECRET)) as JWTPayload & {
      id: string;
    };
    // Set the senderId
    c.set("senderId", payload.id);
    // next
    await next();
  } catch (error: any) {
    if (
      error instanceof JwtTokenExpired ||
      error instanceof JwtTokenInvalid ||
      error instanceof JwtTokenSignatureMismatched
    ) {
      return c.json({ message: "Unauthorized - Invalid token" }, 401);
    } else {
      console.log("Error in authenticateClient middleware: ", error.message);
      return c.json({ message: "Internal server error" }, 500);
    }
  }
});

export const authenticateWebhook = createMiddleware(async (c, next) => {
  try {
    // Fetch the webhook secret
    const whsecret = c.req.param("whsecret");
    // Validate the webhook secret
    if (c.env.WH_SECRET !== whsecret) {
      return c.json({ messsage: "Unauthorized" }, 400);
    }
    // next
    await next();
  } catch (error: any) {
    console.log("Error in authenticateWebhook middleware: " + error.message);
    return c.json({ message: "Internal server error." }, 500);
  }
});
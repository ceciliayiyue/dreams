import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./lib/auth";
import { db } from "./db";
import { dreams } from "./db/schema";
import { eq } from "drizzle-orm";

const app = new Hono();

// Enable CORS
app.use(
  "/*",
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Auth routes
app.post("/api/auth/signup", async (c) => {
  const { username, password } = await c.req.json();
  
  // Validate input lengths
  if (username.length < 3) {
    return c.json({ error: "Username must be at least 3 characters" }, 400);
  }
  if (password.length < 6) {
    return c.json({ error: "Password must be at least 6 characters" }, 400);
  }

  try {
    const user = await auth.createUser({
      username,
      password,
      name: username,
    });
    return c.json({ user });
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Failed to create user" }, 400);
  }
});

app.post("/api/auth/login", async (c) => {
  const { username, password } = await c.req.json();
  try {
    const session = await auth.signIn("credentials", {
      username,
      password,
    });
    return c.json({ session });
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 401);
    }
    return c.json({ error: "Invalid credentials" }, 401);
  }
});

app.post("/api/auth/logout", async (c) => {
  const session = await auth.getSession(c.req);
  if (session) {
    await auth.signOut(session.id);
  }
  return c.json({ success: true });
});

// Protected route example
app.get("/api/me", async (c) => {
  const session = await auth.getSession(c.req);
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const user = await auth.getUser(session.userId);
  return c.json({ user });
});

// Dream routes
app.post("/api/dreams", async (c) => {
  const session = await auth.getSession(c.req);
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { title, content, dreamDate } = await c.req.json();
  try {
    const [dream] = await db.insert(dreams).values({
      title,
      content,
      dreamDate: new Date(dreamDate),
      userId: session.userId,
    }).returning();
    return c.json({ dream });
  } catch (error) {
    return c.json({ error: "Failed to create dream" }, 400);
  }
});

app.get("/api/dreams", async (c) => {
  const session = await auth.getSession(c.req);
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const userDreams = await db.select().from(dreams).where(eq(dreams.userId, session.userId));
    return c.json({ dreams: userDreams });
  } catch (error) {
    return c.json({ error: "Failed to fetch dreams" }, 400);
  }
});

app.put("/api/dreams/:id", async (c) => {
  const session = await auth.getSession(c.req);
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const id = c.req.param("id");
  const { title, content, dreamDate } = await c.req.json();

  try {
    const [dream] = await db.update(dreams)
      .set({
        title,
        content,
        dreamDate: new Date(dreamDate),
        updatedAt: new Date(),
      })
      .where(eq(dreams.id, id))
      .where(eq(dreams.userId, session.userId))
      .returning();

    if (!dream) {
      return c.json({ error: "Dream not found" }, 404);
    }

    return c.json({ dream });
  } catch (error) {
    return c.json({ error: "Failed to update dream" }, 400);
  }
});

app.post("/api/dreams/:id/interpret", async (c) => {
  const session = await auth.getSession(c.req);
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const id = c.req.param("id");
  const { interpretation } = await c.req.json();

  try {
    const [dream] = await db.select().from(dreams)
      .where(eq(dreams.id, id))
      .where(eq(dreams.userId, session.userId));

    if (!dream) {
      return c.json({ error: "Dream not found" }, 404);
    }

    const newInterpretation = {
      content: interpretation,
      createdAt: new Date(),
      isSaved: false
    };

    const updatedInterpretations = [...(dream.interpretations || []), newInterpretation];

    const [updatedDream] = await db.update(dreams)
      .set({
        interpretations: updatedInterpretations,
        updatedAt: new Date(),
      })
      .where(eq(dreams.id, id))
      .returning();

    return c.json({ dream: updatedDream });
  } catch (error) {
    return c.json({ error: "Failed to add interpretation" }, 400);
  }
});

app.put("/api/dreams/:id/interpretations/:index/save", async (c) => {
  const session = await auth.getSession(c.req);
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const id = c.req.param("id");
  const index = parseInt(c.req.param("index"));

  try {
    const [dream] = await db.select().from(dreams)
      .where(eq(dreams.id, id))
      .where(eq(dreams.userId, session.userId));

    if (!dream) {
      return c.json({ error: "Dream not found" }, 404);
    }

    const interpretations = [...dream.interpretations];
    if (interpretations[index]) {
      interpretations[index] = {
        ...interpretations[index],
        isSaved: true
      };
    }

    const [updatedDream] = await db.update(dreams)
      .set({
        interpretations,
        updatedAt: new Date(),
      })
      .where(eq(dreams.id, id))
      .returning();

    return c.json({ dream: updatedDream });
  } catch (error) {
    return c.json({ error: "Failed to save interpretation" }, 400);
  }
});

const port = process.env.PORT || 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port: Number(port),
}); 
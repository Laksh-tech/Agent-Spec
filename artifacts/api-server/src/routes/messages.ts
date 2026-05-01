import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { requireAuth, getAuth } from "@clerk/express";
import { CreateMessageBody } from "@workspace/api-zod";
import { db, messagesTable } from "@workspace/db";
import { sendVisitorMessage, OWNER_EMAIL } from "../lib/mailer";

const router: IRouter = Router();

router.post("/messages", async (req, res) => {
  const parsed = CreateMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input." });
    return;
  }
  const { name, email, body } = parsed.data;

  const [row] = await db
    .insert(messagesTable)
    .values({ name, email: email ?? null, body })
    .returning({ id: messagesTable.id });

  const delivered = await sendVisitorMessage({ name, email, body });

  if (delivered) {
    await db
      .update(messagesTable)
      .set({ delivered: true })
      .where(eq(messagesTable.id, row.id));
  }

  req.log.info({ id: row.id, delivered }, "Message stored");
  res.status(201).json({ id: row.id, delivered });
});

router.get("/messages", requireAuth(), async (req, res) => {
  const auth = getAuth(req);
  const claims = (auth as unknown as { sessionClaims?: Record<string, unknown> })
    .sessionClaims ?? {};
  const userEmail = ((claims.email as string) ?? "").toLowerCase();

  if (userEmail !== OWNER_EMAIL.toLowerCase()) {
    res.status(403).json({ error: "Only the portfolio owner can read messages." });
    return;
  }

  const rows = await db
    .select()
    .from(messagesTable)
    .orderBy(desc(messagesTable.createdAt))
    .limit(200);

  res.json({
    messages: rows.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
      delivered: m.delivered,
    })),
  });
});

export default router;

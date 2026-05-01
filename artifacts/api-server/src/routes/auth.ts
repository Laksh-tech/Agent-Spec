import { Router, type IRouter, type Request, type Response } from "express";
import { getAuth } from "@clerk/express";

const router: IRouter = Router();

router.get("/auth/user", (req: Request, res: Response) => {
  const auth = getAuth(req);
  if (!auth.userId) {
    res.json({ user: null });
    return;
  }

  const claims = (auth as unknown as { sessionClaims?: Record<string, unknown> })
    .sessionClaims ?? {};

  res.json({
    user: {
      id: auth.userId,
      email: (claims.email as string) ?? null,
      firstName: (claims.first_name as string) ?? null,
      lastName: (claims.last_name as string) ?? null,
      profileImageUrl: (claims.image_url as string) ?? null,
    },
  });
});

export default router;

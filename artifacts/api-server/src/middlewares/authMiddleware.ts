import { clerkMiddleware, requireAuth, getAuth } from "@clerk/express";
import { type Request, type Response, type NextFunction } from "express";

export { clerkMiddleware, requireAuth, getAuth };

declare global {
  namespace Express {
    interface Request {
      isAuthenticated(): boolean;
      user?: { id: string; email: string | null };
    }
  }
}

export function attachUser(req: Request, _res: Response, next: NextFunction) {
  const auth = getAuth(req);
  req.isAuthenticated = () => !!auth.userId;
  if (auth.userId) {
    req.user = {
      id: auth.userId,
      email: (auth as unknown as { sessionClaims?: { email?: string } })
        .sessionClaims?.email ?? null,
    };
  }
  next();
}

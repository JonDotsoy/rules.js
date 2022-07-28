# Security Rules API

Grant access through a central control.

**Sample**

```ts
import { createRules } from "bylaw";

// ./rules.ts
interface RuleInput {
  auth?: {
    uid: string
    role: string
  }
  resource?: {
    ownerId: string
  }
}

export const rules = createRules({
  "authorized": (input: RuleInput) => Boolean(input.auth),
  "pacman": (input: RuleInput) => Boolean(input.auth),
  "pacman:create": (input: RuleInput) => input.auth?.role === "admin",
  "pacman:delete": (input: RuleInput) => input.auth?.role === "admin",
  "profile:read": (input: RuleInput) => true,
  "profile:update": (input: RuleInput) => Boolean(input.auth) && input.resource?.ownerId === input.auth?.uid,
});
```

## Handler Solution

This is a sample solution to make a middleware protector to express.

```ts
import express from "express";
import { Unauthorized } from 'http-errors';
import { evaluate } from "bylaw";
import { rules } from "./rules.ts";

function protectMiddleware(rule: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Capture the authorization token
    const token = req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.substring(7) : undefined;

    // Use JWT to decode and verify token
    const auth = token ? jwt.verify(token) : undefined;

    // make the rule input 
    const ruleInput = { auth };

    // If the evaluation is true continue
    if (evaluate(rules, rule, ruleInput)) return next();
    return next(new Unauthorized('Invalid token 😉'));
  };
}

const app = express()

app.get("/pacman/:pacmanId", protectMiddleware("pacman"), readPacmanHandler);
app.put("/pacman/:pacmanId", protectMiddleware("pacman:create"), createPacmanHandler);
app.delete("/pacman/:pacmanId", protectMiddleware("pacman:delete"), deletePacmanHandler);
app.get("/profile/:profileId", protectMiddleware("profile:read"), readProfileHandler);

// Advance solution
app.update("/profile/:profileId", protectMiddleware("authorized"), (req: Request, res: Response, next: NextFunction) => {
  const profile = profileRepository.findById(req.params.profileId);

  // Capture the authorization token
  const token = req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.substring(7) : undefined;

  // Use JWT to decode and verify token
  const auth = token ? jwt.verify(token) : undefined;

  // make the rule input 
  const ruleInput = { auth, resource: profile };

  if (!evaluate(rules, "profile:update", ruleInput)) return next(new Unauthorized('Invalid token 😉'));

  const profileUpdated = profileRepository.updateById(req.params.profileId, req.body);
  return res.status(202).json(profileUpdated);
});
```

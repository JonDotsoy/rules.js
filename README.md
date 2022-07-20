# Security Rules API

Grant access through a central control.

**Sample**

```ts
const rules = createRules({
  "pacman": token => token.role === "admin",
  "pacman2:create": token => token.role === "admin",
});

rules.pacman.test({ role: "admin" }); // true
rules.pacman.test({ role: "guest" }); // false
rules.pacman.test({}); // false
rules.pacman.test(); // false
rules.pacman2.test() // true
rules.pacman2.testCreate() // false
rules.pacman2.testCreate({ role: "admin" }) // true
```

## Handler Solution

This is a sample solution to make a middleware protector.

```ts
import { Unauthorized } from 'http-errors';

const rules = createRules({
  isAdmin: auth => auth.isAdmin === true,
});

function protectMiddleware(rule: string) {
  return (req: e.Request, res: e.Response, next: e.NextFunction) => {
    if (rules('isAdmin').test(req.auth)) return next();
    return next(new Unauthorized('Invalid token 😉'));
  };
}
```

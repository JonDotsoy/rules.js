# Security Rules API

Grant access through a central control.

**Sample**

```ts
const rules = createRules({
  "pacman": token => token.role === "admin",
  "pacman2": {
    "read": true,
    "create": token => token.role === "admin",
  },
});

rules.pacman.test({ role: "admin" }); // true
rules.pacman.test({ role: "guest" }); // false
rules.pacman.test({}); // false
rules.pacman.test(); // false
rules.pacman2.test() // true
rules.pacman2.testCreate() // false
rules.pacman2.testCreate({ role: "admin" }) // true
```

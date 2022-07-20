import { strictEqual } from 'assert';
import { createRules, evaluate } from './index';

interface Token {
  role?: string
}

const rules = createRules({
  pacman: (token: Token) => token.role === "admin",
  "pacman2:create": (token: Token) => token.role === "admin",
});

strictEqual(true, evaluate(rules, 'pacman', { role: "admin" }));
strictEqual(false, evaluate(rules, 'pacman', { role: "guest" }));
strictEqual(false, evaluate(rules, 'pacman', {}));
strictEqual(false, evaluate(rules, 'pacman', undefined));
strictEqual(true, evaluate(rules, 'pacman2:create', { role: "admin" }));

console.log('[all ok]');

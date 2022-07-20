import { strictEqual } from 'assert';
import { createRules, evaluate } from './index';

interface Token {
  role: string
}

const rules = createRules({
  pacman: (token: Token) => token.role === "admin",
  "pacman2:create": (token: Token) => token.role === "admin",
  "err": (_token: Token) => { throw new Error('fail') },
});

strictEqual(true, evaluate(rules, 'pacman', { role: "admin" }));
strictEqual(false, evaluate(rules, 'pacman', { role: "guest" }));
strictEqual(true, evaluate(rules, 'pacman2:create', { role: "admin" }));
strictEqual(false, evaluate(rules, 'err', { role: "admin" }));

console.log('[all ok]');

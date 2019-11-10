import { strictEqual } from 'assert';
import { createRules, test } from '.';

test('read', true, {});

const rules = createRules<{ role: string, uid?: string }, 'pacman' | 'pacman2'>({
  pacman: token => token.role === "admin",
  pacman2: {
    create: token => token.role === "admin",
    read: true,
  },
});

strictEqual(true, rules.pacman.test({ role: "admin" }));
strictEqual(false, rules.pacman.test({ role: "guest" }));
strictEqual(false, rules.pacman.test({}));
strictEqual(false, rules.pacman.test());
strictEqual(true, rules.pacman2.test());
strictEqual(false, rules.pacman2.testCreate());
strictEqual(true, rules.pacman2.testCreate({ role: "admin" }));

console.log('[all ok]');

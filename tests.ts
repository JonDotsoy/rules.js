import * as assert from 'assert';
import * as bylawSync from './sync';
import * as bylawAsync from './async';
import * as t from "node:test";



t.test("apply bylaw module with role strategy", async t => {
  interface Token {
    role: string
  }

  await t.test("rules sync", async t => {
    const rulesSync = bylawSync.createRules({
      isAdmin: (token: Token) => token.role === "admin",
      isProfile: (token: Token) => token.role === "profile",
      isGuest: (token: Token) => token.role === "guest",
    });

    await t.test("Evaluate rule 1", async () => {
      assert.strictEqual(true, bylawSync.evaluate(rulesSync, 'isAdmin', { role: "admin" }));
    })

    await t.test("Evaluate rule 2", async () => {
      assert.strictEqual(false, bylawSync.evaluate(rulesSync, 'isAdmin', { role: "guest" }));
    })

    await t.test("Evaluate some rule", async () => {
      assert.strictEqual(true, bylawSync.evaluateMany(rulesSync, ['isAdmin', 'isProfile'], { role: "profile" }));
      assert.strictEqual(false, bylawSync.evaluateMany(rulesSync, ['isAdmin', 'isProfile'], { role: "guest" }));
    })

  })

  await t.test("rules async", async t => {

    const rulesAsync = bylawAsync.createRules({
      isAdmin: async (token: Token) => token.role === "admin",
      isProfile: async (token: Token) => token.role === "profile",
    });


    await t.test("Evaluate rule 1", async () => {
      assert.strictEqual(true, await bylawAsync.evaluate(rulesAsync, 'isAdmin', { role: "admin" }));
    })

    await t.test("Evaluate rule 2", async () => {
      assert.strictEqual(false, await bylawAsync.evaluate(rulesAsync, 'isAdmin', { role: "guest" }));
    })

    await t.test("Evaluate some rule", async () => {
      assert.strictEqual(true, await bylawAsync.evaluateMany(rulesAsync, ['isAdmin', 'isProfile'], { role: "profile" }));
      assert.strictEqual(false, await bylawAsync.evaluateMany(rulesAsync, ['isAdmin', 'isProfile'], { role: "guest" }));
    })
  })

});

t.test("apply bylaw module with actions strategy", async t => {
  interface Token {
    uid: string
    role: string
    resourceOwner: string
  }

  await t.test("rules sync", async t => {
    const rulesSync = bylawSync.createRules({
      ReadDoc: (token: Token) =>
        !!token.uid,
      WriteDoc: (token: Token) =>
        token.role === "admin"
        || token.resourceOwner == token.uid,
      DeleteDoc: (token: Token) =>
        token.role === "admin"
        || token.resourceOwner == token.uid,
    });

    await t.test("Evaluate rule read doc", async () => {
      assert.strictEqual(true, bylawSync.evaluate(rulesSync, 'ReadDoc', { role: "profile", uid: 'b', resourceOwner: 'a' }));
    })

    await t.test("Evaluate rule write doc", async () => {
      assert.strictEqual(true, bylawSync.evaluate(rulesSync, 'WriteDoc', { role: "profile", uid: 'a', resourceOwner: 'a' }));
      assert.strictEqual(false, bylawSync.evaluate(rulesSync, 'WriteDoc', { role: "profile", uid: 'a', resourceOwner: 'b' }));
      assert.strictEqual(true, bylawSync.evaluate(rulesSync, 'WriteDoc', { role: "admin", uid: 'a', resourceOwner: 'b' }));
    })

  })

  await t.test("rules async", async t => {
    const rulesAsync = bylawAsync.createRules({
      ReadDoc: async (token: Token) =>
        !!token.uid,
      WriteDoc: async (token: Token) =>
        token.role === "admin"
        || token.resourceOwner == token.uid,
      DeleteDoc: async (token: Token) =>
        token.role === "admin"
        || token.resourceOwner == token.uid,
    });

    await t.test("Evaluate rule read doc", async () => {
      assert.strictEqual(true, await bylawAsync.evaluate(rulesAsync, 'ReadDoc', { role: "profile", uid: 'b', resourceOwner: 'a' }));
    })

    await t.test("Evaluate rule write doc", async () => {
      assert.strictEqual(true, await bylawAsync.evaluate(rulesAsync, 'WriteDoc', { role: "profile", uid: 'a', resourceOwner: 'a' }));
      assert.strictEqual(false, await bylawAsync.evaluate(rulesAsync, 'WriteDoc', { role: "profile", uid: 'a', resourceOwner: 'b' }));
      assert.strictEqual(true, await bylawAsync.evaluate(rulesAsync, 'WriteDoc', { role: "admin", uid: 'a', resourceOwner: 'b' }));
    })
  })

  await t.test("rules async 2", async t => {
    const rulesAsync = bylawAsync.createRules({
      Doc: async (token: Token) =>
        token.role === "admin",
      ReadDoc: async (token: Token) =>
        !!token.uid,
      WriteDoc: async (token: Token) =>
        token.resourceOwner == token.uid,
      DeleteDoc: async (token: Token) =>
        token.resourceOwner == token.uid,
    });

    await t.test("Evaluate some rule", async () => {
      assert.strictEqual(true, await bylawAsync.evaluateMany(rulesAsync, ['Doc', 'ReadDoc'], { role: "profile", uid: 'b', resourceOwner: 'a' }));
      assert.strictEqual(false, await bylawAsync.evaluateMany(rulesAsync, ['Doc', 'WriteDoc'], { role: "profile", uid: 'b', resourceOwner: 'a' }));
      assert.strictEqual(true, await bylawAsync.evaluateMany(rulesAsync, ['Doc', 'WriteDoc'], { role: "profile", uid: 'a', resourceOwner: 'a' }));
      assert.strictEqual(true, await bylawAsync.evaluateMany(rulesAsync, ['Doc', 'WriteDoc'], { role: "admin", uid: 'b', resourceOwner: 'a' }));
      assert.strictEqual(true, await bylawAsync.evaluateMany(rulesAsync, ['Doc', 'DeleteDoc'], { role: "profile", uid: 'a', resourceOwner: 'a' }));
      assert.strictEqual(true, await bylawAsync.evaluateMany(rulesAsync, ['Doc', 'DeleteDoc'], { role: "admin", uid: 'b', resourceOwner: 'a' }));
    })
  })

});


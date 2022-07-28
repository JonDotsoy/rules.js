import { RuleName, RulesSync, EvaluatorSync } from "./types";

export function createRules<T extends RuleName, P>(rules: RulesSync<T, P>): RulesSync<T, P> {
  return rules;
}

export function evaluateSync<T extends RuleName, P>(rules: RulesSync<T, P>, ruleName: RuleName, payload: P) {
  let getEvaluate = (rules: Record<RuleName, EvaluatorSync<any>>, ruleName: RuleName) => ruleName in rules && typeof rules[ruleName] === "function" ? rules[ruleName] : undefined;

  return getEvaluate(rules, ruleName)?.(payload) ?? false;
}

export function evaluateManySync<T extends RuleName, P>(rules: RulesSync<T, P>, rulesName: RuleName[], payload: P) {
  let getEvaluate = (rules: Record<RuleName, EvaluatorSync<any>>, ruleName: RuleName) => ruleName in rules && typeof rules[ruleName] === "function" ? rules[ruleName] : undefined;

  for (const ruleName of rulesName) {
    if (getEvaluate(rules, ruleName)?.(payload) ?? false) return true;
  }

  return false;
}

export const evaluate = evaluateSync;
export const evaluateMany = evaluateManySync;

import { RuleName, RulesAsync, EvaluatorAsync } from "./types";

export function createRules<T extends RuleName, P>(rules: RulesAsync<T, P>): RulesAsync<T, P> {
  return rules;
}

export function evaluateSync<T extends RuleName, P>(rules: RulesAsync<T, P>, ruleName: RuleName, payload: P) {
  let getEvaluate = (rules: Record<RuleName, EvaluatorAsync<any>>, ruleName: RuleName) => ruleName in rules && typeof rules[ruleName] === "function" ? rules[ruleName] : undefined;

  return getEvaluate(rules, ruleName)?.(payload) ?? false;
}

export async function evaluateManySync<T extends RuleName, P>(rules: RulesAsync<T, P>, rulesName: RuleName[], payload: P) {
  let getEvaluate = (rules: Record<RuleName, EvaluatorAsync<any>>, ruleName: RuleName) => ruleName in rules && typeof rules[ruleName] === "function" ? rules[ruleName] : undefined;

  for (const ruleName of rulesName) {
    if (await getEvaluate(rules, ruleName)?.(payload) ?? false) return true;
  }

  return false;
}

export const evaluate = evaluateSync;
export const evaluateMany = evaluateManySync;

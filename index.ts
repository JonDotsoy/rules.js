
export type RuleName = string | symbol;
export type Evaluator<T> = (payload: T) => boolean;
export type Rules<T extends RuleName, Payload> = Record<T, Evaluator<Payload>>

export class RuleError extends Error {

}

export function createRules<T extends RuleName, P>(rules: Rules<T, P>): Rules<T, P> {
  return rules;
}

export function evaluateSafe<T extends RuleName, P>(rules: Rules<T, P>, ruleName: RuleName, payload: P) {
  let getEvaluate = (rules: Record<RuleName, Evaluator<any>>, ruleName: RuleName) => ruleName in rules && typeof rules[ruleName] === "function" ? rules[ruleName] : undefined;

  return getEvaluate(rules, ruleName)?.(payload) ?? false;
}

export const evaluate = evaluateSafe;

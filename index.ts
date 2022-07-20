
export type RuleName = string | symbol;
export type Evaluator<T> = (payload: T) => boolean;
export type Rules<T extends RuleName, Payload> = Record<T, Evaluator<Payload>>

export class RuleError extends Error {

}

export function createRules<T extends RuleName, P>(rules: Rules<T, P>): Rules<T, P> {
  return rules;
}

export function evaluate<T extends RuleName, P>(rules: Rules<T, P>, ruleName: RuleName, payload: unknown) {
  let hasRule = <K extends RuleName>(rules: Rules<RuleName, any>, ruleName: K): rules is Rules<K, any> => ruleName in rules;
  if (hasRule(rules, ruleName)) {
    try {
      return rules[ruleName](payload);
    } catch {
      return false;
    }
  } else {
    return false;
  }
}

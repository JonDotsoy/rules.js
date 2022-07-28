export type RuleName = string | symbol;
export type EvaluatorSync<T> = (payload: T) => boolean;
export type EvaluatorAsync<T> = (payload: T) => Promise<boolean>;
export type RulesSync<T extends RuleName, Payload> = Record<T, EvaluatorSync<Payload>>
export type RulesAsync<T extends RuleName, Payload> = Record<T, EvaluatorAsync<Payload>>

export class RuleError extends Error {}

import {
  isObject,
  isArray
} from './util/types';
import { Index } from "./types";
import { recoverPattern } from "./recover-pattern.selector";
import { isPatternInclude, isPatternInlinePush, isPatternMatch, Pattern, PatternBase, PatternType } from './Pattern';
import { Ref } from './types/ref.type';
import { getValueById } from './index-async-local-storage';
import { strToExp } from './util/str-to-regexp';

const isNotNull = <T>(v: T): v is Exclude<T, null> => v !== null

export function* recoverPatterns(intentPatterns: any): Generator<Pattern<PatternType.inline_push | PatternType.match>> {
  if (isObject(intentPatterns) && isArray(intentPatterns.patterns)) {
    for (const intentPattern of intentPatterns.patterns) {
      if (isPatternMatch(intentPattern)) {
        yield {
          ...intentPattern,
          match: strToExp(intentPattern.match),
        }
      }
      if (isPatternInlinePush(intentPattern)) {
        yield {
          ...intentPattern,
          begin: strToExp(intentPattern.begin),
          end: strToExp(intentPattern.end),
        };
      }
      if (isPatternInclude(intentPattern)) {
        const value = getValueById(intentPattern.include);
        if (value) {
          yield* recoverPatterns(value);
        }
      }
    }
  }

  return null;
}

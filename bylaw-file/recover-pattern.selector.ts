import {
  isObject
} from './util/types';
import { Index } from "./types";
import { isPatternInclude, isPatternInlinePush, isPatternMatch } from './Pattern';
import { strToExp } from './util/str-to-regexp';

export function* recoverPattern(index: Index, intentPattern: any) {
  console.log('recoverPattern', intentPattern);

  if (isObject(intentPattern)) {
    if (isPatternMatch(intentPattern)) {
      return {
        ...intentPattern,
        match: strToExp(intentPattern.match),
      };
    }
    if (isPatternInlinePush(intentPattern)) {
      return intentPattern;
    }
    if (isPatternInclude(intentPattern)) {
      return index.get(intentPattern.include.substring(1));
    }
  }
  return null;
}

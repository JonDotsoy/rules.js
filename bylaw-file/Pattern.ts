import { isRegExp } from "util/types";
import { isString, isStringOrRegExp, Obj } from "./util/types"

export enum PatternType {
  match,
  inline_push,
  include,
}

export interface Capture {
  [key: string]: {
    name: string,
  },
}

export type Pattern<T extends PatternType = PatternType> =
  T extends PatternType.match ? {
    // pattern match
    match: RegExp;
    name: string;
  } :
  T extends PatternType.inline_push ? {
    // pattern inline_push
    begin: RegExp
    beginCaptures: Capture
    patterns: PatternBase<PatternType>[]
    end: RegExp
    endCaptures: Capture
  } :
  T extends PatternType.include ? {
    // Include
    include: `#${string}`;
  } :
  never;

export type PatternBase<T extends PatternType = PatternType> =
  T extends PatternType.match ? {
    // pattern match
    match: string;
    name: string;
  } :
  T extends PatternType.inline_push ? {
    // pattern inline_push
    begin: string
    beginCaptures: Capture
    patterns: PatternBase<PatternType>[]
    end: string
    endCaptures: Capture
  } :
  T extends PatternType.include ? {
    // Include
    include: `#${string}`;
  } :
  never;

export const isPatternMatch = (pattern: Obj): pattern is Pattern<PatternType.match> => {
  return isStringOrRegExp(pattern.match)
}

export const isPatternInlinePush = (pattern: Obj): pattern is Pattern<PatternType.inline_push> => {
  return isStringOrRegExp(pattern.begin) && isStringOrRegExp(pattern.end)
}

export const isPatternInclude = (pattern: Obj): pattern is Pattern<PatternType.include> => {
  return isStringOrRegExp(pattern.include)
}

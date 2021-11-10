import { AsyncLocalStorage } from 'async_hooks'
import { inspect, InspectOptions } from 'util';
import { isObject, Obj } from '../util/types';

type MapIndex = Map<string, any>;
type ListPatterns = Set<any>;

export const grammarAsyncLocalStorage = new AsyncLocalStorage<{
  indexes: MapIndex,
  patterns: ListPatterns,
}>();

const eachIndex = <T>(v: T): T => {
  const indexes = grammarAsyncLocalStorage.getStore()!.indexes
  Object.entries(v).forEach(([key, value]) => {
    indexes.set(`#${key}`, value)
  })
  return v;
};

const toPattern = <T extends Obj>(v: T) => {
  const indexes = grammarAsyncLocalStorage.getStore()!.indexes;
  if (isObject(v) && 'include' in v) {
    return {
      ...v,
      toRef: () => indexes.get(v.include),
    }
  }
}

export const createGrammar = <T>(v: () => T): T => grammarAsyncLocalStorage.run({
  indexes: new Map<string, any>(),
  patterns: new Set<any>(),
}, () => v());


export class Repository {
  #entry: any;
  [k: string]: any;

  private constructor(entry: any) {
    this.#entry = entry;
    const { indexes } = grammarAsyncLocalStorage.getStore()!;
    for (const [key, value] of Object.entries(entry)) {
      if (typeof key === 'string') {
        this[key] = value;
        indexes.set(`#${key}`, value);
      }
    }
  }

  [inspect.custom](depth: number, options: InspectOptions) {
    const inspectConfig = inspectConfigurable.getStore()

    if (inspectConfig?.type === 'ts') {
      return `Repository.create(${inspect(this.#entry, options)})`
    }

    return `Repository ${inspect(this.#entry, options)}`
  }

  static create(entry: any) {
    return new Repository(entry);
  }
}

export enum EntryType {
  inlinePattern = 'inline-pattern',
  include = 'include',
  match = 'match',
  repository = 'repository',
}


type Entry<T extends EntryType> =
  T extends EntryType.inlinePattern ? {
    begin: RegExp
    beginCaptures: { [propName: `${number}`]: { name: string } }
    patterns: Pattern<any>[]
    end: RegExp
    endCaptures: { [propName: `${number}`]: { name: string } }
  }
  : T extends EntryType.include ? { include: string }
  : T extends EntryType.repository ? {
    patterns: Pattern<any>[]
  }
  : T extends EntryType.match ? {
    match: RegExp
    name: string
  }
  : null;

export class Pattern<T extends EntryType> {
  #type: T
  #entry: Entry<T>;
  #indexes: MapIndex
  #patterns: ListPatterns;

  private constructor(
    type: T,
    entry: any,
  ) {
    this.#entry = entry;
    this.#type = type;
    const { indexes, patterns } = grammarAsyncLocalStorage.getStore()!;
    this.#indexes = indexes;
    this.#patterns = patterns;
    patterns.add(this);
  }

  getIndexes() { return this.#indexes }
  getPatterns() { return this.#patterns }

  * deepPatterns(): Generator<Pattern<any>> {
    if ('patterns' in this.#entry) {
      for (const pattern of this.#entry.patterns) {
        if (Pattern.isPatternType(pattern, EntryType.include)) {
          for (const pattern2 of this.getIndexes().get(pattern.#entry.include).patterns) {
            yield pattern2;
          }
        }
      }
    }
  }

  match(value: string, indexOf = 0): any {
    if (Pattern.isPatternType(this, EntryType.repository)) {
      const patterns: Pattern<any>[] = this.#entry.patterns;

      for (const pattern of patterns) {
        const result = pattern.match(value);
        if (result) {
          return result;
        }
      }

      return null;
    }

    if (Pattern.isPatternType(this, EntryType.include)) {
      const patterns = this.getIndexes().get(this.#entry.include).patterns;

      for (const pattern of patterns) {
        const result = pattern.match(value, indexOf);
        if (result) {
          return result;
        }
      }

      return null;
    }

    if (Pattern.isPatternType(this, EntryType.inlinePattern)) {
      const { begin, beginCaptures } = this.#entry;
      const beginExp = new RegExp(`^(?<prefix>(?:\\n|\\s)*)${begin.source}`);

      const resultMatch = beginExp.exec(value);

      if (resultMatch) {
        const postEnd = indexOf + resultMatch[0].length;
        let postEndResult = postEnd;

        const { end, endCaptures, } = this.#entry;
        const childs: any[] = [];

        const patterns = Array.from(this.deepPatterns());

        for (let index = 0; index < patterns.length; index++) {

          const pattern = patterns[index];
          const result = pattern.match(value.slice(postEndResult), postEndResult);
          if (result) {
            childs.push(result);
            postEndResult = result.end;
            index = 0;
          }
        }

        return {
          tokens: Object.entries(beginCaptures).map(([key, value]) => {
            return {
              name: value.name,
              value: resultMatch[Number(key) + 1],
            }
          }),
          start: resultMatch.index + indexOf + resultMatch.groups!.prefix.length,
          end: postEnd,
          childs,
        }
      }

      return null;
    }

    if (Pattern.isPatternType(this, EntryType.match)) {
      const matchExp = new RegExp(`^(?<prefix>(?:\\n|\\s)*)${this.#entry.match.source}`);
      const matchResult = matchExp.exec(value);
      if (matchResult) {
        const postEnd = indexOf + matchResult[0].length;
        return {
          tokens: [{
            name: this.#entry.name,
            value: matchResult[2],
          }],
          // value,
          // matchResult,
          // source: matchExp.source,
          // indexOf,
          start: indexOf + matchResult.index + matchResult.groups!.prefix.length,
          end: postEnd,
        }
      }
      // console.log(this.#entry.name, matchExp.source, JSON.stringify(value), matchResult);
      return null;
      throw new Error('Not implemented');
    }

    throw new Error(`Unknown type ${this.#type}`);
  }

  [inspect.custom](depth: number, options: InspectOptions) {
    const inspectConfig = inspectConfigurable.getStore()

    if (inspectConfig?.type === 'ts') {
      return `Pattern.create(${inspect(this.#type)}, ${inspect(this.#entry, options)})`
    }

    return `Pattern <${this.#type}> ${inspect(Object.fromEntries(Object.entries(this)), options)}`
  }

  static isPatternType<T extends EntryType>(pattern: Pattern<any>, type: T): pattern is Pattern<T> {
    return pattern.#type === type;
  }

  static create(
    type: EntryType,
    entries: any,
  ) {
    return new Pattern(type, entries);
  }

  static isPattern(value: any): value is Pattern<any> {
    return value instanceof Pattern;
  }
}

type InspectConfig = {
  type: 'ts'
}

const inspectConfigurable = new AsyncLocalStorage<InspectConfig>();

export const inspectToTS = (value: Pattern<any>) => inspectConfigurable.run(
  {
    type: 'ts',
  },
  () => `createGrammar(() => ${inspect(value, {
    depth: null,
    maxArrayLength: null,
    maxStringLength: null,
    showHidden: false,
  })})`
)

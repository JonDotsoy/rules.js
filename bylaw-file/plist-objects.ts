import { PlistValue } from 'plist';
import { ROOT } from './constant/root.symbol';
import { recoverPatterns } from './recover-patterns.selector';
import { recoverRepository } from './recover-repository.selector';
import { Index } from './types';
import { getId, indexAsyncLocalStorage } from './index-async-local-storage';
import { Capture, isPatternInlinePush, isPatternMatch, Pattern, PatternBase } from './Pattern';
import { strToExp } from './util/str-to-regexp';
import { Token } from './types/token';
import { inspect } from 'util';

class BodyPoint {
  private constructor(
    readonly body: string,
    public positions: number,
  ) { }

  clone() {
    return BodyPoint.create(this.body, this.positions);
  }

  forward(positions: number) {
    this.positions += positions;
    return this.positions;
  }

  toString() {
    return `${this.body.substring(this.positions)}`;
  }

  static create(...args: [bodyPoint: BodyPoint] | [body: string, positions: number]) {
    if (args.length === 2) {
      return new BodyPoint(args[0], args[1]);
    } else {
      return new BodyPoint(args[0].body, args[0].positions);
    }
  }
}

export class PListObject {
  private indexes!: Index;

  constructor(
    public readonly value: PlistValue
  ) {
    this.runInspect();
  }

  private runInspect() {
    const indexes: Index = new Map([
      [ROOT, { $id: ROOT, value: this.value }],
    ]);

    const repository = recoverRepository(this.value);

    if (repository) {
      Object.entries(repository).forEach(([key, value]) => {
        indexes.set(key, {
          $id: key,
          value: value,
        });
      });
    }

    this.indexes = indexes;
  }

  expExec(regexp: RegExp | string, capture: Capture, value: string) {
    const exp = strToExp(regexp);
    const match = exp.exec(value);

    if (!match) return null;

    return {
      text: match[0],
      pos: match.index,
      scopes: Object.entries(capture).map(([indexStr, scope]) => {
        const index = parseInt(indexStr);
        return {
          scope: scope.name,
          value: match[index],
        }
      }),
    }
  }

  patternExec(bodyPointBase: BodyPoint, pattern: Pattern) {
    if (isPatternMatch(pattern)) {
      const e = bodyPointBase.toString();
      const match = this.expExec(pattern.match, { '1': { name: pattern.name } }, e);

      if (!match) return null;

      const bodyPoint = bodyPointBase.clone();

      return {
        e,
        bodyPoint,
        kind: getId(pattern),
        pos: bodyPoint.forward(match.pos),
        end: bodyPoint.forward(match.text.length),
        scopes: match.scopes,
        _text: match.text,
        _text_full: bodyPoint.toString(),
        patterns: Array.from(recoverPatterns(pattern)),
      };
    }
    if (isPatternInlinePush(pattern)) {
      const e = bodyPointBase.toString();
      const match = this.expExec(pattern.begin, pattern.beginCaptures, e);
      if (!match) return null;

      const bodyPoint = bodyPointBase.clone();

      return {
        e,
        bodyPoint,
        kind: getId(pattern), 
        pos: bodyPoint.forward(match.pos),
        end: bodyPoint.forward(match.text.length),
        scopes: match.scopes,
        _text: match.text,
        _text_full: bodyPoint.toString(),
        patterns: Array.from(recoverPatterns(pattern)),
      };
    }

    return null;
  }

  *patternsExec(bodyPoint: BodyPoint, patterns: Pattern[]): Generator<Token> {
    if (!patterns)
      throw new Error(`No patterns found`);

    for (const pattern of patterns) {
      const resPattern = this.patternExec(bodyPoint, pattern);
      if (!resPattern) continue;

      yield Token.from({
        ...resPattern,
        children: Array.from(this.patternsExec(resPattern.bodyPoint.clone(), resPattern.patterns)),
      });
    }
  }

  match(body: string) {
    return indexAsyncLocalStorage.run(this.indexes, () => {
      const bodyPoint = BodyPoint.create(body, 0);
      const patterns = Array.from(recoverPatterns(this.indexes.get(ROOT)?.value));

      if (!patterns) throw new Error(`No patterns found`);

      return Array.from(this.patternsExec(bodyPoint, patterns))
    });
  }
}

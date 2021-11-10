import {
  isString,
  isObject
} from './util/types';

export function capture(capture: any, match: RegExpMatchArray) {
  if (isObject(capture)) {

    return Object.entries(capture)
      .map(([k, v]) => {
        if (isObject(v) && isString(v.name)) {
          const valueMatch = match[Number(k)];
          return {
            kind: v.name,
            pos: match.index,
            end: valueMatch.length + match.index!,
            _text: valueMatch,
          };
        }
        return null;
      })
      .filter((v) => v !== null);

  }
}

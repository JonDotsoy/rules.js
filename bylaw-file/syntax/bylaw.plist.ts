import * as plist from "plist";
import fs from 'fs';
import { isArray, isObject, isString } from "../util/types";
import { inspect } from "util";
import { createGrammar, EntryType, Pattern, Repository } from "./obj-grammar";

const root = Symbol('root');

export const plistValues = plist.parse(fs.readFileSync(`${__dirname}/syntax.plist`, 'utf-8'))

export const parse = (source: string) => createGrammar(() => {
  const parsed = plist.parse(source)

  const truncate = (propName: string | symbol, value: any): any => {
    if (isString(value) && value.startsWith('(') && value.endsWith(')')) {
      return Object.assign(
        eval(`/${value}/`),
        {
          rootValue: value,
          [inspect.custom]() {
            return `/${value}/`;
          },
        },
      )
    }
    if (isArray(value)) {
      return Object.entries(value)
        .map(([key, val]) => truncate(key, val))
    }
    if (isObject(value)) {
      const a = Object.entries(value)
        .map(([k, v]) => [k, truncate(k, v)])

      if (propName === 'repository') {
        return Repository.create(Object.fromEntries(a));
      }

      let type = ('include' in value && a.length === 1) ? EntryType.include :
        ('begin' in value && 'end' in value) ? EntryType.inlinePattern :
          ("match" in value) ? EntryType.match :
            ('repository' in value && 'patterns' in value) ? EntryType.repository :
              null

      if (type) {
        return Pattern.create(type, Object.fromEntries(a));
      }

      return Object.fromEntries(a);
    }
    return value;
  }

  const v = truncate(root, parsed);

  if (!Pattern.isPattern(v)) {
    throw new Error(`Expected a pattern, got ${inspect(v)}`)
  }

  return v;
});

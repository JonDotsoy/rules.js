import { parse } from './bylaw.plist'
import fs from 'fs'
import { inspectToTS, Pattern } from './obj-grammar'
import { inspect } from 'util'


it('parse', () => {
  const parsed = parse(fs.readFileSync(`${__dirname}/syntax.plist`, 'utf-8'))

  expect(parsed).toBeInstanceOf(Pattern)
})

it('stringify to ts', () => {
  const parsed = parse(fs.readFileSync(`${__dirname}/syntax.plist`, 'utf-8'))

  expect(inspectToTS(parsed)).toMatchSnapshot()
})


it('should match pattern', () => {
  const parsed = parse(fs.readFileSync(`${__dirname}/syntax.plist`, 'utf-8'));

  const source = `
    version = "1.0";
  `;

  const match = parsed.match(source);

  console.log(inspect(match, {
    depth: null,
    maxArrayLength: null,
  }));
})


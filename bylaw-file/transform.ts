import { writeFileSync } from 'fs'
import { PlistValue } from 'plist'
import { inspect } from 'util'
import { plistValues } from './syntax/bylaw.plist'
import { PListObject } from './plist-objects'


export class Transform {
  constructor(
    private code: string,
    private rules: PlistValue,
  ) { }

  async parseAST() {
    const plistRules = new PListObject(this.rules)

    return Array.from(plistRules.match(this.code))
  }

  static async parse(buf: string) {
    writeFileSync(`${__dirname}/.plist-values`, inspect(plistValues, { depth: Infinity }))

    return new Transform(buf, plistValues).parseAST()
  }
}


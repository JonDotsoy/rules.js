import { parse, toTS } from './bylaw.plist'
import fs, { writeFileSync } from 'fs'

const source = fs.readFileSync(`${__dirname}/syntax.plist`, 'utf-8')

writeFileSync(`${__dirname}/syntax.plist.out.ts`, toTS(parse(source)));

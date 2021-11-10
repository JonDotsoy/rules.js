import { inspect } from "util"
import { Transform } from "./transform"

type ArgsType<T> = T extends (...args: infer U) => any ? U : never

const b = (...args: ArgsType<typeof String.raw>) => Buffer.from(String.raw(...args))

describe('transform', () => {
  it('parse body file', async () => {


    const buffer = `
        version = '1'

        match /route/{param}/name {
          allow action, nl : if true;
          allow action, action2:
              if request.auth.   scope == "admin" 
              or request.auth.scope["asd"] == "read" 
              and true;
      }
    `
    const buffer2 = `version = '1';`

    const res = await Transform.parse(buffer2);

    console.log(inspect(res, { depth: Infinity }))
  })
})
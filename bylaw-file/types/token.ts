import { inspect } from "util"


export interface Scope {
  scope: string;
  value: string;
}

export class Token {
  kind!: string | symbol | null
  pos!: number
  end!: number
  scopes!: Scope[]
  children!: Token[]
  // patterns: Pattern[]
  [key: string]: any

  constructor(obj: Token) {
    Object.assign(this, obj)
  }

  // [inspect.custom]() {
  //   return {
  //     kind: this.kind,
  //     pos: this.pos,
  //     end: this.end,
  //     scopes: this.scopes,
  //     children: this.children,
  //   }
  // }

  static from(obj: any) {
    return new Token(obj)
  }
}

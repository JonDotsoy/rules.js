import { PlistObject, PlistValue } from 'plist';
import { isRegExp } from 'util/types';

// help

export type Obj = { [key: string]: any };

export const isBuffer = (value: PlistValue): value is Buffer => value instanceof Buffer;
export const isDate = (value: PlistValue): value is Date => value instanceof Date
export const isString = (value: PlistValue): value is string => typeof value === 'string'
export const isNumber = (value: PlistValue): value is number => typeof value === 'number'
export const isBoolean = (value: PlistValue): value is boolean => typeof value === 'boolean'
export const isArray = (value: any): value is any[] => Array.isArray(value)

export const isObject = (value: any): value is Obj => value !== null &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  !isBuffer(value) &&
  !isDate(value)

export const isPlistArray = (value: PlistValue): value is PlistObject[] => Array.isArray(value)
export const isPlistObject = (value: PlistValue): value is PlistObject => typeof value === 'object'
  && value !== null
  && !isPlistArray(value)
  && !isBuffer(value)
  && !isDate(value)

export const isStringOrRegExp = (value: any) => isString(value) || isRegExp(value);

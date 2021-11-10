import { PlistValue } from 'plist';
import { isObject } from './util/types';

export const recoverRepository = (value: any) => {
  if (isObject(value) && isObject(value.repository)) {
    return value.repository;
  }
  return null;
};

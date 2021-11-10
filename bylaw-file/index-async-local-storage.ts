import { Index } from './types';
import { AsyncLocalStorage } from 'async_hooks';
import { isArray, isObject } from './util/types';

export const indexAsyncLocalStorage = new AsyncLocalStorage<Index>();

export const getIndex = () => {
  const indexes = indexAsyncLocalStorage.getStore()
  if (!indexes) {
    throw new Error('Context index not initialized')
  }
  return indexes
};

export const getValueById = (id: `#${string}`) => {
  return getIndex().get(id.substring(1))?.value ?? null;
}

export const getId = (value: any) => {
  const indexes = getIndex()

  for (const entry of indexes.values()) {
    if (entry.value === value) {
      return entry.$id
    }
    if (isObject(entry.value) && isArray(entry.value.patterns)) {
      for (const pattern of entry.value.patterns) {
        if (pattern === value) {
          return entry.$id
        }
      }
    }
  }

  return null;
}

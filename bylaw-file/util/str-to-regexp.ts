export const strToExp = (value: string | RegExp) => {
  if (value instanceof RegExp) return value;

  const newLocal_1 = Array.from(Buffer.from(value, 'utf-8'))
    .map(e =>
      e == 0x08
        ? Array.from(Buffer.from('\\b', 'utf-8'))
        : e
    )
    .flat();

  const newLocal = Buffer.from(newLocal_1).toString('utf-8');

  return new RegExp(newLocal);
};

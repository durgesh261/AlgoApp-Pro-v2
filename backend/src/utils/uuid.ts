import { randomUUID } from 'crypto';

export function cryptoNativeUuid(): string {
  return randomUUID();
}

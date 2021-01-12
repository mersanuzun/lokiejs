export type Expire = number | Date;

export interface SetItemOptions {
  expire?: Expire,
}

export interface LokieObject<T> {
  expire?: Expire
  data: T
}

export interface LokieJS {
  setItem<T>(key: string, value: T, options?: SetItemOptions): void
  getItem<T> (key: string, defaultValue?: any): T | null
  removeItem(key: string): void
  sync(excludeKeys?: string[]): void
}

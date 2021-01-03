type Expire = number | Date;
export interface SetItemOptions {
  expire?: Expire,
}
export interface LokieObject<T> {
  expire?: Expire
  data: T
}
export interface LokieJS {
  setItem<T>(key: string, value: T, options?: SetItemOptions): void
  getItem<T> (key: string): T | null
  removeItem(key: string): void
  sync(excludeKeys?: string[]): void
}

const LokieJS: LokieJS = {
  setItem<T>(key: string, value: T, options?: SetItemOptions): void {
    let exp: Expire;

    if (options?.expire instanceof Date) {
      exp = options.expire.getTime();
    } else if (typeof options?.expire === 'number') {
      exp = options.expire;
    }

    const lokieObject: LokieObject<T> = {
      expire: exp,
      data: value,
    };

    localStorage.setItem(key, JSON.stringify(lokieObject));
  },

  getItem<T>(key: string): T | null {
    const now = (new Date()).getTime();
    const objectAsString = localStorage.getItem(key);
    try {
      const object: LokieObject<T> = JSON.parse(objectAsString);

      if (object.expire && object.expire < now) {
        localStorage.removeItem(key);

        return null;
      }

      return object.data;
    } catch (err) {
      console.warn(`Could not get item from localstorage with ${key}`);

      return null;
    }
  },

  removeItem(key: string): void {
    return localStorage.removeItem(key);
  },

  sync(excludeKeys?: string[]): void {
    Object.keys(localStorage).forEach(key => {
      const value = localStorage.getItem(key);

      if (!excludeKeys?.includes(key)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        this.setItem(key, value);
      }
    });
  },
};

export default LokieJS;

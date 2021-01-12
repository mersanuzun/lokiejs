import {Expire, LokieJS, LokieObject, SetItemOptions} from "./types";

const lokieJS: LokieJS = {
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

  getItem<T>(key: string, defaultValue?: any): T | null {
    const now = (new Date()).getTime();
    const objectAsString = localStorage.getItem(key);
    try {
      const object: LokieObject<T> = JSON.parse(objectAsString);

      if (object.expire && object.expire < now) {
        localStorage.removeItem(key);

        return defaultValue || null;
      }

      return object.data;
    } catch (err) {
      console.warn(`Could not get item from localstorage with ${key}`);

      return defaultValue || null;
    }
  },

  removeItem(key: string): void {
    return localStorage.removeItem(key);
  },

  sync(excludeKeys?: string[]): void {
    Object.keys(localStorage).forEach(key => {
      const value = localStorage.getItem(key);

      if (!excludeKeys?.includes(key)) {
        this.setItem(key, value);
      }
    });
  },
};

export default lokieJS;

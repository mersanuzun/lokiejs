
import * as faker from 'faker';
import { when } from 'jest-when';
import {LokieObject, SetItemOptions} from "../src/types";
import lokieJS from "../src";

describe('lokieJS', () => {
  let localStorageMock;

  beforeAll(() => {
    localStorageMock = {};
    localStorageMock.__proto__ = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };

    Object.defineProperty(global, 'localStorage', {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      value: localStorageMock,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('setItem', () => {
    it('should set undefined to expire field if not give expire time', () => {
      // given
      const key = faker.random.word();
      const value = faker.random.objectElement();
      const object: LokieObject<any> = {
        data: value,
      };

      // when
      lokieJS.setItem(key, value);

      // then
      const [ [calledKey, calledObjAsString] ] = localStorageMock.setItem.mock.calls;

      expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);
      expect(calledKey).toBe(key);
      expect(JSON.parse(calledObjAsString)).toEqual(object);
    });
    it('should set to expire time from getTime method if expire time is given as Date', () => {
      // given
      const key = faker.random.word();
      const value = faker.random.objectElement();
      const expireDate = new Date();
      jest.spyOn(expireDate, 'getTime').mockReturnValue(1);
      const setItemOptions: SetItemOptions = {
        expire: expireDate,
      };
      const object: LokieObject<any> = {
        data: value,
        expire: 1,
      };

      // when
      lokieJS.setItem(key, value, setItemOptions);

      // then
      const [ [calledKey, calledObjAsString] ] = localStorageMock.setItem.mock.calls;

      expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);
      expect(calledKey).toBe(key);
      expect(JSON.parse(calledObjAsString)).toEqual(object);
    });
    it('should set to expire time if expire time is given as number', () => {
      // given
      const key = faker.random.word();
      const value = faker.random.objectElement();
      const setItemOptions: SetItemOptions = {
        expire: 3,
      };
      const object: LokieObject<any> = {
        data: value,
        expire: setItemOptions.expire,
      };

      // when
      lokieJS.setItem(key, value, setItemOptions);

      // then
      const [ [calledKey, calledObjAsString] ] = localStorageMock.setItem.mock.calls;

      expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);
      expect(calledKey).toBe(key);
      expect(JSON.parse(calledObjAsString)).toEqual(object);
    });
  });

  describe('getItem', () => {
    beforeEach(() => {
      jest.spyOn(global.console, 'warn');
    });

    it('should return null if any error occurred while parsing retrieved object', () => {
      // given
      const key = faker.random.word();
      when(localStorageMock.getItem)
        .calledWith(key)
        .mockReturnValue(faker.random.word());

      // when
      const value = lokieJS.getItem(key);

      // then
      expect(value).toEqual(null);
      expect(console.warn).toHaveBeenNthCalledWith(
        1,
        `Could not get item from localstorage with ${key}`
      );
    });
    it('should return null if value was expired', () => {
      // given
      const lokieObject: LokieObject<any> = {
        data: false,
        expire: 10,
      };

      const key = faker.random.word();
      when(localStorageMock.getItem)
        .calledWith(key)
        .mockReturnValue(JSON.stringify(lokieObject));
      const mockDate = new Date(lokieObject.expire.valueOf() + 1);
      jest
        .spyOn(global, 'Date')
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .mockImplementation(() => mockDate);

      // when
      const value = lokieJS.getItem(key);

      // then
      expect(value).toEqual(null);
      expect(console.warn).not.toHaveBeenCalled();
      expect(localStorageMock.removeItem).toHaveBeenNthCalledWith(
        1,
        key
      );
    });
    it('should return value if expire not set before', () => {
      // given
      const lokieObject: LokieObject<any> = {
        data: false,
      };
      const key = faker.random.word();
      when(localStorageMock.getItem)
        .calledWith(key)
        .mockReturnValue(JSON.stringify(lokieObject));

      // when
      const value = lokieJS.getItem(key);

      // then
      expect(value).toEqual(lokieObject.data);
      expect(console.warn).not.toHaveBeenCalled();
      expect(localStorageMock.removeItem).not.toHaveBeenCalled();
    });
  });

  describe('removeItem', () => {
    it('should remove item', () => {
      // given
      const key: string = faker.random.word();

      // when
      lokieJS.removeItem(key);

      // then
      expect(localStorageMock.removeItem).toHaveBeenNthCalledWith(
        1,
        key
      );
    });
  });

  describe('sync', () => {
    it('should sync all key value pairs if excludeKeys is not given as parameter', () => {
      // given
      localStorageMock.key1 = 'value1';
      localStorageMock.key2 = 'value2';
      when(localStorageMock.getItem)
        .calledWith('key1')
        .mockReturnValue('value1');
      when(localStorageMock.getItem)
        .calledWith('key2')
        .mockReturnValue('value2');

      // when
      lokieJS.sync();

      // then
      expect(localStorageMock.setItem).toHaveBeenCalledWith('key1', '{"data":"value1"}');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('key2', '{"data":"value2"}');
    });

    it('should sync only not excluded key value pairs if excludeKeys is given as parameter', () => {
      // given
      localStorageMock.key1 = 'value1';
      localStorageMock.key2 = 'value2';
      when(localStorageMock.getItem)
        .calledWith('key1')
        .mockReturnValue('value1');
      when(localStorageMock.getItem)
        .calledWith('key2')
        .mockReturnValue('value2');

      // when
      lokieJS.sync(['key1']);

      // then
      expect(localStorageMock.setItem).toHaveBeenCalledWith('key2', '{"data":"value2"}');
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);
    });
  });
});

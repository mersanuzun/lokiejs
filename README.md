# lokiejs
This is a wrapper of localstorage. It brings an expiration feature to localstorage. You can give expire time the stored elements.
It will return null if stored element of time is expired and remove from localstorage.

## Install
```sh
npm i @mersanuzun/lokiejs
```

## Usage
```javascript
import lokieJS from '@mersanuzun/lokiejs';
```

### setItem
You can set item with key value pairs. The given value will be stringify with `JSON.stringify`. The third parameter is optional. You can only pass it when you want to set expire time.
```javascript
lokieJS.setItem('key', { lib: 'lokiJS' }, { expire: 3000000 });
```

### getItem
You can get item with key. The value returns after parsing with `JSON.parse`. If you set the item with expire time, it will be checked with current time. If value is expired, it returns null, otherwise returns value.
```javascript
const value = lokieJS.getItem('key');
```

### removeItem
It removes item from localstorage.
```javascript
lokieJS.removeItem('key');
```

### sync
It syncs all localstorage items. If you want to exclude some keys, you can pass them with array param.

```javascript
lokieJS.sync(); // Syncs all items
lokieJS.sync(['excludedKey']); // Syncs all items except excludedKey
```

## License
MIT

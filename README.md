# bitmath
add, subtract, multiply, euclidean divide bit arrays of any size

Also on [npm](https://www.npmjs.com/package/bitmath)

## api

very simple.

```
m = require('bitmath');
x = Uint1Array.of(1,0,1,0);
y = Uint1Array.of(1,1,1);
m.add(x,y)
m.mul(x,y)
m.div(x,y)
m.dif(x,y)
m.mod(x,y)
```

## Latest news

Modexp using repeated squaring in a (trying to be) timesafe way is implemented.
Division algorithm is fixed. Modexp naive version is implemented.

# [bitmath](https://github.com/crislin2046/bitmath) ![npm downloads](https://img.shields.io/npm/dt/bitmath) ![version](https://img.shields.io/npm/v/bitmath)

add, subtract, multiply, euclidean divide bit arrays of any size

Also on [npm](https://www.npmjs.com/package/bitmath)

## api

very simple.

```
m = require('bitmath');
x = Uint1Array.of(1,0,1,0);
y = Uint1Array.of(1,1,1);
z = Uint1Array.of(0,1);
m.add(x,y)
m.mul(x,y)
m.div(x,y)
m.dif(x,y) // subtract (no negative values!)
m.mod(x,y)
m.modexp(x,y,x)
```


## Timesafe Notes

Modexp using repeated squaring in a (trying to be) timesafe way is implemented.

# :keycap_ten: [abacus](https://github.com/crislin2046/bitmath) ![npm downloads](https://img.shields.io/npm/dt/bitmath) ![version](https://img.shields.io/npm/v/bitmath)

bit arithmetic package to add, subtract, multiply, euclidean divide bit arrays of any size.

Uses [Uint1Array](https://npmjs.com/package/uint1array).

## get

```console
npm i --save bitmath
```

## api

```
import m from 'bitmath';
import Uint1Array from 'uint1array';

x = m.from(28);               // create bit field from number 28
y = Uint1Array.of(1,1,1);     // or just create using Uint1Array TypedArray
z = Uint1Array.of(0,1);

m.add(x,y)
m.mul(x,y)
m.div(x,y)
m.dif(x,y)                    // subtract (note: sign is omitted)
m.mod(x,y)
m.modexp(x,y,x)
```

## Timesafe Notes

Modexp using repeated squaring in a (trying to be) timesafe way is implemented.

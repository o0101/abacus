"use strict";
{
  const Uint1Array = require('uint1array');
  const bitmath = require('./index.js');

  const a = Uint1Array.of( 1, 1, 1, 1, 1, 1, 1 );
  const b = Uint1Array.of( 1, 1, 0, 0, 0, 1);
  const c = bitmath.add(a,b);
  const f = bitmath.dif(a,b);
  const p = bitmath.mul(a,b);
  const q = bitmath.mul(a,a,b,b,b);
  console.log( `a=${a}\nb=${b}\nc=a+b=${c}\nf=a-b=${f}\np=a*b=${p}\nq=a*a*b*b*b=${q}`);
}

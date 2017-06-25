"use strict";
{
  const Uint1Array = require('uint1array');
  const bitmath = require('./index.js');

  const a = Uint1Array.of( 1, 1, 1, 1, 1 );
  const b = Uint1Array.of( 1 );
  const c = bitmath.add(a,b);
  const d = bitmath.dif(a,b);
  const e = Uint1Array.of( 0, 1 );
  const f = bitmath.dif(a,e);
  console.log( `a=${a}\nb=${b}\nc=a+b=${c}\nd=a-b=${d}\ne=${e}\nf=c-e=${f}\n`);
  const g = bitmath.inv( Uint1Array.of( 0,1,1,0,1,0,0,1 ) );
  console.log( `inv(01101001) = ${g}` );
}

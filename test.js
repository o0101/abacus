"use strict";
{
  const Uint1Array = require('uint1array');
  const bitmath = require('./index.js');

  const a = Uint1Array.of( 1, 1, 1, 1, 1 );
  const b = Uint1Array.of( 1, 0, 0, 0, 0, 0, 0, 1 );
  const c = bitmath.mul( a, b );
  const d = bitmath.add( a, b, c );
  const e = bitmath.mul( c, d );

  console.log( `a=${a},b=${b},c=a.b=${c},d=a+b+c=${d},e=c+d=2.a.b+a+b=${e}` );
}

"use strict";
{
  const Uint1Array = require('uint1array');
  const bitmath = require('./index.js');

  const a = Uint1Array.of( 1, 1, 1, 1, 1, 1, 1 );
  const b = Uint1Array.of( 1, 1, 0, 0, 0, 1);
  const c = bitmath.add(a,b);
  const f = bitmath.dif(a,b);
  const f2 = bitmath.dif(a,b);
  const f2i = bitmath.inv(f2);
  const p = bitmath.mul(a,b);
  const q = bitmath.mul(a,a,b,b,b);
  const altb = bitmath.less_than(a,b);
  const amtb = bitmath.more_than(a,b);
  const eq = bitmath.equal(a,a);
  const neq = bitmath.equal(a,b);
  const bmta = bitmath.more_than(b,a);
  const blta = bitmath.less_than(b,a);
  console.log( `
    a=${a}
    b=${b}
    c=a+b=${c}
    f=a-b=${f}
    f2=a(cdif)b=${f2}
    f2i=inv(f2)=${f2i}
    p=a*b=${p}
    q=a*a*b*b*b=${q}
    a < b=${altb}
    a > b=${amtb}
    a = a=${eq}
    a = b=${neq}
    b > a=${bmta}
    b < a=${blta}
  `);
}

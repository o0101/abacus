  import Uint1Array from 'uint1array';
  import bitmath from './index.js';

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
  const div7 = bitmath.div( Uint1Array.of( 1,0,0,1,0,1,1 ), Uint1Array.of(1,1,1) ); // 105 / 7 
  const div7r1 = bitmath.div( Uint1Array.of( 0,1,0,1,0,1,1 ), Uint1Array.of(1,1,1) ); // 105 / 7 
  const div7r3 = bitmath.div( Uint1Array.of( 0,0,1,1,0,1,1 ), Uint1Array.of(1,1,1) ); // 105 / 7 
  const modexp = bitmath.modexp( Uint1Array.of( 1, 1 ), Uint1Array.of( 1,1,1,1,1,1,1,1 ), Uint1Array.of( 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1 ) );
  const modexp_naive = bitmath.modexp_naive( Uint1Array.of( 1, 1 ), Uint1Array.of( 1,1,1,1,1,1,1,1 ), Uint1Array.of( 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1 ) );
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
    div7 = 105/7 = ${div7.quotient} ${div7.remainder}
    div7r1 = 106/7 = ${div7r1.quotient} ${div7r1.remainder}
    div7r3 = 107/7 = ${div7r3.quotient} ${div7r3.remainder}
    modexp       = 3**255 % 32768 = ${modexp}
    modexp_naive = 3**255 % 32768 = ${modexp_naive}
  `);
  const divisor = bitmath.from( 17 );
  const dividend = bitmath.from( 8134 );
  const dividend2 = bitmath.from( 8250 );
  const { quotient, remainder } = bitmath.div( dividend, divisor );
  const { quotient:quotient2, remainder:remainder2 } = bitmath.div( dividend2, divisor );
  console.log( `8134/17 = q ${quotient} r ${remainder}` );
  console.log( `8250/17 = q ${quotient2} r ${remainder2}` );
  for( let i = 0; i < 100; i++ ) {
    for( let j = i; j < 100; j++ ) {
      const x = bitmath.from(j);
      const y = bitmath.from(i);
      const rd = j - i;
      const cd = bitmath.to( bitmath.dif( x, y ) );
      const t = rd == cd;
      if ( ! t ) {
        console.warn( "There is some problem." , j, i );
      }
      //console.log( rd, cd, t, j, i );
    }
  }
  const m = bitmath.from(58);
  const y = bitmath.to(bitmath.quo(m,bitmath.from(5)));
  console.log(m,5,y);
  console.log('Tests passs');

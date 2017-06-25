"use strict";
// all arguments are assumed to be typed arrays of bits, or equivalently, uint1array
{
  const bitmath = {
    add, sub, mul, div, 
    mod,
    inv, and, xor, or
  };
  
  function to_minlen( ...v ) {
    return Math.min( ...v.map( b => b.length ) );
  }

  function to_maxlen( ...v ) {
    return Math.max( ...v.map( b => b.length ) );
  }

  function pointwise( op, initial, does_carry, ...v ) {
    const maxlen = to_maxlen( v );
    const vnum = v.length;
    const x = new Uint1Array( maxlen );

    let carry = initial;
    for( let i = 0; i < maxlen; i++ ) {
      let xi = op( initial, carry );
      for( let j = 0; j < vnum; j++ ) {
        if ( xi >= Number.MAX_SAFE_INTEGER ) {
          throw new ValueError( `Precision Loss Failure: intermediate value xi has exceeded JavaScript's maximum precise value.` );
        }
        xi = op( xi, v[j][i] );
      }
      x[i] = xi & 1;
      carry = xi - x[i];
      carry >>= 1;
    }

    return x;
  }

  function xor( ...v ) {
    return pointwise( (a,b) => a ^ b, 0, false, ...v );
  }

  function and( ...v ) {
    return pointwise( (a,b) => a & b, 1, false, ...v );
  }

  function or( ...v ) {
    return pointwise( (a,b) => a | b, 0, false, ...v );
  }

  function inv( ...v ) {
    return pointwise( (a,b) => a ^ ((~b)&1), 0, false, ...v );
  }

  function add( ...v ) {
    return pointwise( (a,b) => a + b, 0, true, ...v );
  }

  function sub( ...v ) {
    return pointwise( (a,b) => -a -b, 0, true, ...v );
  }

  function mul( u, v ) {

  }

  function div( u, v ) {

  }

  function mod( u, v ) {
    return div( u, v ).remainder;
  }


}

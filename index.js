"use strict";
// all arguments are assumed to be typed arrays of bits, or equivalently, uint1array
{
  const Uint1Array = require('uint1array');
  const bitmath = {
    add, sub, mul, div, 
    mod,
    inv, and, xor, or
  };

  try { module.exports = bitmath; } catch(e) { Object.assign( self, { bitmath } ) }
  
  function to_minlen( ...v ) {
    return Math.min( ...v.map( b => b.length ) );
  }

  function to_maxlen( ...v ) {
    return Math.max( ...v.map( b => b.length ) );
  }

  function pointwise( op, initial, does_carry, ...v ) {
    console.log( "PW" );
    console.log( v.join('\n') )
    const maxlen = to_maxlen( ...v );
    const vnum = v.length;
    console.log( vnum, maxlen );
    const x = new Uint1Array( maxlen + 1 );

    let carry = initial;
    for( let i = 0; i < maxlen; i++ ) {
      let xi = op( initial, carry );
      for( let j = 0; j < vnum; j++ ) {
        if ( i >= v[j].length ) continue;
        if ( xi >= Number.MAX_SAFE_INTEGER ) {
          throw new ValueError( `Precision Loss Failure: intermediate value xi has exceeded JavaScript's maximum precise value.` );
        }
        xi = op( xi, v[j][i] );
      }
      x[i] = xi & 1;
      if ( does_carry ) {
        carry = xi - x[i];
        carry >>= 1;
      }
    }
    if ( does_carry && carry ) {
      console.log("LAST CARRY", carry );
      x[maxlen] = carry;
    }

    console.log(x+"");
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

  function mul( basis, scaler ) {
    const product = new Uint1Array( basis.length + scaler.length - 1 ); 
    const scaled_bases = [];
    for( let i = 0; i < scaler.length; i++ ) {
      if ( scaler[i] ) {
        scaled_bases.push( mul2( basis, i ) );
      }
    }
    product.set( add( ...scaled_bases ) );
    return product;
  }

  function mul2( basis, power ) {
    const scaled_basis = new Uint1Array( basis.length  + power );
    scaled_basis.set( basis, power );
    return scaled_basis;
  }

  function div( u, v ) {

  }

  function mod( u, v ) {
    return div( u, v ).remainder;
  }
}

"use strict";
// all arguments are assumed to be typed arrays of bits, or equivalently, uint1array
{
  const Uint1Array = require('uint1array');
  const bitmath = {
    add, dif, mul, div, 
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

  function to_carry( n, b ) {
    const point = n % b; 
    const carry = (n-point)/b;
    return { point, carry };
  }
  
  function to_borrow( n, b ) {
    console.log("nb", n,b);
    if ( n >= 0 ) {
      return { point: n, borrow : 0 };
    }
    let { point, carry } = to_carry( n, b ); 
    const borrow = carry + 1;
    carry += 1;
    point += borrow*b;
    point %= b;
    console.log("pb", point, borrow );
    return { point, borrow };
  }

  function pointwise( op, initial, does_carry, does_borrow, ...v ) {
    const maxlen = to_maxlen( ...v ) + ( does_carry ? 1 : 0 );
    const head = v.shift();  
    const vnum = v.length;

    const x = new Uint1Array( maxlen );
    x.set( head );

    let carriage = initial;
    let borrowance = initial;
    for( let i = 0; i < maxlen; i++ ) {
      let xi = x[i];
      for( let j = 0; j < vnum; j++ ) {
        if ( i >= v[j].length ){
          continue;
        }

        xi = op( xi, v[j][i] );
      }
      if ( does_carry ) {
        xi = op(xi, carriage);
        const { point, carry } = to_carry( xi, 2 ); 
        x[i] = point;
        carriage = carry;
      }
      if ( does_borrow ) {
        console.log( borrowance );
        xi = op(xi, borrowance);
        const { point, borrow } = to_borrow( xi, 2 ); 
        x[i] = point;
        borrowance = borrow;
      }
    }
    if ( does_carry && carriage ) {
      x[maxlen] = carriage;
    }
    if ( does_borrow && borrowance ) {
      console.log("WHAT HERE?", borrowance );
    }

    return x;
  }

  function xor( ...v ) {
    return pointwise( (a,b) => a ^ b, 0, false, false, ...v );
  }

  function and( ...v ) {
    return pointwise( (a,b) => a & b, 1, false, false, ...v );
  }

  function or( ...v ) {
    return pointwise( (a,b) => a | b, 0, false, false, ...v );
  }

  function inv( ...v ) {
    return pointwise( (a,b) => a ^ ((~b)&1), 0, false, false, ...v );
  }

  function add( ...v ) {
    return pointwise( (a,b) => a + b, 0, true, false, ...v );
  }

  function dif( ...v ) {
    const head = v.shift();
    const tail = add( ...v );
    return pointwise( (a,b) => a - b, 0, false, true, head, tail );
  }

  // implement a convolve and mul calls convolve
  function mul( ...v ) {
    let product = v.shift();
    while( v.length ) {
      product = mul2arity( product, v.shift() );
    }
    return product;
  }

  function mul2arity( basis, scaler ) {
    const product = new Uint1Array( basis.length + scaler.length ); 
    const scaled_bases = [];
    for( let i = 0; i < scaler.length; i++ ) {
      if ( scaler[i] ) {
        scaled_bases.push( mulbypowerof2( basis, i ) );
      }
    }
    product.set( add( ...scaled_bases ) );
    return product;
  }

  function mulbypowerof2( basis, power ) {
    const scaled_basis = new Uint1Array( basis.length  + power );
    scaled_basis.set( basis, power );
    return scaled_basis;
  }

  function div( u, v ) {
      let quotient, remainder;

      return { quotient, remainder };
  }

  function mod( u, v ) {
    return div( u, v ).remainder;
  }
}

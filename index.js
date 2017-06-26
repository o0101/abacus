"use strict";
// all arguments are assumed to be typed arrays of bits, or equivalently, uint1array
{
  // import 

    const Uint1Array = require('uint1array');

  // export

    const bitmath = {
      add, dif, mul, div, 
      less_than, more_than, equal,
      mod,
      inv, and, xor, or
    };

    try { module.exports = bitmath; } catch(e) { Object.assign( self, { bitmath } ) }
  
  // helpers 

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
      if ( n >= 0 ) {
        return { point: n, borrow : 0 };
      }
      let { point, carry } = to_carry( n, b ); 
      const borrow = carry + 1;
      carry += 1;
      point += borrow*b;
      point %= b;
      return { point, borrow };
    }

    function find_msb( u ) {
      let i = u.length;
      while( i-- ) {
        if ( u[i] ) return i;
      }
      return i;
    }

  // combinators / applicatives / monads

    function pointwise( op, initial, does_carry, does_borrow, ...v ) {
      const maxlen = to_maxlen( ...v ) + ( (does_carry || does_borrow) ? 1 : 0 );
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
          xi = op(xi, borrowance);
          const { point, borrow } = to_borrow( xi, 2 ); 
          x[i] = point;
          borrowance = borrow;
        }
      }
      // TODO it may be necessary for some "novel operations" to loop until
      // carriage and borrowance are zero
      if ( does_carry && carriage ) {
        x[maxlen] = op( carriage, initial );
      }
      if ( does_borrow && borrowance ) {
        x[maxlen] = op( borrowance, initial );
      }

      return x;
    }

    function unary( op, v ) {
      return v.map( b => op(b) );
    }

  // comparators 

    // equals is timesafe
    // no sidechannels
    function equal( u, v ) {
      const maxlen = Math.max( u.length, v.length );
      let eq = true;
      for( let i = 0; i < maxlen; i++ ) {
        eq = eq && u[i] == v[i]; 
      }
      return eq;
    }

    // true if u < v 
    // not timesafe
    function less_than( u, v ) {
      const minlen = Math.min( u.length, v.length );
      let i = minlen;
      let eq = true;
      let lt = true;
      while( i-- ) {
        eq = eq && u[i] == v[i]; 
        if ( eq ) continue;
        lt = lt && u[i] < v[i];    
        break;
      }
      return ! eq && lt;
    }

    // true if u > v 
    // not timesafe
    function more_than( u, v ) {
      const minlen = Math.min( u.length, v.length );
      let i = minlen;
      let eq = true;
      let mt = true;
      while( i-- ) {
        eq = eq && u[i] == v[i]; 
        if ( eq ) continue;
        mt = mt && u[i] > v[i];    
        break;
      }
      return ! eq && mt;
    }

  // bitwise operators 

    function xor( ...v ) {
      return pointwise( (a,b) => a ^ b, 0, false, false, ...v );
    }

    function and( ...v ) {
      return pointwise( (a,b) => a & b, 1, false, false, ...v );
    }

    function or( ...v ) {
      return pointwise( (a,b) => a | b, 0, false, false, ...v );
    }

    function inv( v ) {
      return unary( a => (~a)&1, v );
    }

  // carry and borrow operators 

    function add( ...v ) {
      return pointwise( (a,b) => a + b, 0, true, false, ...v );
    }

    function dif( ...v ) {
      const head = v.shift();
      const tail = add( ...v );
      return pointwise( (a,b) => a - b, 0, false, true, head, tail );
    }

  // convolving operators 

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

  // inverse convolution 

    function div( u, v ) {
      let dividend = u;
      const original_dividend = u;
      const divisor = v;
      let quotient = new Uint1Array( dividend.length );  
      const remainder = new Uint1Array( divisor.length );

      let dividend_msb = find_msb( dividend );
      const divisor_msb = find_msb( divisor );
      console.log( `dividend ${u} msb ${dividend_msb}, divisor ${v} msb ${divisor_msb}` );
      let i = dividend_msb - divisor_msb;
      let j = dividend_msb;
      do {
        let dividend_msb = find_msb( dividend );
        const dividend_slice = dividend.subarray( dividend_msb - divisor_msb, dividend_msb + 1 );
        console.log( `j${j}, dividend ${dividend}, slice ${dividend_slice}` );
        if ( less_than( divisor, dividend_slice ) || equal( divisor, dividend_slice ) ) {
          quotient[j] = 1;
          dividend = bitmath.sub( dividend_slice, divisor );
        } else {
          const new_dividend = new Uint1Array( dividend_slice.length + 1 );
          new_dividend.set( dividend_slice );
          new_dividend[dividend_slice.length] = original_dividend[dividend_slice.length];
          dividend = new_dividend;
        }
        j -= 1;
      } while( j > -1 && dividend.length < original_dividend.length || less_than( divisor, dividend ) )

      remainder.set( dividend );

      quotient = quotient.subarray( j+1, find_msb( quotient ) + 1 );

      return { quotient, remainder };
    }

    function mod( u, v ) {
      return div( u, v ).remainder;
    }
}

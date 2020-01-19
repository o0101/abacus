import Uint1Array from 'uint1array';
  // export

    const bitmath = {
      modexp, modexp_naive,
      add, dif, mul, div, 
      less_than, more_than, equal,
      quo, mod,
      inv, and, xor, or,
      to, from
    }

    export default bitmath;

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
    
    function to_borrow( top, bottom ) {
      let n = top - bottom;
      if ( n >= 0 ) {
        return { point : n, borrow : 0 }
      }
      n += 2;
      return { point : n, borrow : 2 }
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
      // normalize lengths
      v = v.map( b => {
        const bnew = new Uint1Array( maxlen );
        bnew.set( b ); 
        return bnew;
      });
      const head = v.shift();  
      const vnum = v.length;

      const x = new Uint1Array( maxlen );
      x.set( head );

      let carriage = initial;
      let borrowance = initial;
      for( let i = 0; i < maxlen; i++ ) {
        let xi = x[i];
        if ( does_borrow ) {
          xi = op(xi, borrowance); 
          borrowance = initial;
        }
        for( let j = 0; j < vnum; j++ ) {
          if ( does_borrow ) {
            // FIXME ought to throw op to to_borrow, why assume we know what metric ?
            const { point, borrow } = to_borrow( xi, v[j][i] );
            borrowance += borrow;
            xi = point;
          } else {
            xi = op( xi, v[j][i] );
          }
        }
        if ( does_carry ) {
          xi = op(xi, carriage);
          const { point, carry } = to_carry( xi, 2 ); 
          x[i] = point;
          carriage = carry;
        }
        if ( does_borrow ) {
          borrowance >>= 1;
          x[i] = xi;
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

      const result = x.subarray( 0, find_msb(x) + 1 );
      return result;
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
      const msb = Math.max( find_msb( u ), find_msb( v ) );
      let i = msb;
      let eq = true;
      let lt = true;
      do {
        eq = eq && u[i] == v[i]; 
        if ( eq ) continue;
        lt = lt && (u[i] || 0) < (v[i] || 0);    
        break;
      } while( i-- );
      return ! eq && lt;
    }

    // true if u > v 
    // not timesafe
    function more_than( u, v ) {
      const msb = Math.max( find_msb( u ), find_msb( v ) );
      let i = msb;
      let eq = true;
      let mt = true;
      do{
        eq = eq && u[i] == v[i]; 
        if ( eq ) continue;
        mt = mt && (u[i] || 0) > (v[i] || 0);
        break;
      } while( i-- );
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
      return product.subarray(0, find_msb(product)+1);
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
  
    // novel operation ( xor convolution )
    function xul( ...v ) {
      let product = v.shift();
      while( v.length ) {
        product = xul2arity( product, v.shift() );
      }
      return product.subarray(0, find_msb(product)+1);
    }
  
    function xul2arity( basis, scaler ) {
      const product = new Uint1Array( basis.length + scaler.length ); 
      const scaled_bases = [];
      for( let i = 0; i < scaler.length; i++ ) {
        if ( scaler[i] ) {
          scaled_bases.push( xulbypowerof2( basis, i ) );
        }
      }
      product.set( xor( ...scaled_bases ) );
      return product;
    }
  
    function xulbypowerof2( basis, power ) {
      const scaled_basis = new Uint1Array( basis.length  + power );
      scaled_basis.set( basis, power );
      const result = inv( scaled_basis );
      return result;
    }
  
  
  // inverse convolution 

    function div( u, v ) {
      if ( less_than( u, v ) ) {
        return {
          quotient : Uint1Array.of(0),
          remainder: new Uint1Array( u )
        };
      } else if ( equal( u, v ) ) {
        return {
          quotient : Uint1Array.of(1),
          remainder: Uint1Array.of(0)
        }
      }
      const dividend_length = find_msb( u ) + 1;
      const dividend = u.subarray( 0, dividend_length );
      const divisor_length = find_msb( v ) + 1;
      const divisor = v.subarray( 0, divisor_length );
      const n = new Array( dividend_length );
      const t = new Array( dividend_length );
      const q = new Uint1Array( dividend_length );
      let i = 0;
      let j = dividend_length - divisor_length;
      let extend = j;
      let run = false;
      n[i] = dividend.subarray( j, dividend_length + 1 );
      while( extend >= 0 ) {
        t[i] = less_than( divisor, n[i] ) || equal( divisor, n[i] ); 
        if ( t[i] ) {
          run = false;
          j = j - 1;
          q[extend] = 1; 
          i += 1;
          const diff = dif( n[i-1], divisor )
          n[i] = new Uint1Array( divisor.length );
          n[i].set( diff );
        } else {
          if ( extend == 0 ) break;
          if ( run ) {
          //if ( j - extend > 1 ) {
            j -= 1;
            run = false;
          } else {
            run = true;
          }
          i += 1;
          n[i] = new Uint1Array( n[i-1].length + 1 );
          n[i].set( n[i-1], 1 );
          extend -= 1;
          n[i][0] = dividend[extend];
        }
      }
      const remainder = n[i];
      const quotient = q.subarray( 0, find_msb( q ) + 1 );
      return { quotient, remainder };
    }

    function mod( u, v ) {
      return div( u, v ).remainder;
    }

    function quo( u, v ) {
      return div( u, v ).quotient;
    }

  // repetition ( modular exponentiation )

    /** 
      Idea is to take binary expansion of exponent
      And perform only the minimum necessary multiplications.
    **/

    function square( b ) {
      return mul( b, b );
    }

    function modexp_naive( base, exp, modulus ) {
      // naive first
      let product = Uint1Array.of(1);
      exp = toSmallNumber( exp );
      console.log( toSmallNumber(base), exp, toSmallNumber(modulus) );
      while( exp-- ) {
        product = mul( product, base ); 
        console.log( "mul->", toSmallNumber(product));
        product = mod( product, modulus );
        console.log( "mod->", toSmallNumber(product));
      }
      return product.subarray( 0, find_msb( product ) + 1 );
    }

    // this is trying to be timesafe but I don't think it really succeeds
    function modexp( base, exp, modulus ) {
      let product = Uint1Array.of( 1 );
      const baseline = new Uint1Array( modulus.length );
      baseline[0] = 1;
      exp.forEach( (b,i) => {
        console.log( `b ${b}, i ${i}` );
        let partial_product = new Uint1Array(base);
        while( i ) {
          console.log( `square` );
          partial_product = square( partial_product );
          partial_product = mod( partial_product, modulus );
          i--;
        }
        if ( b ) {
          console.log( `include` );
          product = mul( product, partial_product );
          product = mod( product, modulus );
        } else {
          console.log( `ignore` );
          product = mul( product, baseline );
          product = mod( product, modulus );
        }
      });
      return product.subarray( 0, find_msb( product ) + 1 );
    }

  // to small number

    function to( b ) { return toSmallNumber(b) };
    function from( n ) { return fromSmallNumber(n) };

    function toSmallNumber( b ) {
      let n = 0;
      let base = 2;
      let term = 1;
      b.forEach( unit => {
        n += term * unit;
        term *= base;
      });
      return n;
    }

    function fromSmallNumber( n ) {
      const bits = [];
      while( n ) {
        bits.push( n % 2 );
        n = n >> 1;
      }
      return Uint1Array.of( ...bits );
    }


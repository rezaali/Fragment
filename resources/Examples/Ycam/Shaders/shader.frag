#include "uniforms.glsl"
#include "noise3D.glsl"
#include "pi.glsl"

in vec4 vColor;
in vec2 vTexcoord;

out vec4 oColor;

uniform float size; //slider:0.0,2.0,0.5

vec2 ycam[9] = vec2[](
  vec2( 140.0, 66.0 ),
  vec2( 24.0, 0.0 ),
  vec2( 0.0, 37.0 ),
  vec2( 115.0, 105.0 ),
  vec2( 115.0, 240.0 ),
  vec2( 165.0, 240.0 ),
  vec2( 165.0, 105.0 ),
  vec2( 280.0, 37.0 ),
  vec2( 256.0, 0.0 )
);

float area2( in vec2 a, in vec2 b, in vec2 c ) {
		return ( ( ( a.x * b.y ) + ( a.y * c.x ) + ( b.x * c.y ) ) -
					 ( ( c.x * b.y ) + ( c.y * a.x ) + ( b.x * a.y ) ) );
}

float area( in vec2 a, in vec2 b, in vec2 c ) {
		return area2( a, b, c ) * 0.5;
}

bool left( in vec2 a, in vec2 b, in vec2 c ) {
  return area2( a, b, c ) > 0;
}

bool leftOn( in vec2 a, in vec2 b, in vec2 c ) {
  return area2( a, b, c ) >= 0;
}

bool colinear( in vec2 a, in vec2 b, in vec2 c ) {
  return area2( a, b, c ) == 0;
}

bool betweenAprox( in vec2 a, in vec2 b, in vec2 c ) {
  if( a[0] != b[0] ) {
      return ( ( a[ 0 ] <= c[ 0 ] ) && ( c[ 0 ] <= b[ 0 ] ) ) ||
             ( ( a[ 0 ] >= c[ 0 ] ) && ( c[ 0 ] >= b[ 0 ] ) );
  }
  else {
    return ( ( a[ 1 ] <= c[ 1 ] ) && ( c[ 1 ] <= b[ 1 ] ) ) ||
           ( ( a[ 1 ] >= c[ 1 ] ) && ( c[ 1 ] >= b[ 1 ] ) );
  }
  return false;
}

bool between( in vec2 a, in vec2 b, in vec2 c ) {
  if( !colinear( a, b, c ) ) {
    return false;
  }
  if( a[0] != b[0] ) {
      return ( ( a[ 0 ] <= c[ 0 ] ) && ( c[ 0 ] <= b[ 0 ] ) ) ||
             ( ( a[ 0 ] >= c[ 0 ] ) && ( c[ 0 ] >= b[ 0 ] ) );
  }
  else {
    return ( ( a[ 1 ] <= c[ 1 ] ) && ( c[ 1 ] <= b[ 1 ] ) ) ||
           ( ( a[ 1 ] >= c[ 1 ] ) && ( c[ 1 ] >= b[ 1 ] ) );
  }
  return false;
}

bool intersectProper( in vec2 a, in vec2 b, in vec2 c, in vec2 d ) {
	if( colinear( a, b, c ) ||
      colinear( a, b, d ) ||
      colinear( c, d, a ) ||
      colinear( c, d, b ) ) {
    return false;
  }
  if( left( a, b, c ) != left( a, b, d ) &&
      left( c, d, a ) != left( c, d, b ) ) {
      return true;
  }
  return false;
}

bool intersect( in vec2 a, in vec2 b, in vec2 c, in vec2 d ) {
  if( intersectProper( a, b, c, d ) ) {
    return true;
  }
  else if( between( a, b, c ) ||
           between( a, b, d ) ||
           between( c, d, a ) ||
           between( c, d, b ) ) {
    return true;
  }
  return false;
}

void processLogo() {
	for( int i = 0; i < 9; i++ ) {
	  ycam[ i ].x = ycam[ i ].x / 280.0 - 0.5;
	  ycam[ i ].y = - ycam[ i ].y / 240.0 + 0.5;
	  ycam[ i ].x *= size;
	  ycam[ i ].y *= size;
	}
}

float insideLogo( in vec2 pt ) {
	int len = 9;
	for( int i = 0; i < len; i++ ) {
		vec2 a = ycam[ i ];
		vec2 b = ycam[ ( i + 1 ) % len ];
		float area = area2( a, b, pt );
		if( area > 0.0 && area > 0.1 ) {
			return 1.0;
		}
	}
	return 0.0;
}

vec2 tr = vec2( 1.0, 1.0 );
vec2 bl = vec2( -1.0, -1.0 );

float line( in vec2 a, in vec2 b,in vec2 c, in float lineWidth ) {
		float area = area2( a, b, c );
		float lw = lineWidth / max( iResolution.x, iResolution.y );
		lw *= 0.5;
		if( area > -lw && area < lw && betweenAprox( a, b, c ) ) {
			return 1.0;
		}
		return 0.0;
}

float cross2(  in vec2 a, in vec2 b ) {
  return a.x * b.y -  a.y * b.x;
}

float intersectTime( in vec2 a, in vec2 b, in vec2 c, in vec2 d ) {
  vec2 p = a;
  vec2 r = b - p;
  vec2 q = c;
  vec2 s = d - q;
  return ( cross2( q, s ) - cross2( p, s ) ) / cross2( r, s );
}

void intersectTimes( in vec2 a, in vec2 b, in vec2 c, in vec2 d, out float t, out float u ) {
  vec2 p = a;
  vec2 r = b - p;
  vec2 q = c;
  vec2 s = d - q;
  t = ( cross2( q, s ) - cross2( p, s ) ) / cross2( r, s );
  u = ( cross2( p, r ) - cross2( q, r ) ) / cross2( s, r );
}

bool intersectTest( in vec2 a, in vec2 b, in vec2 c, in vec2 d ) {
  vec2 p = a;
  vec2 r = b - p;
  vec2 q = c;
  vec2 s = d - q;
  if( cross2( r, s ) != 0.0 ) {
    return true;
  }
  return false;
}

void main(void)
{
		processLogo();

		vec2 q = vTexcoord.xy;
    vec2 p = -1.0 + 2.0 * q;
		p.x *= iAspect;
		float time = 15.0 + iGlobalTime;


		vec3 col = vec3( 0.0 );

    float alpha = 0.0;
    float t, u;
    int len = 9;
    int hit = 0;
    for( int i = 0; i < 9; i++ ) {
      vec2 a = ycam[ i ];
      vec2 b = ycam[ ( i + 1 ) % len ];
      if( intersectTest( vec2( 0.0 ), p, a, b ) ) {
        intersectTimes( vec2( 0.0, 0.23 ), p, a, b, t, u );
        if( u > 0.0 && u < 1.0 && t > 1.0 ) {
            col = vec3( 1.0 );
            alpha = 1.0;
            hit = i;
        }
      }
    }

    float nv = 1.0 + snoise( vec3( 3.0 * p, sin( iAnimationTime * PI ) ) );
    nv /= 2.0;
    // col *= smoothstep( 0.0, 1.0, nv );
    col *= 1.0 - sin( nv * 100.0 );// > 0.5 ? 1.0 : 0.0;
    oColor = vec4( col, alpha );
}

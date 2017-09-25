#include "uniforms.glsl"
#include "easing.glsl"
#include "noise2D.glsl"
#include "pi.glsl"

uniform float spaceSize; //slider:10.0,30.0,10.0
uniform float aa; //slider:1.0,128.0,64.0
uniform vec2 smoothness; //range:0.0,1.0,0.25,0.75
uniform float lineWidth; //slider:0.0,10.0,0.25

in vec4 vColor;
in vec2 vTexcoord;

out vec4 oColor;

const vec3 zDir = vec3( 0.0, 0.0, 1.0 );

float circle( in vec2 s, in vec2 p, in float r )  //s = space //p = circle pos // r = radius
{
  float dist = length( s - p ) / r;
  return smoothstep( 0.0, 1.0, 1.0 - pow( dist, aa ) );
}

float cross2( in vec2 a, in vec2 b )
{
    return ( a.x * b.y - a.y * b.x );
}

float left( in vec2 a, in vec2 b, in vec2 c )
{
    vec2 ab = b - a;
    vec2 ac = c - a;
    return cross2( ab, ac );
}

float line( in vec2 s, in vec2 a, in vec2 b, in float lw )
{
  float hlw = lw * 0.5;
  vec2 ab2 = b - a;
  float abl = length( ab2 );
  vec3 ab = vec3( ab2 / abl, 0.0 );
  vec2 dir = cross( ab, zDir ).xy;
  vec2 p0 = a + dir * hlw;
  vec2 p1 = b + dir * hlw;
  vec2 p2 = b - dir * hlw;
  vec2 p3 = a - dir * hlw;

  float e0 = left( p0, p1, s ) > 0.0 ? 1.0 : 0.0;
  float e1 = left( p1, p2, s ) > 0.0 ? 1.0 : 0.0;
  float e2 = left( p2, p3, s ) > 0.0 ? 1.0 : 0.0;
  float e3 = left( p3, p0, s ) > 0.0 ? 1.0 : 0.0;

  float sdf = 1.0 - max( abs( left( a, b, s ) ), 0.0 ) / ( hlw * abl );
  sdf = pow( sdf, aa );
  return e0 * e1 * e2 * e3 * sdf;
}

float box( in vec2 s, in vec2 p, in vec2 d )
{
  vec2 hd = d * 0.5;
  vec2 p0 = p + vec2( -hd.x, -hd.y );
  vec2 p1 = p + vec2( hd.x, -hd.y );
  vec2 p2 = p + vec2( hd.x, hd.y );
  vec2 p3 = p + vec2( -hd.x, hd.y );
  float e0 = left( p0, p1, s ) > 0.0 ? 1.0 : 0.0;
  float e1 = left( p1, p2, s ) > 0.0 ? 1.0 : 0.0;
  float e2 = left( p2, p3, s ) > 0.0 ? 1.0 : 0.0;
  float e3 = left( p3, p0, s ) > 0.0 ? 1.0 : 0.0;
  return e0 * e1 * e2 * e3 ;
  // return
}

void main(void)
{
    float hs = spaceSize * 0.5;
    vec2 p = spaceSize * vTexcoord;
    p.x *= iAspect;

    vec2 op = p;
    float divSize = 1.0;
    float total = spaceSize / divSize;
    total -= 1.0;
    vec2 cell = floor( p / divSize );

    p.x = mod( p.x, divSize ) / divSize;
    p.y = mod( p.y, divSize ) / divSize;

    cell = -total + 2.0 * total * cell;
    float rand = snoise( cell * 0.03 + 0.1 * vec2( sin( iAnimationTime * TWO_PI ) , cos( iAnimationTime * TWO_PI ) ) );

    float value = 0.0;

    if( rand > 0.0 ) {
      value = 1.0;
    }
    else{
      value = 0.0;
    }

    float size = 4.0;

    value = max( value, box( op, vec2( size ), vec2( size * 2.0 + 2.0 ) ) );
    value *= ( 1.0 - box( op, vec2( size ), vec2( size * 2.0 ) ) );
    value += box( op, vec2( size ), vec2( size * 2.0 - 2.0 ) );
    value *= ( 1.0 - box( op, vec2( size ), vec2( size * 2.0 - 4.0 ) ) );


    value = max( value, box( op, vec2( size, size + hs + size + 3.0 ), vec2( size * 2.0 + 2.0 ) ) );
    value *= ( 1.0 - box( op, vec2( size, size + hs + size + 3.0 ), vec2( size * 2.0 ) ) );
    value += box( op, vec2( size, size + hs + size + 3.0 ), vec2( size * 2.0 - 2.0 ) );
    value *= ( 1.0 - box( op, vec2( size, size + hs + size + 3.0), vec2( size * 2.0 - 4.0 ) ) );


    value = max( value, box( op, vec2( size + hs + size + 3.0 ), vec2( size * 2.0 + 2.0 ) ) );
    value *= ( 1.0 - box( op, vec2( size + hs + size + 3.0 ), vec2( size * 2.0 ) ) );
    value += box( op, vec2( size + hs + size + 3.0 ), vec2( size * 2.0 - 2.0 ) );
    value *= ( 1.0 - box( op, vec2( size + hs + size + 3.0 ), vec2( size * 2.0 - 4.0 ) ) );


    // value *= ( 1.0 - box( op, vec2( size, spaceSize - size ), vec2( size * 2.0 ) ) );
    // value *= ( 1.0 - box( op, vec2( spaceSize - size, spaceSize - size ), vec2( size * 2.0 ) ) );


    value = smoothstep( smoothness.x, smoothness.y, value );

    // oColor = vec4( vec3( p.x, p.y, 0.0 ), 1.0 );
    oColor = vec4( vec3( value ), 1.0 );
    // oColor = vec4( abs( cell / ( total ) ), 0.0, 1.0 );
}

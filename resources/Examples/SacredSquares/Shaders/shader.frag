#include "uniforms.glsl"
#include "easing.glsl"
#include "map.glsl"
#include "pi.glsl"

uniform float spaceSize; //slider:10.0,20.0,10.0
uniform float squareSize; //slider:0.0,10.0,5.0
uniform int numSquares; //slider:1,500,10
uniform float theta; //slider:0.0,0.1,0.01
uniform float lineWidth; //slider:0.0,5.0,0.25
uniform float alpha; //slider:0.01,1.0,1.0
uniform float scale; //slider:0.9,0.99,0.92
in vec4 vColor;
in vec2 vTexcoord;

out vec4 oColor;

const vec3 zDir = vec3( 0.0, 0.0, 1.0 );

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

  float circle1 = 1.0 - ( length( s - a ) / hlw );
  float circle2 = 1.0 - ( length( s - b ) / hlw );

  float sdf = 1.0 - max( abs( left( a, b, s ) ), 0.0 ) / ( hlw * abl );
  return max( e0 * e1 * e2 * e3 * sdf, max( circle1, circle2 ) );
}

float box( in vec2 s, in vec2 p, in vec2 d, in float lw )
{
  vec2 hd = d * 0.5;
  vec2 p0 = p - hd;
  vec2 p1 = p + vec2( hd.x, -hd.y );
  vec2 p2 = p + hd;
  vec2 p3 = p + vec2( -hd.x, hd.y );

  float value = line( s, p0, p1, lw );
  value = max( value, line( s, p1, p2, lw ) );
  value = max( value, line( s, p2, p3, lw ) );
  value = max( value, line( s, p3, p0, lw ) );
  // value = max( value, circle( s, p0, d.x * 0.009 ) );
  // value = max( value, circle( s, p1, d.x * 0.009 ) );
  // value = max( value, circle( s, p2, d.x * 0.009 ) );
  // value = max( value, circle( s, p3, d.x * 0.009 ) );

  return value;
}

vec2 rotate( in vec2 p, in float theta ) {
  vec2 r = vec2( 0.0 );
  r.x = p.x * cos( theta ) - p.y * sin( theta );
  r.y = p.x * sin( theta ) + p.y * cos( theta );
  return r;
}

void main(void)
{
    float time = iAnimationTime;
    float hs = spaceSize * 0.5;
    vec2 p = - hs + spaceSize * vTexcoord;
    p.x *= iAspect;

    float value = 0.0;

    vec2 sz = vec2( squareSize );
    //rotate space
    float inc = 1.0 / float( numSquares + 1.0 );
    for( float i = 1.0; i > 0.0; i -= inc) {
      value += alpha * box( p, vec2( 0.0, 0.0 ), sz, lineWidth );
      // sz *= 0.7071067812;
      sz *= scale;
      p = rotate( p, theta * sin( ( time ) * TWO_PI ) );
      // p = rotate( p, theta * 1.0 );
    }

    oColor = vec4( vec3( 2.0 * value ), 1.0 );
}

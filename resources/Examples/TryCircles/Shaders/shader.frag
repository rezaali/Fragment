#include "uniforms.glsl"
#include "noise2D.glsl"
#include "easing.glsl"
#include "map.glsl"
#include "pi.glsl"

uniform float spaceSize; //slider:1.0,10.0,20.0
uniform float aa; //slider:1.0,1024.0,64.0
uniform vec2 smoothness; //range:0.0,1.0,0.25,0.75
uniform float lineWidth; //slider:0.001,0.05,0.025
uniform float baseLength; //slider:0.0,1.0,2.0
uniform float centerOffset; //slider:0.0,1.0,1.0
uniform float scaleFactor; //slider:0.0,1.0,1.0
uniform float angleOffset; //slider:0.0,0.1,1.0
uniform float circleSize; //slider:0.0,1.0,1.0
uniform float alpha; //slider:0.0,1.0,1.0
uniform float loops; //slider:0.0,40.0,1.0


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

  float sdf = 1.0 - max( abs( left( a, b, s ) ), 0.0 ) / ( hlw * abl );
  // sdf = abs( sin( PI * sdf * 5.0 ) );
  sdf = pow( sdf, aa );
  return e0 * e1 * e2 * e3 * sdf;
}

float lineShadow( in vec2 s, in vec2 a, in vec2 b, in float lw )
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
  return ( e0 * e1 * e2 * e3 );
}

vec2 rotate( in vec2 p, in float theta ) {
  vec2 r = vec2( 0.0 );
  r.x = p.x * cos( theta ) - p.y * sin( theta );
  r.y = p.x * sin( theta ) + p.y * cos( theta );
  return r;
}

void addLine( in vec2 p, in vec2 a, in vec2 b, in float lw, in float inValue, out float outValue )
{
  float shadow = lineShadow( p, a, b, lw * 1.03 );
  outValue = inValue * min( 1.0 - shadow, 1.0 );
  outValue += line( p, a, b, lw );
}

float circle( in vec2 s, in vec2 p, in float r, in float lw )  //s = space //p = circle pos // r = radius
{
  float rM = ( ( r + lw ) + ( r - lw ) ) * 0.5;
  vec2 dir = normalize( s - p );
  dir *= rM;
  float dist = length( s - p - dir ) / lw;
  // float sdf = abs( sin( PI * dist * 5.0 ) );
  // return sdf * smoothstep( 0.0, 1.0, 1.0 - pow( dist, aa ) );
  // float dist = length( s - p );
  return smoothstep( 0.0, 1.0, 1.0 - pow( dist, aa ) );
}


float betterTriangle( in vec2 space, in vec2 center, in float L )
{
  float t60 = tan( PI / 3.0 );
  float L2 = L * 0.5;
  float h = t60 * L2;
  float h2 = h * 0.5;
  vec2 a = vec2( 0.0, h2 );
  vec2 b = vec2( -L2, -h2 );
  vec2 c = vec2( L2, -h2 );

  vec2 cen = ( a + b + c ) / vec2( 3.0 );
  cen -= center;
  a -= cen;
  b -= cen;
  c -= cen;

  float e0 = left( a, b, space );
  e0 = 1.0 - clamp( e0 / L * aa, 0.0, 1.0 );
  float e1 = left( b, c, space );
  e1 = 1.0 - clamp( e1 / L * aa, 0.0, 1.0 );
  float e2 = left( c, a, space );
  e2 = 1.0 - clamp( e2 / L * aa, 0.0, 1.0 );
  return 1.0 - clamp( e0 + e1 + e2, 0.0, 1.0 );
}

float triangle( in vec2 space, in vec2 center, in float L )
{
  float t60 = tan( PI / 3.0 );
  float L2 = L * 0.5;
  float h = t60 * L2;
  float h2 = h * 0.5;
  vec2 a = vec2( 0.0, h2 );
  vec2 b = vec2( -L2, -h2 );
  vec2 c = vec2( L2, -h2 );

  vec2 cen = ( a + b + c ) / vec2( 3.0 );
  cen -= center;
  a -= cen;
  b -= cen;
  c -= cen;

  float e0 = left( a, b, space ) > 0.0 ? 1.0 : 0.0;
  float e1 = left( b, c, space ) > 0.0 ? 1.0 : 0.0;
  float e2 = left( c, a, space ) > 0.0 ? 1.0 : 0.0;
  return ( e0 * e1 * e2 );
}



void main(void)
{
    vec2 p = -0.5 * spaceSize + spaceSize * ( vTexcoord );
    p.x *= iAspect;
    vec3 col = vec3( 0.0 );

    p.y += centerOffset;
    float value = 0.0;

    // value = betterTriangle( p, vec2( 0.0 ), 1.0 );
    // // value += 0.1 * triangle( p, vec2( 0.0 ), 1.0 );

    float time = inOutBack( iAnimationTime ); 
    for( float i = 1.0; i <= loops; i++ ) {
      vec2 space = p;
      float sf = i * scaleFactor;
      space = rotate( space, i * angleOffset * sin( time * TWO_PI ) );
      float v1 = alpha * betterTriangle( space, vec2( 0.0 ), baseLength * sf );
      float v2 = alpha * betterTriangle( space, vec2( 0.0 ), ( baseLength * sf ) - lineWidth );
      value += clamp( v1 - v2, 0.0, 1.0 );
    }

    float c = circle( p, vec2( 0.0 ), 0.0, circleSize );
    value *= c;

    value = smoothstep( smoothness.x, smoothness.y, value );
    col = vec3( value );
    oColor = vec4( col, 1.0 );
}

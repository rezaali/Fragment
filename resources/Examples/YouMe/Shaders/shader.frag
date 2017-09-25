#include "uniforms.glsl"
#include "noise2D.glsl"
#include "easing.glsl"
#include "map.glsl"
#include "pi.glsl"

uniform float spaceSize; //slider:1.0,10.0,20.0
uniform float aa; //slider:1.0,128.0,64.0
uniform vec2 smoothness; //range:0.0,1.0,0.25,0.75
uniform vec2 thetaRange; //range:-5.25,2.0,-3.15,3.14
uniform float lineWidth; //slider:0.01,2.0,0.025
uniform float baseRadius; //slider:0.0,10.0,1.0
uniform float offset; //slider:0.0,-1.0,-1.0
uniform float decay; //slider:0.0,1.0,1.0


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
  float sdf = abs( sin( PI * dist * 5.0 ) );
  // float dist = length( s - p );
  return sdf * smoothstep( 0.0, 1.0, 1.0 - pow( dist, aa ) );
}



void main(void)
{
    vec2 p = -0.5 * spaceSize + spaceSize * ( vTexcoord );
    p.x *= iAspect;
    vec3 col = vec3( 0.0 );

    float value = 0.0;
    float r = baseRadius;
    value = 0.0;
    vec2 p0;
    vec2 p1;
    float inc = 0.05;
    float limit = 0.0;
    float start = thetaRange.x;
    float end = thetaRange.y;
    float total = PI;
    float delta = total - limit;
    vec2 off = vec2( offset, 0.0 );
    float rOld = r;
    for( float t = start; t < end; t += inc )
    {
      float x = rOld * cos( t );
      float y = - rOld * sin( t );

      if ( t > -PI * 0.5 ) {
        float n = map( t, -PI * 0.5, end, 1.0, decay );
        r = baseRadius * inOutQuint( n );
      }
      else {
        r = baseRadius;
      }

      float x1 = r * cos( t + inc );
      float y1 = - r * sin( t + inc );
      p0 = vec2( x, y );
      p1 = vec2( x1, y1 );
      value = max( value, line( p, - off - p0, - off - p1, lineWidth * 2.0 ) );
      value = max( value, line( p, off + p0, off + p1, lineWidth ) );
      rOld = r;
    }

    value = smoothstep( smoothness.x, smoothness.y, value );
    col = vec3( value );
    oColor = vec4( col, 1.0 );
}

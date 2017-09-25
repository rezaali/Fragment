#include "uniforms.glsl"
#include "easing.glsl"
#include "noise2D.glsl"
#include "map.glsl"
#include "pi.glsl"

uniform float spaceSize; //slider:2.0,50.0,10.0
uniform float aa; //slider:1.0,128.0,64.0
uniform vec2 smoothness; //range:0.0,1.0,0.25,0.75
uniform float lineWidth; //slider:0.0,10.0,0.25
uniform float offset; //slider:0.0,1.0,0.25
uniform float noiseScale; //slider:0.0,1.0,0.25
uniform float angleScale; //slider:0.0,1.0,0.25
uniform int total; //slider:0.0,100.0,1


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
  sdf = abs( sin( PI * sdf * 5.0 ) );
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

void main(void)
{
    float hs = spaceSize * 0.5;
    vec2 p = -hs + spaceSize * vTexcoord;
    p.x *= iAspect;

    float value = 0.0;
    float lineLength = 100.0;


    for( float i = 1; i <= total; i++ ) {
        vec2 pt0 = spaceSize * vec2( noiseScale * snoise( vec2( i, offset ) ), snoise( vec2( -i, offset ) ) );
        float angle = snoise( angleScale * vec2( i, offset ) ) * TWO_PI * 2.0;
        vec2 dir = vec2( cos( angle ), sin( angle ) ) * lineLength;

        addLine( p, pt0 + dir, pt0 - dir, lineWidth, value, value );
    }



    // addLine( p, vec2( -lineLength, lineLength ), vec2( lineLength, -lineLength ), lineWidth, value, value );
    // addLine( p, vec2( -lineLength, 0.0 ), vec2( lineLength, 0.0 ), lineWidth, value, value );


    value = smoothstep( smoothness.x, smoothness.y, value );
    oColor = vec4( vec3( value ), 1.0 );
}

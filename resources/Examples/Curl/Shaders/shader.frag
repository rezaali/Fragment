#include "uniforms.glsl"
#include "easing.glsl"
#include "noise3D.glsl"
#include "pi.glsl"

uniform float spaceSize; //slider:10.0,50.0,10.0
uniform float aa; //slider:1.0,128.0,64.0
uniform vec2 smoothness; //range:0.0,1.0,0.25,0.75
uniform float lineWidth; //slider:0.0,10.0,0.25
uniform float deltaStep; //slider:0.0,1.0,0.25
uniform float noiseScale; //slider:0.0,1.0,0.25
uniform float timeScale; //slider:0.0,5.0,0.25
uniform float palette; //dialer:0.0,1.0,0.001

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

void main(void)
{
    float hs = spaceSize * 0.5;
    vec2 p = spaceSize * vTexcoord;
    p.x *= iAspect;

    vec2 divSize = vec2( 1.0 );
    vec2 total = spaceSize / divSize;
    total -= 1.0;
    vec2 cell = floor( p / divSize );

    p.x = mod( p.x, divSize.x ) / divSize.x;
    p.y = mod( p.y, divSize.y ) / divSize.y;

    p = -1.0 + 2.0 * p;    

    float time = timeScale * inOutSine( sin( iAnimationTime * TWO_PI ) );
    vec2 curl;
    vec2 inc = vec2( deltaStep, 0.0 );
    vec2 cx = cell * noiseScale;

    curl.x = snoise( vec3( cx.xy - inc.yx, time ) ) - snoise( vec3( cx.xy + inc.yx, time ) );
    curl.y = snoise( vec3( cx.xy - inc.xy, time ) ) - snoise( vec3( cx.xy + inc.xy, time ) );

    vec2 mx = curl;//normalize( total * ( iMouse.xy / iResolution.xy ) - cell );

    float theta = atan( mx.y, mx.x ) / PI;
    float value = line( p, vec2( -mx ), vec2( mx ), lineWidth );

    vec3 color = texture( iPalettes, vec2( theta, palette ) ).rgb;
    float cvalue = length( color );
    value = smoothstep( smoothness.x, smoothness.y, value );
    oColor = vec4( vec3( value ), 1.0 );
}

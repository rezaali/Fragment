#include "uniforms.glsl"
#include "noise2D.glsl"
#include "easing.glsl"
#include "pi.glsl"

uniform float spaceSize; //slider:10.0,40.0,20.0
uniform float aa; //slider:1.0,128.0,64.0
uniform float spacing; //slider:0.0,0.5,1.0
uniform float extrude; //slider:0.0,0.5,0.5

uniform float alpha; //slider:0.0,1.0,1.0
uniform float lineWidth; //slider:0.01,0.1,0.025
uniform float baseRadius; //slider:0.0,10.0,1.0


uniform int loops; //slider:1.0,100,8
in vec4 vColor;
in vec2 vTexcoord;

out vec4 oColor;

float circle( in vec2 s, in vec2 p, in float r, in float lw )  //s = space //p = circle pos // r = radius
{
  float rM = ( ( r + lw ) + ( r - lw ) ) * 0.5;
  vec2 dir = normalize( s - p );
  dir *= rM;
  float dist = length( s - p - dir ) / lw;
  // float dist = length( s - p );
  return smoothstep( 0.0, 1.0, 1.0 - pow( dist, aa ) );


}

void main(void)
{
    float time = iAnimationTime < 0.5 ? iAnimationTime * 2.0 : 2.0 * ( 1.0 - iAnimationTime );
    time = inOutSine( time );
    // time = 1.0;

    vec2 p = -0.5 * spaceSize + spaceSize * vTexcoord;
    p.x *= iAspect;
    vec3 col = vec3( 0.0 );

    float value = 0.0;


    float ext = time * spaceSize * extrude;

    for( float i = 1.0; i < loops; i++ ) {
      float r = baseRadius + i * spacing;
      value += alpha * circle( p, vec2( ext, 0.0 ), r, lineWidth );//+ time * lineWidth * 0.25 );
      value += alpha * circle( p, vec2( 0.0, ext ), r, lineWidth );//+ time * lineWidth * 0.25 );
      value += alpha * circle( p, vec2( -ext, 0.0 ), r, lineWidth );//+ time * lineWidth * 0.25 );
      value += alpha * circle( p, vec2( 0.0, -ext ), r, lineWidth );//+ time * lineWidth * 0.25 );
    }

    col = vec3( value * value );
    oColor = vec4( col, 1.0 );
}

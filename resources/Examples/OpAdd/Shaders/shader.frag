#include "uniforms.glsl"
#include "noise2D.glsl"
#include "pi.glsl"

uniform float freq; //slider:0.0,100.0,10.0
uniform vec2 aa; //range:0.0,1.0,0.0,1.0

in vec4 vColor;
in vec2 vTexcoord;

out vec4 oColor;

void main(void)
{
  vec2 p = -1.0 + 2.0 * vTexcoord;
  p.x * iAspect;

  float time = iAnimationTime * TWO_PI;
  float value0 = sin( freq * length( p + vec2( 0.0, 0.0 ) ) + time );
  float value1 = sin( freq * length( p + vec2( 1.0, 0.0 ) ) + time );
  float value2 = sin( freq * length( p + vec2( -1.0, 0.0 ) ) + time );
  float value3 = sin( freq * length( p + vec2( 0.0, 1.0 ) ) + time );
  float value4 = sin( freq * length( p + vec2( 0.0, -1.0 ) ) + time );




  float value = smoothstep( aa.x, aa.y, value0 + value1 + value2 + value3 + value4 );




  oColor = vec4( vec3( value ), 1.0 );
}

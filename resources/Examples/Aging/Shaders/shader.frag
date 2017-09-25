#include "uniforms.glsl"
#include "noise2D.glsl"
#include "map.glsl"
#include "pi.glsl"

uniform float spaceSize; //slider:10.0,50.0,10.0
uniform float aa; //slider:1.0,128.0,64.0
uniform float baseRadius; //slider:0.0,10.0,0.25
uniform float lineWidth; //slider:0.0,1.0,0.25
uniform float spacing; //slider:0.0,1.0,0.25
uniform float distortion; //slider:0.0,1.0,0.1
uniform float noiseScale; //slider:0.0,1.0,0.1
uniform float noiseOffset; //slider:0.0,1.0,0.1
uniform vec2 smoothness; //range:0.0,1.0,0.0,1.0

in vec4 vColor;
in vec2 vTexcoord;

out vec4 oColor;

const vec3 zDir = vec3( 0.0, 0.0, 1.0 );

float circle( in vec2 s, in vec2 p, in float r, in float lw )  //s = space //p = circle pos // r = radius
{
  float vr = r + distortion * r * snoise( noiseOffset + noiseScale * normalize( s ) );
  vec2 dp = s - p;
  vec2 ns = normalize( dp );
  float dist = ( length( ns * vr - dp ) / lw );
  return smoothstep( 0.0, 1.0, 1.0 - pow( dist, aa ) );
}

void main(void)
{
    float hs = spaceSize * 0.5;
    vec2 p = -hs + spaceSize * vTexcoord;
    p.x *= iAspect;

    float value = 0.0;

    float total = 40.0;
    float rad = baseRadius;
    for( float i = 1; i <= total; i++ ) {
      float n = i / total;
      float cv = circle( p, vec2( 0.0 ), rad, lineWidth );
      value = max( value, cv );
      rad += 2.0 * lineWidth + spacing;
      value += cv > 0.0 ? snoise( 10.0 * iAnimationTime + 2.0 * p ) : 0.0;
      value *= cv > 0.0 ? sin( n * PI ) : 1.0;
    }

    value = smoothstep( smoothness.x, smoothness.y, value );
    oColor = vec4( vec3( value ), 1.0 );
}

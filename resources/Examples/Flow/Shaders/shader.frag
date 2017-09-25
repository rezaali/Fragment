#include "uniforms.glsl"
#include "noise2D.glsl"
#include "map.glsl"
#include "pi.glsl"

uniform float spaceSize; //slider:1.0,10.0,20.0
uniform float aa; //slider:1.0,1024.0,64.0
uniform vec2 smoothness; //range:0.0,1.0,0.25,0.75

in vec4 vColor;
in vec2 vTexcoord;

out vec4 oColor;

float solidCircle( in vec2 s, in vec2 p, in float r )  //s = space //p = circle pos // r = radius
{
  float dist = length( s - p  ) / r;
  return smoothstep( 0.0, 1.0, 1.0 - pow( dist, aa ) );
}

void main(void)
{
    vec2 p = -0.5 * spaceSize + spaceSize * ( vTexcoord );
    p.x *= iAspect;

    vec3 col = vec3( 0.0 );
    float value = 0.0;


    for( float i = -spaceSize * 0.6; i <= spaceSize * 0.6 ; i += 0.25 ) {
      vec2 pt = vec2( i +  snoise( 0.05 * vec2( 0.75 * i * p.y, 40.0 * sin( iAnimationTime * TWO_PI ) + p.y ) ), p.y );
      float dist = 1.0 - clamp( length( p - pt ), 0.0, 1.0 );
      // value = smoothstep( smoothness.x, smoothness.y, value );
      // dist = pow( dist, aa );
      value = max( value, dist );
    }

    value *= solidCircle( p, vec2( 0.0 ), spaceSize * 0.4 );

    value = smoothstep( smoothness.x, smoothness.y, value );
    col = vec3( value );
    oColor = vec4( col, 1.0 );
}

#include "uniforms.glsl"
#include "easing.glsl"
#include "pi.glsl"

uniform float spaceSize; //slider:10.0,40.0,20.0
uniform float aa; //slider:1.0,128.0,64.0
uniform float spacing; //slider:0.01,1.0,1.0
uniform vec2 MinMaxRadius; //range:0.0,1.0,0.1,0.4
uniform int loops; //slider:1.0,20,8
in vec4 vColor;
in vec2 vTexcoord;

out vec4 oColor;

float circle( in vec2 s, in vec2 p, in float r )  //s = space //p = circle pos // r = radius
{
  float dist = length( s - p ) / r;
  return smoothstep( 0.0, 1.0, 1.0 - pow( dist, aa ) );
}

void main(void)
{
    float time = iAnimationTime < 0.5 ? iAnimationTime * 2.0 : 2.0 * ( 1.0 - iAnimationTime );


    vec2 p = -0.5 * spaceSize + spaceSize * vTexcoord;
    p.x *= iAspect;
    vec3 col = vec3( 0.0 );

    float value = 0.0;

    float theta = 0;
    for( float j = 1; j < loops; j++ ) {
      float size = 0.5 * ( MinMaxRadius.x + MinMaxRadius.y );
      float cir = 2.0 * PI * size * j ;
      float num = floor( cir / size );
      float inc = TWO_PI / num;
      inc = max( inc, 0.1 );
      for( float i = 0; i < TWO_PI; i += inc ) {
          // i += iAnimationTime * TWO_PI;
          float thetaPlus = iAnimationTime * TWO_PI;
          float r = MinMaxRadius.x + MinMaxRadius.y * sin( i + j * TWO_PI * iAnimationTime );
          vec2 pos = ( spacing + 0.5 * size ) * ( j ) * vec2( cos( i ), sin( i ) );
          value = max( value, circle( p, pos, r ) );
      }
    }


    value = pow( value, 8.0 );
    col = vec3( value );


    oColor = vec4( col, 1.0 );
}

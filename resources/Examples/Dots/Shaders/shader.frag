#include "uniforms.glsl"
#include "noise2D.glsl"
#include "gamma.glsl"
#include "pi.glsl"

uniform vec3 light; //ui:-1.0,1.0,1.0
uniform float rad;  //slider:0.0,1.0,1.0
uniform float shinyness;  //slider:0.0,64.0,10.0
uniform float noiseScale;  //slider:0.0,1.0,1.0
in vec4 vColor;
in vec2 vTexcoord;

out vec4 oColor;


float blinnPhongSpecular( vec3 lightDirection, vec3 viewDirection, vec3 surfaceNormal, float shininess ) {

  //Calculate Blinn-Phong power
  vec3 H = normalize(viewDirection + lightDirection);
  return pow(max(0.0, dot(surfaceNormal, H)), shininess);
}

vec3 sphere( in vec2 pos, in float radius )
{
  vec2 sp = - 1.0 + 2.0 * ( vTexcoord );
  sp.x *= iAspect;
  float r = 1.0 / radius;
  vec2 p = - 1.0 * r + 2.0 * r * ( vTexcoord - pos );
  p.x *= iAspect;

  vec3 pt = vec3( sp, 1.0 - length( p ) );
  vec3 diff = pt - light;
  float clr = clamp( dot( pt, light ), 0.0, 1.0 );
  clr = blinnPhongSpecular( light, vec3( 0.0, 0.0, 1.0 ), pt, shinyness );
  vec3 col = vec3( clr );
  return col;
}


void main(void)
{
    float time = iAnimationTime;
    oColor = iBackgroundColor;
    for( int i = 0; i < 5; i++) {
      vec2 pos = 0.5 * vec2( snoise( noiseScale * vec2( i * 10.0, time ) ), snoise( noiseScale * vec2( -i * 10.0, -time ) ) );
      vec3 sp = clamp( sphere( pos, 0.5 + rad * abs( snoise( noiseScale * vec2( i + time ) ) ) ), 0.0, 1.0 );
      oColor.rgb = max( oColor.rgb, sp );
    }

    oColor.rgb = pow( 1.0 - oColor.rgb, vec3( 10.0, 3.0, 1.0 ) );
    oColor = gamma( oColor );
}
//

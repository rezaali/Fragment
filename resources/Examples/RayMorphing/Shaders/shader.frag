#include "uniforms.glsl"
#include "rotate.glsl"
#include "shapes.glsl"
#include "csg.glsl"
#include "map.glsl"
#include "pi.glsl"
#include "cellular.glsl"
#include "gamma.glsl"
#include "easing.glsl"
#include "curlnoise.glsl"

in vec4 vColor;
in vec2 vTexcoord;

out vec4 oColor;

uniform vec4 core_color; //color
uniform vec4 tip_color; //color

vec3 hsv2rgb(vec3 c) {
  vec4 KV = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
  vec3 PV = abs(fract(c.xxx + KV.xyz) * 6.0 - KV.www);
  return c.z * mix(KV.xxx, clamp(PV - KV.xxx, 0.0, 1.0), c.y);
}

float form( vec3 pos ) {
  float time = sin( iAnimationTime * TWO_PI * 2.0 );
  float time2 = sin( iAnimationTime * TWO_PI * 4.0 );
  time = inBack( abs( time ) );
  time2 = inBack( abs( time2 ) );
  float result = Morph(

    mix( Icosahedron( pos, 1.0 ), Tetrahedron( pos, 0.75 ), time ),
    mix( Dodecahedron( pos, 1.0 ), Octahedron( pos, 1.0 ), time2 ),
    time );
  return result;
}

vec4 scene( vec3 pos ) {
  float time = iAnimationTime * TWO_PI;
  vec3 p = pos;
  p *= rotationMatrix( vec3( sin( time ), cos( time ), tan( time / 2.0 ) ), PI );
  float result = form( p );

  return vec4(
    mix(
      core_color.rgb,
      tip_color.rgb,
      clamp( PHI_P - pow( length( pos ), 3.0 ), 0.0, 1.0 ) ),
    result );
}

vec3 calcNormal( in vec3 pos ) {
    vec3 eps = vec3( 0.001, 0.0, 0.0 );
    vec3 nor = vec3(
        scene(pos+eps.xyy).a - scene(pos-eps.xyy).a,
        scene(pos+eps.yxy).a - scene(pos-eps.yxy).a,
        scene(pos+eps.yyx).a - scene(pos-eps.yyx).a );
    return normalize(nor);
}

float castRay( in vec3 ro, in vec3 rd ) {
    float maxd = 100.0; // ray marching distance max
    float s = maxd;
    float d = 0.0;
    for( int i = 0; i < 150; i++ ) {
        if( s < 0.0001 ||  s > maxd ) break;
        s = scene( ro + rd * d ).a;
        d += s * 0.5;
    }
    return d;
}

vec4 render( in vec3 ro, in vec3 rd, in vec2 uv ) {
  float t = castRay( ro, rd );
  vec3 pos = ro + t * rd;
  float mixvalue = clamp( 100.0 - t, 0.0, 1.0 );


  vec3 norm = calcNormal( pos );
  vec3 normal = iCameraViewMatrix * norm;
  float diffuse = clamp( dot( normal, vec3( 0, 0, 1 ) ), 0.0, 1.0 );


  vec3 color = gamma( hsv2rgb( vec3( 0.5 * sin( iAnimationTime * PI ) + pow( rd.x, 4.0 ) / 10.0 + sin( rd.y * PI ) / 5.0, 1.0, 1.0 ) ) );
  color = mix(
    color * vec3( iBackgroundColor.rgb ),
    scene( pos ).rgb,
    t < 10.0 ? 1.0 : 0.0 );

  // color = hsv2rgb( vec3( color.r, 1.0, 1.0 ) );


  float time = t/3.0 - diffuse;
  time /= diffuse;

  // color = hsv2rgb( vec3( diffuse, diffuse, time ) );
  float tm = clamp( diffuse - time, 0.0, 4.0 );
  color = mix( color, hsv2rgb( vec3( iAnimationTime * 2.0 + time/2.5, 1.0, 1.0 ) ), diffuse );

  return vec4( color, 1.0 );
}

vec4 render( in vec2 tc ) {
  vec2 q = tc;
  vec2 p = -1.0 + 2.0 * q ;
  p.x *= iAspect;

  vec3 ro = iCameraEyePoint * 2.5;

  float radius = 0.4;
  float time = iAnimationTime * PI;

  vec3 rd = normalize( vec3( p.xy, - tan( iCameraFov ) ) ) * iCameraViewMatrix;
  rd *= iModelMatrix;
  ro *= iModelMatrix;
  vec4 col = render( ro, rd, p );
  return col;
}

void main(void)
{
  vec4 color = render( vTexcoord );
  oColor = gamma( color );

}

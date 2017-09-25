#include "uniforms.glsl"
#include "pi.glsl"

uniform float aa; //slider:0.0,10.0,1.0
uniform float lineWidth; //slider:0.0,0.1,0.10
uniform float radius; //slider:0.0,1.0,0.5
uniform float extrude; //slider:0.0,1.0,0.5
uniform float spacing; //slider:0.0,0.1,0.05
uniform float thetaOffset; //slider:0.0,0.10,0.05
uniform float offsetSpeed; //slider:0.0,1.0,0.5
uniform int loops; //slider:0.0,50.0,0.0


in vec4 vColor;
in vec2 vTexcoord;

out vec4 oColor;

vec2 rotate( in vec2 p, in float theta ) {
  vec2 r = vec2( 0.0 );
  r.x = p.x * cos( theta ) - p.y * sin( theta );
  r.y = p.x * sin( theta ) + p.y * cos( theta );
  return r;
}


float circle( in vec2 s, in vec2 p, in float r, in float lw, in float thetaOffset, in float extrude )  //s = space //p = circle pos // r = radius
{
  vec2 rs = rotate( s, iAnimationTime * TWO_PI );
  float rM = ( ( r + lw ) + ( r - lw ) ) * 0.5;
  vec2 dir = normalize( rs - p );

  float theta = atan( -dir.y, dir.x ) / PI;
  float offset = abs( theta ) * extrude * cos( ( thetaOffset + iAnimationTime * TWO_PI + theta ) * TWO_PI * 1.0 );
  dir *= rM;
  float dist = length( rs - p - dir - offset * dir ) / lw;

  float value = smoothstep( 0.0, 1.0, 1.0 - pow( dist, aa ) );
  return value;
}

void main(void)
{
  vec2 p = -1.0 + 2.0 * vTexcoord;
  p.x *= iAspect;

  float value = 0.0;
  float offset = iAnimationTime * PI * offsetSpeed;
  float ext = extrude * sin( iAnimationTime * PI );
  vec2 pos = vec2( 0.0 );

  for( float t = 1; t <= loops; t++ ) {
    value = max( value, circle( p, pos, radius + t * spacing, lineWidth, offset + t * thetaOffset, ext ) );
    value = max( value, circle( p, pos, radius + t * spacing, lineWidth, 0.0 + t * thetaOffset, ext ) );
  }
  oColor = vec4( vec3( value ), 1.0 );
}

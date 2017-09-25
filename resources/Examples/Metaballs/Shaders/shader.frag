#include "uniforms.glsl"
#include "pi.glsl"

in vec4 vColor;
in vec2 vTexcoord;

out vec4 oColor;

uniform float foff; //slider:0.0,2.0,0.1
uniform vec4 clr0; //color:1.0,0.0,0.0,1.0
uniform vec4 clr1; //color:0.0,1.0,0.0,1.0
uniform vec4 clr2; //color:0.0,0.0,1.0,1.0

float circle( in vec2 uv, in vec2 p, float radius, float falloff  ) {
	float dist = length( uv + p ) - radius;
	dist = exp( -2.0 * dist ) * falloff;
	return dist;
}

void main(void)
{
	vec2 uv = 2.0 * vTexcoord - 1.0;
	uv *= 2.0;

	vec2 p0 = vec2( sin( iGlobalTime ), cos(iGlobalTime ) );
	vec2 p1 = -vec2( sin( iGlobalTime ), cos(iGlobalTime ) );
	vec2 p2 = vec2( -sin( iGlobalTime ), cos(iGlobalTime ) );

	float c0 = circle( uv, p0, sin( iGlobalTime * 2.0 ), foff );
	float c1 = circle( uv, p1, cos( iGlobalTime * 2.0 ), foff );
	float c2 = circle( uv, p2, sin( -iGlobalTime * 2.0 ), foff );

	vec3 color = vec3(clr0) * c0;
	color += vec3( clr1 ) * c1;
	color += vec3( clr2 ) * c2;
	// color = vec3( length( color ) );

  oColor = vec4( color, 1.0 );
}

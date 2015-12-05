#include "uniforms.glsl"

in vec4 vColor;
in vec2 vTexcoord;

out vec4 oColor;

void main(void)
{
	vec3 rd = vec3( 0.0, 0.0, -1.0 );
	vec3 ro = abs( vec3( vTexcoord.x - 0.5, vTexcoord.y - 0.5, 0.0 ) );

	vec2 tx = vTexcoord;
	oColor = vec4( vec3( ro ), 1.0 );
}

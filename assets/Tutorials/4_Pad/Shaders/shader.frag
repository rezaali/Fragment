#include "uniforms.glsl"
#include "pi.glsl"

uniform vec2 xy; //pad:-1.0,1.0,0.0,0.0

in vec4 vColor;
in vec2 vTexcoord;

out vec4 oColor;

void main(void)
{
		float color = 0.0;
		vec2 p = -1.0 + 2.0 * vTexcoord;
		if( length( p - xy ) < 0.25 ) {
			color = 1.0;
		}
		oColor = vec4( vec3( color ), 1.0 );
}

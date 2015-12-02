#include "uniforms.glsl"

uniform float blue; //slider:0.0,1.0,1.0

in vec4 vColor;
in vec2 vTexcoord;

out vec4 oColor;

void main(void)
{
	oColor = vec4( vTexcoord.x, vTexcoord.y, blue, 1.0 );
}

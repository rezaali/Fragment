#include "uniforms.glsl"
#include "pi.glsl"

uniform vec4 color; //color:1.0,1.0,0.0,1.0

in vec4 vColor;
in vec2 vTexcoord;

out vec4 oColor;

void main(void)
{
		oColor = vec4( color );
}

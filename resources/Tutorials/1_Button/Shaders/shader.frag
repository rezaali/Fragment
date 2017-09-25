#include "uniforms.glsl"
#include "pi.glsl"

uniform bool whiteOut; //button:0

in vec4 vColor;
in vec2 vTexcoord;

out vec4 oColor;

void main(void)
{
		float color = 0.0;
		if( whiteOut ) {
				color = 1.0;
		}
		oColor = vec4( vec3( color ), 1.0 );
}

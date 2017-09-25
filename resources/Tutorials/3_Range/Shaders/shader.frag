#include "uniforms.glsl"
#include "pi.glsl"

uniform vec2 xRange; //range:0.0,1.0,0.25,0.75

in vec4 vColor;
in vec2 vTexcoord;

out vec4 oColor;

void main(void)
{
		float color = 0.0;
		if( vTexcoord.x > xRange.x && vTexcoord.x < xRange.y ) {
				color = 1.0;
		}
		oColor = vec4( vec3( color ), 1.0 );
}

#include "uniforms.glsl"
#include "pi.glsl"

uniform float freq; //slider:0.0,64.0,16.0
uniform float edge; //slider:0.0,64.0,16.0

in vec4 vColor;
in vec2 vTexcoord;

out vec4 oColor;

void main(void)
{
	vec2 tx = vTexcoord * vec2( iAspect, 1.0 );
	float value = sin( freq * TWO_PI * tx.x - iAnimationTime * TWO_PI );
	value *= cos( freq * TWO_PI * tx.y - iAnimationTime * TWO_PI );
	if( value > 0.0 ) {
		value = pow( value, 1.0 / edge );
	}
	oColor = vec4( vec3( value ), 1.0 );
}

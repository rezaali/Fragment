#include "uniforms.glsl"
#include "pi.glsl"

uniform vec2 freq; //dialer:1.0,5.0,2.0001

/*
// You can make int dialers
uniform int firstParam; //dialer:0,10,2
// You can also make float dialers
uniform float secondParam; //dialer:1.0,5.0,2.00001
// The last number represents the precision
// Add 0.0001 to last number to get more precision!
uniform vec3 lightPos; //dialer:-1.0,1.0,0.0001
uniform vec4 quatTest; //dialer:-1.0,1.0,0.001
*/

in vec4 vColor;
in vec2 vTexcoord;

out vec4 oColor;

void main(void)
{
		vec2 p = -1.0 + 2.0 * vTexcoord;
		float valueX = p.x * freq.x;
		float valueY = p.y * freq.y;

		oColor = vec4( vec3( fract( valueX * valueY ) ), 1.0 );
}

#include "uniforms.glsl"
#include "pi.glsl"

uniform vec2 colors; //ui:0.0,1.0,0.5

/*
//You can also make multisliders of vec3, and vec4s
uniform vec3 lightPos; //ui:0.0,1.0,0.5
uniform vec4 quatTest; //ui:0.0,1.0,0.5
*/

in vec4 vColor;
in vec2 vTexcoord;

out vec4 oColor;

void main(void)
{
		vec3 color = vec3( 0.0 );

		if( colors.x > vTexcoord.x ) {
				color.r = 1.0;
		}
		if( colors.y > vTexcoord.y ) {
			color.b = 1.0;
		}

		oColor = vec4( vec3( color ), 1.0 );
}

#include "uniforms.glsl"
#include "pi.glsl"

uniform float xPos; //slider:0.0,1.0,0.5

/*
//Uncomment and save file to see changes in the UI Panel
//This makes individual sliders
//In case you don't like the compressed ones
uniform vec2 twoSliders; //slider:0.0,1.0,0.5
uniform vec3 threeSliders; //slider:0.0,1.0,0.5
uniform vec4 fourSliders; //slider:0.0,1.0,0.5
//You can also make int sliders
uniform int xPosInt; //slider:0,10,5
*/

in vec4 vColor;
in vec2 vTexcoord;

out vec4 oColor;

void main(void)
{
		float color = 0.0;
		if( xPos > vTexcoord.x ) {
				color = 1.0;
		}
		oColor = vec4( vec3( color ), 1.0 );
}

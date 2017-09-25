#include "uniforms.glsl"
#include "pi.glsl"

in vec4 vColor;
in vec2 vTexcoord;

out vec4 oColor;

void main(void)
{
    oColor = vec4( vTexcoord.x, vTexcoord.y, 1.0, 1.0 );
}

#include "uniforms.glsl"
#include "pi.glsl"
#include "shapes.glsl"
#include "csg.glsl"

in vec4 vColor;
in vec2 vTexcoord;

out vec4 oColor;

float scene( vec3 pos ) {
    return Difference( Box( pos, 1.0 ), Sphere( pos, 1.2 ) );
}

#include "render.glsl"

void main(void)
{
    oColor = vec4( render( vTexcoord ), 1.0 );
}

#include "uniforms.glsl"
#include "gamma.glsl"
#include "easing.glsl"
#include "fbm.glsl"
#include "pi.glsl"

uniform vec3 mult; //ui:0.0,4.0,4.0
uniform vec3 off; //ui:0.0,4.0,4.0

uniform float speed; //slider:0.0,4.0,0.5
in vec4 vColor;
in vec2 vTexcoord;

out vec4 oColor;

void main(void)
{
    float time = inOutExpo( sin( iAnimationTime * PI ) );
    float r = 1.0 + fbm( vec3( mult.x * vTexcoord + off.x, speed * ( time ) ), 3 );
    float g = 1.0 + fbm( vec3( mult.y * vTexcoord + off.y, speed * ( time + 1 ) ), 3 );
    float b = 1.0 + fbm( vec3( mult.z * vTexcoord + off.z, speed * ( time + 2 ) ), 3 );

    r *= 0.5;
    g *= 0.5;
    b *= 0.5;

    vec3 col = vec3( r > g || r > b ? r : 0.0,
                     g > r || g > b ? g : 0.0,
                     b > g || b > r ? b : 0.0 );

    col = gamma( col );
    oColor = vec4( col, 1.0 );
    // oColor = vec4( pow( 1.0 - col, vec3( 64.0 ) ), 1.0 );
}

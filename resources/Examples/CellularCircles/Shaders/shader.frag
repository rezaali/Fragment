#include "uniforms.glsl"
#include "gamma.glsl"
#include "easing.glsl"
#include "map.glsl"
#include "pi.glsl"
#include "cellular.glsl"

uniform float mult; //slider:0.0,10.0,4.0
uniform int speed; //slider:0.0,4.0,0.5
uniform int stripes; //slider:0.0,8.0,2.0
uniform float palette; //slider:0.0,1.0,0.0
uniform vec2 paletteRange; //range:0.0,1.0,0.25,0.75
uniform vec2 offset; //pad:-1.0,1.0,0.0

in vec4 vColor;
in vec2 vTexcoord;

out vec4 oColor;

void main(void)
{
    float time = speed * inOutSine( iAnimationTime );
    vec2 p = vTexcoord;
    p.x *= iAspect;
    p += offset;
    vec2 F = cellular( p * mult );
    float distmap = F.x;
    float pattern = distmap;
    float lookup = fract( ( F.x + time ) * stripes ) * pow( ( 1.0 - F.x ), 1.0 );
    lookup = map( lookup, 0.0, 1.0, paletteRange.x, paletteRange.y );
    vec3 col = texture( iPalettes, vec2( lookup, palette ) ).rgb;
    col = vec3( col.x * col.y * col.z );
    col *= 1.5;
    // col = 1.0 - col;
    oColor = vec4( col, 1.0 );
}

#include "uniforms.glsl"
#include "pi.glsl"
#include "map.glsl"

in vec4 vColor;
in vec2 vTexcoord;

out vec4 oColor;

const float ra = 0.0 / 3.0 * 2.0 * PI;
const float ga = 1.0 / 3.0 * 2.0 * PI;
const float ba = 2.0 / 3.0 * 2.0 * PI;

// all of these can be played with
uniform float scale; //UI:0.0,32.0,18.0
uniform float tscale; //UI:0.0,32.0,7.0
uniform float pixels; //UI:0.0,16.0,2.0
uniform float symmetry;	//UI:0.0,32.0,13.0
uniform float palette; //UI:0.0,1.0,0.0
uniform float paletteLow; //UI:0.0,1.0,0.0
uniform float paletteHigh; //UI:0.0,1.0,1.0
uniform float offsetX; //UI:-1.0,1.0,1.0
uniform float offsetY; //UI:-1.0,1.0,1.0

float adj( float n, float m )
{
    return scale * ( ( 2.0 * n / ( m - 1.0 ) ) - 1.0 );
}

vec2 point( vec2 src )
{
    return vec2( adj( src.x, pixels ), adj( src.y, pixels ) );
}

float wave( vec2 p, float th )
{
    float t = fract( iGlobalTime / tscale );
    t *= 2.0 * PI;
    float sth = sin( th );
    float cth = cos( th );
    float w = ( cos ( cth * p.x + sth * p.y + t ) + 1.0 ) / 2.0;
    return w;
}

float combine( vec2 p )
{
    float sum = 0.0;
		int total = int( symmetry );
    for (int i = 0; i < total; i++) {
        sum += wave( point( p ), float( i ) * PI / float( total ) );
    }
    return mod(floor(sum), 2.0) == 0.0 ? fract(sum) : 1.0 - fract(sum);
}

void main(void)
{
    vec2 vUV = vTexcoord + vec2( offsetX, offsetY );
    float s = 0.0;
    s = combine( vec2( vUV.x * pixels, vUV.y * pixels ) );
		oColor = texture( iPalettes, vec2( map( s, 0.0, 1.0, paletteLow, paletteHigh ), palette ) );
		// oColor.rgb = vec3( pow( s, 2.0 ) );
		oColor.a = s; 
}

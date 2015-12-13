#include "uniforms.glsl"
#include "gamma.glsl"
#include "fbm.glsl"
#include "pi.glsl"

uniform vec3 freq; //slider:0.0,10.0,5.0
uniform vec2 cameraPos; //dialer:-10.0,10.0,5.0

in vec4 vColor;
in vec2 vTexcoord;

out vec4 oColor;

void main( void )
{
    // oColor = vec4( vec3( 0.5 * ( snoise( 10.0 * vTexcoord ) + 1.0 )  ), 1.0 );

    float r = 0.5 * ( snoise( vec3( freq.x * vTexcoord, iGlobalTime ) ) + 1.0 );
    float g = 0.5 * ( snoise( vec3( freq.y * vTexcoord, iGlobalTime + 1 ) ) + 1.0 );
    float b = 0.5 * ( snoise( vec3( freq.z * vTexcoord, iGlobalTime + 2 ) ) + 1.0 );

    vec3 col = vec3( r > g || r > b ? r : 0.0, b > g || b > r ? b : 0.0, g > r || g > b ? g : 0.0 );
    // col = gamma( col );
    oColor = vec4( col, 1.0 );
    // oColor = vec4( vec3( ( fbm( 1.0 * vTexcoord + 1.0, 10 ) + 1.0 ) * 0.5  ) , 1.0 );
}

#include "uniforms.glsl"
#include "map.glsl"

in vec2 vTexcoord;
out vec4 oColor;

uniform float blue; //UI:0.0,1.0,1.0
uniform float border; //UI:0.0,1.0,1.0
uniform float borderStart; //UI:0.0,0.5,0.4
uniform float borderEnd; //UI:0.0,0.5,0.5
uniform float shadowPower; //UI:0.0,1.0,0.125
uniform float shadowWidth; //UI:0.0,0.5,0.125
uniform float antialias; //UI:0.0,0.1,0.003


void main(void)
{
    oColor = vec4( vTexcoord.x, vTexcoord.y, blue, 1.0 );
    float dist = length( vTexcoord - vec2( 0.5 ) );

    float borderStartaa =  borderStart - antialias;
    if( dist > borderStartaa && dist < borderStart ) {
        float value = map( dist, borderStartaa, borderStart, 0.0, 1.0 );
        value = pow( value, 8.0 );
        oColor.rgb += value * vec3( border );
    }

    if( dist > borderStart && dist < borderEnd ) {
        oColor.rgb += vec3( border );
    }


    oColor.rgb += vec3( borderStart - dist );

    //shadow
    if( dist > ( borderStart - shadowWidth ) && dist < borderStart ){
        float shadow = map( dist, ( borderStart - shadowWidth ), borderStart, 1.0, 0.0 );
        shadow = pow( shadow, shadowPower );
        oColor.rgb = mix( vec3( oColor.rgb * 0.5 ), oColor.rgb, shadow );
    }


    float borderEndaa = borderEnd + antialias;

    if( dist > borderEnd && dist < borderEndaa ) {
        oColor.rgb += vec3( border );
        float value = map( dist, borderEnd, borderEndaa, 1.0, 0.0 );
        value = pow( value, 8.0 );
        oColor.a = value;
    }

    if( dist > borderEndaa ) {
        oColor.a = 0.0;
    }
    // oColor.a = 0.0;
}

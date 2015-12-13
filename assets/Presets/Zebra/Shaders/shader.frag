#include "uniforms.glsl"
#include "pi.glsl"
#include "noise4D.glsl"

uniform float cameraDistance; //slider:0.0,10.0,7.0

in vec4 vColor;
in vec2 vTexcoord;
out vec4 oColor;

float sdSphere( vec3 p, float s )
{
		float modValue = snoise( vec4( 1.0 * normalize( p ), 0.2 * iGlobalTime ) );
    return length( p ) - ( s + 0.5 * modValue );
}

vec2 map( in vec3 pos )
{
    return vec2( sdSphere( pos, 1.0 ), 2.0 );
}

vec2 castRay( in vec3 ro, in vec3 rd )
{
    float tmin = 1.0;
    float tmax = 20.0;

		float precis = 0.001;
    float t = tmin;
    float m = -1.0;
    for( int i=0; i<1; i++ )
    {
	    	vec2 res = map( ro + rd*t );
        if( res.x < precis || t > tmax ) break;
        t += res.x;
	    	m = res.y;
    }

    if( t>tmax ) m=-1.0;
    return vec2( t, m );
}



vec3 calcNormal( in vec3 pos )
{
	vec3 eps = vec3( 0.25, 0.0, 0.0 );
	vec3 nor = vec3(
	    map(pos+eps.xyy).x - map(pos-eps.xyy).x,
	    map(pos+eps.yxy).x - map(pos-eps.yxy).x,
	    map(pos+eps.yyx).x - map(pos-eps.yyx).x );
	return normalize(nor);
}

float calcAO( in vec3 pos, in vec3 nor )
{
	float occ = 0.0;
    float sca = 1.0;
    for( int i=0; i<5; i++ )
    {
        float hr = 0.01 + 0.12*float(i)/4.0;
        vec3 aopos =  nor * hr + pos;
        float dd = map( aopos ).x;
        occ += -(dd-hr)*sca;
        sca *= 0.95;
    }
    return clamp( 1.0 - 3.0*occ, 0.0, 1.0 );
}

vec3 render( in vec3 ro, in vec3 rd )
{
    vec3 col = vec3( 0.0, 0.0, 0.0 );
    vec2 res = castRay( ro, rd );
    float t = res.x;
		float m = res.y;
    if( m > -1.0 ) {
        vec3 pos = ro + t*rd;
        vec3 nor = abs( calcNormal( pos ) );
				col = vec3( 1.0 );
				float rim = dot( vec3( 0.0, 0.0, 1.0 ), nor );;
				float value = cos( rim * TWO_PI * 20.0 );
				col *= value > 0.7 ? 1.0 : 0.0;
    }
		return col;
}

mat3 setCamera( in vec3 ro, in vec3 ta, float cr )
{
		vec3 cw = normalize(ta-ro);
		vec3 cp = vec3(sin(cr), cos(cr),0.0);
		vec3 cu = normalize( cross(cw,cp) );
		vec3 cv = normalize( cross(cu,cw) );
    return mat3( cu, cv, cw );
}

void main(void)
{
		vec2 q = vTexcoord.xy;
    vec2 p = -1.0 + 2.0 * q;
		p.x *= iAspect;
		vec3 ro = vec3( 0.0, 0.0, -cameraDistance );
		vec3 rd = normalize( vec3( p.xy, 2.0 ) );
    vec3 col = render( ro, rd );
    oColor = vec4( col, 1.0 );
}

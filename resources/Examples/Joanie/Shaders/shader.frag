#include "uniforms.glsl"
#include "pi.glsl"

in vec4 vColor;
in vec2 vTexcoord;

out vec4 oColor;

mat3 rotationMatrix( vec3 axis, float angle )
{
    axis = normalize( axis );
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;

    return mat3( oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,
                 oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,
                 oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c );
}

float sdPlane( vec3 p ) {
	return p.y;
}

float sdSphere( vec3 p, float s ) {
    return length( p ) - s;
}

float sdBox( vec3 p, float b ) {
	vec3 d = abs( p ) - b;
	// return min( max( d.x, max( d.y, d.z ) ) , 0.0 ) + length( max( d, 0.0 ) );

	return max( abs( p.x ) - b, max( abs( p.y ) - b, abs( p.z ) - b ) );
}

float opS( float d1, float d2 )
{
    return max(-d2,d1);
}

vec2 opU( vec2 d1, vec2 d2 )
{
	return (d1.x<d2.x) ? d1 : d2;
}

vec3 opRep( vec3 p, vec3 c )
{
    return mod(p,c)-0.5*c;
}

vec3 opTwist( vec3 p )
{
    float  c = cos(10.0*p.y+10.0);
    float  s = sin(10.0*p.y+10.0);
    mat2   m = mat2(c,-s,s,c);
    return vec3(m*p.xz,p.y);
}

vec2 map( in vec3 pos )
{
		// pos.x = pow( abs( pos.x ), 10.0 );
    vec2 res = vec2( sdPlane( pos ), 1.0 );
		vec3 p = pos;
		p.x = opRep( pos, vec3( 1.414213562 ) ).x;

		// vec2 p = pos.xy;
		// float theta = iGlobalTime;
		// mat2 rot;
		// rot[0][0] = cos( theta );	rot[1][0] = -sin( theta );
		// rot[0][1] = sin( theta ); rot[1][1] = cos( theta );
		// p *= rot;
		// vec3 p3 = vec3( p.x, p.y, pos.z );

		p *= rotationMatrix( vec3( 1.0, 0.0, 0.0 ), -PI * 0.2 );
		p *= rotationMatrix( vec3( 0.0, 1.0, 0.0 ), PI * 0.25 );

		// float spt = sdSphere( p - 0.3, 0.45 );
		float spb = sdBox( p, 0.50 );
		float spb2 = sdBox( p - vec3( 1.0, -1.0, -.0 ), 0.50 );
		float spb3 = sdBox( p - vec3( 0.0, -1.0, 1.0 ), 0.50 );
		float spb4 = sdBox( p - vec3( -1.0, 1.0, 0.0 ), 0.50 );
		float spb5 = sdBox( p - vec3( 0.0, 1.0, -1.0 ), 0.50 );
		float spb6 = sdBox( p - vec3( -1.0, 2.0, -1.0 ), 0.50 );
		float spb7 = sdBox( p - vec3( 1.0, -2.0, 1.0 ), 0.50 );

		res = vec2( spb, 2.0 );
		res = opU( res, vec2( spb2, 3.0 ) );
		res = opU( res, vec2( spb3, 4.0 ) );
		res = opU( res, vec2( spb4, 5.0 ) );
		res = opU( res, vec2( spb5, 6.0 ) );
		res = opU( res, vec2( spb6, 6.0 ) );
		res = opU( res, vec2( spb7, 7.0 ) );

		return res;
}

vec2 castRay( in vec3 ro, in vec3 rd )
{
    float tmin = 1.0;
		float tmax = 25.0;
		float precis = 0.002;
    float t = tmin;
    float m = -1.0;			//means we hit nothing
    for( int i = 0; i < 50; i++ )
    {
	    	vec2 res = map( ro + t * rd );
        if( res.x < precis || t > tmax ) break;
        t += res.x;
	    	m = res.y;
    }

    if( t > tmax ) m = -1.0;
    return vec2( t, m );
}

vec3 calcNormal( in vec3 pos )
{
	vec3 eps = vec3( 0.001, 0.0, 0.0 );
	vec3 nor = vec3(
	    map(pos+eps.xyy).x - map(pos-eps.xyy).x,
	    map(pos+eps.yxy).x - map(pos-eps.yxy).x,
	    map(pos+eps.yyx).x - map(pos-eps.yyx).x );
	return normalize(nor);
}

vec3 render( in vec3 ro, in vec3 rd ) {
	vec3 col = iBackgroundColor.rgb;
	vec2 res = castRay( ro, rd );
	float t = res.x;	//Distance to Object in Time
	float m = res.y;	//ID of Object Hit
	if( m > -0.5 )
	{
			vec3 pos = ro + t*rd;
			vec3 nor = calcNormal( pos );
			vec3 ref = reflect( rd, nor );

			float value = pow( t / ( ro.z * 1.025 ), 64.0 );
			col = vec3( value );
			// col = vec3( smoothstep( 0.5, 0.7, sin( 20.0 * TWO_PI * value + 10.0 * iAnimationTime * TWO_PI ) ) );
			// col *= pow( 1.0 - value, 4.0 );
	}
	// return vec3( clamp( pow( t / 4.0, 4.), 0.0, 1.0 ) );
	return vec3( clamp( col, 0.0, 1.0 ) );
}

void main(void)
{
	vec2 uv = -1.0 + 2.0 * ( vTexcoord );
	vec3 ro = vec3( 0.0, 0.0, 20.0 );
	vec3 rd = normalize( vec3( uv.x, uv.y, -7.25 ) );
	rd.x *= iAspect;
	vec3 col = render( ro, rd );
	col = pow( col, vec3( 0.4545 ) );
	oColor = vec4( col, 1.0 );
}

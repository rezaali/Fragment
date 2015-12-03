#include "uniforms.glsl"
#include "gamma.glsl"

uniform vec4 sphereColor; 	//color:0.9,0.8,0.6,1.0
uniform vec3 pos; 			//ui:-10.0,10.0,1.0
uniform vec3 light; 			//ui:-10.0,10.0,1.0
uniform float radius; 		//slider:0.0,2.0,1.0
uniform float shadowScale; 	//slider:1.0,4.0,2.0

in vec4 vColor;
in vec2 vTexcoord;

vec4 sph1 = vec4( pos, radius );

out vec4 oColor;

float iSphere( in vec3 ro, in vec3 rd, in vec4 sph )
{
	//so a sphere centered at the origin has the equation |xyz| = r
	//meaning, |xyz|^2 = r^2, meaning <xyz,xyz> = r^2
	//now, xyz = ro + t * rd, |xyz|^2 = (ro + t*rd) * (ro + t*rd)
	//therefore r^2 = |ro|^2 + t^2 * |rd|^2 + 2.0 * t * <ro,rd>, |rd|^ 2 = 1.0
	//thus t^2 + 2*t*<ro,rd> + |ro|^2 - r^2 = 0.0;
	//this is a quadratic equation: a*x^2 + b*x + c = 0
	//Solution to quadratic: x = ( -b +- sqrt( b^2 - 4 * a * c ) ) / ( 2 * a )
	//solve for t
	vec3 oc = ro - sph.xyz;
	float r = sph.w;
	float a = 1.0;
	float b = 2.0 * dot( oc, rd );
	float c = dot( oc, oc ) - r * r;
	float h = b*b - 4.0 * a * c;
	if( h < 0.0 ) return -1.0;
	float t = ( -b - sqrt( h ) ) / ( 2.0 * a );
	return t;
}

float iPlane( in vec3 ro, in vec3 rd )
{
	//equation of a plane, y = 0, ro.y + t * rd
	return -ro.y / rd.y;
}

vec3 nSphere( in vec3 pos, in vec4 sph )
{
	return ( pos - sph.xyz ) / sph.w;
}

vec3 nPlane( in vec3 pos )
{
	return vec3( 0.0, 1.0, 0.0 );
}

float intersect( in vec3 ro, in vec3 rd, out float resT ) {
	resT = 1000.0;
	float id = -1.0;
	float tsph = iSphere( ro, rd, sph1 );	//intersect with a sphere
	float tpla = iPlane( ro, rd );	//intersect with a plane
	if( tsph > 0.0 ) {
		id = 1.0;
		resT = tsph;
	}
	if( tpla > 0.0 && tpla < resT ) {
		id = 2.0;
		resT = tpla;
	}
	return id;
}

void main( void )
{
	vec2 uv = vTexcoord;
	vec3 ro = vec3( 0.0, 1.0, 4.0 );
	vec3 rd = normalize( vec3( ( -1.0 + 2.0 * uv ) * vec2( iAspect, 1.0 ), -2.0 ) );

	// vec3 ro = vec3( 0.0, 20.0, 0.0 );
	// vec2 uvt = vec2( -1.0 + 2.0 * uv ) * vec2( iAspect, 1.0 );
	// vec3 rd = normalize( vec3( uvt.x, -4.0, uvt.y ) );

	float t;
	float id = intersect( ro, rd, t );

	vec3 col = vec3( iBackgroundColor.rgb );
	if( id > 0.5 && id < 1.5 ) {
		//we hit the sphere
		vec3 pos = ro + t * rd;
		vec3 nor = nSphere( pos, sph1 );
		float dif = clamp( dot( nor, normalize( light - ( pos - ro ) ) ), 0.0, 1.0 );
		float ao = 0.5 + 0.5*nor.y;
		col = ( 1.0 - sphereColor.rgb ) * dif * ao + vec3( sphereColor.rgb ) * ao;
	}
	else if( id > 1.5 ) {
		// we hit the plane
		vec3 pos = ro + t * rd;
		vec3 nor = nPlane( pos );
		float dif = clamp( dot( nor, light ), 0.0, 1.0 );
		float height = clamp( ( 5.0 - ( sph1.y - sph1.w ) ) / 5.0, 0.0, 1.0 );
		float amb = smoothstep( 0.0, shadowScale * ( height * sph1.w ), length( pos.xz - sph1.xz ) );
		amb += ( 1.0 - amb ) * ( 1.0 - height );
		col *= amb;
	}

	col = gamma( col );
	oColor = vec4( col, 1.0 );
}

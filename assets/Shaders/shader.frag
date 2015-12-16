#version 330 core

#include "uniforms.glsl"
#include "blinnphongspecular.glsl"
#include "pi.glsl"
#include "easing.glsl"
#include "random.glsl"
#include "cellular.glsl"
#include "map.glsl"

uniform float sphereSize; //slider:0.0,4.0,0.5
uniform vec3 rot; //ui:-1.0,1.0,0.5
uniform vec3 lightDirection; //ui:-1.0,1.0,0.0
uniform vec3 rayOrigin; //ui:0.0,20.0,0.0

uniform float camAngle; //slider:0.0,4.0,1.5
uniform float camDistance; //slider:0.0,10.0,7.5
uniform float heightOffset; //slider:0.0,3.0,1.0

uniform vec2 paletteObjectRange; //range:0.0,1.0,0.25,0.75
uniform vec2 paletteFloorRange; //range:0.0,1.0,0.25,0.75
uniform vec2 shadowRange; //range:-4.0,4.0,-2.00,4.0
uniform vec2 ssoObjectRange; //range:0.0,1.0,0.25,0.75
uniform vec2 ssoRange; //range:0.0,1.0,0.25,0.75
uniform vec2 lightRange; //range:0.0,1.0,0.25,0.75

uniform float randOffset; //ui:0.0,1.0,0.84
uniform float palette; //ui:0.0,1.0,0.5
uniform float specular; //ui:0.0,10.0,1.0
uniform float rimLightPower; //ui:0.0,1.0,0.5


in vec4 vColor;
in vec2 vTexcoord;

out vec4 oColor;

float time = sin( iAnimationTime * TWO_PI );
float heightOffsetTime = heightOffset; //+ .25 + time;

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
    vec2 cr = cellular( p + time );
    float ds = 1.0 - cr.x * cr.x * cr.x;
    // float ds = pow(( 1.0 - cr.x ), 2.0 ) * 0.5 * abs( sin( TWO_PI * cr.x * 10.0 ) );
    float st = s;
    float lp = length( p );
    if( ( lp - st ) < 0.25 ) {
       st -= ( 0.4 * ds );
    }
    return lp - st;
}

float sdBox( vec3 p, float b ) {
	vec3 d = abs( p ) - b;
	return min( max( d.x, max( d.y, d.z ) ) , 0.0 ) + length( max( d, 0.0 ) );
}

float sdBox( vec3 p, vec3 b ) {
	vec3 d = abs( p ) - b;
	return min( max( d.x, max( d.y, d.z ) ) , 0.0 ) + length( max( d, 0.0 ) );
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

vec2 map( in vec3 pos )
{
    vec2 res = vec2( sdPlane( pos ), 1.0 );
		vec3 p = pos;
    p -= vec3( 0.0, heightOffsetTime, 0.0 );
    p *= rotationMatrix( vec3( 1.0, 0.0, 0.0 ), TWO_PI * rot.x * time );
    p *= rotationMatrix( vec3( 0.0, 0.0, 1.0 ), TWO_PI * rot.y * time );
    p *= rotationMatrix( vec3( 0.0, 1.0, 0.0 ), TWO_PI * rot.z * time );

    float sb = sdSphere( p, sphereSize );
    res = opU( res, vec2( sb, 2.0 ) );
		return res;
}

vec2 castRay( in vec3 ro, in vec3 rd )
{
    float tmin = 1.00;
		float tmax = 30.0;
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

vec3 getColor( in float d ) {
  return texture( iPalettes, vec2( map( d, 0.0, 1.0, paletteObjectRange.x, paletteObjectRange.y ), palette ) ).rgb;
}

vec3 render( in vec3 ro, in vec3 rd ) {
	vec3 col = iBackgroundColor.rgb;
	vec2 res = castRay( ro, rd );
	float t = res.x;	//Distance to Object in Time
	float m = res.y;	//ID of Object Hit
  vec3 pos = ro + t*rd;
  float value = 1.0 - smoothstep( ssoRange.x, ssoRange.y, t / 30.0 );


  col = iBackgroundColor.rgb;
	if( m > -0.5 )
	{
      if( m > 1.5 ) {
        float v = 1.0 - smoothstep( ssoObjectRange.x, ssoObjectRange.y, t / 30.0 ) ;
        float bps = blinnPhongSpecular( normalize( lightDirection ), normalize( ro ), pos, specular );
        float dp = dot( normalize( pos ), normalize( ro ) );

        //
        col = vec3( 1.0 );
        col *= v;



        pos -= vec3( 0.0, heightOffsetTime, 0.0 );
        pos *= rotationMatrix( vec3( 1.0, 0.0, 0.0 ), TWO_PI * rot.x * time );
        pos *= rotationMatrix( vec3( 0.0, 0.0, 1.0 ), TWO_PI * rot.y * time );
        pos *= rotationMatrix( vec3( 0.0, 1.0, 0.0 ), TWO_PI * rot.z * time );

        vec2 cr = cellular( pos + time );
        float ds = 1.0 - cr.x * cr.x * cr.x;
        col *= 1.0 - pow( ds, 2.75 );
      }
      else
      {

        float len = length( pos.xz );
        float soffb = time > 0.0 ? 0.0 : -time * 2.0 ;
        float sofft = time > 0.0 ? time * 3.0  : 0.0;

        float amb = smoothstep( shadowRange.x + soffb, shadowRange.y - sofft, len );

        // col = mix( texture( iPalettes, vec2( paletteFloorRange.x , palette ) ).rgb, col, amb );
        col *= vec3( amb );
      }
	}
	return vec3( clamp( col, 0.0, 1.0 ) );
}

void main(void)
{
	vec2 uv = -1.0 + 2.0 * ( vTexcoord );
	vec3 ro = rayOrigin;
	vec3 rd = normalize( vec3( uv.x, uv.y - camAngle, -camDistance ) );
	rd.x *= iAspect;
	vec3 col = render( ro, rd );
	col = pow( col, vec3( 0.4545 ) );
	oColor = vec4( col, 1.0 );
}

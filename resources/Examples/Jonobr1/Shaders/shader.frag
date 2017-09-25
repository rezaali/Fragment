#include "uniforms.glsl"
#include "noise2D.glsl"
#include "easing.glsl"
#include "pi.glsl"

uniform float spaceSize; //slider:1.0,10.0,20.0
uniform float aa; //slider:1.0,128.0,64.0
uniform float spacing; //slider:0.0,0.5,1.0
uniform float extrude; //slider:0.0,0.5,0.5
uniform vec2 smoothness; //range:0.0,1.0,0.25,0.75
uniform vec2 offset; //pad:-1.0,1.0,0.0
uniform vec2 circleCenter; //pad:-2.0,2.0,0.0
uniform float alpha; //slider:0.0,1.0,1.0
uniform float circleLineWidth; //slider:0.01,1.0,0.025
uniform float lineWidth; //slider:0.01,1.0,0.025
uniform float baseRadius; //slider:0.0,10.0,1.0

in vec4 vColor;
in vec2 vTexcoord;

out vec4 oColor;

const vec3 zDir = vec3( 0.0, 0.0, 1.0 );

float cross2( in vec2 a, in vec2 b )
{
    return ( a.x * b.y - a.y * b.x );
}

float left( in vec2 a, in vec2 b, in vec2 c )
{
    vec2 ab = b - a;
    vec2 ac = c - a;
    return cross2( ab, ac );
}

float line( in vec2 s, in vec2 a, in vec2 b, in float lw )
{
  float hlw = lw * 0.5;
  vec2 ab2 = b - a;
  float abl = length( ab2 );
  vec3 ab = vec3( ab2 / abl, 0.0 );
  vec2 dir = cross( ab, zDir ).xy;
  vec2 p0 = a + dir * hlw;
  vec2 p1 = b + dir * hlw;
  vec2 p2 = b - dir * hlw;
  vec2 p3 = a - dir * hlw;

  float e0 = left( p0, p1, s ) > 0.0 ? 1.0 : 0.0;
  float e1 = left( p1, p2, s ) > 0.0 ? 1.0 : 0.0;
  float e2 = left( p2, p3, s ) > 0.0 ? 1.0 : 0.0;
  float e3 = left( p3, p0, s ) > 0.0 ? 1.0 : 0.0;

  float sdf = 1.0 - max( abs( left( a, b, s ) ), 0.0 ) / ( hlw * abl );
  sdf = abs( sin( PI * sdf * 5.0 ) );
  // sdf = pow( sdf, aa );
  return e0 * e1 * e2 * e3 * sdf;
}

float lineShadow( in vec2 s, in vec2 a, in vec2 b, in float lw )
{
  float hlw = lw * 0.5;
  vec2 ab2 = b - a;
  float abl = length( ab2 );
  vec3 ab = vec3( ab2 / abl, 0.0 );
  vec2 dir = cross( ab, zDir ).xy;
  vec2 p0 = a + dir * hlw;
  vec2 p1 = b + dir * hlw;
  vec2 p2 = b - dir * hlw;
  vec2 p3 = a - dir * hlw;

  float e0 = left( p0, p1, s ) > 0.0 ? 1.0 : 0.0;
  float e1 = left( p1, p2, s ) > 0.0 ? 1.0 : 0.0;
  float e2 = left( p2, p3, s ) > 0.0 ? 1.0 : 0.0;
  float e3 = left( p3, p0, s ) > 0.0 ? 1.0 : 0.0;
  float sdf = 1.0 - max( abs( left( a, b, s ) ), 0.0 ) / ( hlw * abl );
  return ( e0 * e1 * e2 * e3 );
}

vec2 rotate( in vec2 p, in float theta ) {
  vec2 r = vec2( 0.0 );
  r.x = p.x * cos( theta ) - p.y * sin( theta );
  r.y = p.x * sin( theta ) + p.y * cos( theta );
  return r;
}

void addLine( in vec2 p, in vec2 a, in vec2 b, in float lw, in float inValue, out float outValue )
{
  float shadow = lineShadow( p, a, b, lw * 1.03 );
  outValue = inValue * min( 1.0 - shadow, 1.0 );
  outValue += line( p, a, b, lw );
}

float circle( in vec2 s, in vec2 p, in float r, in float lw )  //s = space //p = circle pos // r = radius
{
  float rM = ( ( r + lw ) + ( r - lw ) ) * 0.5;
  vec2 dir = normalize( s - p );
  dir *= rM;
  float dist = length( s - p - dir ) / lw;
  float sdf = abs( sin( PI * dist * 5.0 ) );
  // float dist = length( s - p );
  return sdf * smoothstep( 0.0, 1.0, 1.0 - pow( dist, aa ) );
}



void main(void)
{
    vec2 p = -0.5 * spaceSize + spaceSize * ( vTexcoord + offset );
    p.x *= iAspect;
    p.y *= -1.0;
    vec3 col = vec3( 0.0 );

    float value = 0.0;
    float r = baseRadius;
    value = circle( p, vec2( circleCenter ), r, circleLineWidth );

    value = max( value, line( p, vec2( 2.029, 0.455 ), vec2( 2.029, 0.409 ), lineWidth ) );
    value = max( value, line( p, vec2( 2.029, 0.409 ), vec2( 2.029, 0.364 ), lineWidth ) );
    value = max( value, line( p, vec2( 2.029, 0.364 ), vec2( 2.029, 0.318 ), lineWidth ) );
    value = max( value, line( p, vec2( 2.029, 0.318 ), vec2( 2.029, 0.272 ), lineWidth ) );
    value = max( value, line( p, vec2( 2.029, 0.272 ), vec2( 2.029, 0.227 ), lineWidth ) );
    value = max( value, line( p, vec2( 2.029, 0.227 ), vec2( 2.029, 0.181 ), lineWidth ) );
    value = max( value, line( p, vec2( 2.029, 0.181 ), vec2( 2.029, 0.136 ), lineWidth ) );
    value = max( value, line( p, vec2( 2.029, 0.136 ), vec2( 2.029, 0.090 ), lineWidth ) );
    value = max( value, line( p, vec2( 2.029, 0.090 ), vec2( 2.015, 0.107 ), lineWidth ) );
    value = max( value, line( p, vec2( 2.015, 0.107 ), vec2( 2.001, 0.124 ), lineWidth ) );
    value = max( value, line( p, vec2( 2.001, 0.124 ), vec2( 1.987, 0.142 ), lineWidth ) );
    value = max( value, line( p, vec2( 1.987, 0.142 ), vec2( 1.973, 0.159 ), lineWidth ) );
    value = max( value, line( p, vec2( 1.973, 0.159 ), vec2( 1.959, 0.176 ), lineWidth ) );
    value = max( value, line( p, vec2( 1.959, 0.176 ), vec2( 1.945, 0.193 ), lineWidth ) );
    value = max( value, line( p, vec2( 1.945, 0.193 ), vec2( 1.932, 0.210 ), lineWidth ) );
    value = max( value, line( p, vec2( 1.932, 0.210 ), vec2( 1.918, 0.227 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.148, 0.226 ), vec2( 0.147, 0.257 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.147, 0.257 ), vec2( 0.145, 0.289 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.145, 0.289 ), vec2( 0.144, 0.324 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.144, 0.324 ), vec2( 0.144, 0.360 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.144, 0.360 ), vec2( 0.143, 0.398 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.143, 0.398 ), vec2( 0.143, 0.437 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.143, 0.437 ), vec2( 0.144, 0.478 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.144, 0.478 ), vec2( 0.144, 0.520 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.144, 0.520 ), vec2( 0.145, 0.563 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.145, 0.563 ), vec2( 0.146, 0.607 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.146, 0.607 ), vec2( 0.148, 0.652 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.148, 0.652 ), vec2( 0.150, 0.697 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.150, 0.697 ), vec2( 0.152, 0.743 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.152, 0.743 ), vec2( 0.154, 0.790 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.154, 0.790 ), vec2( 0.157, 0.837 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.157, 0.837 ), vec2( 0.160, 0.885 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.160, 0.885 ), vec2( 0.163, 0.933 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.163, 0.933 ), vec2( 0.166, 0.980 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.166, 0.980 ), vec2( 0.170, 1.028 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.170, 1.028 ), vec2( 0.174, 1.075 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.174, 1.075 ), vec2( 0.178, 1.123 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.178, 1.123 ), vec2( 0.182, 1.169 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.182, 1.169 ), vec2( 0.187, 1.216 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.187, 1.216 ), vec2( 0.191, 1.261 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.191, 1.261 ), vec2( 0.196, 1.306 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.196, 1.306 ), vec2( 0.201, 1.350 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.201, 1.350 ), vec2( 0.206, 1.393 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.206, 1.393 ), vec2( 0.212, 1.434 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.212, 1.434 ), vec2( 0.217, 1.475 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.217, 1.475 ), vec2( 0.223, 1.514 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.223, 1.514 ), vec2( 0.229, 1.551 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.229, 1.551 ), vec2( 0.235, 1.587 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.070, 1.017 ), vec2( 0.086, 0.994 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.086, 0.994 ), vec2( 0.116, 0.953 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.116, 0.953 ), vec2( 0.157, 0.899 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.157, 0.899 ), vec2( 0.209, 0.838 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.209, 0.838 ), vec2( 0.271, 0.775 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.271, 0.775 ), vec2( 0.343, 0.716 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.343, 0.716 ), vec2( 0.424, 0.665 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.424, 0.665 ), vec2( 0.513, 0.629 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.513, 0.629 ), vec2( 0.601, 0.607 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.601, 0.607 ), vec2( 0.683, 0.599 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.683, 0.599 ), vec2( 0.757, 0.605 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.757, 0.605 ), vec2( 0.822, 0.625 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.822, 0.625 ), vec2( 0.879, 0.660 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.879, 0.660 ), vec2( 0.927, 0.710 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.927, 0.710 ), vec2( 0.965, 0.776 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.965, 0.776 ), vec2( 0.993, 0.859 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.993, 0.859 ), vec2( 1.009, 0.954 ), lineWidth ) );
    value = max( value, line( p, vec2( 1.009, 0.954 ), vec2( 1.011, 1.054 ), lineWidth ) );
    value = max( value, line( p, vec2( 1.011, 1.054 ), vec2( 0.999, 1.156 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.999, 1.156 ), vec2( 0.972, 1.253 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.972, 1.253 ), vec2( 0.930, 1.341 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.930, 1.341 ), vec2( 0.873, 1.415 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.873, 1.415 ), vec2( 0.801, 1.469 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.801, 1.469 ), vec2( 0.713, 1.499 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.713, 1.499 ), vec2( 0.626, 1.501 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.626, 1.501 ), vec2( 0.558, 1.481 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.558, 1.481 ), vec2( 0.507, 1.442 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.507, 1.442 ), vec2( 0.471, 1.389 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.471, 1.389 ), vec2( 0.452, 1.327 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.452, 1.327 ), vec2( 0.446, 1.260 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.446, 1.260 ), vec2( 0.453, 1.194 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.453, 1.194 ), vec2( 0.473, 1.133 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.473, 1.133 ), vec2( 0.502, 1.082 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.502, 1.082 ), vec2( 0.536, 1.041 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.536, 1.041 ), vec2( 0.575, 1.009 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.575, 1.009 ), vec2( 0.618, 0.986 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.618, 0.986 ), vec2( 0.665, 0.971 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.665, 0.971 ), vec2( 0.714, 0.963 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.714, 0.963 ), vec2( 0.767, 0.961 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.767, 0.961 ), vec2( 0.821, 0.965 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.821, 0.965 ), vec2( 0.859, 0.973 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.859, 0.973 ), vec2( 0.898, 0.985 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.898, 0.985 ), vec2( 0.938, 1.000 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.938, 1.000 ), vec2( 0.979, 1.015 ), lineWidth ) );
    value = max( value, line( p, vec2( 0.979, 1.015 ), vec2( 1.020, 1.027 ), lineWidth ) );
    value = max( value, line( p, vec2( 1.020, 1.027 ), vec2( 1.062, 1.033 ), lineWidth ) );
    value = max( value, line( p, vec2( 1.062, 1.033 ), vec2( 1.106, 1.032 ), lineWidth ) );
    value = max( value, line( p, vec2( 1.106, 1.032 ), vec2( 1.150, 1.020 ), lineWidth ) );
    value = max( value, line( p, vec2( 1.150, 1.020 ), vec2( 1.190, 0.997 ), lineWidth ) );
    value = max( value, line( p, vec2( 1.190, 0.997 ), vec2( 1.220, 0.968 ), lineWidth ) );
    value = max( value, line( p, vec2( 1.220, 0.968 ), vec2( 1.242, 0.935 ), lineWidth ) );
    value = max( value, line( p, vec2( 1.242, 0.935 ), vec2( 1.256, 0.901 ), lineWidth ) );
    value = max( value, line( p, vec2( 1.256, 0.901 ), vec2( 1.264, 0.870 ), lineWidth ) );
    value = max( value, line( p, vec2( 1.264, 0.870 ), vec2( 1.269, 0.844 ), lineWidth ) );
    value = max( value, line( p, vec2( 1.269, 0.844 ), vec2( 1.270, 0.826 ), lineWidth ) );
    value = max( value, line( p, vec2( 1.270, 0.826 ), vec2( 1.271, 0.819 ), lineWidth ) );
    value = max( value, line( p, vec2( 1.271, 0.819 ), vec2( 1.306, 0.808 ), lineWidth ) );
    value = max( value, line( p, vec2( 1.306, 0.808 ), vec2( 1.341, 0.797 ), lineWidth ) );
    value = max( value, line( p, vec2( 1.341, 0.797 ), vec2( 1.377, 0.786 ), lineWidth ) );
    value = max( value, line( p, vec2( 1.377, 0.786 ), vec2( 1.412, 0.775 ), lineWidth ) );
    value = max( value, line( p, vec2( 1.412, 0.775 ), vec2( 1.448, 0.764 ), lineWidth ) );
    value = max( value, line( p, vec2( 1.448, 0.764 ), vec2( 1.483, 0.752 ), lineWidth ) );
    value = max( value, line( p, vec2( 1.483, 0.752 ), vec2( 1.518, 0.741 ), lineWidth ) );
    value = max( value, line( p, vec2( 1.518, 0.741 ), vec2( 1.554, 0.730 ), lineWidth ) );
    value = max( value, line( p, vec2( 1.554, 0.730 ), vec2( 1.556, 0.798 ), lineWidth ) );
    value = max( value, line( p, vec2( 1.556, 0.798 ), vec2( 1.565, 0.870 ), lineWidth ) );
    value = max( value, line( p, vec2( 1.565, 0.870 ), vec2( 1.581, 0.944 ), lineWidth ) );
    value = max( value, line( p, vec2( 1.581, 0.944 ), vec2( 1.603, 1.016 ), lineWidth ) );
    value = max( value, line( p, vec2( 1.603, 1.016 ), vec2( 1.634, 1.083 ), lineWidth ) );
    value = max( value, line( p, vec2( 1.634, 1.083 ), vec2( 1.674, 1.143 ), lineWidth ) );
    value = max( value, line( p, vec2( 1.674, 1.143 ), vec2( 1.723, 1.191 ), lineWidth ) );
    value = max( value, line( p, vec2( 1.723, 1.191 ), vec2( 1.783, 1.225 ), lineWidth ) );
    value = max( value, line( p, vec2( 1.783, 1.225 ), vec2( 1.843, 1.241 ), lineWidth ) );
    value = max( value, line( p, vec2( 1.843, 1.241 ), vec2( 1.894, 1.241 ), lineWidth ) );
    value = max( value, line( p, vec2( 1.894, 1.241 ), vec2( 1.937, 1.227 ), lineWidth ) );
    value = max( value, line( p, vec2( 1.937, 1.227 ), vec2( 1.971, 1.202 ), lineWidth ) );
    value = max( value, line( p, vec2( 1.971, 1.202 ), vec2( 1.998, 1.170 ), lineWidth ) );
    value = max( value, line( p, vec2( 1.998, 1.170 ), vec2( 2.016, 1.133 ), lineWidth ) );
    value = max( value, line( p, vec2( 2.016, 1.133 ), vec2( 2.027, 1.095 ), lineWidth ) );
    value = max( value, line( p, vec2( 2.027, 1.095 ), vec2( 2.031, 1.058 ), lineWidth ) );


    // value = smoothstep( smoothness.x, smoothness.y, value );
    col = vec3( value );
    oColor = vec4( col, 1.0 );
}

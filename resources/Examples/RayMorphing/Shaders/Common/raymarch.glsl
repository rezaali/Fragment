vec3 calcNormal( in vec3 pos ) {
    vec3 eps = vec3( 0.001, 0.0, 0.0 );
    vec3 nor = vec3(
        form(pos+eps.xyy) - form(pos-eps.xyy),
        form(pos+eps.yxy) - form(pos-eps.yxy),
        form(pos+eps.yyx) - form(pos-eps.yyx) );
    return normalize(nor);
}

float castRay( in vec3 ro, in vec3 rd ) {
    float maxd = 100.0; // ray marching distance max
    float s = maxd;
    float d = 0.0;
    for( int i = 0; i < 150; i++ ) {
        if( s < 0.0001 ||  s > maxd ) break;
        s = form( ro + rd * d );
        d += s * 0.5;
    }
    return d;
}

vec4 render( in vec3 ro, in vec3 rd ) {
  float t = castRay( ro, rd );
  vec3 pos = ro + t * rd;
  float mixvalue = clamp( 100.0 - t, 0.0, 1.0 );

  vec3 normal = calcNormal( pos );
  float diffuse = clamp( dot( normal, vec3( 0, 0, 1 ) ), 0.0, 1.0 );
  vec3 color = mix( vec3( iBackgroundColor.rgb ), gradient( pos ), t < 10.0 ? 1.0 : 0.0 );
  return vec4( color, 1.0 );
}

vec4 render( in vec2 tc ) {
  vec2 q = tc;
  vec2 p = -1.0 + 2.0 * q ;
  p.x *= iAspect;

  vec3 ta = iCameraPivotPoint;
  vec3 ro = iCameraEyePoint * 2.5;

  vec3 rd = normalize( vec3( p.xy, - tan( iCameraFov ) ) ) * iCameraViewMatrix;
  rd *= iModelMatrix;
  ro *= iModelMatrix;
  vec4 col = render( ro, rd );
  return col;
}
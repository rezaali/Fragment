uniform mat3 iCameraViewMatrix;
uniform vec3 iCameraPivotPoint;
uniform vec3 iCameraEyePoint;
uniform mat3 iModelMatrix;
uniform float iCameraFov;

float castRay( in vec3 ro, in vec3 rd ) {
    float maxd = 100.0; // ray marching distance max
    float s = maxd;
    float d = 0.0;
    for( int i = 0; i < 150; i++ ) {
        if( s < 0.0001 ||  s > maxd ) break;
        s = scene( ro + rd * d );
        d += s * 0.25;
    }
    return d;
}

vec3 calcNormal( in vec3 pos ) {
    vec3 eps = vec3( 0.001, 0.0, 0.0 );
    vec3 nor = vec3(
        scene(pos+eps.xyy) - scene(pos-eps.xyy),
        scene(pos+eps.yxy) - scene(pos-eps.yxy),
        scene(pos+eps.yyx) - scene(pos-eps.yyx) );
    return normalize(nor);
}


vec3 render( in vec3 ro, in vec3 rd ) {
  float t = castRay( ro, rd );
  vec3 pos = ro + t * rd;
  return vec3( clamp( dot( calcNormal( pos ), normalize( ro - pos ) ), 0.0, 1.0 ) );
  return calcNormal( pos );
}

vec3 render( in vec2 tc ) {
  vec2 q = tc;
  vec2 p = -1.0 + 2.0 * q ;
  p.x *= iAspect;

  vec3 ta = iCameraPivotPoint;
  vec3 ro = iCameraEyePoint * 2.5;

  vec3 rd = normalize( vec3( p.xy, - tan( iCameraFov ) ) ) * iCameraViewMatrix;
  rd *= iModelMatrix;
  ro *= iModelMatrix;
  vec3 col = render( ro, rd );
  return col;
}
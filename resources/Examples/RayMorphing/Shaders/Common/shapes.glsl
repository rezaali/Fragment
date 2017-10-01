#ifndef PHI_P
#define PHI_P 0.5*(1.0+sqrt(5.0))
#endif

#ifndef PHI_N
#define PHI_N 0.5*(1.0-sqrt(5.0))
#endif

//2D SHAPES
float Line( vec3 pos, vec3 a, vec3 b ) {
  vec3 pa = pos - a;
  vec3 ba = b - a;
  float t = clamp( dot( pa, ba ) / dot( ba, ba ), 0.0, 1.0);
  vec3 pt = a + t * ba;
  return length( pt - pos );
}

float Circle( vec2 pos, float radius ) {
  return length( pos ) - radius;
}

float Square( vec2 pos, vec2 size ) {
  vec2 v = abs( pos ) - size;
  return max( v.x, v.y );
}

//3D SHAPES
float Plane( vec3 pos, vec3 normal, float offset ) {
  return dot( pos, normal ) + offset;
}

float Cone( vec3 pos, float radius, float height ) {
  float z = ( height * 0.5 ) - pos.z;
  float c = Circle( pos.xy, radius * z / height );
  float h = abs(z) - height;
  return max( c, h );
}

float Pyramid( vec3 pos, vec3 size ) {
  float y = ( size.y ) - pos.y;
  float c = Square( pos.xz, size.xz * ( y / ( size.y * 2.0) ) );
  float h = abs(y) - size.y * 2.0;
  return max( c, h );
}

float Pyramid( vec3 pos, float size ) {
  return Pyramid( pos, vec3( size ) );
}

float Sphere( vec3 pos, float radius ) {
  return length( pos ) - radius;
}

float Box( vec3 pos, vec3 size ) {
  vec3 result = abs( pos ) - size;
  return min( max( result.x, max( result.y, result.z) ), 0.0 ) +
       length( max(result, 0.0 ) );
}

float Box( vec3 pos, float size ) {
  return Box( pos, vec3( size ) );
}

float Box( vec3 pos, vec3 size, float radius )
{
  vec3 result = abs( pos ) - size;
  return length( max( result, 0.0 ) ) - radius;
}

float Box( vec3 pos, float size, float radius ) {
  return Box( pos, vec3( size ), radius );
}

float Cylinder( vec3 pos, float radius, float height ) {
  float c = Circle( pos.xy, radius );
  float h = abs( pos.z ) - height;
  return max(c, h);
}

float Capsule( vec3 pos, vec3 a, vec3 b, float r ) {
    return Line( pos, a, b ) - r;
}

float Torus( vec3 pos, vec2 size ) {
  vec2 c2 = vec2( length( pos.xy ) - size.x, pos.z );
  return length( c2 ) - size.y;
}

float Octahedron( vec3 pos, float size ) {
  float hs = size;
  float result = Box( pos, size );
  result = max( result, -Plane( pos, vec3( 1, 1, 1 ), hs ) );
  result = max( result, -Plane( pos, vec3( -1, 1, 1 ), hs ) );
  result = max( result, -Plane( pos, vec3( 1, -1, 1 ), hs ) );
  result = max( result, -Plane( pos, vec3( -1, -1, 1 ), hs ) );
  result = max( result, -Plane( pos, vec3( 1, 1, -1 ), hs ) );
  result = max( result, -Plane( pos, vec3( -1, 1, -1 ), hs ) );
  result = max( result, -Plane( pos, vec3( 1, -1, -1 ), hs ) );
  result = max( result, -Plane( pos, vec3( -1, -1, -1 ), hs ) );
  return result;
}

float Dodecahedron( vec3 pos, float size ) {
    float hs = PHI_P * size;
    float result = Box( pos, size );
    result = max( result, -Plane( pos, vec3( 0, PHI_P, 1  ), hs ) );
    result = max( result, -Plane( pos, vec3( 0, -PHI_P, 1 ), hs ) );
    result = max( result, -Plane( pos, vec3( 0, PHI_P, -1 ), hs ) );
    result = max( result, -Plane( pos, vec3( 0, -PHI_P, -1 ), hs ) );
    result = max( result, -Plane( pos, vec3( 1, 0, PHI_P ), hs ) );
    result = max( result, -Plane( pos, vec3( -1, 0, PHI_P ), hs ) );
    result = max( result, -Plane( pos, vec3( 1, 0, -PHI_P ), hs ) );
    result = max( result, -Plane( pos, vec3( -1, 0, -PHI_P ), hs ) );
    result = max( result, -Plane( pos, vec3( PHI_P, 1, 0 ), hs ) );
    result = max( result, -Plane( pos, vec3( -PHI_P, 1, 0 ), hs ) );
    result = max( result, -Plane( pos, vec3( PHI_P, -1, 0 ), hs ) );
    result = max( result, -Plane( pos, vec3( -PHI_P, -1, 0 ), hs ) );
    return result;
}

float Icosahedron( vec3 pos, float size ) {
  float hs = PHI_P * size;
  float result = Box( pos, size );
  result = max( result, -Plane( pos, vec3( 1, 1, 1 ), hs ) );
  result = max( result, -Plane( pos, vec3( -1, 1, 1 ), hs ) );
  result = max( result, -Plane( pos, vec3( 1, -1, 1 ), hs ) );
  result = max( result, -Plane( pos, vec3( -1, -1, 1 ), hs ) );
  result = max( result, -Plane( pos, vec3( 1, 1, -1 ), hs ) );
  result = max( result, -Plane( pos, vec3( -1,1, -1 ), hs ) );
  result = max( result, -Plane( pos, vec3( 1,-1, -1 ), hs ) );
  result = max( result, -Plane( pos, vec3( -1,-1, -1 ), hs ) );
  result = max( result, -Plane( pos, vec3( 0, PHI_N, PHI_P ), hs ) );
  result = max( result, -Plane( pos, vec3( 0, PHI_N,- PHI_P ), hs ) );
  result = max( result, -Plane( pos, vec3( 0, -PHI_N, PHI_P ), hs ) );
  result = max( result, -Plane( pos, vec3( 0, -PHI_N,- PHI_P ), hs ) );
  result = max( result, -Plane( pos, vec3( PHI_P, 0, PHI_N ), hs ) );
  result = max( result, -Plane( pos, vec3( PHI_P, 0, -PHI_N ), hs ) );
  result = max( result, -Plane( pos, vec3( -PHI_P, 0, PHI_N ), hs ) );
  result = max( result, -Plane( pos, vec3( -PHI_P, 0, -PHI_N ), hs ) );
  result = max( result, -Plane( pos, vec3( PHI_N, PHI_P, 0 ), hs ) );
  result = max( result, -Plane( pos, vec3( PHI_N, -PHI_P, 0 ), hs ) );
  result = max( result, -Plane( pos, vec3( -PHI_N, PHI_P, 0 ), hs ) );
  result = max( result, -Plane( pos, vec3( -PHI_N, -PHI_P, 0 ), hs ) );
  return result;
}

float Hexagon( vec3 pos, vec2 size ) {
  vec3 apos = abs( pos );
  float z = apos.z - size.y;
  float xy = max( apos.x * 0.8660254038 + apos.y * 0.5, apos.y ) - size.x;
  return max( xy, z );
}

float Tetrahedron( vec3 pos, float size ) {
  float hs = size;
  float result = Box( pos, size );
  result = max( result, -Plane( pos, vec3( 1, 1, 1 ), hs ) );
  result = max( result, -Plane( pos, vec3( 1, -1, -1 ), hs ) );
  result = max( result, -Plane( pos, vec3( -1, 1, -1 ), hs ) );
  result = max( result, -Plane( pos, vec3( -1, -1, 1 ), hs ) );
  return result;
}

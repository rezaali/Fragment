float Shell( float a, float d ) {
  float d2 = d * 0.5;
  return max( a - d2, -d2 - a );
}

float Morph( float a, float b, float d ) {
    return d * a + ( 1.0 - d ) * b;
}

float Blend( float a, float b, float r ) {
    return min( min ( a, b ), sqrt(a) + sqrt(b) - r );
}

float Union( float a, float b) {
  return min( a, b);
}

float UnionStep( float a, float b, float r ) {
  float am = a - r;
  float bm = b - r;
  float m = max( am, bm );
  return min(min( b , a ), m);
}

float UnionRound( float a, float b, float r ) {
  vec2 u = max( vec2( r - a, r - b ), vec2( 0.0 ) );
  return max( r, min( a, b ) ) - length(u);
}

float UnionSoft( float a, float b, float r ) {
  float u = max( r - abs( a - b ), 0 );
  return min( a, b )- u * u * 0.25 / r;
}

float Intersection( float a, float b ) {
  return max( a, b );
}

float Difference( float a, float b ) {
  return max( a, -b );
}

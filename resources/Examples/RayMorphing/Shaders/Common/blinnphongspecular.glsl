float blinnPhongSpecular( vec3 lightDirection, vec3 viewDirection, vec3 surfaceNormal, float shininess ) {

  //Calculate Blinn-Phong power
  vec3 H = normalize(viewDirection + lightDirection);
  return pow(max(0.0, dot(surfaceNormal, H)), shininess);
}

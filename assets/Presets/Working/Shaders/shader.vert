uniform mat4 ciModelViewProjection;

in vec4	ciPosition;
in vec2 ciTexCoord0;
in vec4	ciColor;

out highp vec4 vColor;
out highp vec2 vTexcoord;

void main( void )
{
	vColor = ciColor;
	vTexcoord = ciTexCoord0;
	gl_Position	= ciModelViewProjection * ciPosition;
}

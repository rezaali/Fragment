uniform mat4 ciModelViewProjection;

in vec4	ciPosition;
in vec2 ciTexCoord0;

out highp vec2 vTexcoord;

void main( void )
{
	vTexcoord = ciTexCoord0;
	gl_Position	= ciModelViewProjection * ciPosition;
}

#include "cinder/app/App.h"
#include "cinder/app/RendererGl.h"
#include "cinder/gl/gl.h"

using namespace ci;
using namespace ci::app;
using namespace std;

class ShaderToyApp : public App {
  public:
	void setup() override;
	void mouseDown( MouseEvent event ) override;
	void update() override;
	void draw() override;
};

void ShaderToyApp::setup()
{
}

void ShaderToyApp::mouseDown( MouseEvent event )
{
}

void ShaderToyApp::update()
{
}

void ShaderToyApp::draw()
{
	gl::clear( Color( 0, 0, 0 ) ); 
}

CINDER_APP( ShaderToyApp, RendererGl )

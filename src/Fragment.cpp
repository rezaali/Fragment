#include "Resources.h"
//CINDER
#include "cinder/app/App.h"
#include "cinder/app/RendererGl.h"
#include "cinder/gl/Batch.h"
#include "cinder/gl/GlslProg.h"
#include "cinder/gl/ShaderPreprocessor.h"
#include "cinder/gl/gl.h"
#include "cinder/qtime/AvfWriter.h"
#include "cinder/Log.h"

//BLOCKS
#include "Osc.h"
#include "AppUI.h"
#include "Paths.h"
#include "GlslParams.h"
#include "Helpers.h"
#include "EasyCamera.h"
#include "LiveCode.h"
#include "Watchdog.h"
#include "Tiler.h"
#include "UI.h"
#include "SaveLoadCamera.h"
#include "ImageSaver.h"
#include "SequenceSaver.h"
#include "MovieSaver.h"

/*
 TO DO:
 
 DONE:
 + Change Renders to use alpha when valid
 + Fix Console upon successful comp
 */

using namespace ci;
using namespace ci::app;
using namespace std;

using namespace reza::live;
using namespace reza::app;
using namespace reza::cam;
using namespace reza::glsl;
using namespace reza::ui;
using namespace reza::tiler;
using namespace reza::paths;
using namespace reza::mov;
using namespace reza::seq;
using namespace reza::img;

#define USE_UDP 1

#if USE_UDP
using Receiver = osc::ReceiverUdp;
using protocol = asio::ip::udp;
typedef std::shared_ptr<class osc::ReceiverUdp> ReceiverRef;
#else
using Receiver = osc::ReceiverTcp;
using protocol = asio::ip::tcp;
typedef std::shared_ptr<class osc::ReceiverTcp> ReceiverRef;
#endif

class Fragment : public App {
  public:
    //PREPARE SETTINGS
    static void prepareSettings( Settings *settings );

    //SETUP
    void setup() override;

    //CLEANUP
    void cleanup() override;

    // CAMERA
    EasyCameraRef mCameraRef;

    // FILESYSTEM
    void createAssetDirectories();
    void createSessionDefaultDirectories();
    void createSessionWorkingDirectories();
    void createSessionExamplesDirectories();
    void createSessionTutorialsDirectories();

    //OUTPUT
    void setupOutput();
    void updateOutput();
    void drawOutput();
    void _drawOutput();
    void _drawOutput( const vec2 &ul, const vec2 &ur, const vec2 &lr, const vec2 &ll );
    void keyDownOutput( KeyEvent event );
    void mouseDownOutput( MouseEvent event );
    void mouseDragOutput( MouseEvent event );

    ci::app::WindowRef mOutputWindowRef;
    vec2 mMouse = vec2( 0.0 );
    vec2 mMousePrev = vec2( 0.0 );
    vec2 mMouseClick = vec2( 0.0 );
    bool mOutputWindowFullscreen = false;
    ivec2 mOutputWindowOrigin = ivec2( 0 );
    ivec2 mOutputWindowSize = ivec2( 1920, 1080 );

    //BACKGROUND
    ColorA mBgColor = ColorA::white();

    //COLOR PALETTE
    Surface32fRef mPaletteSurfRef = nullptr;
    gl::Texture2dRef mPaletteTexRef = nullptr;
    void setupPalettes();

    // IMAGE EXPORTER
    ImageSaverRef mImageSaverRef;
    void setupImageSaver();

    // MOVIE EXPORTER
    MovieSaverRef mMovieSaverRef;
    void setupMovieSaver();

    // SEQUENCE EXPORTER
    SequenceSaverRef mSequenceSaverRef;
    void setupSequenceSaver();
    bool mSaveMovie = false;
    bool mSaveSequence = false;
    int mTotalFrames = 120;
    float mCurrentTime = 0.0f;
    float mSeconds = 0.0;

    //BATCH & GLSL
    bool mSetupBatch = true;
    gl::BatchRef mBatchRef = nullptr;
    gl::GlslProgRef mGlslProgRef = nullptr;
    GlslParamsRef mGlslParamsRef = nullptr;
    bool mGlslInitialized = false;

    void setupBatch();
    void drawBatch();
    void setupGlsl();

    //UI
    AppUIRef mUIRef;
    void setupUIs();
    void arrangeUIWindows();
    UIPanelRef setupAppUI( UIPanelRef ui );
    UIPanelRef setupShaderUI( UIPanelRef ui );
    UIPanelRef setupExporterUI( UIPanelRef ui );
    UIPanelRef setupExamplesUI( UIPanelRef ui );
    UIPanelRef setupTutorialsUI( UIPanelRef ui );
    UIPanelRef setupConsoleUI( UIPanelRef ui );

    //CONSOLE
    string mCompiledMessageError;
    bool mCompiledGlsl = false;
    bool mCompiledGlslLast = false;
    LabelRef mCompiledLabelRef = nullptr;

    //CAMERA
    float mDoubleClickThreshold = 0.2;
    float mLastClick = -1;

    vec2 mTexcoordOffset = vec2( 0.0f );
    float mTexcoordScale = 0.0;

    //SAVING & LOADING
    fs::path mDefaultEditorPath;
    fs::path mDefaultSaveLoadPath;
    fs::path mDefaultMoviePath;
    fs::path mDefaultRenderPath;

    void saveSettings( const fs::path &path );
    void loadSettings( const fs::path &path );

    void saveShaders( const fs::path &path );
    void loadShaders( const fs::path &path );

    void saveDefaultPaths( const fs::path &path );
    void loadDefaultPaths( const fs::path &path );

    void saveSession();
    void loadSession();

    // SAVE & LOAD
    void save( const fs::path &path );
    void load( const fs::path &path );

    // OSC
    ReceiverRef mReceiverRef;
    void setupOsc();
    int mOscPort = 10001;

    // EDITOR
    void openEditor();
    void setEditor();
};

//------------------------------------------------------------------------------
#pragma mark - PREPARE SETTINGS
//------------------------------------------------------------------------------

void Fragment::prepareSettings( App::Settings *settings )
{
    settings->setWindowSize( 1280, 720 );
    settings->setFrameRate( 60.0f );
    settings->setHighDensityDisplayEnabled();
}

//------------------------------------------------------------------------------
#pragma mark - SETUP
//------------------------------------------------------------------------------

void Fragment::setup()
{
    cout << getAppSupportPath() << endl;
    CI_LOG_V( "SETUP ASSETS DIRECTORIES" );
    createAssetDirectories();
    CI_LOG_V( "SETUP DEFAULT DIRECTORIES" );
    createSessionDefaultDirectories();
    CI_LOG_V( "SETUP WORKING DIRECTORIES" );
    createSessionWorkingDirectories();
    CI_LOG_V( "SETUP EXAMPLES DIRECTORIES" );
    createSessionExamplesDirectories();
    CI_LOG_V( "SETUP TUTORIALS DIRECTORIES" );
    createSessionTutorialsDirectories();

    CI_LOG_V( "SETUP OUTPUT" );
    setupOutput();

    CI_LOG_V( "SETUP CAMERA" );
    EasyCamera::Format cfmt;
    cfmt.distance( 1.0f );
    mCameraRef = EasyCamera::create( mOutputWindowRef, cfmt );
    mCameraRef->enable();

    CI_LOG_V( "SETUP PALETTES" );
    setupPalettes();

    CI_LOG_V( "SETUP IMAGE SAVER" );
    setupImageSaver();

    CI_LOG_V( "SETUP SEQUENCE SAVER" );
    setupSequenceSaver();

    CI_LOG_V( "SETUP MOVIE SAVER" );
    setupMovieSaver();

    CI_LOG_V( "SETUP GLSL" );
    setupGlsl();

    CI_LOG_V( "SETUP UIS" );
    setupUIs();

    CI_LOG_V( "LOADING APP & UI SETTINGS" );
    loadSettings( getAppSupportWorkingSessionPath() );
    arrangeUIWindows();
    arrangeUIWindows();
}

//------------------------------------------------------------------------------
#pragma mark - CLEANUP
//------------------------------------------------------------------------------

void Fragment::cleanup()
{
    saveSettings( getAppSupportWorkingSessionPath() );
}

//------------------------------------------------------------------------------
#pragma mark - FILESYSTEM
//------------------------------------------------------------------------------

void Fragment::createAssetDirectories()
{
    //INSIDER THE APP
    auto localAssets = getResourcesAssetsPath();

    //OUTSIDE THE APP
    auto appAssets = getAppSupportAssetsPath();

    if( !fs::exists( appAssets ) ) {
        copyDirectoryRecursively( localAssets, appAssets );
    }
}

void Fragment::createSessionDefaultDirectories()
{
    //INSIDER THE APP
    auto localDefaultSession = getResourcesDefaultPath();
    auto localDefaultSettingsSession = getResourcesDefaultSettingsPath();
    auto localDefaultShadersSession = getResourcesDefaultShadersPath();

    //OUTSIDE THE APP
    auto appDefaultSession = getAppSupportDefaultSessionPath();
    auto appDefaultSettingsSession = getAppSupportDefaultSessionSettingsPath();
    auto appDefaultShadersSession = getAppSupportDefaultSessionShadersPath();

    if( !fs::exists( appDefaultSession ) ) {
        createDirectories( appDefaultSession );
        copyDirectoryRecursively( localDefaultSettingsSession, appDefaultSettingsSession );
        copyDirectoryRecursively( localDefaultShadersSession, appDefaultShadersSession );
    }
}

void Fragment::createSessionWorkingDirectories()
{
    //INSIDER THE APP
    auto localWorkingSession = getResourcesWorkingPath();
    auto localWorkingSettingsSession = getResourcesWorkingSettingsPath();
    auto localWorkingShadersSession = getResourcesWorkingShadersPath();

    //OUTSIDE THE APP
    auto appWorkingSession = getAppSupportWorkingSessionPath();
    auto appWorkingSettingsSession = getAppSupportWorkingSessionSettingsPath();
    auto appWorkingShadersSession = getAppSupportWorkingSessionShadersPath();

    if( !fs::exists( appWorkingSession ) ) {
        createDirectories( appWorkingSession );
        copyDirectoryRecursively( localWorkingSettingsSession, appWorkingSettingsSession );
        copyDirectoryRecursively( localWorkingShadersSession, appWorkingShadersSession );
    }
}

void Fragment::createSessionExamplesDirectories()
{
    //INSIDER THE APP
    auto local = getResourcesPath( EXAMPLES_PATH );

    //OUTSIDE THE APP
    auto support = getAppSupportPath( EXAMPLES_PATH );

    if( !fs::exists( support ) ) {
        copyDirectoryRecursively( local, support );
    }
}

void Fragment::createSessionTutorialsDirectories()
{
    //INSIDER THE APP
    auto local = getResourcesPath( TUTORIALS_PATH );

    //OUTSIDE THE APP
    auto support = getAppSupportPath( TUTORIALS_PATH );

    if( !fs::exists( support ) ) {
        copyDirectoryRecursively( local, support );
    }
}

//------------------------------------------------------------------------------
#pragma mark - OUTPUT
//------------------------------------------------------------------------------

void Fragment::setupOutput()
{
    mOutputWindowRef = getWindow();
    mOutputWindowRef->getSignalClose().connect( [this] { quit(); } );
    mOutputWindowRef->getSignalDraw().connect( [this] {
        updateOutput();
        mImageSaverRef->update();
        mSequenceSaverRef->update();
        drawOutput();
        mMovieSaverRef->update();
    } );
    mOutputWindowRef->getSignalResize().connect( [this] {
        mOutputWindowSize = mOutputWindowRef->getSize();
        mSetupBatch = true;
        saveCamera( getAppSupportWorkingSessionSettingsPath( CAMERA_PATH ), mCameraRef->getCameraPersp() );
        mCameraRef->setup();
        loadCamera( getAppSupportWorkingSessionSettingsPath( CAMERA_PATH ), mCameraRef->getCameraPersp(), [this]() { mCameraRef->update(); } );
    } );
    mOutputWindowRef->getSignalMove().connect( [this] { mOutputWindowOrigin = mOutputWindowRef->getPos(); } );
    mOutputWindowRef->getSignalKeyDown().connect( [this]( KeyEvent event ) { keyDownOutput( event ); } );
    mOutputWindowRef->getSignalMouseDown().connect( [this]( MouseEvent event ) {
        mMousePrev = mMouseClick = mMouse = vec2( event.getPos() );
        if( ( ( getElapsedSeconds() - mLastClick ) < mDoubleClickThreshold ) ) {
            mTexcoordOffset = vec2( 0.0f );
            mTexcoordScale = 0.0;
            mSetupBatch = true;
        }
        mLastClick = getElapsedSeconds();
    } );
    mOutputWindowRef->getSignalMouseDrag().connect( [this]( MouseEvent event ) {
        mMousePrev = mMouse;
        mMouse = event.getPos();
        if( event.isMetaDown() ) {
            vec2 delta = ( mMousePrev - mMouse ) / ( vec2( mOutputWindowRef->getSize() ) * toPixels( 1.0f + mTexcoordScale ) );
            delta.y *= -1.0;
            mTexcoordOffset += delta;
            mSetupBatch = true;
        }
    } );
    mOutputWindowRef->getSignalMouseUp().connect( [this]( MouseEvent event ) { mMouse = vec2( 0.0 ); } );
    mOutputWindowRef->getSignalMouseWheel().connect( [this]( MouseEvent event ) {
        if( event.isMetaDown() ) {
            mTexcoordScale += event.getWheelIncrement() * 0.001;
            mSetupBatch = true;
        }
    } );
}

void Fragment::updateOutput()
{
    mOutputWindowRef->setTitle( to_string( (int)getAverageFps() ) + " FPS" );

    if( mSetupBatch ) {
        setupBatch();
        mSetupBatch = false;
    }
    if( mSequenceSaverRef->isRecording() ) {
        mCurrentTime = mSequenceSaverRef->getCurrentTime();
    }
    else if( mMovieSaverRef->isRecording() ) {
        mCurrentTime = mMovieSaverRef->getCurrentTime();
    }
    else {
        mCurrentTime = mSequenceSaverRef->getCurrentTime();
    }
}

void Fragment::drawOutput()
{
    gl::clear( mBgColor );
    vec2 size = mOutputWindowRef->getSize();
    gl::setMatricesWindow( size );

    if( mGlslProgRef ) {
        if( mCompiledGlsl ) {
            chrono::system_clock::time_point now = chrono::system_clock::now();
            time_t tt = chrono::system_clock::to_time_t( now );
            tm local_tm = *localtime( &tt );

            float hours = local_tm.tm_hour + 1.0f;
            float minutes = hours * 60 + ( local_tm.tm_min + 1 );
            float seconds = minutes * 60 + ( local_tm.tm_sec );

            mGlslProgRef->uniform( "iBackgroundColor", mBgColor );
            mGlslProgRef->uniform( "iResolution", vec3( size.x, size.y, 0.0 ) );
            mGlslProgRef->uniform( "iAspect", mOutputWindowRef->getAspectRatio() );
            mGlslProgRef->uniform( "iGlobalTime", float( getElapsedSeconds() ) );
            mGlslProgRef->uniform( "iAnimationTime", mCurrentTime );
            mGlslProgRef->uniform( "iMouse", vec4( mMouse.x, size.y - mMouse.y, mMouseClick.x, size.y - mMouseClick.y ) );
            mGlslProgRef->uniform( "iDate", vec4( local_tm.tm_year + 1900, local_tm.tm_mon + 1, local_tm.tm_mday, seconds ) );
            mGlslProgRef->uniform( "iPalettes", 0 );

            mat3 identity;
            mGlslProgRef->uniform( "iModelMatrix", identity );
            mGlslProgRef->uniform( "iCameraViewMatrix", mat3( mCameraRef->getCameraPersp().getViewMatrix() ) );
            mGlslProgRef->uniform( "iCameraPivotPoint", mCameraRef->getCameraPersp().getPivotPoint() );
            mGlslProgRef->uniform( "iCameraEyePoint", mCameraRef->getCameraPersp().getEyePoint() );
            mGlslProgRef->uniform( "iCameraFov", toRadians( mCameraRef->getCameraPersp().getFov() ) );

            mPaletteTexRef->bind( 0 );
            mGlslParamsRef->applyUniforms( mGlslProgRef );
        }
        _drawOutput();
    }
}

void Fragment::_drawOutput()
{
    gl::ScopedBlendAlpha scpAlp;
    drawBatch();
}

void Fragment::_drawOutput( const vec2 &ul, const vec2 &ur, const vec2 &lr, const vec2 &ll )
{
    gl::ScopedBlendAlpha scpAlp;
    vec2 size = mOutputWindowRef->getSize();
    auto batch = gl::Batch::create( geom::Rect( Rectf( 0.0f, 0.0f, size.x, size.y ) ).texCoords( ul, ur, lr, ll ), mGlslProgRef );
    batch->draw();
}

void Fragment::keyDownOutput( KeyEvent event )
{
    if( event.isMetaDown() ) {
        switch( event.getCode() ) {
        case KeyEvent::KEY_a: {
            mUIRef->spawnUI( "fragment" );
        } break;
        case KeyEvent::KEY_p: {
            mUIRef->spawnUI( "params" );
        } break;
        case KeyEvent::KEY_r: {
            mUIRef->spawnUI( "exporter" );
        } break;
        case KeyEvent::KEY_c: {
            mUIRef->spawnUI( "console" );
        } break;
        case KeyEvent::KEY_e: {
            if( event.isShiftDown() ) {
                openEditor();
            }
            else {
                mUIRef->spawnUI( "examples" );
            }
        } break;
        case KeyEvent::KEY_t: {
            mUIRef->spawnUI( "tutorials" );
        } break;
        case KeyEvent::KEY_o: {
            loadSession();
        } break;
        case KeyEvent::KEY_w: {
            arrangeUIWindows();
        } break;
        case KeyEvent::KEY_s: {
            saveSession();
        } break;
        case KeyEvent::KEY_f: {
            mOutputWindowFullscreen = !mOutputWindowFullscreen;
            mOutputWindowRef->setFullScreen( mOutputWindowFullscreen );
        } break;
        }
    }
}

//------------------------------------------------------------------------------
#pragma mark - BATCH
//------------------------------------------------------------------------------

void Fragment::setupBatch()
{
    if( mGlslProgRef ) {
        vec2 size = mOutputWindowRef->getSize();
        vector<vec2> texcoords = { vec2( 0.0, 1.0 ), vec2( 1.0, 1.0 ), vec2( 1.0, 0.0 ), vec2( 0.0, 0.0 ) };
        for( auto &it : texcoords ) {
            it += normalize( vec2( 0.5 ) - it ) * mTexcoordScale;
            it += mTexcoordOffset;
        }
        auto geo = geom::Rect( Rectf( 0.0f, 0.0f, size.x, size.y ) );
        geo.texCoords( texcoords[0], texcoords[1], texcoords[2], texcoords[3] );
        mBatchRef = gl::Batch::create( geo, mGlslProgRef );
    }
}

void Fragment::drawBatch()
{
    gl::ScopedColor scpClr( ColorA( 1.0, 0.0, 0.0, 1.0 ) );
    if( mBatchRef ) {
        mBatchRef->draw();
    }
    else {
        mSetupBatch = true;
    }
}

//------------------------------------------------------------------------------
#pragma mark - UI
//------------------------------------------------------------------------------

void Fragment::setupUIs()
{
    mUIRef = AppUI::create();
    mUIRef->setupUI( APP_UI, [this]( UIPanelRef ui ) -> UIPanelRef { return setupAppUI( ui ); } );
    mUIRef->setupUI( SHADER_UI, [this]( UIPanelRef ui ) -> UIPanelRef { return setupShaderUI( ui ); } );
    mUIRef->setupUI( EXPORTER_UI, [this]( UIPanelRef ui ) -> UIPanelRef { return setupExporterUI( ui ); } );
    mUIRef->setupUI( EXAMPLES_UI, [this]( UIPanelRef ui ) -> UIPanelRef { return setupExamplesUI( ui ); } );
    mUIRef->setupUI( TUTORIALS_UI, [this]( UIPanelRef ui ) -> UIPanelRef { return setupTutorialsUI( ui ); } );
    mUIRef->setupUI( CONSOLE_UI, [this]( UIPanelRef ui ) -> UIPanelRef { return setupConsoleUI( ui ); } );
}

UIPanelRef Fragment::setupAppUI( UIPanelRef ui )
{
    auto mvCb = [this]( int value ) { mOutputWindowRef->setPos( mOutputWindowOrigin ); };
    auto szCb = [this]( int value ) { mOutputWindowRef->setSize( mOutputWindowSize ); };
    auto dfmt = Dialeri::Format().label( false );
    ui->addDialeri( "PX", &mOutputWindowOrigin.x, 0, getDisplay()->getWidth(), dfmt )->setCallback( mvCb );
    ui->right();
    ui->addDialeri( "PY", &mOutputWindowOrigin.y, 0, getDisplay()->getHeight(), dfmt )->setCallback( mvCb );
    ui->addDialeri( "SX", &mOutputWindowSize.x, 0, 10000, dfmt )->setCallback( szCb );
    ui->addDialeri( "SY", &mOutputWindowSize.y, 0, 10000, dfmt )->setCallback( szCb );
    ui->addToggle( "BORDER", false, Toggle::Format().label( false ) )->setCallback( [this]( bool value ) {
        mOutputWindowRef->setBorderless( value );
    } );
    ui->down();
    ui->addSpacer();
    ui->down();
    ui->addButton( "SET EDITOR", false )->setCallback( [this]( bool value ) {
        if( value ) {
            setEditor();
        }
    } );
    ui->right();
    ui->addButton( "OPEN EDITOR", false )->setCallback( [this]( bool value ) {
        if( value ) {
            openEditor();
        }
    } );
    ui->down();
    ui->addSpacer();
    auto dialer = ui->addDialeri( "OSC PORT", &mOscPort, 0, 65535 );
    dialer->setTrigger( Trigger::END );
    dialer->setCallback( [this]( int value ) {
        setupOsc();
    } );
    ui->addSpacer();
    ui->addButton( "SAVE AS", false )->setCallback( [this]( bool value ) { if( value ) { saveSession(); } } );
    ui->right();
    ui->addButton( "LOAD", false )->setCallback( [this]( bool value ) { if( value ) { loadSession(); } } );
    ui->addButton( "NEW", false )->setCallback( [this]( bool value ) {
        if( value ) {
            auto pth = getAppSupportDefaultSessionPath();
            if( fs::exists( pth ) ) {
                load( pth );
            }
        }
    } );

    ui->down();
    ui->addSpacer();
    ui->addDialerf( "MX", &mMouse.x, 0.0, 2000 );
    ui->right();
    ui->addDialerf( "MY", &mMouse.y, 0.0, 2000 );
    ui->down();
    ui->addDialerf( "CX", &mMouseClick.x, 0.0, 2000 );
    ui->right();
    ui->addDialerf( "CY", &mMouseClick.y, 0.0, 2000 );
    ui->down();

    auto bcb = [this]( float value ) { mSetupBatch = true; };
    ui->addDialerf( "TX", &mTexcoordOffset.x, -2.0, 2.0 )->setCallback( bcb );
    ui->right();
    ui->addDialerf( "TY", &mTexcoordOffset.y, -2.0, 2.0 )->setCallback( bcb );
    ui->addDialerf( "TS", &mTexcoordScale, -2.0, 2.0 )->setCallback( bcb );
    ui->down();
    ui->addButton( "RESET CAMERA", false )->setCallback( [this]( bool value ) {
        if( value ) {
            mCameraRef->setup();
        }
    } );
    ui->addSliderf( "FOV", &mCameraRef->getFov(), 0.0f, 180.0f )
        ->setCallback( [this]( float value ) { mCameraRef->update(); } );

    return ui;
}

UIPanelRef Fragment::setupShaderUI( UIPanelRef ui )
{
    ui->addSpacer();
    ui->addColorPicker( "BACKGROUND COLOR", &mBgColor );
    return ui;
}

UIPanelRef Fragment::setupExporterUI( UIPanelRef ui )
{
    ui->addButton( "SAVE IMAGE AS", false )->setCallback( [this]( bool value ) {
        if( value ) {
            fs::path path = ci::app::getSaveFilePath( mDefaultRenderPath );
            if( !path.empty() ) {
                mDefaultRenderPath = path.parent_path();
                string filename = path.filename().string();
                string ext = path.extension().string();
                string dir = path.parent_path().string() + "/";

                fs::path opath = fs::path( dir );
                auto it = filename.find( "." );
                if( it != string::npos ) {
                    filename = filename.substr( 0, it );
                }
                vector<string> extensions = { "png", "jpg", "tif" };
                bool valid = false;
                for( auto it : extensions ) {
                    if( it == ext ) {
                        valid = true;
                        break;
                    }
                }
                if( !valid ) {
                    ext = "png";
                }
                mImageSaverRef->save( opath, filename, ext );
            }
        }
    } );
    ui->down();
    ui->addDialeri( "OUTPUT IMAGE SCALE", mImageSaverRef->getSizeMultiplier(), 1, 20 )
        ->setCallback( [this]( int value ) {
            mImageSaverRef->setSizeMultiplier( value );
            mSequenceSaverRef->setSizeMultiplier( value );
        } );

    ui->addSpacer();
    ui->addButton( "RENDER", false )->setCallback( [this]( bool value ) {
        if( value && ( mSaveMovie || mSaveSequence ) ) {
            fs::path path = getSaveFilePath( mDefaultMoviePath );
            if( !path.empty() ) {
                mDefaultMoviePath = path.parent_path();

                string filename = path.filename().string();
                string dir = path.parent_path().string();
                fs::path opath = path.parent_path();

                auto it = filename.rfind( "." );
                if( it != string::npos ) {
                    filename = filename.substr( 0, it );
                }

                if( mSaveMovie ) {
                    mMovieSaverRef->save( opath, filename, "mov" );
                }

                if( mSaveSequence ) {
                    mSequenceSaverRef->save( addPath( opath, filename ), filename, "png" );
                }
            }
        }
    } );
    ui->right();
    ui->addToggle( "MOV", &mSaveMovie );
    ui->addToggle( "PNG", &mSaveSequence );
    ui->addDialeri( "FRAMES", &mTotalFrames, 0, 99999, Dialeri::Format().label( false ) )
        ->setCallback( [this]( int value ) {
            mMovieSaverRef->setTotalFrames( value );
            mSequenceSaverRef->setTotalFrames( value );
        } );
    ui->down();
    return ui;
}

UIPanelRef Fragment::setupExamplesUI( UIPanelRef ui )
{
    ui->setTriggerSubViews( false );
    ui->setLoadSubViews( false );
    ui->addSpacer();

    fs::path examplesPath = getAppSupportPath( EXAMPLES_PATH );
    vector<string> examples;

    fs::directory_iterator it( examplesPath ), eit;
    for( ; it != eit; ++it ) {
        if( fs::is_directory( it->path() ) ) {
            string path = it->path().native();
            size_t lastSlash = path.rfind( getPathSeparator(), path.length() );
            if( lastSlash == string::npos ) {
                examples.push_back( path );
            }
            else {
                examples.push_back( path.substr( lastSlash + 1, string::npos ) );
            }
        }
    }

    ui->addRadio( "Examples", examples )
        ->setCallback( [this]( string name, bool value ) {
            if( value ) {
                load( addPath( getAppSupportPath( EXAMPLES_PATH ), name ) );
                arrangeUIWindows();
            }
        } );
    return ui;
}

UIPanelRef Fragment::setupTutorialsUI( UIPanelRef ui )
{
    ui->setTriggerSubViews( false );
    ui->setLoadSubViews( false );
    ui->addSpacer();

    fs::path tutorialsPath = getAppSupportPath( TUTORIALS_PATH );
    vector<string> tutorials;

    fs::directory_iterator it( tutorialsPath ), eit;
    for( ; it != eit; ++it ) {
        if( fs::is_directory( it->path() ) ) {
            string path = it->path().native();
            size_t lastSlash = path.rfind( getPathSeparator(), path.length() );
            if( lastSlash == string::npos ) {
                tutorials.push_back( path );
            }
            else {
                tutorials.push_back( path.substr( lastSlash + 1, string::npos ) );
            }
        }
    }

    ui->addRadio( "Tutorials", tutorials )
        ->setCallback( [this]( string name, bool value ) {
            if( value ) {
                load( addPath( getAppSupportPath( TUTORIALS_PATH ), name ) );
                arrangeUIWindows();
            }
        } );

    return ui;
}

UIPanelRef Fragment::setupConsoleUI( UIPanelRef ui )
{
    string status = mCompiledGlsl == true ? "SUCCESS V2.0.0" : "ERROR V2.0.0";
    mCompiledLabelRef = ui->addLabel( "STATUS: " + status, FontSize::SMALL );
    if( mCompiledGlsl ) {
        mCompiledLabelRef->setColorFill( ColorA( 0.0, 1.0, 0.0, 1.0 ) );
    }
    else {
        mCompiledLabelRef->setColorFill( ColorA( 1.0, 0.0, 0.0, 1.0 ) );
    }
    float w = mCompiledLabelRef->getStringWidth( "_" ) + mCompiledLabelRef->getSpacing();

    auto addTextArea = [this, &w, &ui]( const string &message ) {
        float totalWidth = message.length() * w;
        float uiw = ui->getSize().x - ui->getPadding().mRight - ui->getPadding().mLeft;
        int totalPerLine = floor( uiw / w );
        int total = ceil( totalWidth / uiw );
        for( int i = 0; i < total; i++ ) {
            int offset = i * totalPerLine;
            int length = totalPerLine;
            if( i + 1 == total ) {
                length = std::min( int( message.length() - offset ), int( totalPerLine ) );
            }
            ui->addLabel( message.substr( offset, length ), FontSize::SMALL );
        }
    };

    string message = mCompiledMessageError;
    vector<string> errors = split( mCompiledMessageError, '\n' );
    auto keys = { "FRAGMENT: ", "ERROR: ", "Use of ", "identifier " };
    for( auto &it : errors ) {
        string msg = it;
        for( auto k : keys ) {
            string key = k;
            size_t foundKey = msg.find( key );
            if( foundKey != string::npos ) {
                msg = msg.replace( foundKey, key.length(), "" );
            }
        }
        ui->addSpacer();
        addTextArea( msg );
    }
    ui->autoSizeToFitSubviews();
    return ui;
}

void Fragment::arrangeUIWindows()
{
    mUIRef->spawnUIs();

    float ht = 23.0;
    float sp = 1.0;

    mOutputWindowRef->setPos( 0, ht );
    mOutputWindowRef->setSize( 500, 500 );

    auto frag = mUIRef->getUI( "fragment" );
    auto pars = mUIRef->getUI( "params" );
    auto expt = mUIRef->getUI( "exporter" );
    auto exam = mUIRef->getUI( "examples" );
    auto tuto = mUIRef->getUI( "tutorials" );
    auto coso = mUIRef->getUI( "console" );

    vec2 p = mOutputWindowRef->getPos();
    vec2 s = mOutputWindowRef->getSize();

    frag->setPos( vec2( 0.0, p.y + s.y + ht * 2.0 ) );
    tuto->setPos( vec2( 0.0, frag->getPos().y + frag->getHeight() + sp + ht ) );

    expt->setPos( vec2( frag->getPos().x + frag->getWidth() + sp, frag->getPos().y ) );
    exam->setPos( vec2( expt->getPos().x, expt->getPos().y + expt->getHeight() + sp + ht ) );

    coso->setPos( vec2( p.x + s.x + sp, ht * 2.0 ) );
    pars->setPos( vec2( coso->getPos().x, coso->getPos().y + coso->getHeight() + ht + sp ) );
}

//------------------------------------------------------------------------------
#pragma mark - COLOR PALETTE
//------------------------------------------------------------------------------

void Fragment::setupPalettes()
{
    mPaletteSurfRef = Surface32f::create( loadImage( getAppSupportAssetsPath( "palettes.png" ) ) );
    mPaletteTexRef = gl::Texture2d::create( *mPaletteSurfRef.get(), gl::Texture2d::Format().minFilter( GL_LINEAR ).magFilter( GL_LINEAR ).loadTopDown().dataType( GL_FLOAT ).internalFormat( GL_RGBA ) );
}

//------------------------------------------------------------------------------
#pragma mark - IMAGE EXPORTER
//------------------------------------------------------------------------------
void Fragment::setupImageSaver()
{
    auto drawBg = [this]( glm::vec2 ul, glm::vec2 ur, glm::vec2 lr, glm::vec2 ll ) {
        _drawOutput( ul, ur, lr, ll );
    };
    mImageSaverRef = ImageSaver::create( mOutputWindowRef, nullptr, drawBg, nullptr );
}

//------------------------------------------------------------------------------
#pragma mark - MOVIE EXPORTER
//------------------------------------------------------------------------------
void Fragment::setupMovieSaver()
{
    mMovieSaverRef = MovieSaver::create( mOutputWindowRef );
}

//------------------------------------------------------------------------------
#pragma mark - SEQUENCE EXPORTER
//------------------------------------------------------------------------------
void Fragment::setupSequenceSaver()
{
    auto drawBg = [this]( glm::vec2 ul, glm::vec2 ur, glm::vec2 lr, glm::vec2 ll ) {
        _drawOutput( ul, ur, lr, ll );
    };
    mSequenceSaverRef = SequenceSaver::create( mOutputWindowRef, nullptr, drawBg, nullptr );
}

//------------------------------------------------------------------------------
#pragma mark - GLSL
//------------------------------------------------------------------------------
void Fragment::setupGlsl()
{
    auto consoleUI = [this] {
        auto ui = mUIRef->getUI( CONSOLE_UI );
        if( ui != nullptr ) {
            ui->clear();
            setupConsoleUI( ui );
        }
    };

    auto superFn = [this]() {
        auto ui = mUIRef->getUI( SHADER_UI );
        if( ui != nullptr ) {
            if( mGlslInitialized ) {
                mUIRef->saveUI( ui, getAppSupportWorkingSessionSettingsPath() );
            }
        }
    };

    auto successFn = [this, consoleUI]( ci::gl::GlslProgRef result, const std::vector<std::string> sources ) {
        mOutputWindowRef->getRenderer()->makeCurrentContext( true );
        mGlslProgRef = result;
        mSetupBatch = true;
        if( mGlslParamsRef ) {
            mGlslParamsRef->clearUniforms();
        }
        else {
            mGlslParamsRef = GlslParams::create();
        }
        mGlslParamsRef->parseUniforms( sources );
        auto ui = mUIRef->getUI( SHADER_UI );
        if( ui != nullptr ) {
            ui->clear();
            setupShaderUI( ui );
            mUIRef->addShaderParamsUI( ui, *( mGlslParamsRef.get() ) );
            mUIRef->loadUI( ui, getAppSupportWorkingSessionSettingsPath() );
        }
        mCompiledGlsl = true;
        mGlslInitialized = true;
        mCompiledMessageError = "";
        consoleUI();
    };

    auto errorFn = [this, consoleUI]( ci::Exception exc ) {
        CI_LOG_E( string( SHADER_UI ) + " ERROR: " + string( exc.what() ) );
        mGlslProgRef = gl::getStockShader( gl::ShaderDef().color() );
        mCompiledGlsl = false;
        mCompiledMessageError = exc.what();
        consoleUI();
    };

    auto vertex = getAppSupportWorkingSessionShadersPath( "shader.vert" );
    auto fragment = getAppSupportWorkingSessionShadersPath( "shader.frag" );
    auto format = gl::GlslProg::Format();

    wd::unwatch( vertex );
    wd::unwatch( fragment );

    auto cb = [this, vertex, fragment, format, superFn, successFn, errorFn]( const fs::path &path ) {
        reza::live::glsl( vertex, fragment, format, superFn, successFn, errorFn );
    };

    wd::watch( vertex, cb );
    wd::watch( fragment, cb );
}

//------------------------------------------------------------------------------
#pragma mark - SAVE & LOAD DEFAULT PATHS
//------------------------------------------------------------------------------

void Fragment::saveDefaultPaths( const fs::path &path )
{
    JsonTree tree;
    tree.addChild( JsonTree( "EDITOR_PATH", mDefaultEditorPath.string() ) );
    tree.addChild( JsonTree( "SESSION_PATH", mDefaultSaveLoadPath.string() ) );
    tree.addChild( JsonTree( "MOVIE_PATH", mDefaultMoviePath.string() ) );
    tree.addChild( JsonTree( "RENDER_PATH", mDefaultRenderPath.string() ) );
    tree.write( addPath( path, "settings.json" ) );
}

void Fragment::loadDefaultPaths( const fs::path &path )
{
    auto pth = addPath( path, "settings.json" );
    if( fs::exists( pth ) ) {
        JsonTree tree( loadFile( pth ) );
        if( tree.hasChild( "EDITOR_PATH" ) ) {
            mDefaultEditorPath = fs::path( tree.getValueForKey<string>( "EDITOR_PATH" ) );
        }
        if( tree.hasChild( "SESSION_PATH" ) ) {
            mDefaultSaveLoadPath = fs::path( tree.getValueForKey<string>( "SESSION_PATH" ) );
            if( !fs::exists( mDefaultSaveLoadPath ) ) {
                mDefaultSaveLoadPath = getAppSupportPath();
            }
        }
        if( tree.hasChild( "MOVIE_PATH" ) ) {
            mDefaultMoviePath = fs::path( tree.getValueForKey<string>( "MOVIE_PATH" ) );
            if( !fs::exists( mDefaultMoviePath ) ) {
                mDefaultMoviePath = getAppSupportPath();
            }
        }
        if( tree.hasChild( "RENDER_PATH" ) ) {
            mDefaultRenderPath = fs::path( tree.getValueForKey<string>( "RENDER_PATH" ) );
            if( !fs::exists( mDefaultRenderPath ) ) {
                mDefaultRenderPath = getAppSupportPath();
            }
        }
    }
}

//------------------------------------------------------------------------------
#pragma mark - SAVE & LOAD SETTINGS
//------------------------------------------------------------------------------

void Fragment::saveSettings( const fs::path &path )
{
    auto pth = addPath( path, SETTINGS_PATH );
    saveDefaultPaths( getAppSupportPath() );
    mUIRef->saveUIs( pth );
    saveCamera( addPath( pth, CAMERA_PATH ), mCameraRef->getCameraPersp() );
}

void Fragment::loadSettings( const fs::path &path )
{
    auto pth = addPath( path, SETTINGS_PATH );
    loadDefaultPaths( getAppSupportPath() );
    mUIRef->loadUIs( pth );
    loadCamera( addPath( pth, CAMERA_PATH ), mCameraRef->getCameraPersp(), [this]() { mCameraRef->update(); } );
}

//------------------------------------------------------------------------------
#pragma mark - SAVE & LOAD SHADERS
//------------------------------------------------------------------------------

void Fragment::saveShaders( const fs::path &path )
{
    auto shadersPath = addPath( path, SHADERS_PATH );
    createDirectory( shadersPath );
    copyDirectory( getAppSupportWorkingSessionShadersPath(), shadersPath );
}

void Fragment::loadShaders( const fs::path &path )
{
    mGlslInitialized = false;
}

//------------------------------------------------------------------------------
#pragma mark - SAVE & LOAD SESSIONS
//------------------------------------------------------------------------------

void Fragment::saveSession()
{
    auto rtrim = []( string input, string key ) {
        string result = "";
        size_t found = input.rfind( key );
        if( found != string::npos ) {
            result = input.substr( 0, found );
        }
        return result;
    };

    auto prePath = mDefaultSaveLoadPath;
    auto pth = getSaveFilePath( prePath );
    if( !pth.empty() ) {
        if( createDirectory( pth ) ) {
            mDefaultSaveLoadPath = fs::path( rtrim( pth.native(), "/" ) );
            save( pth );
            saveSettings( getAppSupportWorkingSessionSettingsPath() );
        }
    }
}

void Fragment::loadSession()
{
    auto pth = getFolderPath( mDefaultSaveLoadPath );
    if( !pth.empty() ) {
        load( pth );
        mDefaultSaveLoadPath = pth.parent_path();
    }
}

//------------------------------------------------------------------------------
#pragma mark - SAVE & LOAD
//------------------------------------------------------------------------------

void Fragment::save( const fs::path &path )
{
    createDirectory( path );
    saveShaders( path );
    saveSettings( path );
}

void Fragment::load( const fs::path &path )
{
    copyDirectory( path, getAppSupportWorkingSessionPath() );
    loadSettings( path );
    loadShaders( path );
}

//------------------------------------------------------------------------------
#pragma mark - OSC
//------------------------------------------------------------------------------

void Fragment::setupOsc()
{
    mReceiverRef = nullptr;
    mReceiverRef = ReceiverRef( new Receiver( mOscPort ) );
    mReceiverRef->setListener( "/*",
        [this]( const osc::Message &msg ) {
            string address = msg.getAddress().substr( 1 );
            string typeTag = msg.getTypeTagString();
            vector<string> keys = split( address, "/" );
            int numKeys = int( keys.size() );
            if( numKeys > 1 ) {
                auto ui = mUIRef->getUI( keys[0] );
                if( ui ) {
                    string subkey = keys[1];
                    auto view = ui->getSubView( subkey );
                    if( view == nullptr ) {
                        std::transform( subkey.begin(), subkey.end(), subkey.begin(), ::toupper );
                        view = ui->getSubView( subkey );
                    }
                    if( view ) {
                        string type = view->getType();
                        if( type == "Sliderf" && typeTag == "f" ) {
                            Sliderf *widget = static_cast<Sliderf *>( view.get() );
                            widget->setValue( lmap<float>( msg.getArgFloat( 0 ), 0.0, 1.0, widget->getMin(), widget->getMax() ) );
                        }
                        else if( type == "Slideri" && typeTag == "f" ) {
                            Slideri *widget = static_cast<Slideri *>( view.get() );
                            widget->setValue( lmap<float>( msg.getArgFloat( 0 ), 0.0, 1.0, widget->getMin(), widget->getMax() ) );
                        }
                        else if( type == "Sliderd" && typeTag == "f" ) {
                            Sliderd *widget = static_cast<Sliderd *>( view.get() );
                            widget->setValue( lmap<double>( msg.getArgDouble( 0 ), 0.0, 1.0, widget->getMin(), widget->getMax() ) );
                        }
                        else if( type == "MultiSlider" && typeTag == "f" && numKeys > 2 ) {
                            MultiSlider *widget = static_cast<MultiSlider *>( view.get() );
                            int index = stoi( keys[2] );
                            if( ( index - 1 ) < int( widget->getSubViews().size() ) ) {
                                string key = subkey;
                                switch( index ) {
                                case 1:
                                    key += "-X";
                                    break;
                                case 2:
                                    key += "-Y";
                                    break;
                                case 3:
                                    key += "-Z";
                                    break;
                                case 4:
                                    key += "-W";
                                    break;
                                default:
                                    break;
                                }

                                widget->setValue( key, lmap<float>( msg.getArgFloat( 0 ), 0.0, 1.0, widget->getMin( key ), widget->getMax( key ) ) );
                            }
                        }
                        else if( type == "Dialeri" && typeTag == "f" ) {
                            Dialeri *widget = static_cast<Dialeri *>( view.get() );
                            widget->setValue( lmap<float>( msg.getArgFloat( 0 ), 0.0, 1.0, widget->getMin(), widget->getMax() ) );
                        }
                        else if( type == "Dialerf" && typeTag == "f" ) {
                            Dialerf *widget = static_cast<Dialerf *>( view.get() );
                            widget->setValue( lmap<float>( msg.getArgFloat( 0 ), 0.0, 1.0, widget->getMin(), widget->getMax() ) );
                        }
                        else if( type == "Dialerd" && typeTag == "f" ) {
                            Dialerd *widget = static_cast<Dialerd *>( view.get() );
                            widget->setValue( lmap<double>( msg.getArgDouble( 0 ), 0.0, 1.0, widget->getMin(), widget->getMax() ) );
                        }
                        else if( type == "Toggle" ) {
                            Toggle *toggle = static_cast<Toggle *>( view.get() );
                            if( typeTag == "f" ) {
                                toggle->setValue( msg.getArgFloat( 0 ) );
                            }
                            else if( typeTag == "b" ) {
                                toggle->setValue( msg.getArgBool( 0 ) );
                            }
                        }
                        else if( type == "Button" ) {
                            Button *button = static_cast<Button *>( view.get() );
                            if( typeTag == "f" ) {
                                button->setValue( msg.getArgFloat( 0 ) );
                            }
                            else if( typeTag == "b" ) {
                                button->setValue( msg.getArgBool( 0 ) );
                            }
                        }
                        else if( type == "XYPad" ) {
                            XYPad *widget = static_cast<XYPad *>( view.get() );
                            if( typeTag == "ff" ) {
                                vec2 min = widget->getMin();
                                vec2 max = widget->getMax();
                                float x = lmap<float>( msg.getArgFloat( 0 ), 0, 1, min.x, max.x );
                                float y = lmap<float>( msg.getArgFloat( 1 ), 0, 1, min.y, max.y );
                                widget->setValue( vec2( x, y ) );
                            }
                        }
                        view->trigger();
                    }
                }
            }
        } );

    try {
        mReceiverRef->bind();
    }
    catch( const osc::Exception &ex ) {
        CI_LOG_E( "Error binding: " << ex.what() << " val: " << ex.value() );
    }
#if USE_UDP
    mReceiverRef->listen(
        []( asio::error_code error, protocol::endpoint endpoint ) -> bool {
            if( error ) {
                CI_LOG_E( "Error Listening: " << error.message() << " val: " << error.value() << " endpoint: " << endpoint );
                return false;
            }
            else
                return true;
        } );
#endif
}

void Fragment::openEditor()
{
    auto shaderPath = getAppSupportWorkingSessionShadersPath();
    string editorPath = mDefaultEditorPath.string();
    vector<string> parts = split( editorPath, ' ' );
    editorPath = "";
    for( auto &it : parts ) {
        editorPath += it + "\\ ";
    }
    editorPath = editorPath.substr( 0, editorPath.size() - 2 );
    string cmd = "cd " + shaderPath.string() + " && open -a " + editorPath + " .";
    system( cmd.c_str() );
}

void Fragment::setEditor()
{
    fs::path path = getOpenFilePath( getAppPath(), { "app" } );
    if( !path.empty() ) {
        mDefaultEditorPath = path;
        saveDefaultPaths( getAppSupportPath() );
    }
}

CINDER_APP( Fragment, RendererGl( RendererGl::Options().msaa( 0 ) ), Fragment::prepareSettings )

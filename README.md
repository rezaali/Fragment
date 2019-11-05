Fragment
--

### About:

Fragment is an open source design tool that utilizes GLSL and live coding to allow anyone to create spectacular imagery with math(s)!

Similar to shadertoy.com, glslsandbox.com, and glslb.in. Fragment is a constrained design tool for content creation within the boundaries of two triangles. If none of that made any sense, please visit [www.shadertoy.com](http://www.shadertoy.com)

Unlike shadertoy, Fragment is a native macOS app, that allows you to edit your GLSL code with which ever text editor you prefer. Fragment allows you to render out high resolution prints, and png sequences (with transparency if you want it)! Also, you can VJ with Fragment by sending it OSC :)

Fragment allows you to create playable real-time visual instruments. It does this by creating UI elements (sliders, buttons, etc) from comments in your glsl code, i.e. uniform float foobar; //slider:0.0,1.0,0.5.

More info here: [www.syedrezaali.com/store/fragment-osx-app](http://www.syedrezaali.com/store/fragment-osx-app).

### Examples:

Check out some things made with Fragment: [https://github.com/rezaali/FragmentSketches](https://github.com/rezaali/FragmentSketches)

### Build Fragment:

#### 1. Clone Cinder
```
git clone --recursive https://github.com/cinder/Cinder.git Cinder
```
#### 2. Clone Fragment:
```
cd Cinder/samples
mkdir _reza
cd _reza
git clone git@github.com:rezaali/Fragment.git
```

#### 3. Clone Dependencies
```
cd ../../blocks/
git clone git@github.com:rezaali/Cinder-SaveLoadCamera.git SaveLoadCamera
git clone git@github.com:rezaali/Cinder-EasyCamera.git EasyCamera
git clone git@github.com:rezaali/Cinder-MovieSaver.git MovieSaver
git clone git@github.com:rezaali/Cinder-SequenceSaver.git SequenceSaver
git clone git@github.com:rezaali/Cinder-LiveCode.git LiveCode
git clone git@github.com:rezaali/Cinder-ImageSaver.git ImageSaver
git clone git@github.com:rezaali/Cinder-GlslParams.git GlslParams
git clone git@github.com:rezaali/Cinder-UI.git UI
git clone git@github.com:rezaali/Cinder-Tiler.git Tiler
git clone git@github.com:rezaali/Cinder-AppUI.git AppUI
git clone git@github.com:rezaali/Cinder-AppPaths.git AppPaths
git clone git@github.com:rezaali/Watchdog.git Watchdog
```

#### 4. Build Cinder
```
cd ../../proj/xcode/ && ./fullbuild.sh
```

#### 5. Open Fragment Xcode project
```
cd ../samples/_reza/Fragment/xcode
open Fragment.xcodeproj/
```

#### 6. Run
In Xcode, go to the Product Menu and then Run or press Apple + R


### Using Fragment:

1. Arrange Windows (Apple + w)
2. Set your code editor (Click SET EDITOR button) & navigate to your favorite text editor app
3. Open the editor (Click OPEN EDITOR button or Apple + Shift + E). This will open the folder containing the code you should edit (shader.frag)
4. Edit the code and save, Fragment will recompile the shaders and show you hottness.
5. Save your live code session by clicking SAVE AS.
6. Load a live code session by clicking LOAD.
7. Try rendering a high res print (EXPORTER > SAVE IMAGE AS)
8. Try rendering a movie (EXPORTER > RENDER): Select MOVIE Option, unselect PNG and click RENDER
9. Change the total number of frames for your movie (this effects the iAnimationTime, which goes from 0 -> 1). The number dialer for this is next to EXPORTER > PNG.
10. Try rendering a sequence of pngs (EXPORTER > RENDER) Select PNG Option, unselect MOVIE and click RENDER.

### Improving Fragment:

1. Make this readme better and submit a pull request!
2. Point out things I'm doing wrong or could be better.
3. Submit an example.
4. Refactor something to make it easier to understand.
5. Share Fragment with your friends.


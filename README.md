# Fragment

Fragment is a design tool that utilizes GLSL and live coding to allow anyone to create spectacular imagery with math(s)!

Similar to shadertoy.com, glslsandbox.com, and glslb.in. Fragment is a constrained design tool for content creation within the boundaries of two triangles. If none of that made any sense, please visit www.shadertoy.com

Unlike shadertoy, Fragment is a native OSX app, that allows you to edit your GLSL code with which ever text editor you prefer. Fragment allows you to render out high resolution prints, quicktime movies and png sequences (with transparency if you want it)!

Fragment allows you to create playable real-time visual instruments. It does this by creating UI elements (sliders, buttons, etc) from comments in your glsl code, i.e. uniform float foobar; //slider:0.0,1.0,0.5

## Congratulations!

You've made it this far and chances are you'll become a Fragment power user and GLSL wizard in no time. The following will outline how to get up and running with Fragment.

TLDR: Open the app and open ( with a text editor ) the shader.frag file ( Fragment / assets / Shaders ) and start writing code. Suggest a feature or report a bug: syed.reza.ali@gmail.com or @rezaali

Disclaimer: Since its a developer / designer focused tool, please forgive its complexity. Just know it will handsomely reward you with 10k+ resolution prints and badass quicktime movies that you can share with the world once you're accustomed to how it all works)!

## First Steps:

First things first, download the app and unzip the folder! Now that you have Fragment, you can put it anywhere on your computer, I'd suggest the Applications folder and maybe even put its icon in the dock if you're going to be using it a lot! (I'd be honored)!

Now if you have a preferred text editor, now is the time to open it up! (I'd suggest using something like Sublime or Atom if you don't have one). Great!!! Now use the text editor to open the "Shaders" folder inside the assets folder inside of the Fragment folder ( Fragment / assets / Shaders ). Once you've opened the folder, open the file shader.frag and place it on the right side of your screen. Fragment will open up on the left. This way you can view your code and see what Fragment is doing (and vise versa).

## Fragment App UI Overview:

Open the App and just look at the panels for a second. There are a couple so I'll break down what each does.

The OUTPUT panel shows your shader working hard to color all the pixels inside that window (top left window)! The one super cool thing that Fragment allows you to do is to zoom in on you shader by scrolling with mouse and holding down the Apple key (all short cuts and key commands are listed below). You can also pan left, right, up and down by holding down the Apple key and dragging with the mouse. Super cool right?

The FRAGMENT panel has controls for saving, loading and creating new shaders***. Moreover, the number dialers on there allow you to move and resize the window precisely. There is a button to the right of the number dialers, this allows you to make the window borderless. The controls on the bottom of the panel just show you the mouse position (nothing to special)!

The EXPORTER panel contains the controls for rendering images, and controlling how big the render will be. The "OUTPUT IMAGE SCALE" represents how big relative to the window size you want your print to be. So on a retina Macbook Pro, if the window is 500 x 500, and the image scale is set to 10, then 500 px * 2 (retina) * 10 = 10k!!!!! Welcome to the big leagues! Now you're a high-end artist who can show in galleries. Woohoo!

The PARAMS panel! This is my favorite panel and it probably will be yours as well! When you are creating "uniform" parameters in your shader you can include a comment on the same line as the uniform declaration. If the comment is formatted properly (see tutorial examples in the app) then Fragment will create a UI element that will allow you to control that variable! OMFG, magic right!?!  

The TUTORIAL panel has buttons that trigger the loading of short tutorials. When you click one of the tutorials, it will load the shader and this should also change the text inside of your text editor! Try it out and see if it's working. If it isn't you might need to close the shader file you opened earlier and try reopening the file.

The EXAMPLES panel has buttons. These buttons load shader examples I made. Very much like the tutorial panel, it will load the shader file and in your text editor you can see how the shader works. Once you've edited your glsl code and tweaked your uniform params you can hit "SAVE AS" (in the Fragment App) and save your work anywhere. If you decide to put your shader in the Examples folder ( Fragment / assets / Examples ) then Fragment will create a button in for your sketch in the EXAMPLES panel. This will allow you to quick load it so you can show off to you friends or create a template shader for you to build off of in the future! For more examples & inspiration visit www.shadertoy.com or check out the NVScene channel on Youtube!

The CONSOLE panel will let you know if you've made a mistake when writing your shader. I'd recommend making sure that every time you make a change to your shader file, you save the file (in your text editor! not Fragment) to make sure it compiled properly. If your shader didn't compile, you can use this panel to see what the errors were.

Also! Don't be afraid to close the panels. You can always re-spawn them using the cheat codez below. Feel free to position the panels wherever you want them on screen to help you flow. Fragment will remember your panel's positions. When loading a shader you've made, Fragment will load the shader files & the app's UI settings & and parameter values! To reset the app's UI placement at any time press Apple + w (more cheat codes below).  

Congrats again!! That was the hardest part of using the app understand what all the UI panels do. You made it!!!

## Notes Regarding Saving & Loading:

Please keep in mind that your shader files (which we opened earlier) will stay in the same place. Meaning you will always be editing the shader files ( Fragment / assets / Shaders ). The app will take care of saving the shader files to another location when you click "SAVE AS" or copying the files to the Fragment / assets / Shaders directory when you click "LOAD". This was by design so when you render / save  something you really like, you don't accidentally write over it when you LOAD that sketch again. Trust me, I've lost so many good sketches and battles with clients who have wanted pixel perfect replicas of renders!

When Fragment opens, it will automatically load the last shader and all the ui settings so you can continue where you left off.

## Cheat Codez & Keyboard Bindings:

Apple + a : Show FRAGMENT panel
Apple + p : Show PARAMS panel
Apple + r : Show EXPORTER panel
Apple + c : Show CONSOLE panel
Apple + e : Show EXAMPLES panel
Apple + t : Show TUTORIALS panel
Apple + s : Save Session
Apple + l : Load Session
Apple + Shift + s : Render Image
Apple + m : Render Movie
Apple + w : Reset Output Window & Layout  
Apple + f : Toggle Fullscreen

## Shader Includes:

Moving on! More things!?!! You can include other shaders in your fragment shader by adding them to the Common folder ( Fragment / assets / Shaders / Common ) next to the shader.frag & shader.vert files and including them in your fragment shader like so:

#include "noise2D.glsl"
(this allows you to import noise functions or other helpful glsl functions). Keep in mind that these files won't be saved when you save or render a movie (or image) with Fragment. The reason being these are common files are globals helper files (meant to help you write less code and make more awesomeness by reusing stable code that does cool things).

## Creating UI Elements from Comments:

As mentioned above, one of the coolest features in Fragment is that you can create UI interfaces for your shader's uniform parameters. All you have to do is leave a formatted comment on the same line as your uniform declaration, i.e:
```C++
uniform float resonate; //slider:0.0,1.0,0.5
```
This will create a slider in the Params panel. The general format of the comment is like so:

```C++
uniform float resonate; //[UI ELEMENT TYPE]:[LOW VALUE],[HIGH VALUE],[DEFAULT VALUE]
```

Its important to know you aren't limited to float and sliders only. You can use bools, ints, vec2, vec3, vec4. If you want to use a vec4 to represent a color, there is a color picker you can make like so:

```C++
uniform vec4 background; //color:0.1,0.5,0.9,1.0
```
In this case the last four numbers represent the red, green, blue and alpha value of the color. Check out the tutorials in Fragment for a full listing of ui elements and how to declare them.

## Builtin Uniforms:

Like shadertoy, Fragment gives you all the same uniforms (except for the channels). You can access these uniforms by including the uniforms.glsl file in you shader like so:

#include "uniforms.glsl"
In addition to the default shadertoy uniforms, Fragment includes a uniform for animation (iAnimationTime) that ranges from 0.0 - 1.0 and is based on frames. This allows you to make perfect loop animations! So get ready to blow peoples minds & tumblrs away with your gif(t)s! I've even included a easing.glsl file full of easing functions! Woooot! Here are the uniforms that are built in:

```C++
uniform vec3 iResolution;//resolution of the output window
uniform float iAspect; //aspect ratio of the screen ( width / height )
uniform float iGlobalTime; //the time
uniform float iAnimationTime;//time from 0.0 to 1.0
uniform vec4 iMouse; //mouse coordinate xy (if dragging) zw contained the last clicked position
uniform vec4 iBackgroundColor; //the background color of the window
uniform vec4 iDate; //Year, Month, Day, Time in Seconds
uniform sampler2D iPalettes; //A texture full of color palettes (a palettes varies in the x direction)
```

## Rendering / Exporting Content:

Whenever you render a video or make a print from Fragment the app's ui settings and your shader files are saved in a folder next to the movie or image(s) you just rendered. Also note that when you render an image, a low resolution version is also saved, so you don't always have to open huge files if you want to quickly preview the render.

When rendering out movies, the total frames is set by the number dialer right of the PNG toggle. You might be asking, what does that PNG toggle do anyways. Well when you want to render out a PNG sequence, you enable this toggle. If you only want to save a movie, then disable this toggle. Rendering speed are A LOT faster when a PNG sequence is not being rendered as well. BIG NOTE: If you want you PNGs to be the same size as the output video, then make sure to set the OUTPUT IMAGE SCALE to 1, otherwise, you'll end up with png images sequences that will gobble up your hard drive.   

Also, you can also render out a png sequence with an alpha channel if you set you shader to render things transparent ( oColor.a < 1.0 ) Super useful for VFX jobs, making sick comps, and logos that need transparency. (i.e. Fragment's app icon, which was made within Fragment)!!

## Future Features:

In the future, Fragment will allow for OSC control, so people can perform with the app. (OSC would map to the shader param names you expose to the UI via the comments). Also, Syphon will be built in so you can syphon the content out the app into other apps! I plan on making a github repo for awesome shaders and interfaces people make for their shaders

## Suggest a feature or report a bug or typo / error in this guide: syed.reza.ali@gmail.com or @rezaali

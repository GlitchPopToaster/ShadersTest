"use strict";

import { initBuffers } from "./init-buffers.js";
import { drawScene } from "./draw-scene.js";
import { initBuffersSkybox } from "./skybox.js";
//import { createProgramFromScripts } from "./webgl-utils.js";
//import * as webglUtils from "./webgl-utils.js";

let cubeRotation = 0.0;
let deltaTime = 0;
let speed = 0.3;

// Vertex shader program


const vsSourceHologram = `

`;

const fsSourceHologram = `

uniform vec4 baseColor: hint_color = vec4(0.3058, 0.835, 0.960, 1.);
uniform float speed = 0.5;
uniform vec4 linesColor: hint_color = vec4(0.633232, 0.910156, 0.555693, 1.);
uniform float linesColorIntensity = 5.;
uniform float emissionValue = 1.;
uniform sampler2D hologramTexture;
uniform vec2 hologramTextureTiling = vec2(1., 5.);

vec2 TilingAndOffset(vec2 uv, vec2 tiling, vec2 offset) {
	return uv * tiling + offset;
}

float Fresnel(vec3 normal, vec3 view, float pow) {
	return pow(1.0 - clamp(dot(normal, view), 0.0, 1.0), pow);
}

void fragment() {
	vec2 uv = SCREEN_UV;
	vec2 offset = vec2(TIME * speed);
	vec2 tiling = TilingAndOffset(uv, hologramTextureTiling, offset);

	vec4 noise = texture(hologramTexture, tiling);
	float fresnel = Fresnel(NORMAL, VIEW, emissionValue);

	vec4 colorLines = linesColor * vec4(vec3(linesColorIntensity), 1.);
	vec4 emission = colorLines * fresnel * noise;

	ALBEDO = baseColor.rgb;
	ALPHA = dot(noise.rgb, vec3(0.333));
	EMISSION = emission.rgb;
}
`;


var threshold = 0.7;
var gl;


main();




function main() {
    
    //let start = performance.now();
    //let time = performance.now() - start;
    
    // Get the WebGL canvas element
    const canvas = document.getElementById("webglCanvas");

    // Get the WebGL rendering context
    gl = canvas.getContext("webgl2", {
        alpha: true, 
        antialias: true, 
        depth: true, 
        stencil: true, 
        premultipliedAlpha: true,
        failIfMajorPerformanceCaveat: false,
        powerPreference: "default",
        desynchronized: false});
    //enum WebGLPowerPreference { "default", "low-power", "high-performance" };

    // Only continue if WebGL is available and working
    if (gl === null) {
        alert(
        "Unable to initialize WebGL. Your browser or machine may not support it."
        );
        return;
    }

    // Set clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);




    var programInfoArray = [];
    var buffersArray = [];


    //var frag_shader = fs.readFileSync("./frag_shader1.glsl").toString('utf-8');

    // Initialize a shader program; this is where all the lighting
    // for the vertices and so forth is established.
    //const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    
    var vert_sh = getShaderFromScript(gl, "vertex-shader2");
    var frag_sh = getShaderFromScript(gl, "fragment-shader2");
    const shaderProgram = initShaderProgram(gl, vert_sh, frag_sh);


    // Collect all the info needed to use the shader program.
    // Look up which attributes our shader program is using
    // for aVertexPosition, aVertexColor and also
    // look up uniform locations.
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
            vertexNormal: gl.getAttribLocation(shaderProgram, "aVertexNormal"),
            textureCoord: gl.getAttribLocation(shaderProgram, "aTextureCoord"),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram,"uProjectionMatrix"),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
            normalMatrix: gl.getUniformLocation(shaderProgram, "uNormalMatrix"),
            uSampler: gl.getUniformLocation(shaderProgram, "u_texture"),
            uSampler2: gl.getUniformLocation(shaderProgram, "u_noise"),
            uSampler3: gl.getUniformLocation(shaderProgram, "blendTexture"),
            sh_threshold: gl.getUniformLocation(shaderProgram, "u_threshold"),
            sh_time: gl.getUniformLocation(shaderProgram, "u_time"),
        },
    };



    // Here's where we call the routine that builds all the
    // objects we'll be drawing.
    const buffers = initBuffers(gl);

    // Load texture
    const texture = loadTexture(gl, "box_side.png");
    const texture2 = loadTexture(gl, "perlin18.png");
    const texture3 = loadTexture(gl, "grainy14.png");
    //gl.cullFace(gl.FRONT_AND_BACK);

    // Flip image pixels into the bottom-to-top order that WebGL expects.
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);


    programInfoArray.push(programInfo);
    buffersArray.push(buffers);


    
    //console.log(programInfo);
    //console.log(buffers);



    //SKYBOX--
    var m4 = twgl.m4;

    var vert_sh2 = getShaderFromScript(gl, "skybox-vertex-shader");
    var frag_sh2 = getShaderFromScript(gl, "skybox-fragment-shader");
    const shaderProgramSkybox = initShaderProgram(gl, vert_sh2, frag_sh2);

    const programInfoSkybox = {
        program: shaderProgramSkybox,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgramSkybox, "aVertexPosition"),
        },
        uniformLocations: {
            viewDirectionProjectionInverseLocation: gl.getUniformLocation(shaderProgramSkybox,"u_viewDirectionProjectionInverse"),
            uSampler4: gl.getUniformLocation(shaderProgramSkybox, "u_skybox"),
            sh_threshold: gl.getUniformLocation(shaderProgramSkybox, "u_threshold"),
            sh_time: gl.getUniformLocation(shaderProgramSkybox, "u_time"),
        },
    };

    const buffersSkybox = initBuffersSkybox(gl);

    
    //console.log(programInfoSkybox);
    //console.log(buffersSkybox);

    programInfoArray.push(programInfoSkybox);
    buffersArray.push(buffersSkybox);

    //--SKYBOX 


    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture2);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, texture3);
    
    var textureCubemap = gl.createTexture();
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, textureCubemap);
    
    const faceInfos = [
        {
          target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
          url: '/images/pos-x.jpg',
        },
        {
          target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
          url: '/images/neg-x.jpg',
        },
        {
          target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
          url: '/images/pos-y.jpg',
        },
        {
          target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
          url: '/images/neg-y.jpg',
        },
        {
          target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
          url: '/images/pos-z.jpg',
        },
        {
          target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
          url: '/images/neg-z.jpg',
        },
    ];
    faceInfos.forEach((faceInfo) => {
    const {target, url} = faceInfo;

    // Upload the canvas to the cubemap face.
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 512;
    const height = 512;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;

    // setup each face so it's immediately renderable
    gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);

    // Asynchronously load an image
    const image = new Image();
    image.src = url;
    image.addEventListener('load', function() {
        // Now that the image has loaded make copy it to the texture.
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, textureCubemap);
        gl.texImage2D(target, level, internalFormat, format, type, image);
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    });
    });
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);


    
    //const buffers2 = initBuffers2(gl);

    programInfoArray = [ programInfo, programInfoSkybox, programInfo];
    buffersArray = [ buffers, buffersSkybox, buffers];
    //programInfoArray = [programInfo, programInfoSkybox];
    //buffersArray = [buffers, buffersSkybox];

    let then = 0;

    // Draw the scene repeatedly
    function render(now) {
        now *= 0.001; // convert to seconds
        deltaTime = now - then;
        then = now;
        //console.log(now);

        drawScene(gl, programInfoArray, buffersArray, texture, texture2, texture3, cubeRotation, now, m4, threshold);
        cubeRotation += deltaTime * speed;

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

    

    var slider = document.getElementById("myRange");
    var output = document.getElementById("rangeValue");
    output.innerHTML = slider.value; // Display the default slider value

    // Update the current slider value (each time you drag the slider handle)
    slider.oninput = function() {
        output.innerHTML = this.value;
        onSliderInput(this.value);
    }
}


function onSliderInput(value) {
    threshold = value / 10.0 - 1.0;
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert(
        `Unable to initialize the shader program: ${gl.getProgramInfoLog(
            shaderProgram
        )}`
        );
        return null;
    }

    return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    // Send the source to the shader object

    gl.shaderSource(shader, source);

    // Compile the shader program

    gl.compileShader(shader);

    // See if it compiled successfully

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(
        `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`
        );
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

//
// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
//
function loadTexture(gl, url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Because images have to be downloaded over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture so we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
    gl.texImage2D(
        gl.TEXTURE_2D,
        level,
        internalFormat,
        width,
        height,
        border,
        srcFormat,
        srcType,
        pixel
    );

    const image = new Image();
    image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
        gl.TEXTURE_2D,
        level,
        internalFormat,
        srcFormat,
        srcType,
        image
        );

        // WebGL1 has different requirements for power of 2 images
        // vs non power of 2 images so check if the image is a
        // power of 2 in both dimensions.
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
        // Yes, it's a power of 2. Generate mips.
        gl.generateMipmap(gl.TEXTURE_2D);
        } else {
        // No, it's not a power of 2. Turn off mips and set
        // wrapping to clamp to edge
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    };
    image.src = url;

    return texture;
}

function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
}

function getShaderFromScript(
    gl, scriptId) {
  let shaderSource = '';
  let shaderType;
  const shaderScript = document.getElementById(scriptId);
  if (!shaderScript) {
    throw ('*** Error: unknown script element' + scriptId);
  }
  shaderSource = shaderScript.text;

    if (shaderScript.type === 'x-shader/x-vertex') {
        shaderType = gl.VERTEX_SHADER;
    } else if (shaderScript.type === 'x-shader/x-fragment') {
        shaderType = gl.FRAGMENT_SHADER;
    } else if (shaderType !== gl.VERTEX_SHADER && shaderType !== gl.FRAGMENT_SHADER) {
        throw ('*** Error: unknown shader type');
    }

  return shaderSource;
  //return loadShader( gl, opt_shaderType ? opt_shaderType : shaderType, shaderSource);
}

const defaultShaderType = [
  'VERTEX_SHADER',
  'FRAGMENT_SHADER',
];

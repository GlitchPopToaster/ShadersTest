
"use strict";

var gl;

var threshold = 0.0;


window.onload = function init() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  
  var canvas = document.getElementById("webglCanvas");

  gl = canvas.getContext("webgl2", {
    alpha: true, 
    antialias: true, 
    depth: true, 
    stencil: true, 
    premultipliedAlpha: true,
    failIfMajorPerformanceCaveat: false,
    powerPreference: "default",
    desynchronized: false});
 

  if (!gl) {
      alert("WebGL is not available");
  }
  main();
}



function main() {
   
  
    var vert_sh = getShaderFromScript(gl, "skybox-vertex-shader");
    var frag_sh = getShaderFromScript(gl, "skybox-fragment-shader");


    // Use our boilerplate utils to compile the shaders and link into a program
    var program = webglUtils.createProgramFromSources(gl, [vert_sh, frag_sh]);
  
    // look up where the vertex data needs to go.
    var positionLocation = gl.getAttribLocation(program, "a_position");
  
    // lookup uniforms
    var skyboxLocation = gl.getUniformLocation(program, "u_skybox");
    var noiseLocation = gl.getUniformLocation(program, "u_noise");
    var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    var viewDirectionProjectionInverseLocation =
        gl.getUniformLocation(program, "u_viewDirectionProjectionInverse");
  
    // Create a vertex array object (attribute state)
    var vao = gl.createVertexArray();
  
    // and make it the one we're currently working with
    gl.bindVertexArray(vao);
  
    // Create a buffer for positions
    var positionBuffer = gl.createBuffer();
    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  
    gl.activeTexture(gl.TEXTURE1);
    const texture_noise = loadTexture(gl, "craters5.png");
    gl.bindTexture(gl.TEXTURE_2D, texture_noise);

    // Create a texture.
    gl.activeTexture(gl.TEXTURE0);
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
  
    const faceInfos = [
      {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
        url: '/images/bkg1_right.jpg',
      },
      {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        url: '/images/bkg1_left.jpg',
      },
      {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
        url: '/images/bkg1_top.jpg',
      },
      {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        url: '/images/bkg1_bot.jpg',
      },
      {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
        url: '/images/bkg1_front.jpg',
      },
      {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
        url: '/images/bkg1_back.jpg',
      },
    ];
    faceInfos.forEach((faceInfo) => {
      const {target, url} = faceInfo;
  
      // Upload the canvas to the cubemap face.
      const level = 0;
      const internalFormat = gl.RGBA;
      const width = 1024;
      const height = 1024;
      const format = gl.RGBA;
      const type = gl.UNSIGNED_BYTE;
  
      // setup each face so it's immediately renderable
      gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);
  
      // Asynchronously load an image
      const image = new Image();
      image.src = url;
      image.addEventListener('load', function() {
        // Now that the image has loaded make copy it to the texture.
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        gl.texImage2D(target, level, internalFormat, format, type, image);
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
      });
    });
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  
  
    


    const sphereBufferInfo = primitives.createSphereWithVertexColorsBufferInfo(gl, 18, 12, 6);
    var programInfo = webglUtils.createProgramInfo(gl, ["vertex-shader", "fragment-shader"]);

    function computeMatrix(viewProjectionMatrix, translation, xRotation, yRotation) {
      var matrix = m4.translate(viewProjectionMatrix,
          translation[0],
          translation[1],
          translation[2]);
      matrix = m4.xRotate(matrix, xRotation);
      return m4.yRotate(matrix, yRotation);
    }
/*
    // Create a buffer to put normals in
    var normalBuffer = gl.createBuffer();
    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = normalBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    */
    var projectionLocation = gl.getUniformLocation(programInfo.program, "u_projection");
    var viewLocation = gl.getUniformLocation(programInfo.program, "u_view");
    var worldLocation = gl.getUniformLocation(programInfo.program, "u_world");
    var textureLocation = gl.getUniformLocation(programInfo.program, "u_texture");
    var worldCameraPositionLocation = gl.getUniformLocation(programInfo.program, "u_worldCameraPosition");
    var sh_threshold = gl.getUniformLocation(programInfo.program, "u_threshold");
    var sh_time = gl.getUniformLocation(programInfo.program, "u_time");


  
    requestAnimationFrame(drawScene);
  
    // Draw the scene.
    function drawScene(time) {
      // convert to seconds
      time *= 0.001;
      
      var fieldOfViewRadians = degToRad(70);
  
      webglUtils.resizeCanvasToDisplaySize(gl.canvas);
  
      // Tell WebGL how to convert from clip space to pixels
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  
      gl.enable(gl.CULL_FACE);
      gl.enable(gl.DEPTH_TEST);
  
      //gl.blendFunc(gl.SRC_COLOR, gl.DST_COLOR);
      //gl.getParameter(gl.BLEND_SRC_RGB) === gl.SRC_COLOR;
      //gl.enable(gl.DITHER);

      // Clear the canvas AND the depth buffer.
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  
      // Compute the projection matrix
      var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
      var projectionMatrix =
          m4.perspective(fieldOfViewRadians, aspect, 1, 2000);
  
      // camera going in circle 2 units from origin looking at origin
      //var cameraPosition = [Math.cos(time * .1), 0, Math.sin(time * .1)];
      var cameraPosition = [Math.cos(time * .1), 0, Math.sin(time * .1)];
      var cameraPosition2 = [Math.cos(time * .1), 0, 100.0+ Math.sin(time * .1)];
      var target = [0, 0, 0];
      var up = [0, 1, 0];

      //cameraPosition = [0, 0, 100];
      //up = [0, 1, 0];
      
      // Compute the camera's matrix using look at.
      var cameraMatrix = m4.lookAt(cameraPosition, target, up);
      var cameraMatrix2 = m4.lookAt(cameraPosition2, target, up);
  
      // Make a view matrix from the camera matrix.
      var viewMatrix = m4.inverse(cameraMatrix);
  
      // We only care about direciton so remove the translation
      viewMatrix[12] = 0;
      viewMatrix[13] = 0;
      viewMatrix[14] = 0;
  
      var viewDirectionProjectionMatrix =
          m4.multiply(projectionMatrix, viewMatrix);
      var viewDirectionProjectionInverseMatrix =
          m4.inverse(viewDirectionProjectionMatrix);
  


      // Tell it to use our program (pair of shaders)
      gl.useProgram(program);
      // Bind the attribute/buffer set we want.
      gl.bindVertexArray(vao);

      
      // Bind the position buffer.
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

      // Put the positions in the buffer
      setGeometry(gl);
    
      // Turn on the position attribute
      gl.enableVertexAttribArray(positionLocation);
    
    
      // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
      var size = 2;          // 2 components per iteration
      var type = gl.FLOAT;   // the data is 32bit floats
      var normalize = false; // don't normalize the data
      var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
      var offset = 0;        // start at the beginning of the buffer
      gl.vertexAttribPointer(
          positionLocation, size, type, normalize, stride, offset);

      // Set the uniforms
      gl.uniformMatrix4fv(
          viewDirectionProjectionInverseLocation, false,
          viewDirectionProjectionInverseMatrix);
  
      // Tell the shader to use texture unit 0 for u_skybox
      gl.uniform1i(skyboxLocation, 0);
      // Tell the shader to use texture unit 0 for u_skybox
      gl.uniform1i(noiseLocation, 1);
      gl.uniform2fv(resolutionLocation, [gl.canvas.clientWidth, gl.canvas.clientHeight]);

      // let our quad pass the depth test at 1.0
      gl.depthFunc(gl.LEQUAL);
      // Draw the geometry.
      gl.drawArrays(gl.TRIANGLES, 0, 1 * 6);


      

      // Compute the projection matrix
      var projectionMatrix2 = m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

      // Make a view matrix from the camera matrix.
      var viewMatrix2 = m4.inverse(cameraMatrix2);
      var viewProjectionMatrix = m4.multiply(projectionMatrix2, viewMatrix2);



      gl.useProgram(programInfo.program);
      // Setup all the needed attributes.

      webglUtils.setBuffersAndAttributes(gl, programInfo, sphereBufferInfo);
      //uniforms.u_matrix = computeMatrix(viewProjectionMatrix, [0, 0, 0], time, time);

      

      function mathfPingPongOne(x,y) {
        return (1.0 + (1.0 + Math.sin(x))* 0.5 * y) ;
      }

      var colorMult = [1.0 * mathfPingPongOne(time,2.0), 0.85, 0.95 * mathfPingPongOne(time,0.2), 1] ;
      var sphereUniforms = {
        u_colorMult: colorMult,
        u_matrix: m4.identity(),
      };
      var sphereTranslation = [ 0, 0, 0];
      var sphereXRotation =  time * 0.0;
      var sphereYRotation =  time * 0.1;
      //var sphereXRotation =  0.0;
      //var sphereYRotation =  0.0;
      sphereUniforms.u_matrix = computeMatrix(
        viewProjectionMatrix,
        sphereTranslation,
        sphereXRotation,
        sphereYRotation);
      
      webglUtils.setUniforms(programInfo, sphereUniforms);

      var modelXRotationRadians = Math.cos(-time * .0);
      var modelYRotationRadians = Math.sin(time * .2);
      var worldMatrix = m4.xRotation(modelXRotationRadians);
      worldMatrix = m4.yRotate(worldMatrix, modelYRotationRadians);

      // Set the uniforms
      gl.uniformMatrix4fv(projectionLocation, false, projectionMatrix);
      gl.uniformMatrix4fv(viewLocation, false, viewMatrix);
      gl.uniformMatrix4fv(worldLocation, false, worldMatrix);
      gl.uniform3fv(worldCameraPositionLocation, cameraPosition);
       
      gl.uniform1f(sh_threshold, threshold);
      gl.uniform1f(sh_time, time);
      // Tell the shader to use texture unit 0 for u_texture
      //gl.uniform1i(textureLocation, 0);


      // Set the uniforms we just computed
      //webglUtils.setUniforms(programInfo, uniforms);
      gl.depthFunc(gl.LESS);
      
      gl.drawArrays(gl.TRIANGLES, 0, sphereBufferInfo.numElements);

      


  
      requestAnimationFrame(drawScene);
    }

    var slider = document.getElementById("myRange");
    var output = document.getElementById("rangeValue");
    output.innerHTML = slider.value; // Display the default slider value

    // Update the current slider value (each time you drag the slider handle)
    slider.oninput = function() {
        output.innerHTML = this.value;
        onSliderInput(this.value);
    }

  }
  

  function degToRad(d) {
    return d * Math.PI / 180;
  }


  // Fill the buffer with the values that define a quad.
  function setGeometry(gl) {
    var positions = new Float32Array(
      [
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
      ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
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

function onSliderInput(value) {
    threshold = value / 10.0 - 1.0;
}
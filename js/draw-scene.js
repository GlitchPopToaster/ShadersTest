// Get the starting time.
var then = 0;

function drawScene(gl, programInfoArray, buffers, texture, texture2, texture3, cubeRotation, time, m4, threshold) {
  
    // convert to seconds
    time *= 0.001;
    // Subtract the previous time from the current time
    var deltaTime = time - then;
    // Remember the current time for the next frame.
    then = time;


    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
    gl.clearDepth(1.0); // Clear everything

    gl.enable(gl.CULL_FACE);
    //gl.depthMask(false);
    gl.enable(gl.DEPTH_TEST); // Enable depth testing
    //gl.depthFunc(gl.LEQUAL); // Near things obscure far things
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    //gl.blendFunc(gl.SRC_COLOR, gl.DST_COLOR);
    //gl.getParameter(gl.BLEND_SRC_RGB) === gl.SRC_COLOR;

    //gl.enable(gl.DITHER);

    // Clear the canvas before we start drawing on it.
  
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    /* not in loop
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture2);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, texture3);
    */
  
    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.
  
    const fieldOfView = (60 * Math.PI) / 180; // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 1000.0;
    const projectionMatrix = mat4.create();
  
    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

  
    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    var modelViewMatrix = mat4.create();
  
    // Now move the drawing position a bit to where we want to
    // start drawing the square.
    mat4.translate(
      modelViewMatrix, // destination matrix
      modelViewMatrix, // matrix to translate
      [-0.0, 0.0, -6.0]
    ); // amount to translate
  
    mat4.rotate(
      modelViewMatrix, // destination matrix
      modelViewMatrix, // matrix to rotate
      cubeRotation, // amount to rotate in radians
      [0, 0, 1]
    ); // axis to rotate around (Z)
    mat4.rotate(
      modelViewMatrix, // destination matrix
      modelViewMatrix, // matrix to rotate
      cubeRotation * 0.7, // amount to rotate in radians
      [0, 1, 0]
    ); // axis to rotate around (Y)
    mat4.rotate(
      modelViewMatrix, // destination matrix
      modelViewMatrix, // matrix to rotate
      cubeRotation * 0.3, // amount to rotate in radians
      [1, 0, 0]
    ); // axis to rotate around (X)
  
    const normalMatrix = mat4.create();
    //mat4.invert(normalMatrix, modelViewMatrix);
    //mat4.transpose(normalMatrix, normalMatrix);


    const modelViewMatrix2 = mat4.create();
    mat4.translate(
      modelViewMatrix2, // destination matrix
      modelViewMatrix2, // matrix to translate
      [-3.0, 0.0, -9.0]
    ); // amount to translate
    mat4.rotate(
      modelViewMatrix2, // destination matrix
      modelViewMatrix2, // matrix to rotate
      cubeRotation, // amount to rotate in radians
      [1, -1, -1]
    ); // axis to rotate around (Z)



    var n = 0;
    programInfoArray.forEach(programInfo => {//--------------------
        
        if(n == 0 ){
          gl.depthFunc(gl.LESS);
        }else{
          modelViewMatrix = modelViewMatrix2;
          gl.depthFunc(gl.LEQUAL);
        }
        


        // Tell WebGL to use our program when drawing
        gl.useProgram(programInfo.program);


        // Tell WebGL how to pull out the positions from the position
        // buffer into the vertexPosition attribute.
        setPositionAttribute(gl, buffers[n], programInfo);
        setColorAttribute(gl, buffers[n], programInfo);
        setTextureAttribute(gl, buffers[n], programInfo);
      
        // Tell WebGL which indices to use to index the vertices
        if(buffers[n].hasOwnProperty('indices')){
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers[n].indices);
        }
      
        setNormalAttribute(gl, buffers[n], programInfo);
      
        // Set the shader uniforms
        gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
        gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
        gl.uniformMatrix4fv(programInfo.uniformLocations.normalMatrix, false, normalMatrix);

        
        
        //SkyBox


        const fieldOfViewRadians = (50 * Math.PI) / 180;;
        // Compute the projection matrix
        var projectionMatrix2 = m4.perspective(fieldOfViewRadians, aspect, 0.1, 2000.0);

        // camera going in circle 2 units from origin looking at origin
        //var cameraPosition = [Math.cos(time * .1), 0, Math.sin(time * .1)];
        var cameraPosition = [0, 0, 0];
        var target = [0, 0, 0];
        var up = [0, 1, 0];
        // Compute the camera's matrix using look at.
        var cameraMatrix = m4.lookAt(cameraPosition, target, up);
        var viewMatrix = m4.inverse(cameraMatrix);

        // We only care about direciton so remove the translation
        viewMatrix[12] = 0;
        viewMatrix[13] = 0;
        viewMatrix[14] = 0;

        var viewDirectionProjectionMatrix = m4.multiply(projectionMatrix2, viewMatrix);
        var viewDirectionProjectionInverseMatrix = m4.inverse(viewDirectionProjectionMatrix);


        gl.uniformMatrix4fv(
          programInfo.uniformLocations.viewDirectionProjectionInverseLocation,
          false,
          viewDirectionProjectionInverseMatrix
        );

        //SkyBox

      
        // Tell the shader we bound the texture to texture unit 0
        gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
        gl.uniform1i(programInfo.uniformLocations.uSampler2, 1);
        gl.uniform1i(programInfo.uniformLocations.uSampler3, 2);
        gl.uniform1i(programInfo.uniformLocations.uSampler4, 3);
        
        gl.uniform1f(programInfo.uniformLocations.sh_time, time);
        gl.uniform1f(programInfo.uniformLocations.sh_threshold, threshold);
    
      
        //const vertexCount = programInfo.vertexCount
        const vertexCount = buffers[n].vertexCount;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
        //gl.drawArrays(gl.TRIANGLES, offset, vertexCount );
        
      
      
      n++;
    
    });//--------------------
        
  }
  
  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute.
  function setPositionAttribute(gl, buffers, programInfo) {
    if(!buffers.hasOwnProperty('position')) return;
    const numComponents = 3;
    const type = gl.FLOAT; // the data in the buffer is 32bit floats
    const normalize = false; // don't normalize
    const stride = 0; // how many bytes to get from one set of values to the next
    // 0 = use type and numComponents above
    const offset = 0; // how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
  }
  
  // Tell WebGL how to pull out the colors from the color buffer
  // into the vertexColor attribute.
  function setColorAttribute(gl, buffers, programInfo) {
    if(!buffers.hasOwnProperty('color')) return;
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexColor,
      numComponents,
      type,
      normalize,
      stride,
      offset
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
  }
  
  // tell webgl how to pull out the texture coordinates from buffer
  function setTextureAttribute(gl, buffers, programInfo) {
    if(!buffers.hasOwnProperty('textureCoord')) return;
    const num = 2; // every coordinate composed of 2 values
    const type = gl.FLOAT; // the data in the buffer is 32-bit float
    const normalize = false; // don't normalize
    const stride = 0; // how many bytes to get from one set to the next
    const offset = 0; // how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
    gl.vertexAttribPointer(
      programInfo.attribLocations.textureCoord,
      num,
      type,
      normalize,
      stride,
      offset
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
  }
  
  // Tell WebGL how to pull out the normals from
  // the normal buffer into the vertexNormal attribute.
  function setNormalAttribute(gl, buffers, programInfo) {
    if(!buffers.hasOwnProperty('normal')) return;
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexNormal,
      numComponents,
      type,
      normalize,
      stride,
      offset
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);

}
  
  export { drawScene };
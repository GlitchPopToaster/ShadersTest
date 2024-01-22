const positions = 
    [
      -10.0, -10.0, 
       10.0, -10.0, 
      -10.0,  10.0, 
      -10.0,  10.0,
       10.0, -10.0,
       10.0,  10.0,
    ];

function initBuffersSkybox(gl) {

    const positionBuffer = initPositionBuffer(gl);

    const vertCount = getVertCount(positions);

    return {
      position: positionBuffer,
      vertexCount: vertCount
    };
  }

  
  function initPositionBuffer(gl) {
    // Create a buffer for the square's positions.
    const positionBuffer = gl.createBuffer();
  
    // Select the positionBuffer as the one to apply buffer
    // operations to from here out.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);


    return positionBuffer;
  }
  
  function getVertCount( position) {
    //return position.length / 2;
    return 1 * 6;
  }
  
  export { initBuffersSkybox };
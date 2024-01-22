
uniform highp float u_time;
uniform highp float u_threshold; // The threshold value for the dissolve effect

attribute vec4 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uNormalMatrix;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying highp vec2 vTextureCoord;
varying highp vec3 vVertexPosition;
varying highp vec3 vLighting;

varying highp vec3 world_pos;

void main(void) {

    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    world_pos = gl_Position.xyz;
    //world_pos = (inverse(uProjectionMatrix) * uModelViewMatrix * aVertexPosition).xyz;

    vTextureCoord = aTextureCoord;
    //vVertexPosition = aVertexPosition.xy;
    vVertexPosition = aVertexPosition.xyz;

    //world_pos = gl_Position.xyz * vec3(vTextureCoord, 1.0).xyz;
    //world_pos = gl_Position.xyz * vec3(vVertexPosition, 1.0).xyz;
    //world_pos = gl_Position.xyz + vec3(vVertexPosition, 1.0).xyz;
    //world_pos = gl_Position.xyz + aVertexPosition.xyz;
    //world_pos = gl_Position.xyz * vec4(aVertexPosition.x, aVertexPosition.y, aVertexPosition.z, 1.0).xyz;

    // Apply lighting effect

    highp vec3 ambientLight = vec3(0.2, 0.2, 0.2);
    highp vec3 directionalLightColor = vec3(1, 1, 1);
    highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

    highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

    highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
    vLighting = ambientLight + (directionalLightColor * directional);
}
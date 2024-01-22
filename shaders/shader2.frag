    uniform highp float u_time;
    uniform highp float u_threshold; // The threshold value for the dissolve effect

    uniform sampler2D u_texture; // The texture to be dissolved
    uniform sampler2D u_noise; // The noise map for the dissolve effect
    uniform sampler2D blendTexture;
    

    highp vec2 UV = vec2(1., 1.);

    //highp float offset = 0.0;
    highp vec3 offset = vec3(0.);

    bool up = true;
    //highp vec4 borderColor: hint_color = vec4(1., 1., 0., 1.);
    highp vec4 borderColor = vec4(1., 0.4, 0.3, 1.);
    highp float borderHeight = 0.2;
    highp float waveAmplitude = 1.0;
    highp float waveFrequency = 1.0;
    highp float wavePhase = 0.1;
    highp float emissionIntensity = 1.0;
    highp float noiseSpeed = 0.1;
    highp float noiseInfluence = 1.0;

    highp vec2 blendUVScale = vec2(1.);
    highp vec2 noiseUVScale = vec2(1.);
    highp vec2 textureUVScale = vec2(1.);

    const highp float tao = 2. * 3.14;

    //uniform highp mat4 global_transform;

    varying highp vec3 world_pos;
    varying highp vec3 vVertexPosition;


    //highp float TIME = 0.5;//


    varying highp vec3 vLighting;
    varying highp vec2 vTextureCoord; // The texture coordinate


    
highp float radius = 5.;


    void main() {

    //highp vec3 position = world_pos;
    highp vec3 position = world_pos;

	//highp vec3 position = (inverse(WORLD_MATRIX) * CAMERA_MATRIX * vec4(VERTEX, 1.0)).xyz;

    highp vec4 text = texture2D(u_texture, vTextureCoord);
    highp vec4 blend = texture2D(blendTexture, vTextureCoord * blendUVScale);
    
    highp vec2 st = vTextureCoord;
    st.y -= u_time * noiseSpeed;
    highp vec4 noise = texture2D(u_noise , st * noiseUVScale);
    //highp vec4 noise = texture2D(u_noise , vTextureCoord + st * noiseUVScale);

    /*
    highp float x = tao * position.x;
    highp float waveFrequency1 = waveFrequency;
    highp float waveFrequency2 = waveFrequency + 2. - wavePhase;
    highp float waveFrequency3 = waveFrequency + 3. - wavePhase;
    
    position.y += waveAmplitude * (sin(x / waveFrequency1) + sin(x / waveFrequency2) + sin(x / waveFrequency3)) ;
    position.y += (noise.r * noiseInfluence);
    position.y -= -3.0 + u_threshold * 8.0;
    
    highp float direction = up ? 1. : -1.;
    highp float upperBorder = smoothstep(offset, offset, (position.y * direction) + 1.);
    highp float bottomBorder = smoothstep(offset, offset, (position.y * direction) - borderHeight + 1.);
    highp float borderPart = upperBorder - bottomBorder;

    //highp vec4 color = mix(blend, borderColor, upperBorder);
    highp vec4 color = mix(blend, borderColor, upperBorder * 5.0);
    //color = vec4(0.0, 0.0, 0.0, 0.0);
    color = mix(color, text, bottomBorder);
    */
   
	highp float global_distance = distance(position, offset) - u_threshold * 5.0;
	global_distance += (noise.r * noiseInfluence);
	highp float border1 = global_distance > radius ? 1. : 0.;
	highp float border2 = global_distance > (radius + borderHeight) ? 1. : 0.;

    highp vec4 color = mix(blend, borderColor, border1);
    color = mix(color, text, border2);
    
    gl_FragColor = vec4(color.rgb * vLighting, color.a);
    }
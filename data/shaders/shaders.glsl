\shaders

skybox basic.vs skybox.fs

\basic.vs 

	precision highp float;
	attribute vec3 a_vertex;
	attribute vec3 a_normal;
	attribute vec2 a_coord;

	varying vec3 v_wPosition;
	varying vec3 v_wNormal;
	varying vec2 v_coord;

	uniform mat4 u_viewprojection;
	uniform mat4 u_model;

	void main() {
		vec3 vertex = a_vertex;

		v_wPosition = (u_model * vec4(vertex,1.0)).xyz;
		v_wNormal = (u_model * vec4(a_normal,0.0)).xyz;
		v_coord = a_coord;

		gl_Position = u_viewprojection * vec4( v_wPosition, 1.0 );
		gl_PointSize = 2.0;
	}

\skybox.fs

	precision highp float;

	varying vec3 v_wPosition;
	varying vec3 v_wNormal;
	varying vec2 v_coord;

	uniform vec3 u_camera_position;
	uniform vec4 u_background_color;
	uniform vec4 u_color;
    uniform samplerCube u_color_texture;

	void main() {
    
        vec3 E = v_wPosition - u_camera_position;
        E = normalize(E);
        
        vec3 color = textureCube(u_color_texture, E).xyz;
        
		gl_FragColor = vec4( color, 1.0 );
	}
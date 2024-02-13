// Three.js Transpiler r161

import {
  uniform,
  vec3,
  mul,
  tslFn,
  mat3,
  color,
  saturate,
  normalize,
  If,
  cameraPosition,
	positionGeometry,
	modelWorldMatrix,
	cameraViewMatrix,
  dot,
  float,
  pow,
  smoothstep,
  clamp,
  vec4,
} from 'three/nodes';

const glowColor = uniform( 'vec3' );
const falloff = uniform( 'float' );
const glowSharpness = uniform( 'float' );
const glowInternalRadius = uniform( 'float' );
const opacity = uniform( 'float' );
const toneMappingExposure = uniform( 'float' );
/* unknown statement */;
/* unknown statement */;

const RRTAndODTFit = tslFn( ( [ v_immutable ] ) => {

	const v = vec3( v_immutable ).toVar();
	const a = vec3( v.mul( v.add( 0.0245786 ) ).sub( 0.000090537 ) ).toVar();
	const b = vec3( v.mul( mul( 0.983729, v ).add( 0.4329510 ) ).add( 0.238081 ) ).toVar();

	return a.div( b );

} );

const ACESFilmicToneMapping = tslFn( ( [ color_immutable ] ) => {

	const color = vec3( color_immutable ).toVar();
	const ACESInputMat = mat3( vec3( 0.59719, 0.07600, 0.02840 ), vec3( 0.35458, 0.90834, 0.13383 ), vec3( 0.04823, 0.01566, 0.83777 ) );
	const ACESOutputMat = mat3( vec3( 1.60475, - 0.10208, - 0.00327 ), vec3( - 0.53108, 1.10813, - 0.07276 ), vec3( - 0.07367, - 0.00605, 1.07602 ) );
	color.mulAssign( toneMappingExposure.div( 0.6 ) );
	color.assign( ACESInputMat.mul( color ) );
	color.assign( RRTAndODTFit( color ) );
	color.assign( ACESOutputMat.mul( color ) );

	return saturate( color );

} );

const main = tslFn( () => {

	const normal = vec3( normalize( vNormal ) ).toVar();

	If( gl_FrontFacing.not(), () => {

		normal.mulAssign( - 1.0 );

	} );

	const viewDirection = vec3( normalize( cameraPosition.sub( vPosition ) ) ).toVar();
	const fresnel = float( dot( viewDirection, normal ) ).toVar();
	fresnel.assign( pow( fresnel, glowInternalRadius.add( 0.1 ) ) );
	const falloff = float( smoothstep( 0., falloff, fresnel ) ).toVar();
	const fakeGlow = float( fresnel ).toVar();
	fakeGlow.addAssign( fresnel.mul( glowSharpness ) );
	fakeGlow.mulAssign( falloff );
	gl_FragColor.assign( vec4( clamp( glowColor.mul( fresnel ), 0., 1.0 ), clamp( fakeGlow, 0., opacity ) ) );

} );

/* unknown statement */;
/* unknown statement */;

const vertexMain = tslFn( () => {

	const modelPosition = vec4( modelMatrix.mul( vec4( position, 1.0 ) ) ).toVar();
	gl_Position.assign( projectionMatrix.mul( viewMatrix.mul( modelPosition ) ) );
	const modelNormal = vec4( modelMatrix.mul( vec4( normal, 0.0 ) ) ).toVar();
	vPosition.assign( modelPosition.xyz );
	vNormal.assign( modelNormal.xyz );

} );

// layouts

main.setLayout( {
	name: 'main',
	type: 'void',
	inputs: []
} );

export { glowColor, falloff, glowSharpness, glowInternalRadius, opacity, toneMappingExposure, RRTAndODTFit, ACESFilmicToneMapping, main };

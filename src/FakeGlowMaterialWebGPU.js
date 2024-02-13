
import { Color, AdditiveBlending } from 'three';
import {
  tslFn,
  modelWorldMatrix,
  positionGeometry,
  normalGeometry,
  mul,
  uniform,
  mat3,
  pow,
  smoothstep,
  clamp,
  saturate,
  float,
  vec3,
  vec4,
  dot,
  normalize,
  cameraPosition,
  MeshBasicNodeMaterial,
  toneMapping,
} from 'three/nodes';

export class FakeGlowMaterial extends MeshBasicNodeMaterial {
  
  constructor({
    falloff = .1,
    glowColor = new Color('#8039ea'),
    opacity = 1,
    glowInternalRadius = 6,
    glowSharpness = .5,
    toneMappingExposure = 1,
  } = {}) {
    super();

    this.uFalloff = uniform(falloff);
    this.uGlowColor = uniform(glowColor);
    this.uOpacity = uniform(opacity);
    this.uGlowInternalRadius = uniform(glowInternalRadius);
    this.uGlowSharpness = uniform(glowSharpness);
    this.uToneMappingExposure = uniform(toneMappingExposure);
    
    const colorNodeTslFn = tslFn(() => {
      const modelPosition = vec4(modelWorldMatrix.mul(vec4(positionGeometry, 1.0)));
      const modelNormal = vec4(modelWorldMatrix.mul(vec4(normalGeometry, 0.0)));
      const vPosition = modelPosition.xyz;
      const vNormal = modelNormal.xyz;
  
      const viewDirection = normalize(cameraPosition.sub(vPosition));
      const fresnel = float(dot(viewDirection, vNormal));
      fresnel.assign(pow(fresnel, this.uGlowInternalRadius.add(0.1)));
      const falloff = float(smoothstep( 0., this.uFalloff, fresnel));
      const fakeGlow = float(fresnel);
      fakeGlow.addAssign(fresnel.mul(this.uGlowSharpness));
      fakeGlow.mulAssign(falloff);
      const inputColor = vec4(clamp(this.uGlowColor.mul(fresnel), 0., 1.0), clamp(fakeGlow, 0., this.uOpacity));
  
      const color = inputColor.rgb.toVar();
      const ACESInputMat = mat3(vec3(0.59719, 0.07600, 0.02840), vec3(0.35458, 0.90834, 0.13383), vec3(0.04823, 0.01566, 0.83777));
      const ACESOutputMat = mat3(vec3(1.60475, - 0.10208, - 0.00327), vec3(- 0.53108, 1.10813, - 0.07276), vec3(- 0.07367, - 0.00605, 1.07602));
      color.mulAssign(this.uToneMappingExposure.div(0.6));
      color.assign(ACESInputMat.mul(color));

      const v = color.rgb.toVar();
      const a = vec3(v.mul(v.add(0.0245786)).sub(0.000090537)).toVar();
      const b = vec3(v.mul(mul(0.983729, v).add(0.4329510)).add(0.238081)).toVar();
      color.assign(a.div(b));
  
      color.assign(ACESOutputMat.mul(color));
      return saturate(vec4(color, inputColor.a));
    });
  
    this.colorNode = colorNodeTslFn();
    this.transparent = true;
    this.blending = AdditiveBlending;
    this.depthTest = false;
    this.ton
  }
}



import { Color, AdditiveBlending, ACESFilmicToneMapping } from 'three';
import {
  tslFn,
  modelWorldMatrix,
  positionGeometry,
  normalGeometry,
  uniform,
  pow,
  smoothstep,
  clamp,
  saturate,
  float,
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
  } = {}) {
    super();

    this.uFalloff = uniform(falloff);
    this.uGlowColor = uniform(glowColor);
    this.uOpacity = uniform(opacity);
    this.uGlowInternalRadius = uniform(glowInternalRadius);
    this.uGlowSharpness = uniform(glowSharpness);
    
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
      const outColor = saturate(this.uGlowColor.mul(fresnel));
      return vec4(toneMapping(ACESFilmicToneMapping, float(1), outColor.rgb), clamp(fakeGlow, 0., this.uOpacity))
    });
  
    this.colorNode = colorNodeTslFn();
    this.transparent = true;
    this.blending = AdditiveBlending;
    this.depthTest = false;
  }
}


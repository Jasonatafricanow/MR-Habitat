import { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { GTAOPass } from "three/examples/jsm/postprocessing/GTAOPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

/**
 * Ground-truth ambient occlusion for the Xiyue interior: contact darkening in
 * corners, under furniture and along skirting is most of what separates a
 * "lived-in" render from flat low-poly. Uses three's bundled passes only.
 */
export function PostAO() {
  const { gl, scene, camera, size } = useThree();
  const composer = useMemo(() => {
    const c = new EffectComposer(gl);
    c.addPass(new RenderPass(scene, camera));
    const ao = new GTAOPass(scene, camera, size.width, size.height);
    ao.updateGtaoMaterial({
      radius: 0.45,
      distanceExponent: 1.6,
      thickness: 1.2,
      scale: 1.15,
      samples: 12,
    });
    ao.blendIntensity = 0.9;
    c.addPass(ao);
    c.addPass(new OutputPass());
    return c;
    // Size changes are handled below without rebuilding passes.
  }, [gl, scene, camera]);
  useEffect(() => {
    composer.setPixelRatio(gl.getPixelRatio());
    composer.setSize(size.width, size.height);
  }, [composer, gl, size.width, size.height]);
  useEffect(() => () => composer.dispose(), [composer]);
  useFrame(() => composer.render(), 1);
  return null;
}

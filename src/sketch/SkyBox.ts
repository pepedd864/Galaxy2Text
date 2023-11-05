import * as kokomi from "kokomi.js";
import * as THREE from "three";
import { getFile } from "@/utils/utils";

export  default class SkyBox extends kokomi.Component {
  constructor(base: kokomi.Base) {
    super(base)
    this.base.scene.background = new THREE.CubeTextureLoader().load(
      [
        getFile('assets/skybox/mobile_l.jpg'), // -z
        getFile('assets/skybox/mobile_r.jpg'), // +z
        getFile('assets/skybox/mobile_u.jpg'), // +y
        getFile('assets/skybox/mobile_d.jpg'), // -y
        getFile('assets/skybox/mobile_b.jpg'), // -x
        getFile('assets/skybox/mobile_f.jpg'), // +x
      ],
      () => document.dispatchEvent(new CustomEvent('loaded')),
    )
  }
}

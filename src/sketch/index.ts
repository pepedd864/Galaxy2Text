import * as kokomi from 'kokomi.js'
import Controls from './Controls'
import Particle from '@/sketch/Particle'
import Text3D from '@/sketch/Text3D'
import { useText3dStore } from '@/store'
import gsap from 'gsap'
import * as dat from 'lil-gui'
import { getFile } from '@/utils/utils'

export default class Sketch extends kokomi.Base {
  strs: string[] = []
  particle!: Particle
  index!: number
  isRender!: boolean

  // @ts-ignore
  async create() {
    this.index = 0
    this.isRender = false
    // new SkyBox(this)

    // @ts-ignore
    window.particleFont = await kokomi.loadFont(getFile('assets/fonts/PingFangSCRegular.json'))

    this.particle = new Particle(this, {
      count: 70000,
      size: 0.2,
      radius: 30,
      randomness: 2,
      randomnessPower: 3,
      insideColor: '#cdb4ad',
      outsideColor: '#1b3984',
    })


    setTimeout(() => document.dispatchEvent(new CustomEvent('loaded')), 1000)

    new Controls(this)
    // @ts-ignore
    if (import.meta.env.MODE === 'development') {
      const gui = new dat.GUI()
      gui.add(this.particle.points.material.uniforms.progress, 'value', 0, 1, 0.01)
      gui.close()
      new kokomi.Stats(this)
    }

  }

  render() {
    super.render()
    this.strs = useText3dStore().textList.map((item) => item.text)
    this.createText()
  }

  async createText() {
    if (this.isRender) return
    if (useText3dStore().playState && this.index >= this.strs.length) {
      useText3dStore().endPlay()
      this.index = 0
      this.particle.clear()
      await gsap.to(this.camera.position, { x: 0, y: 0, z: 15, duration: 5 })
    }
    if (!useText3dStore().playState) return
    this.isRender = true
    let str = this.strs[this.index]
    await Text3D.create(this, str)
    await this.particle.to(Text3D.instance!)
    // 及时销毁
    Text3D.instance?.dispose()
    Text3D.instance = null
    this.index++
    this.isRender = false
  }
}

// @ts-nocheck
import * as kokomi from 'kokomi.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass'
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { FocusShader } from 'three/examples/jsm/shaders/FocusShader'

import type { NormalBufferAttributes } from 'three'
import * as THREE from 'three'
import { BufferGeometry, Color, ShaderMaterial } from 'three'
// @ts-ignore
import vertexShader from '@/shader/particle/vt.glsl?raw'
// @ts-ignore
import fragmentShader from '@/shader/particle/fm.glsl?raw'
import gsap from 'gsap'

interface ParticleParams {
  count: number
  size: number
  radius: number
  randomness: number
  randomnessPower: number
  insideColor: string
  outsideColor: string
}

export default class Particle extends kokomi.Component {
  params: ParticleParams
  geometry: BufferGeometry<NormalBufferAttributes>
  position: Float32Array
  toPosition: Float32Array
  colors: Float32Array
  colorOutside: Color
  colorInside: Color
  material: ShaderMaterial
  scale: Float32Array
  speed: Float32Array
  points!: THREE.Points<
    BufferGeometry<NormalBufferAttributes>,
    ShaderMaterial
  >
  isParticle: Float32Array
  composer?: EffectComposer

  constructor(base: kokomi.Base, params: ParticleParams) {
    super(base)
    // 在场景中添加雾的效果，参数分别代表‘雾的颜色’、‘开始雾化的视线距离’、刚好雾化至看不见的视线距离’
    this.base.scene.fog = new THREE.FogExp2(328972, 5e-4)
    // this.base.renderer = new THREE.WebGLRenderer({
    //   // 透明色
    //   alpha: true,
    // })
    this.base.renderer.autoClear = false// 自动清理，解决 bloomPass 效果器冲突
    // 渲染背景颜色同雾化的颜色
    this.base.renderer.setClearColor(this.base.scene.fog.color)
    // 打开渲染器的阴影地图
    this.base.renderer.shadowMap.enabled = true
    this.base.renderer.shadowMap.type = THREE.PCFSoftShadowMap

    const { count, insideColor, outsideColor } = params
    this.params = params

    this.position = new Float32Array(count * 3)
    this.toPosition = new Float32Array(count * 3)
    this.speed = new Float32Array(count)
    this.isParticle = new Float32Array(count)

    this.colors = new Float32Array(count * 3)
    this.scale = new Float32Array(count)
    this.colorInside = new THREE.Color(insideColor)
    this.colorOutside = new THREE.Color(outsideColor)

    this.geometry = new THREE.BufferGeometry()
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      transparent: true,
      uniforms: {
        progress: { value: 0 },
        time: { value: 0 },
      },
    })

    this.generate()
  }

  /**
   * 创建特效
   */
  createEffect() {
    this.base.composer = new EffectComposer(this.base.renderer)
    const renderPass = new RenderPass(this.base.scene, this.base.camera)
    const bloomPass = new BloomPass(0.75)
    const filmPass = new FilmPass(0.5, 0.5, 1500, 0)
    const shaderPass = new ShaderPass(FocusShader)
    shaderPass.uniforms.screenWidth.value = window.innerWidth
    shaderPass.uniforms.screenHeight.value = window.innerHeight
    shaderPass.uniforms.sampleDistance.value = 0.4
    shaderPass.renderToScreen = true

    this.base.composer?.addPass(renderPass)
    this.base.composer?.addPass(bloomPass)
    this.base.composer?.addPass(filmPass)
    this.base.composer?.addPass(shaderPass)
  }

  static animating: boolean = false

  update() {
    // this._resetVector()
    this.material.uniforms.time.value = this.base.clock.elapsedTime
  }


  generate() {
    if (this.points) {
      this.geometry.dispose()
      this.material.dispose()
      this.base.scene.remove(this.points)
    }

    for (let i = 0; i < this.params.count; i++) {
      const i3 = i * 3
      const radius = Math.random() * this.params.radius

      const mixedColor = this.colorInside.clone()
      mixedColor.lerp(this.colorOutside, radius / this.params.radius)

      // this.position[i3] = Math.random() * this.params.radius - this.params.radius / 2
      // this.position[i3 + 1] = Math.random() * this.params.radius - this.params.radius / 2
      // this.position[i3 + 2] = Math.random() * this.params.radius - this.params.radius / 2


      this.colors[i3] = mixedColor.r
      this.colors[i3 + 1] = mixedColor.g
      this.colors[i3 + 2] = mixedColor.b

      this.isParticle[i] = 1.0

    }

    this.position = kokomi.sampleParticlesPositionFromMesh(
      new THREE.SphereGeometry(5, 64, 64),
      this.params.count,
    )

    this._resetVector()

    this.toPosition = this.position.slice()


    this.points = new THREE.Points(this.geometry, this.material)

    this.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(this.position, 3),
    )
    this.geometry.setAttribute(
      'toPosition',
      new THREE.BufferAttribute(this.toPosition, 3),
    )

    this.geometry.setAttribute(
      'color',
      new THREE.BufferAttribute(this.colors, 3),
    )
    this.geometry.setAttribute(
      'isParticle',
      new THREE.BufferAttribute(this.isParticle, 1),
    )

    this.base.scene.add(this.points)

    this.createEffect()

    // 动画
    setTimeout(() => {
      // this.clear()  // TODO
    }, 4000)
  }

  static targetLength = 0

  _randomCoords(radius: number) {
    let coords = []
    let rand = () => {
      return (
        Math.pow(Math.random(), this.params.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        this.params.randomness *
        radius
      )
    }
    for (let i = 0; i < 3; i++) {
      coords.push(rand())
    }
    return coords
  }

  _copyCoord(Coord1: Float32Array, Coord2: Float32Array, i3: number) {
    Coord1[i3] = Coord2[i3]
    Coord1[i3 + 1] = Coord2[i3 + 1]
    Coord1[i3 + 2] = Coord2[i3 + 2]
  }

  _resetVector() {
    for (let i = 0; i < this.params.count; i++) {
      this.speed[i] = Math.random() * 0.2 + 1

      this.scale[i] = this.params.size + Math.random() * this.params.size
    }
    this.geometry.setAttribute(
      'speed',
      new THREE.BufferAttribute(this.speed, 1),
    )
    this.geometry.setAttribute(
      'scale',
      new THREE.BufferAttribute(this.scale, 1),
    )
  }

  _updateAttribute(attributes: string[]) {
    attributes.forEach((attribute) => {
      this.geometry.attributes[attribute].needsUpdate = true
    })
  }

  // @ts-ignore
  async to(geometry: THREE.BufferGeometry | null) {
    if (Particle.animating) {
      console.log('animating')
      return
    }
    // 通过计算几何体的长度来确定相机的位置
    geometry?.computeBoundingBox()
    const { max } = geometry?.boundingBox as THREE.Box3
    const { x, y, z } = max
    if (x != null) {
      if (x > 4) {
        gsap.to(this.base.camera.position, { x: 0, y: 0, z: x * 1.2, duration: 0.6 })
      } else {
        gsap.to(this.base.camera.position, { x: 0, y: 0, z: 7, duration: 0.6 })
      }
    }

    Particle.animating = true
    let target: Float32Array | null = geometry?.attributes.position.array as Float32Array

    for (let i = target.length; i < Particle.targetLength; i++) {
      this.toPosition[i] = Math.random() * this.params.radius - this.params.radius / 2
      this.speed[i] = Math.random() * 0.2 + 1
    }

    for (let index = 0; index < this.params.count; index++) {
      const i3 = index * 3
      this._copyCoord(this.position, this.toPosition, i3)
      this.isParticle[index] = 1.0
      if (target[i3] !== undefined && target[i3 + 1] !== undefined && target[i3 + 2] !== undefined) {
        this._copyCoord(this.toPosition, target, i3)
        this.isParticle[index] = 0.0
      }

      this.speed[index] = Math.random() * 0.2 + 1

    }
    Particle.targetLength = target.length
    target = null
    this._updateAttribute(['position', 'toPosition', 'speed', 'isParticle'])
    this.points.material.uniforms.progress.value = 0
    await gsap.to(this.points.material.uniforms.progress, { value: 1, duration: 1.5 })
    Particle.animating = false
    console.log('done')
  }

  async clear() {
    if (Particle.animating) {
      console.log('animating')
      return
    }
    Particle.animating = true
    for (let i = 0; i < this.params.count; i++) {
      const i3 = i * 3
      this._copyCoord(this.position, this.toPosition, i3)
      this.toPosition[i3] = Math.random() * this.params.radius - this.params.radius / 2
      this.toPosition[i3 + 1] = Math.random() * this.params.radius - this.params.radius / 2
      this.toPosition[i3 + 2] = Math.random() * this.params.radius - this.params.radius / 2
      this.isParticle[i] = 1.0
      this.speed[i] = Math.random() * 0.2 + 1
    }
    this._updateAttribute(['position', 'toPosition', 'speed', 'isParticle'])
    this.points.material.uniforms.progress.value = 0
    await gsap.to(this.points.material.uniforms.progress, { value: 1, duration: 3 })
    this.points.material.uniforms.progress.value = 0
    for (let i = 0; i < this.params.count; i++) {
      const i3 = i * 3
      this._copyCoord(this.position, this.toPosition, i3)
    }
    this._updateAttribute(['position', 'toPosition', 'speed', 'isParticle'])
    Particle.animating = false
    console.log('done')
  }
}

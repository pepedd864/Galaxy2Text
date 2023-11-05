import * as kokomi from 'kokomi.js'
import gsap from 'gsap'

export default class Controls extends kokomi.Component {
  constructor(base: kokomi.Base) {
    super(base)
    // 相机动画
    this.base.camera.position.set(0, 0, 0)
    gsap.to(this.base.camera.position, { x: 0, y: 0, z: 15, duration: 5 })
    // 控制
    const { controls } = new kokomi.OrbitControls(base)
    controls.enableDamping = true // 开启阻尼效果
    controls.zoomSpeed = 0.3
    controls.autoRotateSpeed = 0.7
    controls.autoRotate = false
    // 设置相机当前仰角
    controls.minDistance = 5 // 最小缩放比例
    controls.maxDistance = 20 // 最大缩放比例
    controls.minPolarAngle = Math.PI / 4 // 最小仰角
    controls.maxPolarAngle = Math.PI / 2.3 // 最大仰角
    controls.enablePan = false // 禁止平移
    // 设置旋转角度
    controls.minAzimuthAngle = -Math.PI / 4 // 最小水平角度
    controls.maxAzimuthAngle = Math.PI / 4 // 最大水平角度
  }
}

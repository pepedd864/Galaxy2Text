import { BufferAttribute, BufferGeometry } from 'three'
import * as kokomi from 'kokomi.js'
import { Base } from 'kokomi.js'
import { getFile, getStrLength } from '@/utils/utils'

export default class Text3D extends BufferGeometry {
  static instance: BufferGeometry | null = null

  constructor() {
    super()
  }

  static font = null

  // @ts-ignore
  static async loadFont() {
    if (!this.font) {
      // @ts-ignore
      if (!window?.particleFont) {
        // @ts-ignore
        this.font = await kokomi.loadFont(getFile('assets/fonts/PingFangSCRegular.json'))
        return
      }
      // @ts-ignore
      this.font = window?.particleFont
    }
  }

  // @ts-ignore
  static async create(base: Base, text: string) {
    await this.loadFont()
    let t3d: kokomi.Text3D | null = new kokomi.Text3D(
      base,
      text,
      this.font!,
      {
        size: 1.2,
        height: 0.2,
        curveSegments: 2, // 曲线分段数 不能太大, 否则会导致采样点数过多，内存溢出
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        // @ts-ignore
        bevelSegments: 5,
      },
    )
    // 让文字位于屏幕中央
    t3d.mesh.geometry.center()
    // 处理点数,一个字占2000点
    // 1. 计算字数
    const count = text.length
    // 2. 计算点数, 如果是中文字符则为5300, 其他为2700
    const [chinese, english] = getStrLength(text)
    const points = chinese * 5300 + english * 2700
    // 3. 采样
    const sampledPos = kokomi.sampleParticlesPositionFromMesh(
      t3d.mesh.geometry,
      points, //采样点数
    )
    // 4. 销毁t3d
    t3d = null
    // 5. 复制到自定义的 BufferGeometry 中
    Text3D.instance = new Text3D().setAttribute('position', new BufferAttribute(sampledPos, 3))
  }
}

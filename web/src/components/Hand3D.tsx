import { Canvas as ThreeCanvas } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { useMemo } from 'react';

/**
 * 真·3D 手部模型（程序化几何，不依赖外部 GLB）
 * - 手掌：扁圆球
 * - 手腕：圆柱
 * - 5 根手指：每根 3 节（近节/中节/远节），用胶囊体拼接
 * - 拇指偏前+斜向，其他四指向上
 * 整体材质走肤色 standardMaterial，有真实光照与阴影。
 */

const SKIN = '#f1c8a8';
const SKIN_DEEP = '#d8a684';

interface FingerSegment {
  /** 长度（沿手指轴向） */
  length: number;
  /** 半径（垂直于手指轴向） */
  radius: number;
  /** 此段相对父节末端的旋转（rad） */
  rotX?: number;
}

function FingerSegmentMesh({
  length, radius, rotX = 0, children,
}: FingerSegment & { children?: React.ReactNode }) {
  return (
    <group rotation={[rotX, 0, 0]}>
      {/* 把胶囊放在 group 的 +Y 方向延伸：底部放在 group 原点 */}
      <mesh position={[0, length / 2, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[radius, length - radius * 2, 8, 16]} />
        <meshStandardMaterial color={SKIN} roughness={0.55} />
      </mesh>
      {/* 子节挂在胶囊顶部 */}
      <group position={[0, length, 0]}>{children}</group>
    </group>
  );
}

interface FingerProps {
  /** 三节长度+半径 */
  proximal: FingerSegment;
  middle:   FingerSegment;
  distal:   FingerSegment;
  /** 每节相对前一节的弯曲（rad），让手指自然微弯 */
  bend?: [number, number, number];
}

function Finger({ proximal, middle, distal, bend = [0, 0.06, 0.08] }: FingerProps) {
  return (
    <FingerSegmentMesh {...proximal} rotX={bend[0]}>
      <FingerSegmentMesh {...middle} rotX={bend[1]}>
        <FingerSegmentMesh {...distal} rotX={bend[2]} />
      </FingerSegmentMesh>
    </FingerSegmentMesh>
  );
}

function Hand() {
  // 手掌（用稍微压扁的球做基础形状）
  // 注意：在 three.js 中向上是 +Y，向相机是 +Z

  // 四指：底端略向掌内收（rotation z 轻微张开），整体朝上 (Y+)
  const fingers = useMemo(
    () => [
      // 食指
      { x: -0.55, scale: 1.05, bend: [-0.05, 0.08, 0.1] as [number, number, number] },
      // 中指
      { x: -0.18, scale: 1.15, bend: [-0.02, 0.05, 0.08] as [number, number, number] },
      // 无名指
      { x:  0.18, scale: 1.05, bend: [-0.02, 0.07, 0.1] as [number, number, number] },
      // 小指
      { x:  0.55, scale: 0.85, bend: [0,    0.1,  0.12] as [number, number, number] },
    ],
    [],
  );

  return (
    <group>
      {/* 手腕（圆柱，半径 ~0.7，斜向下进入画面） */}
      <mesh position={[0, -1.6, 0]} rotation={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.62, 0.7, 1.2, 32]} />
        <meshStandardMaterial color={SKIN_DEEP} roughness={0.6} />
      </mesh>

      {/* 手掌（压扁的球） */}
      <mesh position={[0, -0.5, 0]} scale={[1.2, 1.0, 0.7]} castShadow receiveShadow>
        <sphereGeometry args={[0.95, 32, 24]} />
        <meshStandardMaterial color={SKIN} roughness={0.55} />
      </mesh>

      {/* 拇指：从掌的左前方斜向伸出 */}
      <group position={[-1.0, -0.4, 0.25]} rotation={[-0.2, 0, -0.55]}>
        <Finger
          proximal={{ length: 0.55, radius: 0.18 }}
          middle  ={{ length: 0.42, radius: 0.16 }}
          distal  ={{ length: 0.32, radius: 0.14 }}
          bend={[0, 0.18, 0.22]}
        />
      </group>

      {/* 四指：在掌顶 (y≈+0.3 处) 排成一行 */}
      {fingers.map((f, i) => (
        <group key={i} position={[f.x, 0.3, 0.05]} scale={[1, f.scale, 1]}>
          <Finger
            proximal={{ length: 0.62, radius: 0.16 }}
            middle  ={{ length: 0.45, radius: 0.14 }}
            distal  ={{ length: 0.36, radius: 0.12 }}
            bend={f.bend}
          />
        </group>
      ))}
    </group>
  );
}

interface Props {
  /** 整体外尺寸（px） */
  size: number;
  /** 是否渲染（用于淡入淡出） */
  visible: boolean;
}

/**
 * 把 3D 手嵌入 2D 画布的指定位置：
 * 手腕在 three 坐标系 y=-1.6 附近，让相机看过去手腕中心 ≈ 屏幕中心。
 */
export default function Hand3D({ size, visible }: Props) {
  return (
    <div
      className="absolute pointer-events-none transition-opacity duration-500"
      style={{
        width: size * 1.1,
        height: size * 1.4,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -42%)',
        opacity: visible ? 1 : 0,
        zIndex: 0,
      }}
    >
      <ThreeCanvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0, 6], fov: 32 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        {/* 三点布光：暖主光 + 冷补光 + 顶光 —— 不依赖 HDR */}
        <ambientLight intensity={0.45} />
        <directionalLight
          position={[3, 5, 4]}
          intensity={1.4}
          color="#fff3e0"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-4, 2, -1]} intensity={0.45} color="#cab8ff" />
        <directionalLight position={[0, -3, 2]} intensity={0.18} color="#ffb38a" />

        <Hand />

        {/* 接触阴影：投在 y=-2.6 一个虚拟地面（其实手腕下方），增强真实感 */}
        <ContactShadows
          position={[0, -2.6, 0]}
          opacity={0.4}
          scale={6}
          blur={2.6}
          far={3}
          color={new THREE.Color('#5a3a18').getHexString()}
        />
      </ThreeCanvas>
    </div>
  );
}

import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import "./App.css";

/* =========================================================
   PARTICLE INFINITY
   ========================================================= */

function InfinityParticles() {
  const pointsRef = useRef();

  const COUNT = 7000;

  const { geometry } = useMemo(() => {
    const geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);

    const basePositions = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      /*
       * Infinity / Lemniscate equation
       *
       * x = sin(t)
       * y = sin(t)cos(t)
       */

      const t = Math.random() * Math.PI * 2;

      /*
       * Main infinity size
       */
      const x = 3.25 * Math.sin(t);

      const y =
        1.65 *
        Math.sin(t) *
        Math.cos(t);

      /*
       * Tiny random thickness.
       * This makes it look like thousands
       * of individual stars rather than a line.
       */
      const thickness =
        0.018 +
        Math.random() * 0.075;

      const angle =
        Math.random() * Math.PI * 2;

      const px =
        x +
        Math.cos(angle) * thickness;

      const py =
        y +
        Math.sin(angle) * thickness;

      const pz =
        (Math.random() - 0.5) *
        0.55;

      /*
       * Current position
       */
      positions[i * 3] = px;
      positions[i * 3 + 1] = py;
      positions[i * 3 + 2] = pz;

      /*
       * Original infinity position.
       * Particles will return here after
       * cursor moves away.
       */
      basePositions[i * 3] = px;
      basePositions[i * 3 + 1] = py;
      basePositions[i * 3 + 2] = pz;

      /*
       * Random space colors
       */

      const randomColor =
        Math.random();

      if (randomColor < 0.38) {
        /*
         * Cyan
         */
        colors[i * 3] = 0.05;
        colors[i * 3 + 1] = 0.75;
        colors[i * 3 + 2] = 1.0;
      } else if (randomColor < 0.70) {
        /*
         * Purple
         */
        colors[i * 3] = 0.55;
        colors[i * 3 + 1] = 0.18;
        colors[i * 3 + 2] = 1.0;
      } else if (randomColor < 0.90) {
        /*
         * Blue-white
         */
        colors[i * 3] = 0.55;
        colors[i * 3 + 1] = 0.90;
        colors[i * 3 + 2] = 1.0;
      } else {
        /*
         * Bright white stars
         */
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 1.0;
        colors[i * 3 + 2] = 1.0;
      }
    }

    /*
     * Store positions
     */
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        positions,
        3
      )
    );

    /*
     * Store colors
     */
    geometry.setAttribute(
      "color",
      new THREE.BufferAttribute(
        colors,
        3
      )
    );

    /*
     * Store original positions separately
     */
    geometry.userData.basePositions =
      basePositions;

    return {
      geometry
    };
  }, []);

  /* =======================================================
     CURSOR INTERACTION
     ======================================================= */

  useFrame((state) => {
    if (!pointsRef.current) {
      return;
    }

    const geometry =
      pointsRef.current.geometry;

    const positionAttribute =
      geometry.attributes.position;

    const positions =
      positionAttribute.array;

    const basePositions =
      geometry.userData.basePositions;

    /*
     * Mouse position in 3D-like screen space
     */
    const mouseX =
      state.pointer.x * 4.8;

    const mouseY =
      state.pointer.y * 2.9;

    /*
     * Cursor influence radius
     */
    const radius = 0.75;

    for (let i = 0; i < COUNT; i++) {
      const index = i * 3;

      /*
       * Original particle position
       */
      const baseX =
        basePositions[index];

      const baseY =
        basePositions[index + 1];

      const baseZ =
        basePositions[index + 2];

      /*
       * Distance from cursor
       */
      const dx =
        baseX - mouseX;

      const dy =
        baseY - mouseY;

      const distance =
        Math.sqrt(
          dx * dx +
          dy * dy
        );

      let targetX = baseX;
      let targetY = baseY;
      let targetZ = baseZ;

      /*
       * Cursor is touching particle area
       */
      if (distance < radius) {
        /*
         * 0 → far edge
         * 1 → cursor center
         */
        const force =
          1 -
          distance / radius;

        /*
         * Smooth stronger push
         */
        const smoothForce =
          force * force;

        /*
         * Direction away from cursor
         */
        let directionX = dx;
        let directionY = dy;

        const length =
          Math.sqrt(
            directionX * directionX +
            directionY * directionY
          );

        if (length > 0.001) {
          directionX /= length;
          directionY /= length;
        } else {
          directionX = 1;
          directionY = 0;
        }

        /*
         * How far particles divide
         */
        const push =
          smoothForce * 1.7;

        targetX =
          baseX +
          directionX * push;

        targetY =
          baseY +
          directionY * push;

        /*
         * Bring particles slightly
         * toward the camera.
         */
        targetZ =
          baseZ +
          smoothForce * 0.8;
      }

      /*
       * VERY SMOOTH movement
       *
       * This makes the particles
       * flow instead of jumping.
       */
      positions[index] +=
        (targetX -
          positions[index]) *
        0.085;

      positions[index + 1] +=
        (targetY -
          positions[index + 1]) *
        0.085;

      positions[index + 2] +=
        (targetZ -
          positions[index + 2]) *
        0.085;
    }

    positionAttribute.needsUpdate =
      true;
  });

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
    >
      <pointsMaterial
        size={0.035}
        vertexColors={true}
        transparent={true}
        opacity={0.95}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </points>
  );
}


/* =========================================================
   EXTRA FLOATING SPACE STARS
   ========================================================= */

function SpaceStars() {
  return (
    <>
      <Stars
        radius={80}
        depth={50}
        count={7000}
        factor={2.2}
        saturation={0.2}
        fade={true}
        speed={0.15}
      />

      <Stars
        radius={35}
        depth={25}
        count={1800}
        factor={1.5}
        saturation={0.4}
        fade={true}
        speed={0.25}
      />
    </>
  );
}


/* =========================================================
   SMALL RANDOM STAR PARTICLES
   ========================================================= */

function BackgroundParticles() {
  const pointsRef = useRef();

  const geometry = useMemo(() => {
    const geo =
      new THREE.BufferGeometry();

    const COUNT = 1200;

    const positions =
      new Float32Array(
        COUNT * 3
      );

    const colors =
      new Float32Array(
        COUNT * 3
      );

    for (let i = 0; i < COUNT; i++) {
      const index = i * 3;

      /*
       * Keep background stars
       * away from center a little.
       */
      positions[index] =
        (Math.random() - 0.5) *
        22;

      positions[index + 1] =
        (Math.random() - 0.5) *
        14;

      positions[index + 2] =
        (Math.random() - 0.5) *
        10;

      const c =
        Math.random();

      if (c < 0.5) {
        /*
         * Blue
         */
        colors[index] = 0.15;
        colors[index + 1] = 0.65;
        colors[index + 2] = 1;
      } else if (c < 0.8) {
        /*
         * Purple
         */
        colors[index] = 0.55;
        colors[index + 1] = 0.25;
        colors[index + 2] = 1;
      } else {
        /*
         * White
         */
        colors[index] = 0.8;
        colors[index + 1] = 0.95;
        colors[index + 2] = 1;
      }
    }

    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(
        positions,
        3
      )
    );

    geo.setAttribute(
      "color",
      new THREE.BufferAttribute(
        colors,
        3
      )
    );

    return geo;
  }, []);

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
    >
      <pointsMaterial
        size={0.025}
        vertexColors={true}
        transparent={true}
        opacity={0.65}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </points>
  );
}


/* =========================================================
   CAMERA MOVEMENT
   ========================================================= */

function CursorCamera() {
  useFrame((state) => {
    /*
     * Small camera movement based on cursor.
     *
     * This does NOT rotate the infinity.
     */
    const targetX =
      state.pointer.x * 0.35;

    const targetY =
      state.pointer.y * 0.20;

    state.camera.position.x +=
      (targetX -
        state.camera.position.x) *
      0.025;

    state.camera.position.y +=
      (targetY -
        state.camera.position.y) *
      0.025;

    state.camera.lookAt(
      0,
      0,
      0
    );
  });

  return null;
}


/* =========================================================
   MAIN 3D SCENE
   ========================================================= */

function Scene() {
  return (
    <>
      <CursorCamera />

      <SpaceStars />

      <BackgroundParticles />

      {/* ===============================================
          ONLY ONE INFINITY
          =============================================== */}

      <InfinityParticles />
    </>
  );
}


/* =========================================================
   MAIN APP
   ========================================================= */

export default function App() {
  return (
    <div className="app">

      <Canvas
        dpr={[1, 2]}
        camera={{
          position: [0, 0, 8],
          fov: 45,
          near: 0.1,
          far: 100
        }}
      >

        {/* Dark space background */}

        <color
          attach="background"
          args={["#01030d"]}
        />

        {/* Very subtle depth fog */}

        <fog
          attach="fog"
          args={[
            "#01030d",
            8,
            35
          ]}
        />

        <Scene />

      </Canvas>


      {/* =================================================
          SCREEN UI
          ================================================= */}

      <div className="interface">

        {/* ---------- TOP LEFT ---------- */}

        <div className="top-left">

          <span className="line"></span>

          INFINITY INTELLIGENCE

        </div>


        {/* ---------- TOP RIGHT ---------- */}

        <div className="top-right">

          ✦

          &nbsp;&nbsp;

          MOVE CURSOR TO EXPLORE

          <span className="line"></span>

        </div>


        {/* ---------- CENTER NAME ---------- */}

        <div className="identity">

          <div className="name">
            P A V A N I
          </div>

          <div className="core">

            <span className="line"></span>

            — INFINITY CORE —

            <span className="line"></span>

          </div>

        </div>


        {/* ---------- BOTTOM LEFT ---------- */}

        <div className="bottom-left">

          <span className="line"></span>

          SPACE

          &nbsp; // &nbsp;

          TIME

          &nbsp; // &nbsp;

          BEYOND

        </div>


        {/* ---------- BOTTOM RIGHT ---------- */}

        <div className="bottom-right">

          <i></i>

          ONLINE

          <span className="line"></span>

        </div>

      </div>

    </div>
  );
}
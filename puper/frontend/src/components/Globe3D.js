import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { motion } from 'framer-motion';

// Import textures
import globeBaseColor from '../assets/images/globe3d/globe/globe_mat_BaseColor.png';
import globeNormal from '../assets/images/globe3d/globe/globe_mat_Normal.png';
import globeRoughness from '../assets/images/globe3d/globe/globe_mat_Roughness.png';

const Globe3D = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const globeRef = useRef(null);
  const animationRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      50,
      1, // aspect ratio 1:1 for perfect circle
      0.1,
      1000
    );
    camera.position.set(0, 0, 3);

    // Renderer setup - perfect square for circular container
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(120, 120); // Perfect square
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    // Slightly brighter lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.2);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.7);
    pointLight.position.set(-5, 0, 5);
    scene.add(pointLight);

    // Additional front light for brightness
    const frontLight = new THREE.DirectionalLight(0xffffff, 1.7);
    frontLight.position.set(0, 0, 10);
    scene.add(frontLight);

    // Load textures
    const textureLoader = new THREE.TextureLoader();

    Promise.all([
      new Promise((resolve, reject) => {
        textureLoader.load(
          globeBaseColor,
          resolve,
          undefined,
          reject
        );
      }),
      new Promise((resolve, reject) => {
        textureLoader.load(
          globeNormal,
          resolve,
          undefined,
          reject
        );
      }),
      new Promise((resolve, reject) => {
        textureLoader.load(
          globeRoughness,
          resolve,
          undefined,
          reject
        );
      })
    ]).then(([baseColorTexture, normalTexture, roughnessTexture]) => {
      // Configure textures
      [baseColorTexture, normalTexture, roughnessTexture].forEach(texture => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.colorSpace = THREE.SRGBColorSpace;
      });

      // Create globe geometry and material
      const geometry = new THREE.SphereGeometry(1, 64, 64);

      const material = new THREE.MeshStandardMaterial({
        map: baseColorTexture,
        normalMap: normalTexture,
        roughnessMap: roughnessTexture,
        roughness: 0.8,
        metalness: 0.1,
        normalScale: new THREE.Vector2(0.5, 0.5),
      });

      // Create globe mesh
      const globe = new THREE.Mesh(geometry, material);
      globe.castShadow = true;
      globe.receiveShadow = true;
      globeRef.current = globe;
      scene.add(globe);

      setIsLoaded(true);
    }).catch((error) => {
      console.error('Error loading globe textures:', error);
      // Fallback to basic material
      const geometry = new THREE.SphereGeometry(1, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color: 0x4a90e2,
        roughness: 0.8,
        metalness: 0.1,
      });

      const globe = new THREE.Mesh(geometry, material);
      globe.castShadow = true;
      globe.receiveShadow = true;
      globeRef.current = globe;
      scene.add(globe);

      setIsLoaded(true);
    });

    // Add renderer to DOM
    mountRef.current.appendChild(renderer.domElement);

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      
      if (globeRef.current) {
        // Rotate globe
        globeRef.current.rotation.y += 0.005;
        
        // Add subtle hover effect
        if (isHovered) {
          globeRef.current.rotation.y += 0.002;
        }
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup function
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isHovered]);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return (
    <Link to="/map" style={{ textDecoration: 'none' }}>
      <motion.div
        className="globe-3d-container"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.8 }}
        transition={{ duration: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div 
          ref={mountRef} 
          className="globe-3d-mount"
          style={{
            width: '120px',
            height: '120px',
            cursor: 'pointer',
            borderRadius: '50%',
            overflow: 'hidden',
            boxShadow: isHovered 
              ? '0 0 30px rgba(74, 144, 226, 0.6)' 
              : '0 0 20px rgba(74, 144, 226, 0.3)',
            transition: 'box-shadow 0.3s ease'
          }}
        />
        {!isLoaded && (
          <div className="globe-loading">
            <div className="loading-spinner"></div>
          </div>
        )}
      </motion.div>
    </Link>
  );
};

export default Globe3D;

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export default function SphereCanvas({ projects, onProjectClick, selectedProject, filterCategory }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const sphereRef = useRef(null);
  const projectNodesRef = useRef([]);
  const animationFrameRef = useRef(null);
  const isDraggingRef = useRef(false);
  const previousMouseRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const starsRef = useRef([]);
  const targetCameraZRef = useRef(20);
  const currentCameraZRef = useRef(20);

  // Function to draw attractive custom icons for each category
  const drawCategoryIcon = (context, category, centerX, centerY, size) => {
    context.save();
    context.translate(centerX, centerY);
    
    // Set style for all icons
    context.strokeStyle = '#FFFFFF';
    context.fillStyle = '#FFFFFF';
    context.lineWidth = size / 20;
    context.lineCap = 'round';
    context.lineJoin = 'round';

    switch(category) {
      case 'AI/ML':
        // Neural network icon
        const nodeRadius = size / 15;
        const positions = [
          [-size/3, -size/3], [0, -size/3], [size/3, -size/3],
          [-size/2.5, 0], [size/2.5, 0],
          [-size/3, size/3], [0, size/3], [size/3, size/3]
        ];
        
        // Draw connections
        context.globalAlpha = 0.6;
        positions.forEach((pos1, i) => {
          positions.forEach((pos2, j) => {
            // Random connections to simulate neural network
            if (i < j && Math.random() > 0.3) { 
              context.beginPath();
              context.moveTo(pos1[0], pos1[1]);
              context.lineTo(pos2[0], pos2[1]);
              context.stroke();
            }
          });
        });
        
        // Draw nodes
        context.globalAlpha = 1;
        positions.forEach(pos => {
          context.beginPath();
          context.arc(pos[0], pos[1], nodeRadius, 0, Math.PI * 2);
          context.fill();
          context.beginPath();
          context.arc(pos[0], pos[1], nodeRadius * 1.5, 0, Math.PI * 2);
          context.stroke();
        });
        break;

      case 'Web Development':
        // Browser window with code brackets
        const w = size * 0.8;
        const h = size * 0.7;
        
        // Window outline
        context.beginPath();
        context.rect(-w/2, -h/2, w, h);
        context.stroke();
        
        // Top bar
        context.fillRect(-w/2, -h/2, w, h/6);
        
        // Dots
        context.fillStyle = '#000000';
        [-w/3, -w/6, w/100].forEach((x) => { // Adjusted 0 to w/100 to avoid overlap with line
          context.beginPath();
          context.arc(x, -h/3, size/25, 0, Math.PI * 2);
          context.fill();
        });
        
        // Code brackets
        context.fillStyle = '#FFFFFF';
        context.font = `bold ${size/2}px monospace`; // Adjusted font size
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('< >', 0, h/8);
        break;

      case 'Mobile App':
        // Smartphone icon
        const phoneW = size * 0.5;
        const phoneH = size * 0.9;
        const radius = size / 10;
        
        // Phone outline
        context.beginPath();
        context.roundRect(-phoneW/2, -phoneH/2, phoneW, phoneH, radius);
        context.stroke();
        
        // Screen
        context.beginPath();
        context.rect(-phoneW/2.5, -phoneH/3, phoneW/1.25, phoneH/1.8);
        context.stroke();
        
        // Home button
        context.beginPath();
        context.arc(0, phoneH/3, size/15, 0, Math.PI * 2);
        context.stroke();
        
        // Signal bars
        const barWidth = size / 20;
        for (let i = 0; i < 4; i++) {
          context.fillRect(
            -phoneW/3 + i * (barWidth * 1.5),
            -phoneH/2.5,
            barWidth,
            (i + 1) * size / 20
          );
        }
        break;

      case 'Data Science':
        // Chart/Graph icon
        const chartSize = size * 0.8;
        
        // Axes
        context.beginPath();
        context.moveTo(-chartSize/2, chartSize/2);
        context.lineTo(-chartSize/2, -chartSize/2);
        context.lineTo(chartSize/2, chartSize/2);
        context.stroke();
        
        // Bar chart
        const bars = [0.4, 0.7, 0.5, 0.9]; // Fewer bars for clarity
        const barGap = chartSize / (bars.length + 1) / 2;
        const barW = chartSize / (bars.length * 1.5);
        
        context.fillStyle = '#FFFFFF';
        bars.forEach((height, i) => {
          const x = -chartSize/2 + barGap + (i * (barW + barGap));
          const barHeight = height * chartSize * 0.7;
          context.fillRect(
            x,
            chartSize/2 - barHeight,
            barW,
            barHeight
          );
        });
        
        // Trend line
        context.strokeStyle = '#FFD700'; // Accent color for the line
        context.lineWidth = size / 25;
        context.beginPath();
        bars.forEach((height, i) => {
          const x = -chartSize/2 + barGap + (i * (barW + barGap)) + barW/2;
          const y = chartSize/2 - height * chartSize * 0.7;
          if (i === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        });
        context.stroke();
        context.strokeStyle = '#FFFFFF';
        break;

      case 'Cloud/DevOps':
        // Cloud with gears icon
        // Cloud shape
        context.beginPath();
        context.arc(-size/4, size/10, size/4, Math.PI, 0); // Left bump
        context.arc(size/4, size/10, size/4, Math.PI, 0); // Right bump
        context.arc(0, -size/6 + size/10, size/3, 0, Math.PI); // Top bump
        context.closePath();
        context.fill();
        
        // Gear in cloud
        const gearRadius = size / 6;
        const teeth = 8;
        context.fillStyle = '#000000'; // Dark color for the gear
        context.beginPath();
        for (let i = 0; i < teeth * 2; i++) {
          const angle = (i * Math.PI) / teeth;
          const r = i % 2 === 0 ? gearRadius * 1.2 : gearRadius;
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;
          if (i === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.closePath();
        context.fill();
        
        // Center hole
        context.fillStyle = '#FFFFFF';
        context.beginPath();
        context.arc(0, 0, gearRadius / 3, 0, Math.PI * 2);
        context.fill();
        break;

      case 'Blockchain':
        // Chain links icon
        const linkSize = size / 3;
        
        context.strokeStyle = '#FFFFFF';
        context.lineWidth = size / 20;

        // First block
        context.beginPath();
        context.rect(-linkSize * 1.2, -linkSize/2, linkSize, linkSize);
        context.stroke();
        context.fillText('0', -linkSize * 1.2 + linkSize/2, 0);

        // Second block
        context.beginPath();
        context.rect(linkSize * 0.2, -linkSize/2, linkSize, linkSize);
        context.stroke();
        context.fillText('1', linkSize * 0.2 + linkSize/2, 0);

        // Arrow connecting them
        context.strokeStyle = '#FFD700'; // Gold accent for connection
        context.lineWidth = size / 30;
        context.beginPath();
        context.moveTo(-linkSize/2, 0);
        context.lineTo(linkSize/4, 0);
        context.lineTo(linkSize/4 - linkSize/10, -linkSize/10);
        context.moveTo(linkSize/4, 0);
        context.lineTo(linkSize/4 - linkSize/10, linkSize/10);
        context.stroke();
        
        context.fillStyle = '#FFFFFF';
        context.font = `bold ${size/4}px Arial`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        break;

      case 'IoT':
        // Connected devices icon
        const deviceSize = size / 6;
        const devices = [
          [0, -size/2.5],
          [-size/2.5, size/4],
          [size/2.5, size/4]
        ];
        
        // Center hub
        context.beginPath();
        context.arc(0, 0, deviceSize, 0, Math.PI * 2);
        context.fill();
        
        // Connections
        context.globalAlpha = 0.6;
        devices.forEach(pos => {
          context.beginPath();
          context.moveTo(0, 0);
          context.lineTo(pos[0], pos[1]);
          context.stroke();
        });
        context.globalAlpha = 1;
        
        // Devices
        devices.forEach(pos => {
          context.beginPath();
          context.rect(
            pos[0] - deviceSize/2,
            pos[1] - deviceSize/2,
            deviceSize,
            deviceSize
          );
          context.stroke();
          
          // Signal waves
          for (let i = 1; i <= 2; i++) { // Reduced waves for clarity
            context.globalAlpha = 1 - (i * 0.3);
            context.beginPath();
            context.arc(pos[0], pos[1], deviceSize * (1 + i * 0.6), Math.PI * 0.25, Math.PI * 0.75); // Arc outward
            context.stroke();
          }
          context.globalAlpha = 1;
        });
        break;

      case 'Other':
        // Light bulb icon
        const bulbRadius = size / 3;
        
        // Bulb shape
        context.beginPath();
        context.moveTo(0, -bulbRadius - size/10);
        context.arc(0, -size/10, bulbRadius, 0, Math.PI * 2);
        context.lineTo(0, size/5);
        context.stroke();
        
        // Filament
        context.strokeStyle = '#FFD700'; // Yellow accent for filament
        context.lineWidth = size / 20;
        context.beginPath();
        context.moveTo(-bulbRadius/3, -size/10);
        context.lineTo(bulbRadius/3, -size/10);
        context.moveTo(0, -size/10 - bulbRadius/2);
        context.lineTo(0, -size/10 + bulbRadius/2);
        context.stroke();
        
        // Base
        context.strokeStyle = '#FFFFFF';
        context.fillStyle = '#FFFFFF';
        context.fillRect(-bulbRadius/3, size/5, bulbRadius * 0.66, size/6);
        
        // Light rays
        context.lineWidth = size / 25;
        for (let i = 0; i < 4; i++) { // Fewer rays for clarity
          const angle = (i * Math.PI * 2) / 4 + Math.PI/4; // Start from top-right
          const startR = bulbRadius * 1.2;
          const endR = bulbRadius * 1.6;
          context.beginPath();
          context.moveTo(
            Math.cos(angle) * startR,
            Math.sin(angle) * startR - size/10
          );
          context.lineTo(
            Math.cos(angle) * endR,
            Math.sin(angle) * endR - size/10
          );
          context.stroke();
        }
        break;

      default:
        // Default star icon
        context.beginPath();
        for (let i = 0; i < 10; i++) {
          const angle = (i * Math.PI) / 5;
          const radius = i % 2 === 0 ? size/2 : size/4;
          const x = Math.cos(angle - Math.PI/2) * radius;
          const y = Math.sin(angle - Math.PI/2) * radius;
          if (i === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.closePath();
        context.fill();
    }
    
    context.restore();
  };

  const createVibrantPlanetTexture = (project) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 1024;
    canvas.height = 1024;

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';

    // VIBRANT, ATTRACTIVE STATUS COLORS
    let mainColor, accentColor, lightColor, glowColor;
    if (project.status === 'completed') {
      mainColor = '#00F5A0';  // Vibrant turquoise
      accentColor = '#00D9F5'; // Electric cyan
      lightColor = '#7FFFD4';  // Aquamarine
      glowColor = '#39FF14';   // Neon green
    } else if (project.status === 'in_progress') {
      mainColor = '#FF00FF';   // Vibrant magenta
      accentColor = '#FF1493'; // Deep pink
      lightColor = '#FF69B4';  // Hot pink
      glowColor = '#DA70D6';   // Orchid
    } else {
      mainColor = '#FFD700';   // Gold
      accentColor = '#FFA500'; // Orange
      lightColor = '#FFFF00';  // Yellow
      glowColor = '#FF8C00';   // Dark orange
    }

    if (project.color) {
      mainColor = project.color;
      accentColor = project.color;
    }

    // VIVID gradient background
    const gradient = context.createRadialGradient(350, 350, 0, 512, 512, 512);
    gradient.addColorStop(0, glowColor);
    gradient.addColorStop(0.3, lightColor);
    gradient.addColorStop(0.6, mainColor);
    gradient.addColorStop(1, accentColor);
    
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(512, 512, 512, 0, Math.PI * 2);
    context.fill();

    // Add energetic planetary patterns
    context.globalAlpha = 0.2;
    for (let i = 0; i < 12; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const radius = Math.random() * 80 + 40;
      
      const spotGradient = context.createRadialGradient(x, y, 0, x, y, radius);
      spotGradient.addColorStop(0, lightColor);
      spotGradient.addColorStop(1, 'transparent');
      
      context.fillStyle = spotGradient;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;

    // BRIGHT glowing border
    context.strokeStyle = glowColor;
    context.lineWidth = 12;
    context.shadowColor = glowColor;
    context.shadowBlur = 20;
    context.beginPath();
    context.arc(512, 512, 500, 0, Math.PI * 2);
    context.stroke();
    context.shadowBlur = 0;

    // White accent ring
    context.strokeStyle = '#FFFFFF';
    context.lineWidth = 8;
    context.beginPath();
    context.arc(512, 512, 485, 0, Math.PI * 2);
    context.stroke();

    // CUSTOM ICON - Center (large and clear)
    context.shadowColor = glowColor;
    context.shadowBlur = 40;
    drawCategoryIcon(context, project.category, 512, 480, 280);
    context.shadowBlur = 0;

    // PROJECT NAME - Bottom (vibrant)
    let projectName = project.title.toUpperCase();
    if (projectName.length > 15) {
      projectName = projectName.substring(0, 13) + '..';
    }
    
    context.font = 'bold 50px "Arial Black", Arial, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Glowing text effect
    context.strokeStyle = accentColor;
    context.lineWidth = 8;
    context.shadowColor = glowColor;
    context.shadowBlur = 20;
    context.strokeText(projectName, 512, 880);
    
    context.fillStyle = '#FFFFFF';
    context.shadowBlur = 15;
    context.fillText(projectName, 512, 880);
    context.shadowBlur = 0;

    // Status indicator with glow
    const statusIcons = {
      'completed': '✓',
      'in_progress': '◉',
      'planning': '○'
    };
    
    context.shadowColor = glowColor;
    context.shadowBlur = 15;
    context.fillStyle = mainColor;
    context.beginPath();
    context.arc(512, 960, 30, 0, Math.PI * 2);
    context.fill();
    context.shadowBlur = 0;
    
    context.font = 'bold 40px Arial';
    context.fillStyle = '#FFFFFF';
    context.fillText(statusIcons[project.status] || '✓', 512, 960);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    texture.anisotropy = 16;
    return texture;
  };

  const createHoverLabel = (project) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 900;
    canvas.height = 150;

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';

    // Polyfill for roundRect if not natively available in all environments
    if (!context.roundRect) {
      CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius) {
        if (typeof radius === 'number') {
            radius = {tl: radius, tr: radius, br: radius, bl: radius};
        } else {
            let defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
            for (let side in defaultRadius) {
                radius[side] = radius[side] || defaultRadius[side];
            }
        }
        this.beginPath();
        this.moveTo(x + radius.tl, y);
        this.lineTo(x + width - radius.tr, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
        this.lineTo(x + width, y + height - radius.br);
        this.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
        this.lineTo(x + radius.bl, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
        this.lineTo(x, y + radius.tl);
        this.quadraticCurveTo(x, y, x + radius.tl, y);
        this.closePath();
        return this;
      };
    }

    // Status color
    let bgColor;
    if (project.status === 'completed') {
      bgColor = '#00F5A0';
    } else if (project.status === 'in_progress') {
      bgColor = '#FF00FF';
    } else {
      bgColor = '#FFD700';
    }

    // Background
    const gradient = context.createLinearGradient(0, 0, 0, 150);
    gradient.addColorStop(0, bgColor);
    gradient.addColorStop(1, 'rgba(15, 23, 42, 0.95)');
    
    context.fillStyle = gradient;
    context.roundRect(0, 0, 900, 150, 20);
    context.fill();

    // Border
    context.strokeStyle = '#FFFFFF';
    context.lineWidth = 5;
    context.roundRect(0, 0, 900, 150, 20);
    context.stroke();

    // Title
    context.font = 'bold 60px Arial';
    context.fillStyle = '#FFFFFF';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.shadowColor = 'rgba(0, 0, 0, 0.8)';
    context.shadowBlur = 15;
    
    let title = project.title;
    if (title.length > 20) {
      title = title.substring(0, 18) + '..';
    }
    
    context.fillText(title, 450, 75);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    texture.anisotropy = 16;
    return texture;
  };

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    });
    
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    // Adjusted camera position for realistic view
    camera.position.z = 20;

    // Enhanced lighting for vibrant colors
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight1.position.set(10, 10, 10);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight2.position.set(-10, -5, -5);
    scene.add(directionalLight2);

    const pointLight = new THREE.PointLight(0xffffff, 1.2, 100);
    pointLight.position.set(0, 0, 15);
    scene.add(pointLight);

    // Orbit rings
    const sphereGeometry = new THREE.SphereGeometry(9, 64, 64);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x00F5A0, // Vibrant turquoise for the orbit
      transparent: true,
      opacity: 0.15,
      wireframe: true,
      wireframeLinewidth: 2
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);
    sphereRef.current = sphere;

    // Distribute projects - larger orbit, smaller planets
    const phi = Math.PI * (3 - Math.sqrt(5));
    const radius = 10; // Increased orbit radius

    projects.forEach((project, i) => {
      const y = 1 - (i / Math.max(projects.length - 1, 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;
      const x = Math.cos(theta) * radiusAtY * radius;
      const z = Math.sin(theta) * radiusAtY * radius;

      // Create smaller, vibrant planet
      const nodeTexture = createVibrantPlanetTexture(project);
      const nodeGeometry = new THREE.SphereGeometry(0.8, 64, 64); // Reduced from 1.3 to 0.8
      const nodeMaterial = new THREE.MeshStandardMaterial({
        map: nodeTexture,
        metalness: 0.3, // Slightly more metallic
        roughness: 0.5, // Less rough than original
        emissive: 0x111111, // Subtle emissive for glow effect
        emissiveIntensity: 0.2 // Slightly increased emissive intensity
      });

      const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
      node.position.set(x, y * radius, z);
      scene.add(node);

      // Hover label - adjusted size
      const labelTexture = createHoverLabel(project);
      const spriteMaterial = new THREE.SpriteMaterial({
        map: labelTexture,
        transparent: true,
        opacity: 0
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(4, 0.7, 1);
      sprite.position.copy(node.position);
      sprite.position.y -= 1.5;
      scene.add(sprite);

      projectNodesRef.current.push({
        mesh: node,
        sprite: sprite,
        project: project,
        basePosition: { x, y: y * radius, z }
      });
    });

    // Mouse interaction handlers
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseDown = (event) => {
      isDraggingRef.current = true;
      previousMouseRef.current = {
        x: event.clientX,
        y: event.clientY
      };
      velocityRef.current = { x: 0, y: 0 };
    };

    const onMouseMove = (event) => {
      const rect = currentMount.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDraggingRef.current) {
        const deltaX = event.clientX - previousMouseRef.current.x;
        const deltaY = event.clientY - previousMouseRef.current.y;
        
        targetRotationRef.current.y += deltaX * 0.005;
        targetRotationRef.current.x += deltaY * 0.005;
        
        targetRotationRef.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, targetRotationRef.current.x));
        
        velocityRef.current.x = deltaY * 0.001;
        velocityRef.current.y = deltaX * 0.001;
        
        previousMouseRef.current = {
          x: event.clientX,
          y: event.clientY
        };
      } else {
        // Hover detection
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(
          projectNodesRef.current.map(n => n.mesh)
        );

        projectNodesRef.current.forEach(node => {
          node.sprite.material.opacity = 0;
          if (!selectedProject || node.project.id !== selectedProject.id) {
            node.mesh.scale.set(1, 1, 1);
          }
        });

        if (intersects.length > 0) {
          const hoveredNode = projectNodesRef.current.find(
            n => n.mesh === intersects[0].object
          );
          if (hoveredNode) {
            hoveredNode.mesh.scale.set(1.3, 1.3, 1.3);
            hoveredNode.sprite.material.opacity = 1;
          }
          currentMount.style.cursor = 'pointer';
        } else {
          currentMount.style.cursor = isDraggingRef.current ? 'grabbing' : 'grab';
        }
      }
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onClick = (event) => {
      if (Math.abs(velocityRef.current.x) > 0.01 || Math.abs(velocityRef.current.y) > 0.01) {
        return;
      }

      const rect = currentMount.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(
        projectNodesRef.current.map(n => n.mesh)
      );

      if (intersects.length > 0) {
        const clickedNode = projectNodesRef.current.find(
          n => n.mesh === intersects[0].object
        );
        if (clickedNode) {
          onProjectClick(clickedNode.project);
          // Zoom in to planet
          targetCameraZRef.current = 12;
        }
      } else {
        // Zoom out when clicking empty space
        if (selectedProject) {
          onProjectClick(null);
        }
        targetCameraZRef.current = 20;
      }
    };

    currentMount.addEventListener('mousedown', onMouseDown);
    currentMount.addEventListener('mousemove', onMouseMove);
    currentMount.addEventListener('mouseup', onMouseUp);
    currentMount.addEventListener('click', onClick);
    currentMount.style.cursor = 'grab';

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      // Smooth rotation
      rotationRef.current.x += (targetRotationRef.current.x - rotationRef.current.x) * 0.1;
      rotationRef.current.y += (targetRotationRef.current.y - rotationRef.current.y) * 0.1;

      // Inertia
      if (!isDraggingRef.current) {
        if (Math.abs(velocityRef.current.x) > 0.0001 || Math.abs(velocityRef.current.y) > 0.0001) {
          targetRotationRef.current.x += velocityRef.current.x;
          targetRotationRef.current.y += velocityRef.current.y;
          
          velocityRef.current.x *= 0.95;
          velocityRef.current.y *= 0.95;
        } else {
          // Gentle auto-rotation
          targetRotationRef.current.y += 0.003;
        }
      }

      // Update orbit sphere
      if (sphere) {
        sphere.rotation.y = rotationRef.current.y;
        sphere.rotation.x = rotationRef.current.x;
      }

      // Update project nodes
      projectNodesRef.current.forEach((node) => {
        const cosY = Math.cos(rotationRef.current.y);
        const sinY = Math.sin(rotationRef.current.y);
        const cosX = Math.cos(rotationRef.current.x);
        const sinX = Math.sin(rotationRef.current.x);

        let x = node.basePosition.x;
        let y = node.basePosition.y;
        let z = node.basePosition.z;

        // Rotate around Y axis
        let tempX = x * cosY - z * sinY;
        let tempZ = x * sinY + z * cosY;
        x = tempX;
        z = tempZ;

        // Rotate around X axis
        let tempY = y * cosX - z * sinX;
        tempZ = y * sinX + z * cosX;
        y = tempY;
        z = tempZ;

        node.mesh.position.set(x, y, z);
        node.sprite.position.set(x, y - 1.5, z);

        // Always face camera
        node.mesh.lookAt(camera.position);
        node.sprite.lookAt(camera.position);

        // Selected project effect
        if (selectedProject && node.project.id === selectedProject.id) {
          const scale = 1.4 + Math.sin(Date.now() * 0.003) * 0.1;
          node.mesh.scale.set(scale, scale, scale);
          node.sprite.material.opacity = 1;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle zoom when selectedProject changes from parent
    if (selectedProject) {
      targetCameraZRef.current = 12;
    } else {
      targetCameraZRef.current = 20;
    }

    // Window resize handler
    const handleResize = () => {
      if (!currentMount) return;
      const width = currentMount.clientWidth;
      const height = currentMount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (currentMount) {
        currentMount.removeEventListener('mousedown', onMouseDown);
        currentMount.removeEventListener('mousemove', onMouseMove);
        currentMount.removeEventListener('mouseup', onMouseUp);
        currentMount.removeEventListener('click', onClick);
        if (renderer.domElement && currentMount.contains(renderer.domElement)) {
          currentMount.removeChild(renderer.domElement);
        }
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (renderer) {
        renderer.dispose();
      }
    };
  }, [projects, selectedProject, onProjectClick]);

  return (
    <div 
      ref={mountRef} 
      className="w-full h-full"
      style={{ touchAction: 'none' }}
    />
  );
}
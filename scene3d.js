/**
 * A LITTLE LIGHT, ALWAYS — Cinematic 3D Scene Engine (Three.js)
 * 
 * Continuous camera tracking across 5 seamless festival days:
 * 1. Dhanteras: Afternoon room, polished teak table, burgundy velvet gift box & champagne ribbon
 * 2. Kali Chaudas: Morning shutters swing open in 3D, volumetric sunlight beams & floating dust
 * 3. Diwali: Festive gathering, 100+ flickering diyas, brass urli with marigolds, gold foil reflections
 * 4. Bestu Varas: Stepping through teak archway into sunlit courtyard with rangoli & marigold torans
 * 5. Bhai Bij: Verandah sunset, brother & sister aarti moment, smooth cinematic pull-back
 */

class DiwaliCinematicWorld {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.scrollProgress = 0; // 0.0 to 1.0
    this.targetScrollProgress = 0;

    // Three.js Core
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();

    // Scene Elements
    this.shutters = { left: null, right: null };
    this.giftBox = null;
    this.ribbonWipeMesh = null;
    this.passingBox = null;
    this.diyas = [];
    this.dustParticles = null;
    this.goldenEmbers = null;
    this.volumetricLightCone = null;
    this.urliGroup = null;
    this.courtyardArch = null;
    this.rangoliMesh = null;
    this.toranMesh = null;
    this.aartiThali = null;
    this.verandahColumns = [];

    // Lighting rig
    this.dirSunLight = null;
    this.ambientLight = null;
    this.diwaliPointLights = [];

    // Camera Spline Path
    this.cameraCurve = null;
    this.lookAtCurve = null;

    this.init();
  }

  init() {
    // 1. Scene Setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x2A111B); // Dark wine
    this.scene.fog = new THREE.FogExp2(0x2A111B, 0.018);

    // 2. Camera Setup
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 150);
    this.setupCameraSplines();

    // 3. Renderer Setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting Rig
    this.setupLighting();

    // 5. Environment & Architectural Elements
    this.createMaterials();
    this.buildArchitecturalHall();
    this.buildDhanterasTableAndGift();
    this.buildKaliChaudasShuttersAndWindow();
    this.buildDiwaliUrliAndDiyas();
    this.buildBestuVarasCourtyard();
    this.buildBhaiBijVerandah();
    this.createAtmosphericParticles();

    // 6. Event Listeners
    window.addEventListener('resize', () => this.onWindowResize());

    // 7. Render Loop
    this.animate();
  }

  setupCameraSplines() {
    // Continuous 3D bezier camera trajectory through the house & courtyard
    const camPoints = [
      new THREE.Vector3(0, 1.4, 6.5),     // 0.00: Prologue - Cinematic high entrance
      new THREE.Vector3(0, 0.85, 3.2),    // 0.10: Dhanteras - Table push-in
      new THREE.Vector3(0, 0.55, 1.2),    // 0.20: Dhanteras ribbon contact
      new THREE.Vector3(-1.8, 1.1, 0.2),  // 0.30: Kali Chaudas - Facing shutters
      new THREE.Vector3(-0.6, 1.2, -1.8), // 0.40: Sunlight expansion through window
      new THREE.Vector3(0, 1.35, -4.5),   // 0.50: Diwali Grand Gathering centre
      new THREE.Vector3(0.5, 1.1, -6.8),  // 0.60: Gift pass across lens
      new THREE.Vector3(0, 1.5, -9.5),    // 0.70: Bestu Varas doorway approach
      new THREE.Vector3(0, 1.4, -13.0),   // 0.80: Courtyard sunlit path
      new THREE.Vector3(0.8, 1.3, -16.5), // 0.90: Bhai Bij aarti close moment
      new THREE.Vector3(0, 2.0, -12.5)    // 1.00: Bhai Bij wide cinematic pull-back
    ];
    this.cameraCurve = new THREE.CatmullRomCurve3(camPoints, false, 'catmullrom', 0.25);

    // Look-At Target Trajectory
    const targetPoints = [
      new THREE.Vector3(0, 0.8, 0),       // Prologue
      new THREE.Vector3(0, 0.65, 0),      // Dhanteras gift
      new THREE.Vector3(0, 0.55, 0),      // Ribbon detail
      new THREE.Vector3(-3.5, 1.6, -0.5), // Kali Chaudas shutters
      new THREE.Vector3(-4.0, 1.8, -1.5), // Sunlight source
      new THREE.Vector3(0, 1.1, -7.5),    // Diwali hall
      new THREE.Vector3(0.8, 1.0, -7.5),  // Diwali gift pass
      new THREE.Vector3(0, 1.6, -14.0),   // Courtyard archway
      new THREE.Vector3(0, 1.2, -16.0),   // Courtyard garden & rangoli
      new THREE.Vector3(1.2, 0.9, -18.5), // Brother-sister aarti thali
      new THREE.Vector3(0, 1.1, -18.5)    // Verandah wide view
    ];
    this.lookAtCurve = new THREE.CatmullRomCurve3(targetPoints, false, 'catmullrom', 0.25);
  }

  setupLighting() {
    // Ambient Light
    this.ambientLight = new THREE.AmbientLight(0x410F20, 0.8);
    this.scene.add(this.ambientLight);

    // Directional Sunlight (shifts color & angle across scenes)
    this.dirSunLight = new THREE.DirectionalLight(0xF5EBDD, 1.6);
    this.dirSunLight.position.set(-6, 8, 4);
    this.dirSunLight.castShadow = true;
    this.dirSunLight.shadow.mapSize.width = 2048;
    this.dirSunLight.shadow.mapSize.height = 2048;
    this.dirSunLight.shadow.camera.near = 0.5;
    this.dirSunLight.shadow.camera.far = 35;
    this.dirSunLight.shadow.camera.left = -10;
    this.dirSunLight.shadow.camera.right = 10;
    this.dirSunLight.shadow.camera.top = 10;
    this.dirSunLight.shadow.camera.bottom = -10;
    this.dirSunLight.shadow.bias = -0.0005;
    this.scene.add(this.dirSunLight);

    // Warm table fill light (Dhanteras)
    const tableLight = new THREE.PointLight(0xD8BD8A, 1.2, 6);
    tableLight.position.set(0, 1.8, 0.8);
    this.scene.add(tableLight);

    // Diwali festive warm glow array
    for (let i = 0; i < 4; i++) {
      const pl = new THREE.PointLight(0xFF9933, 1.8, 8);
      pl.position.set((i % 2 === 0 ? -1.8 : 1.8), 0.7, -4.5 - i * 1.8);
      this.scene.add(pl);
      this.diwaliPointLights.push(pl);
    }
  }

  createMaterials() {
    // Procedural Polished Teakwood
    const woodCanvas = document.createElement('canvas');
    woodCanvas.width = 512;
    woodCanvas.height = 512;
    const ctx = woodCanvas.getContext('2d');
    ctx.fillStyle = '#2A1417';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 150; i++) {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(65, 25, 30, 0.12)' : 'rgba(25, 10, 12, 0.15)';
      ctx.fillRect(0, i * 3.5, 512, Math.random() * 8 + 2);
    }
    const woodTex = new THREE.CanvasTexture(woodCanvas);
    woodTex.wrapS = THREE.RepeatWrapping;
    woodTex.wrapT = THREE.RepeatWrapping;

    this.matTeak = new THREE.MeshStandardMaterial({
      map: woodTex,
      roughness: 0.35,
      metalness: 0.1,
      color: 0x3A181C
    });

    // Burgundy Velvet
    this.matVelvet = new THREE.MeshStandardMaterial({
      color: 0x6E2338,
      roughness: 0.65,
      metalness: 0.15
    });

    // Antique Champagne Gold
    this.matChampagneGold = new THREE.MeshStandardMaterial({
      color: 0xC5A46D,
      metalness: 0.85,
      roughness: 0.22
    });

    // Polished Brass
    this.matBrass = new THREE.MeshStandardMaterial({
      color: 0xD8BD8A,
      metalness: 0.9,
      roughness: 0.18
    });

    // Warm Ivory Plaster / Stone
    this.matIvoryStone = new THREE.MeshStandardMaterial({
      color: 0xF5EBDD,
      roughness: 0.8,
      metalness: 0.05
    });

    // Diya Terracotta / Clay
    this.matClay = new THREE.MeshStandardMaterial({
      color: 0x8C3826,
      roughness: 0.75,
      metalness: 0.05
    });
  }

  buildArchitecturalHall() {
    // Continuous floor
    const floorGeo = new THREE.PlaneGeometry(16, 40);
    const floor = new THREE.Mesh(floorGeo, this.matTeak);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, -8);
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Ceiling with wooden beams
    const ceilingGeo = new THREE.PlaneGeometry(16, 40);
    const ceiling = new THREE.Mesh(ceilingGeo, this.matTeak);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, 3.8, -8);
    this.scene.add(ceiling);

    // Carved Gujarati Pillars along the corridor
    const pillarGeo = new THREE.CylinderGeometry(0.18, 0.22, 3.8, 16);
    const baseGeo = new THREE.BoxGeometry(0.5, 0.3, 0.5);

    [-2.8, 2.8].forEach(x => {
      for (let z = 4; z >= -20; z -= 3.5) {
        const pillarGroup = new THREE.Group();
        const shaft = new THREE.Mesh(pillarGeo, this.matTeak);
        shaft.position.y = 1.9;
        shaft.castShadow = true;
        shaft.receiveShadow = true;
        pillarGroup.add(shaft);

        const base = new THREE.Mesh(baseGeo, this.matTeak);
        base.position.y = 0.15;
        pillarGroup.add(base);

        const capital = new THREE.Mesh(baseGeo, this.matTeak);
        capital.position.y = 3.65;
        pillarGroup.add(capital);

        pillarGroup.position.set(x, 0, z);
        this.scene.add(pillarGroup);
        this.verandahColumns.push(pillarGroup);
      }
    });
  }

  buildDhanterasTableAndGift() {
    const tableGroup = new THREE.Group();

    // Table Top
    const topGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.08, 32);
    const top = new THREE.Mesh(topGeo, this.matTeak);
    top.position.y = 0.58;
    top.receiveShadow = true;
    tableGroup.add(top);

    // Table Pedestal
    const pedGeo = new THREE.CylinderGeometry(0.16, 0.45, 0.58, 16);
    const ped = new THREE.Mesh(pedGeo, this.matTeak);
    ped.position.y = 0.29;
    tableGroup.add(ped);

    // 3D Dhanteras Burgundy Velvet Gift Box
    const giftGroup = new THREE.Group();
    const boxGeo = new THREE.BoxGeometry(0.48, 0.32, 0.48);
    const box = new THREE.Mesh(boxGeo, this.matVelvet);
    box.position.y = 0.16;
    box.castShadow = true;
    box.receiveShadow = true;
    giftGroup.add(box);

    // Gold Ribbons (cross)
    const ribGeoX = new THREE.BoxGeometry(0.49, 0.325, 0.08);
    const ribX = new THREE.Mesh(ribGeoX, this.matChampagneGold);
    ribX.position.y = 0.16;
    giftGroup.add(ribX);

    const ribGeoZ = new THREE.BoxGeometry(0.08, 0.325, 0.49);
    const ribZ = new THREE.Mesh(ribGeoZ, this.matChampagneGold);
    ribZ.position.y = 0.16;
    giftGroup.add(ribZ);

    // Champagne Gold Bow on top
    const bowGeo1 = new THREE.TorusGeometry(0.09, 0.025, 12, 24);
    const bow1 = new THREE.Mesh(bowGeo1, this.matChampagneGold);
    bow1.rotation.y = Math.PI / 4;
    bow1.position.set(0, 0.36, 0);
    giftGroup.add(bow1);

    const bow2 = new THREE.Mesh(bowGeo1, this.matChampagneGold);
    bow2.rotation.y = -Math.PI / 4;
    bow2.position.set(0, 0.36, 0);
    giftGroup.add(bow2);

    giftGroup.position.set(0, 0.62, 0);
    giftGroup.rotation.y = 0.3;
    tableGroup.add(giftGroup);
    this.giftBox = giftGroup;

    // Small brass bell & diya on table
    const diyaGeo = new THREE.SphereGeometry(0.07, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const diya = new THREE.Mesh(diyaGeo, this.matBrass);
    diya.position.set(0.45, 0.62, -0.2);
    tableGroup.add(diya);
    this.createFlame(tableGroup, new THREE.Vector3(0.45, 0.68, -0.2));

    tableGroup.position.set(0, 0, 0);
    this.scene.add(tableGroup);
  }

  buildKaliChaudasShuttersAndWindow() {
    // Left Wall with Jharokha Window Frame
    const wallGeo = new THREE.BoxGeometry(0.2, 3.8, 5.0);
    const wall = new THREE.Mesh(wallGeo, this.matTeak);
    wall.position.set(-3.2, 1.9, 0);
    this.scene.add(wall);

    // Window Frame
    const frameGeo = new THREE.BoxGeometry(0.1, 1.8, 1.4);
    const frame = new THREE.Mesh(frameGeo, this.matTeak);
    frame.position.set(-3.1, 1.7, 0);
    this.scene.add(frame);

    // 3D Hinged Wooden Shutters (Kali Chaudas opening animation)
    const shutterGeo = new THREE.BoxGeometry(0.04, 1.6, 0.62);

    // Left Shutter Group (pivots at -3.05, 1.7, 0.62)
    const leftGroup = new THREE.Group();
    leftGroup.position.set(-3.05, 1.7, 0.62);
    const meshL = new THREE.Mesh(shutterGeo, this.matTeak);
    meshL.position.set(0, 0, -0.31);
    meshL.castShadow = true;
    leftGroup.add(meshL);
    this.scene.add(leftGroup);
    this.shutters.left = leftGroup;

    // Right Shutter Group (pivots at -3.05, 1.7, -0.62)
    const rightGroup = new THREE.Group();
    rightGroup.position.set(-3.05, 1.7, -0.62);
    const meshR = new THREE.Mesh(shutterGeo, this.matTeak);
    meshR.position.set(0, 0, 0.31);
    meshR.castShadow = true;
    rightGroup.add(meshR);
    this.scene.add(rightGroup);
    this.shutters.right = rightGroup;

    // Volumetric Sunlight Beam (Cone)
    const coneGeo = new THREE.ConeGeometry(2.4, 6.0, 32, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0xFFF2D6,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    this.volumetricLightCone = new THREE.Mesh(coneGeo, coneMat);
    this.volumetricLightCone.rotation.z = Math.PI / 3;
    this.volumetricLightCone.rotation.y = -Math.PI / 4;
    this.volumetricLightCone.position.set(-3.0, 1.7, 0);
    this.scene.add(this.volumetricLightCone);
  }

  buildDiwaliUrliAndDiyas() {
    this.urliGroup = new THREE.Group();

    // Large Brass Urli Vessel (centerpiece)
    const urliGeo = new THREE.CylinderGeometry(0.9, 0.5, 0.28, 32);
    const urli = new THREE.Mesh(urliGeo, this.matBrass);
    urli.position.y = 0.14;
    urli.castShadow = true;
    urli.receiveShadow = true;
    this.urliGroup.add(urli);

    // Water surface in Urli
    const waterGeo = new THREE.CircleGeometry(0.86, 32);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x1A0D15,
      metalness: 0.95,
      roughness: 0.05
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0.25;
    this.urliGroup.add(water);

    // Floating Marigold petals (yellow & saffron orange)
    const petalGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const matYellow = new THREE.MeshStandardMaterial({ color: 0xF4B41A, roughness: 0.6 });
    const matOrange = new THREE.MeshStandardMaterial({ color: 0xEB5E28, roughness: 0.6 });

    for (let i = 0; i < 28; i++) {
      const angle = (i / 28) * Math.PI * 2 + Math.random() * 0.2;
      const radius = Math.random() * 0.72 + 0.08;
      const petal = new THREE.Mesh(petalGeo, i % 2 === 0 ? matYellow : matOrange);
      petal.scale.set(1.4, 0.4, 1.0);
      petal.position.set(Math.cos(angle) * radius, 0.26, Math.sin(angle) * radius);
      this.urliGroup.add(petal);
    }

    // 4 Floating Tea Light Diyas in Urli
    for (let j = 0; j < 4; j++) {
      const angle = (j / 4) * Math.PI * 2;
      const diyaM = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.04, 16), this.matClay);
      diyaM.position.set(Math.cos(angle) * 0.45, 0.27, Math.sin(angle) * 0.45);
      this.urliGroup.add(diyaM);
      this.createFlame(this.urliGroup, new THREE.Vector3(Math.cos(angle) * 0.45, 0.33, Math.sin(angle) * 0.45));
    }

    this.urliGroup.position.set(0, 0, -5.5);
    this.scene.add(this.urliGroup);

    // Rows of festive diyas flanking the hall floor
    for (let z = -3.0; z >= -8.5; z -= 1.0) {
      [-1.5, 1.5].forEach(x => {
        const floorDiya = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.06, 16), this.matClay);
        floorDiya.rotation.x = Math.PI;
        floorDiya.position.set(x, 0.03, z);
        this.scene.add(floorDiya);
        this.createFlame(this.scene, new THREE.Vector3(x, 0.09, z));
      });
    }

    // Transition Passing Burgundy Gift Box (sweeps across camera)
    const passGeo = new THREE.BoxGeometry(0.7, 0.5, 0.7);
    this.passingBox = new THREE.Mesh(passGeo, this.matVelvet);
    this.passingBox.position.set(2.5, 1.2, -6.5);
    this.passingBox.rotation.set(0.2, 0.4, 0.1);
    this.scene.add(this.passingBox);
  }

  buildBestuVarasCourtyard() {
    // Carved Teak Archway
    const archGroup = new THREE.Group();
    const pillarL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 3.2, 0.4), this.matTeak);
    pillarL.position.set(-1.4, 1.6, 0);
    archGroup.add(pillarL);

    const pillarR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 3.2, 0.4), this.matTeak);
    pillarR.position.set(1.4, 1.6, 0);
    archGroup.add(pillarR);

    // Arch header
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.4, 0.45), this.matTeak);
    lintel.position.set(0, 3.2, 0);
    archGroup.add(lintel);

    // Marigold Toran Garland across arch
    const toranGroup = new THREE.Group();
    const toranCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-1.4, 3.0, 0.25),
      new THREE.Vector3(0, 2.4, 0.25),
      new THREE.Vector3(1.4, 3.0, 0.25)
    );
    const toranGeo = new THREE.TubeGeometry(toranCurve, 20, 0.04, 8, false);
    const matOrange = new THREE.MeshStandardMaterial({ color: 0xEB5E28, roughness: 0.5 });
    const toranTube = new THREE.Mesh(toranGeo, matOrange);
    toranGroup.add(toranTube);

    // Hanging marigold tassels
    for (let k = -1.0; k <= 1.0; k += 0.4) {
      const tassel = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.3, 8), matOrange);
      tassel.position.set(k, 2.5 - Math.abs(k) * 0.15, 0.25);
      toranGroup.add(tassel);
    }
    archGroup.add(toranGroup);
    this.toranMesh = toranGroup;

    archGroup.position.set(0, 0, -10.0);
    this.scene.add(archGroup);
    this.courtyardArch = archGroup;

    // Courtyard Limestone Floor & Floral Rangoli
    const courtFloorGeo = new THREE.PlaneGeometry(16, 14);
    const courtFloor = new THREE.Mesh(courtFloorGeo, this.matIvoryStone);
    courtFloor.rotation.x = -Math.PI / 2;
    courtFloor.position.set(0, -0.01, -16.0);
    courtFloor.receiveShadow = true;
    this.scene.add(courtFloor);

    // Rangoli Pattern (Procedural high-res canvas mandala)
    const rangoliCanvas = document.createElement('canvas');
    rangoliCanvas.width = 1024;
    rangoliCanvas.height = 1024;
    const rCtx = rangoliCanvas.getContext('2d');
    rCtx.clearRect(0, 0, 1024, 1024);

    // Draw Rangoli Mandala
    const cx = 512, cy = 512;
    rCtx.lineWidth = 6;
    rCtx.strokeStyle = '#FFFFFF';
    rCtx.beginPath();
    rCtx.arc(cx, cy, 460, 0, Math.PI * 2);
    rCtx.stroke();

    rCtx.strokeStyle = '#C5A46D';
    rCtx.lineWidth = 10;
    rCtx.beginPath();
    rCtx.arc(cx, cy, 380, 0, Math.PI * 2);
    rCtx.stroke();

    // 16 Petals
    for (let p = 0; p < 16; p++) {
      const theta = (p / 16) * Math.PI * 2;
      rCtx.save();
      rCtx.translate(cx, cy);
      rCtx.rotate(theta);
      rCtx.fillStyle = p % 2 === 0 ? 'rgba(110, 35, 56, 0.85)' : 'rgba(235, 94, 40, 0.85)';
      rCtx.beginPath();
      rCtx.ellipse(220, 0, 120, 45, 0, 0, Math.PI * 2);
      rCtx.fill();
      rCtx.stroke();
      rCtx.restore();
    }

    // Inner central flower
    rCtx.fillStyle = '#C5A46D';
    rCtx.beginPath();
    rCtx.arc(cx, cy, 100, 0, Math.PI * 2);
    rCtx.fill();
    rCtx.fillStyle = '#410F20';
    rCtx.beginPath();
    rCtx.arc(cx, cy, 55, 0, Math.PI * 2);
    rCtx.fill();

    const rangoliTex = new THREE.CanvasTexture(rangoliCanvas);
    const rangoliGeo = new THREE.PlaneGeometry(3.6, 3.6);
    const rangoliMat = new THREE.MeshBasicMaterial({
      map: rangoliTex,
      transparent: true,
      opacity: 0.92
    });
    this.rangoliMesh = new THREE.Mesh(rangoliGeo, rangoliMat);
    this.rangoliMesh.rotation.x = -Math.PI / 2;
    this.rangoliMesh.position.set(0, 0.015, -13.5);
    this.scene.add(this.rangoliMesh);
  }

  buildBhaiBijVerandah() {
    const verandahGroup = new THREE.Group();

    // Silver Aarti Thali (Plate)
    const thaliGeo = new THREE.CylinderGeometry(0.42, 0.38, 0.03, 32);
    const matSilver = new THREE.MeshStandardMaterial({
      color: 0xE8ECEF,
      metalness: 0.95,
      roughness: 0.12
    });
    this.aartiThali = new THREE.Mesh(thaliGeo, matSilver);
    this.aartiThali.position.set(1.1, 0.45, -18.2);
    this.aartiThali.castShadow = true;
    verandahGroup.add(this.aartiThali);

    // Small brass aarti diya on thali
    const aartiDiya = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.05, 16), this.matBrass);
    aartiDiya.position.set(1.1, 0.49, -18.2);
    verandahGroup.add(aartiDiya);
    this.createFlame(verandahGroup, new THREE.Vector3(1.1, 0.54, -18.2));

    // Low wooden bajot (stool) holding the aarti thali
    const bajotGeo = new THREE.BoxGeometry(1.2, 0.42, 1.0);
    const bajot = new THREE.Mesh(bajotGeo, this.matTeak);
    bajot.position.set(1.1, 0.21, -18.2);
    bajot.receiveShadow = true;
    verandahGroup.add(bajot);

    this.scene.add(verandahGroup);
  }

  createFlame(parentGroup, position) {
    // Custom Diya Flame with hot white core and amber halo
    const flameGeo = new THREE.ConeGeometry(0.025, 0.08, 12);
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0xFFAA33,
      transparent: true,
      opacity: 0.95
    });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.copy(position);

    // Inner bright hot core
    const coreGeo = new THREE.ConeGeometry(0.012, 0.045, 8);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xFFF8EE });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.y = -0.01;
    flame.add(core);

    parentGroup.add(flame);
    this.diyas.push(flame);
  }

  createAtmosphericParticles() {
    // Floating dust motes & golden embers
    const count = 750;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const colGold = new THREE.Color(0xD8BD8A);
    const colAmber = new THREE.Color(0xFFAA44);

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = Math.random() * 3.5 + 0.1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 28 - 6;

      const c = (i % 3 === 0) ? colAmber : colGold;
      colors[i * 3 + 0] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle Material
    const material = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    this.dustParticles = new THREE.Points(geometry, material);
    this.scene.add(this.dustParticles);
  }

  /**
   * Continuous Camera & Scene Update driven by scroll progress (0.0 to 1.0)
   */
  updateScene(progress) {
    this.targetScrollProgress = THREE.MathUtils.clamp(progress, 0, 1);
  }

  onWindowResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    // Smooth inertia lerp for scroll progress
    this.scrollProgress = THREE.MathUtils.lerp(this.scrollProgress, this.targetScrollProgress, 0.08);

    // 1. Camera Tracking along 3D Splines
    const clampedP = THREE.MathUtils.clamp(this.scrollProgress, 0, 0.999);
    const camPos = this.cameraCurve.getPointAt(clampedP);
    const lookAtPos = this.lookAtCurve.getPointAt(clampedP);

    this.camera.position.copy(camPos);
    this.camera.lookAt(lookAtPos);

    // 2. Chapter 1: Dhanteras Gift Box & Ribbon
    if (this.giftBox) {
      this.giftBox.rotation.y = 0.3 + Math.sin(time * 0.5) * 0.04;
    }

    // 3. Chapter 2: Kali Chaudas Shutters Open & Volumetric Sunlight
    // Occurs between scroll progress 0.20 and 0.40
    if (this.shutters.left && this.shutters.right) {
      const shutterProgress = THREE.MathUtils.smoothstep(this.scrollProgress, 0.22, 0.36);
      const angle = shutterProgress * (Math.PI * 0.72); // swing open 130 deg
      this.shutters.left.rotation.y = -angle;
      this.shutters.right.rotation.y = angle;

      // Volumetric beam intensity
      if (this.volumetricLightCone) {
        this.volumetricLightCone.material.opacity = shutterProgress * 0.45;
      }
    }

    // 4. Chapter 3: Diwali Lighting & Gift Pass
    // Climax between 0.40 and 0.60
    if (this.passingBox) {
      // Gift passes right across camera at 0.58
      const passProgress = THREE.MathUtils.smoothstep(this.scrollProgress, 0.52, 0.62);
      this.passingBox.position.x = THREE.MathUtils.lerp(2.5, -2.5, passProgress);
      this.passingBox.position.z = THREE.MathUtils.lerp(-7.5, -5.2, passProgress);
      this.passingBox.rotation.y = time * 0.6 + passProgress * 2.0;
    }

    // 5. Diya Flame Flickering Animation
    const flicker = Math.sin(time * 18.0) * 0.06 + Math.cos(time * 26.0) * 0.04;
    for (let i = 0; i < this.diyas.length; i++) {
      const f = this.diyas[i];
      f.scale.y = 1.0 + flicker + (i % 3 === 0 ? 0.05 : -0.05);
      f.scale.x = 1.0 - flicker * 0.5;
    }

    // 6. Dust & Ember Particles Gentle Float
    if (this.dustParticles) {
      const positions = this.dustParticles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(time + positions[i]) * 0.002;
        if (positions[i + 1] > 3.8) positions[i + 1] = 0.2;
      }
      this.dustParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 7. Dynamic Time of Day / Color Temperature Grading
    if (this.scrollProgress < 0.20) {
      // Dhanteras: Warm afternoon
      this.scene.background.setHex(0x2A111B);
      this.scene.fog.color.setHex(0x2A111B);
      this.dirSunLight.color.setHex(0xFFC785);
      this.dirSunLight.intensity = 1.5;
    } else if (this.scrollProgress < 0.40) {
      // Kali Chaudas: Crisp morning sun entering
      this.scene.background.setHex(0x1F1218);
      this.scene.fog.color.setHex(0x1F1218);
      this.dirSunLight.color.setHex(0xFFF2D6);
      this.dirSunLight.intensity = 2.2;
    } else if (this.scrollProgress < 0.60) {
      // Diwali: Rich celebratory evening & festive burgundy glow
      this.scene.background.setHex(0x350F1D);
      this.scene.fog.color.setHex(0x350F1D);
      this.dirSunLight.color.setHex(0xFF9933);
      this.dirSunLight.intensity = 1.2;
    } else if (this.scrollProgress < 0.80) {
      // Bestu Varas: Radiant New Year morning outdoor light
      this.scene.background.setHex(0x2D1720);
      this.scene.fog.color.setHex(0x2D1720);
      this.dirSunLight.color.setHex(0xFFFAF0);
      this.dirSunLight.intensity = 2.4;
    } else {
      // Bhai Bij: Serene twilight & warm golden hour
      this.scene.background.setHex(0x240D17);
      this.scene.fog.color.setHex(0x240D17);
      this.dirSunLight.color.setHex(0xE59866);
      this.dirSunLight.intensity = 1.4;
    }

    // Render 3D Scene
    this.renderer.render(this.scene, this.camera);
  }
}

window.DiwaliCinematicWorld = DiwaliCinematicWorld;

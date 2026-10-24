import * as THREE from "three";

const palette = {
  background: 0x07111f,
  steel: 0x47e2e7,
  steelDark: 0x18334a,
  seismic: 0x9e79ff,
  envelope: 0x8ec9e8,
  services: 0xf0bf60,
  auxiliary: 0x4d88ff,
  force: 0xffd67f,
  concrete: 0xb8c8d3,
  damaged: 0xff6178,
  repaired: 0x66e6a5
};

const cameraPresets = [
  [25, 0.82, 1.17, 0, 2, 0],
  [19, 0.92, 1.22, 0, 1.8, 0],
  [22, 0.62, 1.1, 0, 6, 0],
  [27, 0.78, 1.05, 0, 5.8, 0],
  [25, 0.91, 1.08, 0, 6.1, 0],
  [25, 0.58, 1.02, 0, 6, 0],
  [27, 0.8, 1.08, 0, 6.2, 0],
  [29, 0.96, 1.05, 0, 6.8, 0],
  [13, 0.18, 1.18, 0, 5, 0.7]
];

function ease(value) {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}

function supportsWebGL() {
  const test = document.createElement("canvas");
  return Boolean(test.getContext("webgl2") || test.getContext("webgl"));
}

export class RasaModel {
  constructor({ canvas, container, onSelect = () => {} }) {
    if (!canvas || !container) throw new Error("بوم نمایش یا قاب مدل پیدا نشد");
    if (!supportsWebGL()) throw new Error("WebGL در مرورگر یا دستگاه شما فعال نیست");

    this.canvas = canvas;
    this.container = container;
    this.onSelect = onSelect;
    this.groups = [];
    this.sensorMeshes = [];
    this.forceArrows = [];
    this.currentStage = 0;
    this.exploded = false;
    this.explodeAmount = 0;
    this.autoRotate = false;
    this.selected = null;
    this.dragging = false;
    this.pointerStart = null;
    this.activePointers = new Map();
    this.lastPinchDistance = 0;
    this.reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.lowPower = matchMedia("(max-width: 700px)").matches || (navigator.hardwareConcurrency || 8) <= 4;

    this.createRenderer();
    this.createScene();
    this.createMaterials();
    this.createModel();
    this.createEnvironment();
    this.createSelection();
    this.bindInteraction();
    this.setCameraPreset(0, true);
    this.resize();

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.previousTime = performance.now();
    this.renderer.setAnimationLoop((time) => this.render(time));
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: !this.lowPower,
      alpha: true,
      powerPreference: "high-performance"
    });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, this.lowPower ? 1.35 : 2));
    this.renderer.shadowMap.enabled = !this.lowPower;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.setClearColor(palette.background, 0);
  }

  createScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(palette.background, 28, 58);
    this.camera = new THREE.PerspectiveCamera(34, 1, 0.1, 120);

    this.scene.add(new THREE.HemisphereLight(0xdff9ff, 0x07111f, 1.7));
    const key = new THREE.DirectionalLight(0xe9fbff, 3.4);
    key.position.set(12, 22, 15);
    key.castShadow = !this.lowPower;
    key.shadow.mapSize.set(this.lowPower ? 1024 : 2048, this.lowPower ? 1024 : 2048);
    key.shadow.camera.left = -18;
    key.shadow.camera.right = 18;
    key.shadow.camera.top = 22;
    key.shadow.camera.bottom = -8;
    this.scene.add(key);

    const rim = new THREE.DirectionalLight(palette.steel, 2.5);
    rim.position.set(-15, 11, -13);
    this.scene.add(rim);

    const gold = new THREE.PointLight(palette.services, 8, 30, 2);
    gold.position.set(7, 10, 8);
    this.scene.add(gold);

    this.model = new THREE.Group();
    this.model.rotation.y = -0.08;
    this.scene.add(this.model);
  }

  createMaterials() {
    this.materials = {
      foundation: new THREE.MeshStandardMaterial({ color: 0x33495b, metalness: 0.18, roughness: 0.76 }),
      concrete: new THREE.MeshStandardMaterial({ color: palette.concrete, metalness: 0.02, roughness: 0.88 }),
      grout: new THREE.MeshStandardMaterial({ color: 0x76909e, metalness: 0.04, roughness: 0.94 }),
      steel: new THREE.MeshStandardMaterial({ color: palette.steel, metalness: 0.83, roughness: 0.24 }),
      steelDark: new THREE.MeshStandardMaterial({ color: palette.steelDark, metalness: 0.88, roughness: 0.23 }),
      seismic: new THREE.MeshStandardMaterial({ color: palette.seismic, metalness: 0.7, roughness: 0.25, emissive: palette.seismic, emissiveIntensity: 0.11 }),
      deck: new THREE.MeshStandardMaterial({ color: palette.envelope, metalness: 0.48, roughness: 0.42 }),
      slab: new THREE.MeshPhysicalMaterial({ color: 0xd9e7ee, metalness: 0.04, roughness: 0.55, transparent: true, opacity: 0.68 }),
      service: new THREE.MeshStandardMaterial({ color: palette.services, metalness: 0.54, roughness: 0.3 }),
      service2: new THREE.MeshStandardMaterial({ color: palette.auxiliary, metalness: 0.48, roughness: 0.34 }),
      glass: new THREE.MeshPhysicalMaterial({ color: palette.envelope, transparent: true, opacity: 0.21, roughness: 0.12, metalness: 0.08, transmission: 0.35, side: THREE.DoubleSide }),
      sensor: new THREE.MeshStandardMaterial({ color: palette.steel, emissive: palette.steel, emissiveIntensity: 2, metalness: 0.34, roughness: 0.22 }),
      force: new THREE.MeshStandardMaterial({ color: palette.force, emissive: palette.force, emissiveIntensity: 1.3, metalness: 0.22, roughness: 0.28 }),
      damaged: new THREE.MeshStandardMaterial({ color: palette.damaged, emissive: palette.damaged, emissiveIntensity: 0.68, metalness: 0.46, roughness: 0.31 }),
      repaired: new THREE.MeshStandardMaterial({ color: palette.repaired, emissive: palette.repaired, emissiveIntensity: 0.48, metalness: 0.53, roughness: 0.27 })
    };
  }

  makeStage(stage, offset, explodeOffset) {
    const group = new THREE.Group();
    group.userData = {
      stage,
      reveal: stage === 0 ? 1 : 0,
      target: stage === 0 ? 1 : 0,
      offset: offset.clone(),
      explodeOffset: explodeOffset.clone(),
      base: new THREE.Vector3()
    };
    this.groups.push(group);
    this.model.add(group);
    return group;
  }

  label(object, info) {
    object.userData.info = info;
    return object;
  }

  box(group, size, position, material, info, rotation = null) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), material);
    mesh.position.copy(position);
    if (rotation) mesh.rotation.set(rotation.x, rotation.y, rotation.z);
    mesh.castShadow = !this.lowPower;
    mesh.receiveShadow = !this.lowPower;
    this.label(mesh, info);
    group.add(mesh);
    return mesh;
  }

  cylinderBetween(group, a, b, radius, material, info, radialSegments = 10) {
    const delta = new THREE.Vector3().subVectors(b, a);
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, delta.length(), this.lowPower ? Math.min(radialSegments, 8) : radialSegments), material);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.clone().normalize());
    mesh.castShadow = !this.lowPower;
    mesh.receiveShadow = !this.lowPower;
    this.label(mesh, info);
    group.add(mesh);
    return mesh;
  }

  bolt(group, position, material, info, axis = "y") {
    const segments = this.lowPower ? 6 : 10;
    const shank = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.5, segments), material);
    shank.position.copy(position);
    if (axis === "z") shank.rotation.x = Math.PI / 2;
    if (axis === "x") shank.rotation.z = Math.PI / 2;
    this.label(shank, info);
    group.add(shank);

    const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.11, 6), material);
    nut.position.copy(position);
    if (axis === "z") {
      nut.rotation.x = Math.PI / 2;
      nut.position.z += 0.25;
    } else if (axis === "x") {
      nut.rotation.z = Math.PI / 2;
      nut.position.x += 0.25;
    } else {
      nut.position.y += 0.25;
    }
    this.label(nut, info);
    group.add(nut);
  }

  createFuse(group, position, material, info) {
    const shape = new THREE.Shape();
    shape.moveTo(-0.62, -0.42);
    shape.lineTo(0.62, -0.42);
    shape.lineTo(0.34, -0.16);
    shape.lineTo(0.34, 0.16);
    shape.lineTo(0.62, 0.42);
    shape.lineTo(-0.62, 0.42);
    shape.lineTo(-0.34, 0.16);
    shape.lineTo(-0.34, -0.16);
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.12,
      bevelEnabled: true,
      bevelSize: 0.04,
      bevelThickness: 0.03,
      bevelSegments: this.lowPower ? 1 : 2
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.rotation.x = Math.PI / 2;
    mesh.castShadow = !this.lowPower;
    this.label(mesh, info);
    group.add(mesh);
    for (const dx of [-0.48, 0.48]) {
      for (const dz of [-0.24, 0.24]) {
        this.bolt(group, new THREE.Vector3(position.x + dx, position.y, position.z + dz), this.materials.steelDark, "پیچ پرمقاومت فیوز — قابل بازکردن و کنترل گشتاور");
      }
    }
    return mesh;
  }

  createModel() {
    const gridX = [-5, -1.67, 1.67, 5];
    const gridZ = [-3.25, 0, 3.25];
    this.gridX = gridX;
    this.gridZ = gridZ;

    const foundation = this.makeStage(0, new THREE.Vector3(0, -2.2, 0), new THREE.Vector3(0, -1.6, 0));
    this.box(foundation, new THREE.Vector3(14, 0.45, 10), new THREE.Vector3(0, -0.38, 0), this.materials.foundation, "پی گسترده سبک‌شده — توزیع یکنواخت بار و بستر دقیق مونتاژ");
    for (const x of gridX) {
      for (const z of gridZ) {
        this.box(foundation, new THREE.Vector3(1.45, 0.36, 1.45), new THREE.Vector3(x, -0.05, z), this.materials.concrete, "کلاف موضعی زیر ستون — تقویت برش پانچ و انتقال نیروی مهاری");
      }
    }
    for (const z of gridZ) this.box(foundation, new THREE.Vector3(10, 0.25, 0.32), new THREE.Vector3(0, 0.04, z), this.materials.foundation, "شناژ رابط — پیوستگی مسیر بار و کنترل تغییرشکل پی");
    for (const x of gridX) this.box(foundation, new THREE.Vector3(0.32, 0.25, 6.5), new THREE.Vector3(x, 0.04, 0), this.materials.foundation, "شناژ عرضی — یکپارچگی شبکه فونداسیون");

    const bases = this.makeStage(1, new THREE.Vector3(0, 3.2, 0), new THREE.Vector3(0, 0.3, 0));
    for (const x of gridX) {
      for (const z of gridZ) {
        this.box(bases, new THREE.Vector3(0.96, 0.08, 0.96), new THREE.Vector3(x, 0.19, z), this.materials.grout, "گروت بدون انقباض — انتقال یکنواخت فشار و اصلاح ریزناهمواری سطح");
        this.box(bases, new THREE.Vector3(0.82, 0.11, 0.82), new THREE.Vector3(x, 0.29, z), this.materials.seismic, "صفحه‌ستون ماشین‌کاری‌شده — نشیمن دقیق و اتصال خشک ستون");
        for (const dx of [-0.28, 0.28]) {
          for (const dz of [-0.28, 0.28]) this.bolt(bases, new THREE.Vector3(x + dx, 0.49, z + dz), this.materials.steelDark, "بولت مهاری پیش‌نصب — انتقال کشش و برش پایه");
        }
      }
    }

    const spine = this.makeStage(2, new THREE.Vector3(0, 11, 0), new THREE.Vector3(-3.4, 0, 0));
    const spineX = [-1.05, 1.05];
    const spineZ = [-0.9, 0.9];
    for (const x of spineX) {
      for (const z of spineZ) this.box(spine, new THREE.Vector3(0.36, 12.2, 0.36), new THREE.Vector3(x, 6.2, z), this.materials.seismic, "ستون جعبه‌ای هسته RASA–Spine — ستون فقرات سیستم جانبی");
    }
    for (let story = 0; story < 4; story += 1) {
      const y0 = story * 3 + 0.5;
      const y1 = (story + 1) * 3 + 0.5;
      for (const z of spineZ) {
        this.cylinderBetween(spine, new THREE.Vector3(-1.05, y0, z), new THREE.Vector3(1.05, y1, z), 0.115, this.materials.seismic, "مهاربند کششی–فشاری — هدایت نیروی جانبی به هسته");
        this.cylinderBetween(spine, new THREE.Vector3(1.05, y0, z), new THREE.Vector3(-1.05, y1, z), 0.115, this.materials.seismic, "مهاربند متقاطع — ایجاد مسیر مقاوم افزونه");
      }
      this.createFuse(spine, new THREE.Vector3(0, y0 + 1.5, 1.04), this.materials.seismic, "فیوز فولادی تسلیم‌شونده — جذب انرژی و تعویض پس از زلزله");
    }
    for (const x of [-0.72, 0.72]) this.cylinderBetween(spine, new THREE.Vector3(x, 0.22, 0), new THREE.Vector3(x, 12.7, 0), 0.045, this.materials.steelDark, "کابل پس‌کشیده — بازگرداندن سازه و کاهش دریفت ماندگار", 12);

    const frame = this.makeStage(3, new THREE.Vector3(0, 8.5, 0), new THREE.Vector3(2.8, 0, 0));
    for (let story = 0; story < 4; story += 1) {
      const y0 = 0.5 + story * 3;
      const y1 = y0 + 3;
      for (const x of gridX) {
        for (const z of gridZ) this.box(frame, new THREE.Vector3(0.28, 3, 0.28), new THREE.Vector3(x, y0 + 1.5, z), this.materials.steel, "ستون مدولار HSS — قطعه کارخانه‌ای شماره‌گذاری‌شده");
      }
      for (const z of gridZ) {
        for (let index = 0; index < gridX.length - 1; index += 1) {
          const x = (gridX[index] + gridX[index + 1]) / 2;
          this.box(frame, new THREE.Vector3(gridX[index + 1] - gridX[index] - 0.24, 0.28, 0.24), new THREE.Vector3(x, y1, z), this.materials.steel, "تیر سردنوردشده مدولار — انتقال بار کف به ستون‌ها");
        }
      }
      for (const x of gridX) {
        for (let index = 0; index < gridZ.length - 1; index += 1) {
          const z = (gridZ[index] + gridZ[index + 1]) / 2;
          this.box(frame, new THREE.Vector3(0.24, 0.28, gridZ[index + 1] - gridZ[index] - 0.24), new THREE.Vector3(x, y1, z), this.materials.steel, "تیر پیرامونی — لبه دیافراگم و اتصال سلول‌ها");
        }
      }
      for (const x of [-5, 5]) {
        for (const z of [-3.25, 3.25]) {
          this.box(frame, new THREE.Vector3(0.52, 0.58, 0.08), new THREE.Vector3(x, y1, z + (z > 0 ? 0.18 : -0.18)), this.materials.seismic, "صفحه انتهایی پیچ‌ومهره‌ای — مونتاژ سریع قاب بدون جوش محل");
          for (const dx of [-0.16, 0.16]) {
            for (const dy of [-0.18, 0.18]) this.bolt(frame, new THREE.Vector3(x + dx, y1 + dy, z + (z > 0 ? 0.23 : -0.23)), this.materials.steelDark, "پیچ اتصال گره مدولار — کنترل‌پذیر و قابل بازبینی", "z");
          }
        }
      }
    }

    const floors = this.makeStage(4, new THREE.Vector3(0, 5.5, 0), new THREE.Vector3(0, 2.2, 0));
    for (let level = 1; level <= 4; level += 1) {
      const y = 0.5 + level * 3;
      for (let ix = 0; ix < gridX.length - 1; ix += 1) {
        for (let iz = 0; iz < gridZ.length - 1; iz += 1) {
          const width = gridX[ix + 1] - gridX[ix] - 0.12;
          const depth = gridZ[iz + 1] - gridZ[iz] - 0.12;
          const x = (gridX[ix + 1] + gridX[ix]) / 2;
          const z = (gridZ[iz + 1] + gridZ[iz]) / 2;
          this.box(floors, new THREE.Vector3(width, 0.13, depth), new THREE.Vector3(x, y + 0.18, z), this.materials.slab, "رویه ژئوپلیمری سبک الیافی — جرم کمتر و عملکرد دیافراگمی");
          for (let rib = -2; rib <= 2; rib += 1) this.box(floors, new THREE.Vector3(width, 0.08, 0.045), new THREE.Vector3(x, y + 0.06, z + (rib * depth) / 6), this.materials.deck, "دِک فولادی موج‌دار — قالب ماندگار و انتقال برش افقی");
        }
      }
    }

    const services = this.makeStage(5, new THREE.Vector3(0, 7.2, 0), new THREE.Vector3(3.6, 0, 1.2));
    for (const x of [2.9, 3.45]) this.cylinderBetween(services, new THREE.Vector3(x, 0.7, -0.55), new THREE.Vector3(x, 12.5, -0.55), 0.095, this.materials.service, "رایزر پیش‌ساخته — اتصال سریع آب، اطفا یا مدار خدماتی", 14);
    this.cylinderBetween(services, new THREE.Vector3(2.35, 0.7, -0.55), new THREE.Vector3(2.35, 12.5, -0.55), 0.13, this.materials.service2, "رایزر تأسیساتی ثانویه — نصب موازی با اسکلت", 14);
    for (let level = 1; level <= 4; level += 1) {
      const y = 0.5 + level * 3 - 0.35;
      this.cylinderBetween(services, new THREE.Vector3(-4.8, y, -2.8), new THREE.Vector3(4.8, y, -2.8), 0.07, this.materials.service, "خط توزیع افقی Plug–and–Play — کوپلر مکانیکی سریع", 12);
      this.box(services, new THREE.Vector3(8.6, 0.16, 0.32), new THREE.Vector3(0, y - 0.25, 2.65), this.materials.service2, "سینی کابل مدولار — دسترسی‌پذیر و قابل توسعه");
      for (const x of [-3.2, 0, 3.2]) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.035, 8, this.lowPower ? 12 : 18), this.materials.seismic);
        ring.position.set(x, y, -2.8);
        ring.rotation.y = Math.PI / 2;
        this.label(ring, "کوپلر سریع — قطع و وصل استاندارد تأسیسات هر سلول");
        services.add(ring);
      }
    }

    const envelope = this.makeStage(6, new THREE.Vector3(0, 4.8, 0), new THREE.Vector3(0, 0, 3.4));
    for (const y of [2, 5, 8, 11]) {
      for (let ix = 0; ix < gridX.length - 1; ix += 1) {
        const width = gridX[ix + 1] - gridX[ix] - 0.25;
        const x = (gridX[ix + 1] + gridX[ix]) / 2;
        for (const z of [-3.43, 3.43]) {
          this.box(envelope, new THREE.Vector3(width, 2.55, 0.08), new THREE.Vector3(x, y, z), this.materials.glass, "پنل نمای خشک مدولار — سبک، قابل تعویض و دارای لایه هوابند");
          this.box(envelope, new THREE.Vector3(0.08, 2.75, 0.16), new THREE.Vector3(gridX[ix + 1], y, z), this.materials.steelDark, "مولیون نمای پیش‌ساخته — اتصال مکانیکی به لبه کف");
        }
      }
      for (let iz = 0; iz < gridZ.length - 1; iz += 1) {
        const depth = gridZ[iz + 1] - gridZ[iz] - 0.25;
        const z = (gridZ[iz + 1] + gridZ[iz]) / 2;
        for (const x of [-5.18, 5.18]) this.box(envelope, new THREE.Vector3(0.08, 2.55, depth), new THREE.Vector3(x, y, z), this.materials.glass, "پوسته جانبی سبک — کاهش بار مرده و سرعت نصب بالا");
      }
    }
    for (let level = 1; level <= 4; level += 1) this.box(envelope, new THREE.Vector3(10.4, 0.11, 0.42), new THREE.Vector3(0, level * 3 + 0.15, -3.72), this.materials.deck, "سایه‌بان افقی مدولار — کنترل تابش و بخشی از هویت معماری");
    this.box(envelope, new THREE.Vector3(2.6, 1.55, 2.1), new THREE.Vector3(0, 13.15, 0), this.materials.glass, "مخزن آب بام با عملکرد دوگانه — ذخیره اطفا و میراگر مایع تنظیم‌شده");
    this.box(envelope, new THREE.Vector3(2.25, 0.75, 1.75), new THREE.Vector3(0, 12.82, 0), this.materials.service, "جرم مایع تنظیم‌شده — کاهش پاسخ ارتعاشی ناشی از باد");

    const monitoring = this.makeStage(7, new THREE.Vector3(0, 3.8, 0), new THREE.Vector3(-2.4, 0.8, -2.4));
    for (let level = 1; level <= 4; level += 1) {
      const y = 0.5 + level * 3;
      for (const point of [[-1.05, y, 0.9], [1.05, y, -0.9], [-5, y, -3.25], [5, y, 3.25]]) {
        const sensor = new THREE.Mesh(new THREE.IcosahedronGeometry(0.15, 1), this.materials.sensor);
        sensor.position.set(...point);
        this.label(sensor, "گره حسگر — اندازه‌گیری شتاب، کرنش یا جابه‌جایی برای دوقلوی دیجیتال");
        monitoring.add(sensor);
        this.sensorMeshes.push(sensor);
      }
    }
    for (const x of [-4, 0, 4]) this.arrow(monitoring, new THREE.Vector3(x, 15, 0), new THREE.Vector3(0, -1, 0), 3.2, "بار ثقلی — از کف به تیر، ستون و فونداسیون منتقل می‌شود", palette.services);
    for (const y of [3, 6, 9, 12]) this.arrow(monitoring, new THREE.Vector3(-9, y, 0), new THREE.Vector3(1, 0, 0), 3, "نیروی باد — از پوسته و دیافراگم به هسته فضایی هدایت می‌شود", palette.steel);
    for (const y of [2.5, 7.5, 12]) this.arrow(monitoring, new THREE.Vector3(8.5, y, 2.5), new THREE.Vector3(-1, 0, -0.15), 2.6, "نیروی زلزله — با کاهش جرم، مهاربند و فیوز مستهلک می‌شود", palette.seismic);

    const repair = this.makeStage(8, new THREE.Vector3(-6, 0, 0), new THREE.Vector3(-3.2, 0, 0));
    this.damagedFuse = this.createFuse(repair, new THREE.Vector3(0, 5, 1.32), this.materials.damaged, "فیوز تسلیم‌شده — قطعه قربانی که انرژی زلزله را جذب کرده است");
    this.newFuse = this.createFuse(repair, new THREE.Vector3(4.5, 5, 1.32), this.materials.repaired, "فیوز جایگزین — قطعه استاندارد آماده نصب و بازگشت سریع به بهره‌برداری");
  }

  arrow(group, origin, direction, length, info, color) {
    const helper = new THREE.ArrowHelper(direction.clone().normalize(), origin, length, color, 0.65, 0.3);
    helper.line.material.transparent = true;
    helper.cone.material.transparent = true;
    helper.userData.info = info;
    helper.line.userData.info = info;
    helper.cone.userData.info = info;
    group.add(helper);
    this.forceArrows.push(helper);
  }

  createEnvironment() {
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(70, 70), new THREE.MeshStandardMaterial({ color: palette.background, roughness: 0.98, metalness: 0 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.62;
    ground.receiveShadow = !this.lowPower;
    this.scene.add(ground);

    const grid = new THREE.GridHelper(44, 44, 0x24495e, 0x173244);
    grid.position.y = -0.6;
    grid.material.transparent = true;
    grid.material.opacity = 0.3;
    this.scene.add(grid);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(8.2, 8.24, 96),
      new THREE.MeshBasicMaterial({ color: palette.steel, transparent: true, opacity: 0.16, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -0.585;
    this.scene.add(ring);
  }

  createSelection() {
    const placeholder = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));
    this.selection = new THREE.BoxHelper(placeholder, palette.force);
    this.selection.visible = false;
    this.selection.material.transparent = true;
    this.selection.material.opacity = 0.9;
    this.scene.add(this.selection);
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
  }

  bindInteraction() {
    this.boundPointerDown = (event) => this.pointerDown(event);
    this.boundPointerMove = (event) => this.pointerMove(event);
    this.boundPointerUp = (event) => this.pointerUp(event);
    this.boundWheel = (event) => this.wheel(event);
    this.boundDoubleClick = () => this.resetCamera();
    this.canvas.addEventListener("pointerdown", this.boundPointerDown);
    this.canvas.addEventListener("pointermove", this.boundPointerMove);
    this.canvas.addEventListener("pointerup", this.boundPointerUp);
    this.canvas.addEventListener("pointercancel", this.boundPointerUp);
    this.canvas.addEventListener("wheel", this.boundWheel, { passive: false });
    this.canvas.addEventListener("dblclick", this.boundDoubleClick);
  }

  screenPointer(event) {
    const rect = this.canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top, width: rect.width, height: rect.height };
  }

  pointerDown(event) {
    const point = this.screenPointer(event);
    this.activePointers.set(event.pointerId, point);
    this.pointerStart = { x: point.x, y: point.y, theta: this.theta, phi: this.phi };
    this.dragging = true;
    this.autoRotate = false;
    this.canvas.setPointerCapture(event.pointerId);
  }

  pointerMove(event) {
    if (!this.dragging || !this.pointerStart) return;
    const point = this.screenPointer(event);
    this.activePointers.set(event.pointerId, point);
    if (this.activePointers.size >= 2) {
      const [first, second] = [...this.activePointers.values()];
      const distance = Math.hypot(first.x - second.x, first.y - second.y);
      if (this.lastPinchDistance) {
        this.radius = Math.max(9, Math.min(42, this.radius * (this.lastPinchDistance / distance)));
        this.radiusGoal = this.radius;
      }
      this.lastPinchDistance = distance;
      return;
    }
    const dx = point.x - this.pointerStart.x;
    const dy = point.y - this.pointerStart.y;
    this.theta = this.pointerStart.theta - dx * 0.008;
    this.phi = Math.max(0.28, Math.min(1.48, this.pointerStart.phi + dy * 0.006));
    this.thetaGoal = this.theta;
    this.phiGoal = this.phi;
  }

  pointerUp(event) {
    const point = this.screenPointer(event);
    const start = this.pointerStart;
    this.activePointers.delete(event.pointerId);
    if (this.activePointers.size < 2) this.lastPinchDistance = 0;
    if (this.activePointers.size) return;
    this.dragging = false;
    if (this.canvas.hasPointerCapture(event.pointerId)) this.canvas.releasePointerCapture(event.pointerId);
    if (start && Math.hypot(point.x - start.x, point.y - start.y) < 5) this.pick(point);
    this.pointerStart = null;
  }

  pick(point) {
    this.pointer.x = (point.x / point.width) * 2 - 1;
    this.pointer.y = -(point.y / point.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.raycaster.intersectObject(this.model, true).find((entry) => entry.object.visible && entry.object.userData.info);
    if (!hit) {
      this.clearSelection();
      return;
    }
    this.selected = hit.object;
    this.selection.setFromObject(this.selected);
    this.selection.visible = true;
    this.onSelect(this.selected.userData.info);
  }

  wheel(event) {
    event.preventDefault();
    this.autoRotate = false;
    this.radius = Math.max(9, Math.min(42, this.radius * Math.exp(event.deltaY * 0.001)));
    this.radiusGoal = this.radius;
  }

  setStage(index) {
    this.currentStage = Math.max(0, Math.min(this.groups.length - 1, Number(index)));
    this.groups.forEach((group) => {
      group.userData.target = group.userData.stage <= this.currentStage ? 1 : 0;
    });
    this.clearSelection();
    this.setCameraPreset(this.currentStage);
  }

  setExploded(active) {
    this.exploded = Boolean(active);
  }

  setAutoRotate(active) {
    this.autoRotate = Boolean(active);
  }

  clearSelection() {
    this.selected = null;
    this.selection.visible = false;
  }

  setCameraPreset(index, immediate = false) {
    const preset = cameraPresets[index];
    this.radiusGoal = preset[0];
    this.thetaGoal = preset[1];
    this.phiGoal = preset[2];
    this.targetGoal = this.targetGoal || new THREE.Vector3();
    this.targetGoal.set(preset[3], preset[4], preset[5]);
    if (immediate || this.reducedMotion || this.radius === undefined) {
      this.radius = this.radiusGoal;
      this.theta = this.thetaGoal;
      this.phi = this.phiGoal;
      this.target = this.target || new THREE.Vector3();
      this.target.copy(this.targetGoal);
    }
  }

  resetCamera() {
    this.setCameraPreset(this.currentStage, true);
  }

  updateCamera() {
    const sinPhi = Math.sin(this.phi);
    this.camera.position.set(
      this.target.x + this.radius * sinPhi * Math.sin(this.theta),
      this.target.y + this.radius * Math.cos(this.phi),
      this.target.z + this.radius * sinPhi * Math.cos(this.theta)
    );
    this.camera.lookAt(this.target);
  }

  resize() {
    const width = Math.max(1, this.container.clientWidth);
    const height = Math.max(1, this.container.clientHeight);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  render(now) {
    const dt = Math.min(0.05, (now - this.previousTime) / 1000);
    this.previousTime = now;
    const response = this.reducedMotion ? 1 : 1 - Math.exp(-dt * 4.8);
    this.explodeAmount += ((this.exploded ? 1 : 0) - this.explodeAmount) * response;

    for (const group of this.groups) {
      group.userData.reveal += (group.userData.target - group.userData.reveal) * response;
      const reveal = ease(group.userData.reveal);
      group.visible = reveal > 0.008;
      group.position.copy(group.userData.base)
        .addScaledVector(group.userData.offset, 1 - reveal)
        .addScaledVector(group.userData.explodeOffset, this.explodeAmount * reveal);
      group.scale.setScalar(0.96 + 0.04 * reveal);
    }

    if (this.autoRotate && !this.dragging && !this.reducedMotion) {
      this.theta += dt * 0.18;
      this.thetaGoal = this.theta;
    } else if (!this.dragging) {
      this.radius += (this.radiusGoal - this.radius) * response;
      this.theta += (this.thetaGoal - this.theta) * response;
      this.phi += (this.phiGoal - this.phi) * response;
      this.target.lerp(this.targetGoal, response);
    }
    this.updateCamera();

    const seconds = now * 0.001;
    if (!this.reducedMotion && this.currentStage >= 7) {
      this.sensorMeshes.forEach((sensor, index) => {
        sensor.scale.setScalar(1 + 0.18 * Math.sin(seconds * 4 + index * 0.7));
      });
      this.forceArrows.forEach((arrow, index) => {
        const alpha = 0.5 + 0.45 * (0.5 + 0.5 * Math.sin(seconds * 3 + index * 0.55));
        arrow.line.material.opacity = alpha;
        arrow.cone.material.opacity = alpha;
      });
    }

    if (this.currentStage === 8 && this.groups[8].visible) {
      const phase = this.reducedMotion ? 1 : Math.min(1, Math.max(0, (Math.sin(seconds * 1.25 - 1.2) + 1) / 2));
      this.damagedFuse.position.x = -1.8 * phase;
      this.damagedFuse.rotation.z = -0.38 * phase;
      this.newFuse.position.x = 4.5 - 4.5 * ease(phase);
    }

    if (this.selected && this.selection.visible) this.selection.setFromObject(this.selected);
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.renderer.setAnimationLoop(null);
    this.resizeObserver?.disconnect();
    this.canvas.removeEventListener("pointerdown", this.boundPointerDown);
    this.canvas.removeEventListener("pointermove", this.boundPointerMove);
    this.canvas.removeEventListener("pointerup", this.boundPointerUp);
    this.canvas.removeEventListener("pointercancel", this.boundPointerUp);
    this.canvas.removeEventListener("wheel", this.boundWheel);
    this.canvas.removeEventListener("dblclick", this.boundDoubleClick);
    this.scene.traverse((object) => {
      object.geometry?.dispose?.();
      if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose?.());
      else object.material?.dispose?.();
    });
    this.renderer.dispose();
  }
}

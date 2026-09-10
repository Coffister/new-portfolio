import { useCursor } from "@/providers/CursorProvider";
import "./CircularGallery.css";
import {
  Camera,
  Mesh,
  Plane,
  Program,
  Renderer,
  Texture,
  Transform,
} from "ogl";
import { useEffect, useRef } from "react";

const CARD_WIDTH = 700;
const CARD_HEIGHT = 900;
const DESIGN_HEIGHT = 1600;

const CARD_GAP = 2;

// 0 = bez posunu
// vyššie číslo = celá galéria sa posunie nižšie
const VERTICAL_OFFSET = -0.25;

type GL = Renderer["gl"];

type GalleryFilter = "grayscale";

function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: number;
  return function (this: any, ...args: Parameters<T>) {
    window.clearTimeout(timeout);
    timeout = window.setTimeout(() => func.apply(this, args), wait);
  };
}

function lerp(p1: number, p2: number, t: number): number {
  return p1 + (p2 - p1) * t;
}

interface ScreenSize {
  width: number;
  height: number;
}

interface Viewport {
  width: number;
  height: number;
}

interface MediaProps {
  geometry: Plane;
  gl: GL;
  image: string;
  index: number;
  length: number;
  renderer: Renderer;
  scene: Transform;
  screen: ScreenSize;
  viewport: Viewport;
  bend: number;
  borderRadius?: number;
}

class Media {
  extra: number = 0;
  geometry: Plane;
  gl: GL;
  image: string;
  index: number;
  length: number;
  renderer: Renderer;
  scene: Transform;
  screen: ScreenSize;
  viewport: Viewport;
  bend: number;
  borderRadius: number;
  program!: Program;
  plane!: Mesh;
  scale!: number;
  padding!: number;
  width!: number;
  widthTotal!: number;
  x!: number;
  speed: number = 0;
  isBefore: boolean = false;
  isAfter: boolean = false;
  active: boolean = false;
  currentFilters: GalleryFilter[] = [];
  saturation: number = 1;
  saturationTarget: number = 1;
  saturationEase: number = 0.07;

  constructor({
    geometry,
    gl,
    image,
    index,
    length,
    renderer,
    scene,
    screen,
    viewport,
    bend,
    borderRadius = 0,
  }: MediaProps) {
    this.geometry = geometry;
    this.gl = gl;
    this.image = image;
    this.index = index;
    this.length = length;
    this.renderer = renderer;
    this.scene = scene;
    this.screen = screen;
    this.viewport = viewport;
    this.bend = bend;
    this.borderRadius = borderRadius;
    this.createShader();
    this.createMesh();
    this.onResize();
    this.saturation = 1;
  }

  createShader() {
    const texture = new Texture(this.gl, {
      generateMipmaps: true,
    });
    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          p.z = 0.0;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragment: `
precision highp float;

uniform vec2 uImageSizes;
uniform vec2 uPlaneSizes;
uniform sampler2D tMap;
uniform float uN;
uniform float uSaturation;

varying vec2 vUv;

float squircleSDF(vec2 p, float n) {
    vec2 q = abs(p * 2.0);

    return pow(
        pow(q.x, n) +
        pow(q.y, n),
        1.0 / n
    ) - 1.0;
}

void main() {
    vec2 ratio = vec2(
        min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
        min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
    );

    vec2 uv = vec2(
        vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
        vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );

    vec4 color = texture2D(tMap, uv);
    float gray = dot(
  color.rgb,
  vec3(0.299, 0.587, 0.114)
);

color.rgb = mix(
  vec3(gray),
  color.rgb,
  uSaturation
);

float d = squircleSDF(
    vUv - 0.5,
    uN
);

    float edgeSmooth = 0.0005;
    float alpha = 1.0 - smoothstep(-edgeSmooth, edgeSmooth, d);

    gl_FragColor = vec4(color.rgb, alpha);
}
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uN: {
          value: 5.5,
        },
        uSaturation: {
          value: 1,
        },
      },
      transparent: true,
    });
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = this.image;
    img.onload = () => {
      texture.image = img;
      this.program.uniforms.uImageSizes.value = [
        img.naturalWidth,
        img.naturalHeight,
      ];
    };
  }

  createMesh() {
    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program,
    });
    this.plane.setParent(this.scene);
  }

  setActive(active: boolean, filters: GalleryFilter[]) {
    this.active = active;
    this.currentFilters = filters;
    const grayscale = filters.includes("grayscale") && !active;
    this.saturationTarget = grayscale ? 0 : 1;
  }

  update(
    scroll: { current: number; last: number },
    direction: "right" | "left",
  ) {
    this.saturation = lerp(this.saturation, this.saturationTarget, this.saturationEase);
    if (this.program && this.program.uniforms.uSaturation) {
      this.program.uniforms.uSaturation.value = this.saturation;
    }
    this.plane.position.x = this.x - scroll.current - this.extra;

    const x = this.plane.position.x;
    const H = this.viewport.width / 2;

    if (this.bend === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      const B_abs = Math.abs(this.bend);
      const R = (H * H + B_abs * B_abs) / (2 * B_abs);
      const effectiveX = Math.min(Math.abs(x), H);

      const arc = R - Math.sqrt(R * R - effectiveX * effectiveX);
      const verticalOffset = this.plane.scale.y * VERTICAL_OFFSET;
      if (this.bend > 0) {
        this.plane.position.y = -arc + verticalOffset;
        this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R);
      } else {
        this.plane.position.y = arc + verticalOffset;
        this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R);
      }
    }

    this.speed = scroll.current - scroll.last;

    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;
    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset;
    if (direction === "right" && this.isBefore) {
      this.extra -= this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
    if (direction === "left" && this.isAfter) {
      this.extra += this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
  }

  onResize({
    screen,
    viewport,
  }: { screen?: ScreenSize; viewport?: Viewport } = {}) {
    if (screen) this.screen = screen;
    if (viewport) {
      this.viewport = viewport;
      if (this.plane.program.uniforms.uViewportSizes) {
        this.plane.program.uniforms.uViewportSizes.value = [
          this.viewport.width,
          this.viewport.height,
        ];
      }
    }
    this.scale = this.screen.height / DESIGN_HEIGHT;

    this.plane.scale.y =
      (this.viewport.height * (CARD_HEIGHT * this.scale)) / this.screen.height;

    this.plane.scale.x =
      (this.viewport.width * (CARD_WIDTH * this.scale)) / this.screen.width;
    this.plane.program.uniforms.uPlaneSizes.value = [
      this.plane.scale.x,
      this.plane.scale.y,
    ];
    this.padding = CARD_GAP;
    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
  }
}

interface AppConfig {
  items?: { image: string }[];
  bend?: number;
  borderRadius?: number;
  scrollSpeed?: number;
  scrollEase?: number;
  inactiveFilters?: GalleryFilter[];

  onActiveChange?: (index: number) => void;
}

class App {
  container: HTMLElement;
  scrollSpeed: number;
  scroll: {
    ease: number;
    current: number;
    target: number;
    last: number;
    position?: number;
  };
  onActiveChange?: (index: number) => void;
  inactiveFilters: GalleryFilter[] = [];
  onCheckDebounce: (...args: any[]) => void;
  renderer!: Renderer;
  gl!: GL;
  camera!: Camera;
  scene!: Transform;
  planeGeometry!: Plane;
  medias: Media[] = [];
  originalLength = 0;
  lastActiveIndex = -1;
  mediasImages: { image: string }[] = [];
  screen!: { width: number; height: number };
  viewport!: { width: number; height: number };
  raf: number = 0;
  hoveredIndex: number | null = null;
  visible: boolean = true;
  visibilityObserver: IntersectionObserver | null = null;

  boundOnResize!: () => void;
  boundOnWheel!: (e: Event) => void;
  boundOnTouchDown!: (e: MouseEvent | TouchEvent) => void;
  boundOnTouchMove!: (e: MouseEvent | TouchEvent) => void;
  boundOnTouchUp!: () => void;
  boundOnKeyDown!: (e: KeyboardEvent) => void;

  isDown: boolean = false;
  start: number = 0;
  mouse = {
    x: 0,
    y: 0,
  };

  constructor(
    container: HTMLElement,
    {
      items,
      bend = 3,
      borderRadius = 0,
      scrollSpeed = 2,
      scrollEase = 0.5,
      inactiveFilters = ["grayscale"],
      onActiveChange,
    }: AppConfig,
  ) {
    document.documentElement.classList.remove("no-js");
    this.container = container;
    this.scrollSpeed = scrollSpeed;
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
    this.onCheckDebounce = debounce(this.onCheck.bind(this), 200);
    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.onResize();
    this.createGeometry();
    this.createMedias(items, bend, borderRadius);
    this.inactiveFilters = inactiveFilters;
    this.onActiveChange = onActiveChange;
    this.addEventListeners();
    this.update();
  }

  createRenderer() {
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    this.container.appendChild(this.renderer.gl.canvas as HTMLCanvasElement);
  }

  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }

  createScene() {
    this.scene = new Transform();
  }

  createGeometry() {
    this.planeGeometry = new Plane(this.gl, {
      heightSegments: 1,
      widthSegments: 1,
    });
  }

  createMedias(
    items: { image: string }[] | undefined,
    bend: number,
    borderRadius: number,
  ) {
    const defaultItems = [
      {
        image: `https://picsum.photos/seed/1/800/600?grayscale`,
        text: "Bridge",
      },
      {
        image: `https://picsum.photos/seed/2/800/600?grayscale`,
        text: "Desk Setup",
      },
      {
        image: `https://picsum.photos/seed/3/800/600?grayscale`,
        text: "Waterfall",
      },
      {
        image: `https://picsum.photos/seed/4/800/600?grayscale`,
        text: "Strawberries",
      },
      {
        image: `https://picsum.photos/seed/5/800/600?grayscale`,
        text: "Deep Diving",
      },
      {
        image: `https://picsum.photos/seed/16/800/600?grayscale`,
        text: "Train Track",
      },
      {
        image: `https://picsum.photos/seed/17/800/600?grayscale`,
        text: "Santorini",
      },
      {
        image: `https://picsum.photos/seed/8/800/600?grayscale`,
        text: "Blurry Lights",
      },
      {
        image: `https://picsum.photos/seed/9/800/600?grayscale`,
        text: "New York",
      },
      {
        image: `https://picsum.photos/seed/10/800/600?grayscale`,
        text: "Good Boy",
      },
      {
        image: `https://picsum.photos/seed/21/800/600?grayscale`,
        text: "Coastline",
      },
      {
        image: `https://picsum.photos/seed/12/800/600?grayscale`,
        text: "Palm Trees",
      },
    ];
    const galleryItems = items && items.length ? items : defaultItems;
    this.originalLength = galleryItems.length;
    this.mediasImages = galleryItems.concat(galleryItems);
    this.medias = this.mediasImages.map((data, index) => {
      return new Media({
        geometry: this.planeGeometry,
        gl: this.gl,
        image: data.image,
        index,
        length: this.mediasImages.length,
        renderer: this.renderer,
        scene: this.scene,
        screen: this.screen,
        viewport: this.viewport,
        bend,
        borderRadius,
      });
    });
  }

  onTouchDown(e: MouseEvent | TouchEvent) {
    this.isDown = true;
    this.scroll.position = this.scroll.current;
    this.start = "touches" in e ? e.touches[0].clientX : e.clientX;
  }

  onTouchMove(e: MouseEvent | TouchEvent) {
    const x = "touches" in e ? e.touches[0].clientX : e.clientX;
    const y = "touches" in e ? e.touches[0].clientY : e.clientY;

    this.mouse.x = x;
    this.mouse.y = y;

    if (!this.isDown) return;
    const distance = (this.start - x) * (this.scrollSpeed * 0.025);
    this.scroll.target = (this.scroll.position ?? 0) + distance;
  }

  onTouchUp() {
    this.isDown = false;
    this.onCheck();
  }

  onWheel(e: Event) {
    const wheelEvent = e as WheelEvent;
    const delta =
      wheelEvent.deltaY ||
      (wheelEvent as any).wheelDelta ||
      (wheelEvent as any).detail;
    this.scroll.target +=
      (delta > 0 ? this.scrollSpeed : -this.scrollSpeed) * 0.2;
    this.onCheckDebounce();
  }

  onKeyDown(e: KeyboardEvent) {
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        this.scroll.target += this.scrollSpeed * 5;
        this.onCheckDebounce();
        break;

      case "ArrowLeft":
        e.preventDefault();
        this.scroll.target -= this.scrollSpeed * 5;
        this.onCheckDebounce();
        break;

      default:
        break;
    }
  }

  onCheck() {
    if (!this.medias || !this.medias[0]) return;
    const width = this.medias[0].width;
    const itemIndex = Math.round(Math.abs(this.scroll.target) / width);
    const item = width * itemIndex;
    this.scroll.target = this.scroll.target < 0 ? -item : item;
  }

  onResize() {
    this.screen = {
      width: this.container.clientWidth,
      height: this.container.clientHeight,
    };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({
      aspect: this.screen.width / this.screen.height,
    });
    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.viewport = { width, height };
    if (this.medias) {
      this.medias.forEach((media) =>
        media.onResize({ screen: this.screen, viewport: this.viewport }),
      );
    }
  }

  update() {
    // Pause the WebGL render loop entirely while the gallery is off-screen.
    if (!this.visible) {
      this.raf = 0;
      return;
    }

    this.scroll.current = lerp(
      this.scroll.current,
      this.scroll.target,
      this.scroll.ease,
    );
    const direction = this.scroll.current > this.scroll.last ? "right" : "left";
    if (this.medias) {
      this.medias.forEach((media) => media.update(this.scroll, direction));
    }
    this.renderer.render({ scene: this.scene, camera: this.camera });
    if (this.medias.length > 0) {
      let closestIndex = 0;
      let closestDistance = Infinity;

      this.medias.forEach((media, index) => {
        const distance = Math.abs(media.plane.position.x);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      const activeIndex = closestIndex % this.originalLength;

      this.medias.forEach((media, index) => {
        const isActive = index % this.originalLength === activeIndex;
        media.setActive(isActive, this.inactiveFilters);
      });

      if (activeIndex !== this.lastActiveIndex) {
        this.lastActiveIndex = activeIndex;
        if (this.onActiveChange) {
          this.onActiveChange(activeIndex);
        }
      }
    }
    this.scroll.last = this.scroll.current;
    this.raf = window.requestAnimationFrame(this.update.bind(this));
    
  }

  addEventListeners() {
    this.boundOnResize = this.onResize.bind(this);
    this.boundOnWheel = this.onWheel.bind(this);
    this.boundOnTouchDown = this.onTouchDown.bind(this);
    this.boundOnTouchMove = this.onTouchMove.bind(this);
    this.boundOnTouchUp = this.onTouchUp.bind(this);
    this.boundOnKeyDown = this.onKeyDown.bind(this);

    // Resize stays global; every interaction listener is scoped so the gallery
    // only reacts to gestures that start on its own canvas — it must never
    // hijack page scrolling or text selection elsewhere on the site.
    window.addEventListener("resize", this.boundOnResize);
    this.container.addEventListener("mousewheel", this.boundOnWheel, { passive: true });
    this.container.addEventListener("wheel", this.boundOnWheel, { passive: true });
    this.container.addEventListener("mousedown", this.boundOnTouchDown);
    this.container.addEventListener("touchstart", this.boundOnTouchDown, { passive: true });
    // Move/up are on window so a drag that leaves the canvas still tracks and
    // releases — both handlers no-op unless a drag is actually in progress.
    window.addEventListener("mousemove", this.boundOnTouchMove);
    window.addEventListener("mouseup", this.boundOnTouchUp);
    window.addEventListener("touchmove", this.boundOnTouchMove, { passive: true });
    window.addEventListener("touchend", this.boundOnTouchUp);

    this.container.addEventListener("keydown", this.boundOnKeyDown);

    if ("IntersectionObserver" in window) {
      this.visibilityObserver = new IntersectionObserver(
        (entries) => {
          const wasVisible = this.visible;
          this.visible = entries[0]?.isIntersecting ?? true;
          if (this.visible && !wasVisible && this.raf === 0) {
            this.update();
          }
        },
        { rootMargin: "200px" },
      );
      this.visibilityObserver.observe(this.container);
    }
  }

  destroy() {
    window.cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.visibilityObserver?.disconnect();
    this.visibilityObserver = null;
    window.removeEventListener("resize", this.boundOnResize);
    this.container.removeEventListener("mousewheel", this.boundOnWheel);
    this.container.removeEventListener("wheel", this.boundOnWheel);
    this.container.removeEventListener("mousedown", this.boundOnTouchDown);
    this.container.removeEventListener("touchstart", this.boundOnTouchDown);
    window.removeEventListener("mousemove", this.boundOnTouchMove);
    window.removeEventListener("mouseup", this.boundOnTouchUp);
    window.removeEventListener("touchmove", this.boundOnTouchMove);
    window.removeEventListener("touchend", this.boundOnTouchUp);
    if (
      this.renderer &&
      this.renderer.gl &&
      this.renderer.gl.canvas.parentNode
    ) {
      this.renderer.gl.canvas.parentNode.removeChild(
        this.renderer.gl.canvas as HTMLCanvasElement,
      );
    }
    if (this.container) {
      this.container.removeEventListener("keydown", this.boundOnKeyDown);
    }
  }
}

export interface CircularGalleryItem {
  image: string;
  title: string;
}

interface CircularGalleryProps {
  items: CircularGalleryItem[];
  onActiveChange?: (index: number) => void;

  bend?: number;
  borderRadius?: number;

  scrollSpeed?: number;
  scrollEase?: number;
}

export default function CircularGallery({
  items,
  onActiveChange,
  bend = -3,
  borderRadius = 0.05,
  scrollSpeed = 2,
  scrollEase = 0.05,
}: CircularGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setVariant } = useCursor();

  useEffect(() => {
    if (!containerRef.current) return;

    const app = new App(containerRef.current, {
      items,
      bend,
      borderRadius,
      scrollSpeed,
      scrollEase,
      onActiveChange,
    });

    return () => {
      app.destroy();
    };
  }, [items, bend, borderRadius, scrollSpeed, scrollEase, onActiveChange]);
  return (
    <div
      className="circular-gallery"
      ref={containerRef}
      tabIndex={0}
      onMouseEnter={() => setVariant("drag")}
      onMouseLeave={() => setVariant("default")}
      role="region"
      aria-label="Circular image gallery. Use Left and Right Arrow keys to navigate."
    />
  );
}

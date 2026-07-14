import "./style.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

initColorField();
initHeroBurst();
initAngles();
initWhy();

function initHeroBurst() {
  const letters = gsap.utils.toArray(".logo-burst__letter");
  const tag = document.querySelector(".hero__tag");
  const hint = document.querySelector(".scroll-hint");

  gsap.set(letters, { transformOrigin: "50% 50%" });

  if (reduceMotion) {
    gsap.set(letters, {
      x: (i, el) => Number(el.dataset.dx) * 0.35,
      y: (i, el) => Number(el.dataset.dy) * 0.35,
      rotation: (i, el) => Number(el.dataset.rot) * 0.5,
      opacity: 0.35,
      filter: "blur(4px)",
    });
    return;
  }

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: "#hero",
      start: "top top",
      end: "bottom top",
      scrub: 1.1,
    },
  });

  letters.forEach((letter) => {
    const dx = Number(letter.dataset.dx);
    const dy = Number(letter.dataset.dy);
    const rot = Number(letter.dataset.rot);
    tl.to(
      letter,
      {
        x: dx,
        y: dy,
        rotation: rot,
        opacity: 0,
        filter: "blur(10px)",
        ease: "none",
      },
      0
    );
  });

  tl.to(tag, { opacity: 0, y: -40, ease: "none" }, 0);
  tl.to(hint, { opacity: 0, y: 20, ease: "none" }, 0);
}

function initAngles() {
  const stage = document.querySelector(".angles__stage");
  if (!stage) return;

  const shots = gsap.utils.toArray(".shot");
  const specs = gsap.utils.toArray(".spec");
  const wires = gsap.utils.toArray(".wire");

  gsap.set(shots, { opacity: 0, y: 60, scale: 0.94 });
  if (!reduceMotion) {
    gsap.set(specs, { opacity: 0, y: 28 });
  }

  const desktop = window.matchMedia("(min-width: 901px)").matches;

  const intro = gsap.timeline({
    scrollTrigger: {
      trigger: "#angles",
      start: "top 70%",
      end: "top 20%",
      toggleActions: reduceMotion ? "play none none none" : "play none none reverse",
    },
  });

  intro.to(shots, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 1,
    stagger: 0.18,
    ease: "power3.out",
  });

  if (desktop && !reduceMotion) {
    wires.forEach((wire, i) => {
      const length = wire.getTotalLength();
      gsap.set(wire, {
        strokeDasharray: length,
        strokeDashoffset: length,
        opacity: 1,
      });
      intro.to(
        wire,
        {
          strokeDashoffset: 0,
          duration: 1.1,
          ease: "power2.out",
        },
        0.35 + i * 0.2
      );
    });

    intro.to(
      specs,
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.16,
        ease: "power2.out",
      },
      0.7
    );
  } else {
    gsap.set(specs, { clearProps: "all" });
    gsap.set(wires, { opacity: 0 });
  }
}

function initWhy() {
  const lines = gsap.utils.toArray(".float-line");
  const blocks = gsap.utils.toArray(".float-block");
  const cta = document.querySelector(".cta");

  if (reduceMotion) {
    gsap.set([lines, blocks, cta], { opacity: 1, y: 0 });
    return;
  }

  gsap
    .timeline({
      scrollTrigger: {
        trigger: "#why",
        start: "top 65%",
        end: "top 15%",
        toggleActions: "play none none reverse",
      },
    })
    .to(lines, {
      opacity: 1,
      y: 0,
      duration: 0.85,
      stagger: 0.12,
      ease: "power3.out",
    })
    .to(
      blocks,
      {
        opacity: 1,
        y: 0,
        duration: 0.75,
        stagger: 0.14,
        ease: "power2.out",
      },
      "-=0.35"
    )
    .to(
      cta,
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
      },
      "-=0.2"
    );
}

function initColorField() {
  const canvas = document.getElementById("fx-canvas");
  const wash = document.querySelector(".color-wash");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0;
  let height = 0;
  let raf = 0;
  let scrollP = 0;

  const blobs = Array.from({ length: 7 }, (_, i) => ({
    x: Math.random(),
    y: Math.random(),
    r: 0.18 + Math.random() * 0.22,
    speed: 0.08 + Math.random() * 0.12,
    phase: Math.random() * Math.PI * 2,
    hue: [190, 320, 40, 95, 265, 150, 10][i],
  }));

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw(time) {
    const t = time * 0.001;
    ctx.clearRect(0, 0, width, height);

    const base = `hsla(${200 + scrollP * 80}, 40%, 6%, 1)`;
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = "lighter";
    blobs.forEach((b, i) => {
      const drift = Math.sin(t * b.speed + b.phase);
      const x = (b.x + Math.cos(t * b.speed * 0.7 + i) * 0.08 + scrollP * 0.15) * width;
      const y = (b.y + drift * 0.06 + Math.sin(scrollP * Math.PI + i) * 0.08) * height;
      const radius = Math.max(width, height) * b.r;
      const hue = (b.hue + scrollP * 120 + t * 8) % 360;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0, `hsla(${hue}, 95%, 62%, 0.38)`);
      grad.addColorStop(0.45, `hsla(${(hue + 40) % 360}, 90%, 55%, 0.16)`);
      grad.addColorStop(1, "hsla(0, 0%, 0%, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // soft scan streaks
    ctx.globalCompositeOperation = "screen";
    for (let i = 0; i < 3; i++) {
      const y = ((t * (20 + i * 12) + i * 180 + scrollP * height) % (height + 120)) - 60;
      const streak = ctx.createLinearGradient(0, y, width, y + 40);
      streak.addColorStop(0, "rgba(0,0,0,0)");
      streak.addColorStop(0.5, `hsla(${(160 + i * 70 + scrollP * 90) % 360}, 100%, 70%, 0.08)`);
      streak.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = streak;
      ctx.fillRect(0, y, width, 48);
    }

    ctx.globalCompositeOperation = "source-over";
    raf = requestAnimationFrame(draw);
  }

  ScrollTrigger.create({
    trigger: document.body,
    start: "top top",
    end: "bottom bottom",
    scrub: true,
    onUpdate: (self) => {
      scrollP = self.progress;
      if (wash) {
        wash.style.setProperty("--scroll-hue", String(Math.round(self.progress * 220)));
      }
    },
  });

  resize();
  window.addEventListener("resize", () => {
    resize();
    ScrollTrigger.refresh();
  });

  if (reduceMotion) {
    ctx.fillStyle = "#0b0a12";
    ctx.fillRect(0, 0, width, height);
    return;
  }

  raf = requestAnimationFrame(draw);

  window.addEventListener("pagehide", () => cancelAnimationFrame(raf), { once: true });
}

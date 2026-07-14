import "./style.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const host = document.getElementById("brand-flight");
const letters = gsap.utils.toArray(".flight-letter:not(.flight-letter--spark)");

const BURST = [
  { x: -300, y: -340, rot: -52, s: 0.5 },
  { x: 20, y: -400, rot: 16, s: 0.62 },
  { x: 340, y: -280, rot: 48, s: 0.48 },
  { x: -360, y: 140, rot: -66, s: 0.58 },
  { x: 320, y: 250, rot: 58, s: 0.5 },
  { x: -20, y: 380, rot: -26, s: 0.68 },
];

const sparks = [];

initSparks();
placeLetters(getHeroOffsets());
initLetterJourney();
initBridge();
initAngles();
initWhy();

window.addEventListener("resize", () => {
  if (window.scrollY < 40) placeLetters(getHeroOffsets());
  ScrollTrigger.refresh();
});

function heroGap() {
  return Math.min(window.innerWidth * 0.115, 150);
}

function assembleGap() {
  return Math.min(window.innerWidth * 0.028, 26);
}

function getHeroOffsets() {
  const gap = heroGap();
  const total = gap * (letters.length - 1);
  return letters.map((_, i) => ({
    x: -total / 2 + i * gap,
    y: 0,
    rotation: 0,
    scale: 1,
    opacity: 1,
  }));
}

function getAssembleOffsets() {
  const gap = assembleGap();
  const total = gap * (letters.length - 1);
  // Match the assemble mark position: upper area of assemble section, not viewport center forever
  const mark = document.getElementById("assemble-mark");
  let y = -80;
  if (mark) {
    const rect = mark.getBoundingClientRect();
    y = rect.top + rect.height * 0.28 - window.innerHeight / 2;
  }
  return letters.map((_, i) => ({
    x: -total / 2 + i * gap,
    y,
    rotation: 0,
    scale: 0.2,
    opacity: 1,
  }));
}

function placeLetters(offsets) {
  if (!host) return;
  host.classList.remove("is-done");
  gsap.set(host, { display: "block", opacity: 1, visibility: "visible" });

  letters.forEach((letter, i) => {
    const o = offsets[i];
    gsap.set(letter, {
      position: "absolute",
      left: "50%",
      top: "50%",
      xPercent: -50,
      yPercent: -50,
      x: o.x,
      y: o.y,
      rotation: o.rotation,
      scale: o.scale,
      opacity: o.opacity,
      transformOrigin: "50% 50%",
    });
  });
}

function hideFlightLayer() {
  if (!host) return;
  gsap.set([letters, sparks], { opacity: 0 });
  host.classList.add("is-done");
}

function showFlightLayer() {
  if (!host) return;
  host.classList.remove("is-done");
  gsap.set(host, { opacity: 1, visibility: "visible" });
}

function initSparks() {
  if (!host || reduceMotion) return;

  letters.forEach((letter) => {
    const spark = letter.cloneNode(true);
    spark.classList.add("flight-letter--spark");
    spark.setAttribute("aria-hidden", "true");
    host.appendChild(spark);
    sparks.push(spark);
    gsap.set(spark, {
      position: "absolute",
      left: "50%",
      top: "50%",
      xPercent: -50,
      yPercent: -50,
      x: 0,
      y: 0,
      opacity: 0,
      scale: 0.35,
      transformOrigin: "50% 50%",
    });
  });
}

function initLetterJourney() {
  const tag = document.querySelector(".hero__tag");
  const hint = document.querySelector(".scroll-hint");
  const mark = document.querySelector(".assemble__mark");
  const model = document.querySelector(".assemble__model");
  const rule = document.querySelector(".assemble__rule");
  const brandText = document.querySelector(".assemble__brand");

  if (reduceMotion) {
    hideFlightLayer();
    gsap.set(mark, { opacity: 1 });
    gsap.set([brandText, model], { opacity: 1, y: 0 });
    gsap.set(rule, { scaleX: 1 });
    return;
  }

  gsap.set(brandText, { opacity: 0 });
  gsap.set(model, { opacity: 0, y: 12 });
  gsap.set(rule, { scaleX: 0 });
  gsap.set(mark, { opacity: 1 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: "#hero",
      start: "top top",
      endTrigger: "#assemble",
      end: "top 35%",
      scrub: 1.05,
      invalidateOnRefresh: true,
      onEnter: showFlightLayer,
      onEnterBack: showFlightLayer,
      onLeave: () => {
        hideFlightLayer();
      },
      onLeaveBack: showFlightLayer,
    },
  });

  // Phase 1 — firework burst
  letters.forEach((letter, i) => {
    const b = BURST[i];
    tl.fromTo(
      letter,
      {
        x: () => getHeroOffsets()[i].x,
        y: 0,
        rotation: 0,
        scale: 1,
        opacity: 1,
      },
      {
        x: () => getHeroOffsets()[i].x + b.x,
        y: b.y,
        rotation: b.rot,
        scale: b.s,
        ease: "none",
      },
      0
    );
  });

  sparks.forEach((spark, i) => {
    const angle = (i / sparks.length) * Math.PI * 2 + 0.35;
    const dist = 380 + (i % 3) * 90;
    tl.fromTo(
      spark,
      { x: 0, y: 0, opacity: 0, scale: 0.25, rotation: 0 },
      {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        opacity: 0.9,
        scale: 0.38,
        rotation: (i % 2 === 0 ? 1 : -1) * (100 + i * 20),
        ease: "none",
      },
      0.04
    );
    tl.to(spark, { opacity: 0, scale: 0.12, ease: "none" }, 0.3);
  });

  tl.to(tag, { opacity: 0, y: -20, ease: "none" }, 0);
  tl.to(hint, { opacity: 0, ease: "none" }, 0);
  tl.to(letters, { opacity: 0.4, ease: "none", duration: 0.1 }, 0.24);

  // Phase 2 — gather above assemble mark, then hard handoff
  letters.forEach((letter, i) => {
    tl.to(
      letter,
      {
        x: () => getAssembleOffsets()[i].x,
        y: () => getAssembleOffsets()[i].y,
        rotation: 0,
        scale: 0.2,
        opacity: 1,
        ease: "none",
      },
      0.4
    );
  });

  tl.to(letters, { opacity: 0, duration: 0.08, ease: "none" }, 0.82);
  tl.to(sparks, { opacity: 0, duration: 0.05, ease: "none" }, 0.82);
  tl.to(brandText, { opacity: 1, duration: 0.08, ease: "none" }, 0.82);
  tl.to(model, { opacity: 1, y: 0, duration: 0.1, ease: "none" }, 0.86);
  tl.to(rule, { scaleX: 1, duration: 0.08, ease: "none" }, 0.9);
  tl.add(() => hideFlightLayer(), 0.95);
}

function initBridge() {
  const bridge = document.getElementById("bridge");
  if (!bridge) return;

  if (reduceMotion) {
    gsap.set(bridge, { opacity: 1, y: 0 });
    return;
  }

  gsap.fromTo(
    bridge,
    { opacity: 0, y: 28 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: "#assemble",
        start: "top 45%",
        toggleActions: "play none none reverse",
      },
    }
  );
}

function initAngles() {
  const shots = gsap.utils.toArray(".shot");
  const specs = gsap.utils.toArray(".spec");
  const wires = gsap.utils.toArray(".wire");

  gsap.set(shots, { opacity: 0, y: 40 });
  if (!reduceMotion) gsap.set(specs, { opacity: 0, y: 20 });

  const desktop = window.matchMedia("(min-width: 901px)").matches;

  const intro = gsap.timeline({
    scrollTrigger: {
      trigger: "#angles",
      start: "top 72%",
      toggleActions: reduceMotion ? "play none none none" : "play none none reverse",
    },
  });

  intro.to(shots, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.14,
    ease: "power2.out",
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
          duration: 0.9,
          ease: "power1.out",
        },
        0.3 + i * 0.15
      );
    });

    intro.to(
      specs,
      {
        opacity: 1,
        y: 0,
        duration: 0.65,
        stagger: 0.12,
        ease: "power2.out",
      },
      0.55
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
        start: "top 68%",
        toggleActions: "play none none reverse",
      },
    })
    .to(lines, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      stagger: 0.1,
      ease: "power2.out",
    })
    .to(
      blocks,
      {
        opacity: 1,
        y: 0,
        duration: 0.65,
        stagger: 0.12,
        ease: "power2.out",
      },
      "-=0.3"
    )
    .to(
      cta,
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
      },
      "-=0.2"
    );
}

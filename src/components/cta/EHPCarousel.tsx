"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";

/* ══════════════════════════════════════════════════
   DATA
══════════════════════════════════════════════════ */
const HERO_SLIDES = [
  {
    id: "pentest",
    title: "Simulateurs\nd'Examens.",
    desc: "Préparez vos certifications de cybersécurité (CEH, OSCP, CompTIA) avec nos simulateurs d'examens réalistes.",
    image: "/ehp-banner.jpg",
    link: "https://ethicalhackerprep.com",
    badge: "Red Team",
  },
  {
    id: "defense",
    title: "Cyber\nDéfense.",
    desc: "Entraînez-vous dans des conditions réelles d'examen. Identifiez vos faiblesses et réussissez du premier coup.",
    image: "/cyber_blue_1786618884481.jpg",
    link: "https://ethicalhackerprep.com",
    badge: "Blue Team",
  },
  {
    id: "bounty",
    title: "Tests\nPratiques.",
    desc: "Plongez dans des scénarios techniques complexes. Bug Bounty, Pentest, et sécurité des applications Web.",
    image: "/cyber_web_1786618911810.jpg",
    link: "https://ethicalhackerprep.com",
    badge: "Web Sec",
  },
  {
    id: "osint",
    title: "OSINT &\nRenseignement.",
    desc: "Collectez et analysez des informations en source ouverte. Des questions d'examen basées sur des cas réels.",
    image: "/cyber_osint_1786618931736.jpg",
    link: "https://ethicalhackerprep.com",
    badge: "OSINT",
  },
  {
    id: "cloud",
    title: "Sécurité\nCloud.",
    desc: "Auditez et sécurisez les environnements AWS, Azure et GCP. Préparez les certifications Cloud Security les plus demandées.",
    image: "/cyber_cloud_1786618962677.jpg",
    link: "https://ethicalhackerprep.com",
    badge: "Cloud Sec",
  },
];

const BOTTOM_CARDS = [
  { id: "cert-oscp",  label: "Simulation d'Examen", title: "Préparation OSCP",  image: "/ehp-banner.jpg", link: "https://ethicalhackerprep.com" },
  { id: "cert-ceh",   label: "Simulation d'Examen", title: "Formation CEH v12", image: "/cyber_blue_1786618884481.jpg", link: "https://ethicalhackerprep.com" },
  { id: "labs-pro",   label: "Pratique",      title: "Labs Dédiés",       image: "/cyber_web_1786618911810.jpg", link: "https://ethicalhackerprep.com" },
  { id: "comptia-sec",label: "Simulation d'Examen", title: "CompTIA Security+", image: "/cyber_osint_1786618931736.jpg", link: "https://ethicalhackerprep.com" },
  { id: "reverse",    label: "Spécialité",    title: "Reverse Engineering",image:"/cyber_cloud_1786618962677.jpg", link: "https://ethicalhackerprep.com" },
];

const AUTOPLAY_MS = 5000;
const TICK_MS = 16;

/* ══════════════════════════════════════════════════
   HOOK - Drag to Scroll
══════════════════════════════════════════════════ */
function useDragToScroll(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onMouseDown = (e: MouseEvent) => {
      setIsDragging(true);
      startXRef.current = e.pageX - container.offsetLeft;
      scrollLeftRef.current = container.scrollLeft;
      container.style.cursor = "grabbing";
      container.style.userSelect = "none";
      e.preventDefault();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startXRef.current) * 1;
      container.scrollLeft = scrollLeftRef.current - walk;
    };

    const onMouseUp = () => {
      setIsDragging(false);
      if (container) {
        container.style.cursor = "grab";
        container.style.userSelect = "auto";
      }
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging, containerRef]);

  return { isDragging };
}

/* ══════════════════════════════════════════════════
   SUB-COMPONENT — Hero Slide Card
══════════════════════════════════════════════════ */
type Slide = typeof HERO_SLIDES[0];

function SlideCard({
  slide, isActive, slideW, slideH, progress, priority, onClick,
}: {
  slide: Slide;
  isActive: boolean;
  slideW: number;
  slideH: number;
  progress: number;
  priority: boolean;
  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <Link
      href={slide.link}
      onClick={onClick}
      draggable={false}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "block",
        width: `${slideW}px`,
        height: `${slideH}px`,
        borderRadius: "0px",
        overflow: "hidden",
        position: "relative",
        flexShrink: 0,
      }}
    >
      <img
        src={slide.image}
        alt={slide.title}
        loading={priority ? "eager" : "lazy"}
        draggable={false}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 10,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0) 28%, rgba(0,0,0,0.2) 48%, rgba(10,10,10,0.85) 85%, rgba(10,10,10,1) 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          zIndex: 20,
          padding: "26px 28px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          opacity: isActive ? 1 : 0,
          transition: "opacity 0.3s ease",
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#c9a96e",
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(201,169,110,0.25)",
            borderRadius: "100px",
            padding: "5px 14px",
            display: "inline-block",
          }}
        >
          {slide.badge}
        </span>
      </div>

      <motion.div
        initial={false}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
        transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1], delay: isActive ? 0.05 : 0 }}
        style={{
          position: "absolute",
          left: 0, right: 0, bottom: 0,
          zIndex: 20,
          padding: "0 28px 34px",
          pointerEvents: isActive ? "auto" : "none",
        }}
      >
        <h3
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: "clamp(38px, 7.8vw, 92px)",
            fontWeight: 700,
            color: "white",
            lineHeight: 0.92,
            letterSpacing: "-0.02em",
            marginBottom: "13px",
            whiteSpace: "pre-line",
            textShadow: "0 4px 48px rgba(0,0,0,0.80)",
          }}
        >
          {slide.title}
        </h3>

        <p
          style={{
            fontSize: "14px",
            color: "rgba(255,255,255,0.7)",
            lineHeight: 1.58,
            marginBottom: "20px",
            maxWidth: "460px",
          }}
        >
          {slide.desc}
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "10px 22px",
              background: "#c9a96e",
              color: "#0a0a0a",
              borderRadius: "100px",
              fontSize: "14px",
              fontWeight: 700,
              letterSpacing: "0.05em",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            Découvrir
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "14px",
              color: "#c9a96e",
              fontWeight: 500,
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            En savoir plus
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path
                d="M2 5.5h7M6.5 3l2.5 2.5L6.5 8"
                stroke="currentColor"
                strokeWidth="1.35"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </motion.div>

      {isActive && (
        <div
          style={{
            position: "absolute",
            bottom: 0, left: 0, right: 0,
            height: "3px",
            background: "rgba(255,255,255,0.05)",
            zIndex: 30,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "#c9a96e",
              transition: "none",
            }}
          />
        </div>
      )}
    </Link>
  );
}

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
export function EHPCarousel() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView   = useInView(sectionRef, { once: true, margin: "-5% 0px" });
  
  const heroContainerRef = useRef<HTMLDivElement>(null);
  const bottomContainerRef = useRef<HTMLDivElement>(null);

  const [heroIdx, setHeroIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [cw, setCw] = useState(0);
  const [vh, setVh] = useState(0);

  const { isDragging: isHeroDragging } = useDragToScroll(heroContainerRef);
  const { isDragging: isBottomDragging } = useDragToScroll(bottomContainerRef);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playRef = useRef(true);
  const idxRef = useRef(0);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { playRef.current = playing; }, [playing]);
  useEffect(() => { idxRef.current = heroIdx; }, [heroIdx]);

  useEffect(() => {
    const measure = () => {
      if (sectionRef.current) {
        setCw(sectionRef.current.offsetWidth);
        setVh(window.innerHeight);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (sectionRef.current) ro.observe(sectionRef.current);
    return () => ro.disconnect();
  }, []);

  /* ── Layout constants ── */
  const heroSlideW   = Math.round(cw * 0.82);
  const heroSlideH   = Math.max(500, Math.round(vh * 0.85)); // 85vh to leave room
  const heroGap      = 15;
  const heroSidePad  = Math.max(0, Math.round((cw - heroSlideW) / 2));

  const bottomSlideW  = Math.round((cw - 45) / 3.3);
  const bottomSlideH  = Math.round(bottomSlideW * 0.60);
  const bottomGap     = 12;
  const bottomSidePad = 20;

  // Observer pour détecter le slide actif
  useEffect(() => {
    const container = heroContainerRef.current;
    if (!container) return;

    const updateActiveIndex = () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      
      scrollTimeoutRef.current = setTimeout(() => {
        const scrollLeft = container.scrollLeft;
        const containerWidth = container.clientWidth;
        const slidesContainer = container.children[0] as HTMLElement;
        if (!slidesContainer) return;
        
        const slides = Array.from(slidesContainer.children);
        
        for (let i = 0; i < slides.length; i++) {
          const slide = slides[i] as HTMLElement;
          const slideLeft = slide.offsetLeft;
          const slideRight = slideLeft + slide.offsetWidth;
          const viewportCenter = scrollLeft + containerWidth / 2;
          
          if (viewportCenter >= slideLeft && viewportCenter <= slideRight) {
            if (i !== heroIdx) {
              setHeroIdx(i);
              if (playRef.current) {
                clearTimers();
                startCycle(i);
              }
            }
            break;
          }
        }
      }, 100);
    };

    container.addEventListener("scroll", updateActiveIndex);
    updateActiveIndex();
    
    return () => {
      container.removeEventListener("scroll", updateActiveIndex);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [heroIdx]);

  const clearTimers = useCallback(() => {
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
    if (autoRef.current) { clearTimeout(autoRef.current); autoRef.current = null; }
  }, []);

  const startCycle = useCallback((idx: number) => {
    clearTimers();
    setProgress(0);
    
    tickRef.current = setInterval(() => {
      if (!playRef.current) return;
      setProgress(p => Math.min(p + (TICK_MS / AUTOPLAY_MS) * 100, 100));
    }, TICK_MS);
    
    autoRef.current = setTimeout(() => {
      if (!playRef.current) return;
      const next = (idx + 1) % HERO_SLIDES.length;
      
      // Hero scroll
      const heroContainer = heroContainerRef.current;
      if (heroContainer) {
        const heroSlidesContainer = heroContainer.children[0] as HTMLElement;
        if (heroSlidesContainer && heroSlidesContainer.children[next]) {
          const targetSlide = heroSlidesContainer.children[next] as HTMLElement;
          heroContainer.scrollTo({
            left: targetSlide.offsetLeft,
            behavior: "smooth"
          });
        }
      }
      
      // Bottom cards scroll - MAINTENANT SYNCHRONISÉ
      const bottomContainer = bottomContainerRef.current;
      if (bottomContainer) {
        const bottomSlidesContainer = bottomContainer.children[0] as HTMLElement;
        if (bottomSlidesContainer && bottomSlidesContainer.children[next]) {
          const targetBottomSlide = bottomSlidesContainer.children[next] as HTMLElement;
          bottomContainer.scrollTo({
            left: targetBottomSlide.offsetLeft,
            behavior: "smooth"
          });
        }
      }
      
      setHeroIdx(next);
      startCycle(next);
    }, AUTOPLAY_MS);
  }, [clearTimers]);

  useEffect(() => {
    if (cw === 0) return;
    const t = setTimeout(() => startCycle(0), 500);
    return () => { clearTimeout(t); clearTimers(); };
  }, [cw, startCycle]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const goTo = useCallback((idx: number) => {
    const heroContainer = heroContainerRef.current;
    if (heroContainer) {
      const heroSlidesContainer = heroContainer.children[0] as HTMLElement;
      if (heroSlidesContainer && heroSlidesContainer.children[idx]) {
        const targetSlide = heroSlidesContainer.children[idx] as HTMLElement;
        heroContainer.scrollTo({
          left: targetSlide.offsetLeft,
          behavior: "smooth"
        });
      }
    }
    
    const bottomContainer = bottomContainerRef.current;
    if (bottomContainer) {
      const bottomSlidesContainer = bottomContainer.children[0] as HTMLElement;
      if (bottomSlidesContainer && bottomSlidesContainer.children[idx]) {
        const targetBottomSlide = bottomSlidesContainer.children[idx] as HTMLElement;
        bottomContainer.scrollTo({
          left: targetBottomSlide.offsetLeft,
          behavior: "smooth"
        });
      }
    }
    
    setHeroIdx(idx);
    startCycle(idx);
  }, [startCycle]);

  const togglePlay = useCallback(() => {
    setPlaying(prev => {
      const next = !prev;
      playRef.current = next;
      if (next) startCycle(idxRef.current);
      else clearTimers();
      return next;
    });
  }, [clearTimers, startCycle]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ background: "#0a0a0a", borderTop: "1px solid rgba(255,255,255,0.05)", paddingBottom: "40px" }}
    >

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.72, ease: [0.2, 0.8, 0.2, 1] }}
        className="pt-[70px] pb-[28px] text-center px-6"
      >
        <p
          style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "#c9a96e",
            marginBottom: "10px",
          }}
        >
          Ethical Hacker Prep
        </p>

        <h2
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: "clamp(32px, 4vw, 56px)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            color: "#ffffff",
          }}
        >
          Maîtrisez la Cybersécurité.
          <br />
          <span style={{ color: "rgba(255,255,255,0.4)" }}>Défendez comme un pro.</span>
        </h2>
      </motion.div>

      {/* HERO CARROUSEL */}
      <div
        ref={heroContainerRef}
        style={{
          overflowX: "auto",
          overflowY: "hidden",
          cursor: isHeroDragging ? "grabbing" : "grab",
          width: "100%",
          WebkitOverflowScrolling: "touch",
          scrollSnapType: "x mandatory",
        }}
        className="hide-scrollbar"
      >
        <div
          style={{
            display: "flex",
            gap: `${heroGap}px`,
            paddingLeft: `${heroSidePad}px`,
            paddingRight: `${heroSidePad}px`,
          }}
        >
          {HERO_SLIDES.map((slide, idx) => (
            <div
              key={slide.id}
              style={{
                flexShrink: 0,
                scrollSnapAlign: "center",
              }}
            >
              <SlideCard
                slide={slide}
                isActive={heroIdx === idx}
                slideW={heroSlideW}
                slideH={heroSlideH}
                progress={heroIdx === idx ? progress : 0}
                priority={idx <= 1}
                onClick={(e) => {
                  if (isHeroDragging) {
                    e.preventDefault();
                    return;
                  }
                  if (heroIdx !== idx) {
                    e.preventDefault();
                    goTo(idx);
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: "20px" }} />

      {/* BOTTOM CARROUSEL - SYNCHRONISÉ */}
      <div style={{ paddingBottom: "24px" }}>
        <div
          ref={bottomContainerRef}
          style={{
            overflowX: "auto",
            overflowY: "hidden",
            cursor: isBottomDragging ? "grabbing" : "grab",
            width: "100%",
            WebkitOverflowScrolling: "touch",
            scrollSnapType: "x mandatory",
          }}
          className="hide-scrollbar"
        >
          <div
            style={{
              display: "flex",
              gap: `${bottomGap}px`,
              paddingLeft: `${bottomSidePad}px`,
              paddingRight: `${bottomSidePad}px`,
            }}
          >
            {BOTTOM_CARDS.map((card, idx) => (
              <div
                key={card.id}
                style={{
                  flexShrink: 0,
                  scrollSnapAlign: "start",
                }}
              >
                <Link
                  href={card.link}
                  draggable={false}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (isBottomDragging) {
                      e.preventDefault();
                    }
                  }}
                  style={{
                    width: `${bottomSlideW}px`,
                    height: `${bottomSlideH}px`,
                    borderRadius: "0px",
                    overflow: "hidden",
                    position: "relative",
                    display: "block",
                    background: "#111",
                    textDecoration: "none",
                  }}
                >
                  <img
                    src={card.image}
                    alt={card.title}
                    loading="lazy"
                    draggable={false}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      pointerEvents: "none",
                    }}
                  />

                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(180deg, transparent 35%, rgba(0,0,0,0.9) 100%)",
                      zIndex: 10,
                    }}
                  />

                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 20,
                      padding: "14px",
                    }}
                  >
                    <span
                      style={{
                        display: "block",
                        fontSize: "9px",
                        fontWeight: 700,
                        letterSpacing: "0.10em",
                        textTransform: "uppercase",
                        color: "#c9a96e",
                        marginBottom: "2px",
                      }}
                    >
                      {card.label}
                    </span>
                    <span
                      style={{
                        display: "block",
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "white",
                        letterSpacing: "-0.012em",
                        lineHeight: 1.25,
                      }}
                    >
                      {card.title}
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Dots */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          marginTop: "0px",
        }}
      >
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            style={{
              width: heroIdx === i ? "30px" : "6px",
              height: "6px",
              borderRadius: "50%",
              border: "none",
              padding: 0,
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
              background: heroIdx === i ? "rgba(201,169,110,0.15)" : "rgba(255,255,255,0.15)",
              transition: "width 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1), background 0.2s",
            }}
          >
            {heroIdx === i && (
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  width: `${progress}%`,
                  background: "#c9a96e",
                  borderRadius: "50%",
                  transition: "none",
                }}
              />
            )}
          </button>
        ))}

        <button
          onClick={togglePlay}
          aria-label={playing ? "Pause" : "Lecture"}
          style={{
            marginLeft: "8px",
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            border: "1px solid rgba(201,169,110,0.2)",
            background: "rgba(201,169,110,0.05)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.2s ease",
          }}
        >
          {playing ? (
            <svg width="9" height="9" fill="#c9a96e" viewBox="0 0 9 9">
              <rect x="0.5" y="0.5" width="2.7" height="8" rx="1" />
              <rect x="5.8" y="0.5" width="2.7" height="8" rx="1" />
            </svg>
          ) : (
            <svg width="9" height="9" fill="#c9a96e" viewBox="0 0 9 9">
              <path d="M1.5 0.8L8.5 4.5L1.5 8.2Z" />
            </svg>
          )}
        </button>
      </div>

      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}

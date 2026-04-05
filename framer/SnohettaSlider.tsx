/**
 * SnohettaSlider — Framer Code Component
 *
 * A full-bleed image slider inspired by snohetta.com.
 * Paste this file into Framer: Assets → Code → New File
 *
 * Features:
 *  - Full-width images, edge-to-edge
 *  - Drag / swipe to navigate (mouse + touch)
 *  - Auto-advance with hover pause
 *  - Minimal caption: title + subtitle
 *  - Navigation arrows + slide counter
 *  - All options editable from Framer's property panel
 */

import { addPropertyControls, ControlType } from "framer"
import { animate, motion, useMotionValue } from "framer-motion"
import { useEffect, useRef, useState } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Slide {
    imageUrl: string
    title: string
    subtitle: string
    href?: string
}

interface Props {
    slides: Slide[]
    height: number
    autoPlay: boolean
    interval: number
    showCounter: boolean
    showArrows: boolean
    font: string
    accentColor: string
    captionBackground: string
}

// ─── Default slides (shown on Framer canvas before user configures) ───────────

const DEFAULT_SLIDES: Slide[] = [
    {
        imageUrl:
            "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1600&q=80",
        title: "The Glasshouse Theatre",
        subtitle: "Queensland Performing Arts Centre",
        href: "#",
    },
    {
        imageUrl:
            "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=1600&q=80",
        title: "The Ring and Greenhouse",
        subtitle: "A new way of living on Istanbul's Black Sea coast",
        href: "#",
    },
    {
        imageUrl:
            "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=1600&q=80",
        title: "Nanterre-Amandiers",
        subtitle: "Renovation of a cultural landmark",
        href: "#",
    },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pad(n: number) {
    return String(n).padStart(2, "0")
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SnohettaSlider({
    slides = DEFAULT_SLIDES,
    height = 600,
    autoPlay = true,
    interval = 4000,
    showCounter = true,
    showArrows = true,
    font = "Inter, sans-serif",
    accentColor = "#000000",
    captionBackground = "#ffffff",
}: Props) {
    const count = slides.length
    const [current, setCurrent] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const x = useMotionValue(0)
    const autoTimer = useRef<ReturnType<typeof setInterval> | null>(null)

    // ── Slide to index ────────────────────────────────────────────────────────

    function goTo(index: number) {
        const clamped = Math.max(0, Math.min(count - 1, index))
        setCurrent(clamped)
        const w = containerRef.current?.offsetWidth ?? 0
        animate(x, -clamped * w, {
            type: "tween",
            duration: 0.65,
            ease: [0.25, 0.1, 0.25, 1],
        })
    }

    // ── Auto-advance ──────────────────────────────────────────────────────────

    function startAuto() {
        if (!autoPlay) return
        stopAuto()
        autoTimer.current = setInterval(() => {
            setCurrent((prev) => {
                const next = (prev + 1) % count
                const w = containerRef.current?.offsetWidth ?? 0
                animate(x, -next * w, {
                    type: "tween",
                    duration: 0.65,
                    ease: [0.25, 0.1, 0.25, 1],
                })
                return next
            })
        }, interval)
    }

    function stopAuto() {
        if (autoTimer.current) clearInterval(autoTimer.current)
    }

    useEffect(() => {
        if (!isDragging && !isHovered) startAuto()
        else stopAuto()
        return stopAuto
    }, [isDragging, isHovered, autoPlay, interval, count])

    // ── Reposition on resize ──────────────────────────────────────────────────

    useEffect(() => {
        function onResize() {
            const w = containerRef.current?.offsetWidth ?? 0
            x.set(-current * w)
        }
        window.addEventListener("resize", onResize)
        return () => window.removeEventListener("resize", onResize)
    }, [current])

    // ── Drag handlers ─────────────────────────────────────────────────────────

    function onDragStart() {
        setIsDragging(true)
    }

    function onDragEnd(_: never, info: { offset: { x: number }; velocity: { x: number } }) {
        setIsDragging(false)
        const { offset, velocity } = info
        const w = containerRef.current?.offsetWidth ?? 1
        const threshold = w * 0.15 // 15% of width
        const fastSwipe = Math.abs(velocity.x) > 500

        if (offset.x < -threshold || (fastSwipe && velocity.x < 0)) {
            goTo(current + 1)
        } else if (offset.x > threshold || (fastSwipe && velocity.x > 0)) {
            goTo(current - 1)
        } else {
            goTo(current) // snap back
        }
    }

    // ── Styles ────────────────────────────────────────────────────────────────

    const styles: Record<string, React.CSSProperties> = {
        root: {
            width: "100%",
            fontFamily: font,
            userSelect: "none",
            WebkitUserSelect: "none",
            cursor: isDragging ? "grabbing" : "grab",
        },
        track: {
            width: "100%",
            height,
            overflow: "hidden",
            position: "relative",
        },
        inner: {
            display: "flex",
            width: `${count * 100}%`,
            height: "100%",
        },
        slide: {
            width: `${100 / count}%`,
            height: "100%",
            flexShrink: 0,
            position: "relative",
            overflow: "hidden",
        },
        img: {
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            pointerEvents: "none",
            draggable: false,
        } as React.CSSProperties,
        caption: {
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            backgroundColor: captionBackground,
            padding: "20px 0 0",
            gap: 24,
        },
        captionText: {
            flex: 1,
        },
        title: {
            fontSize: 16,
            fontWeight: 600,
            color: accentColor,
            lineHeight: 1.3,
            margin: 0,
        },
        subtitle: {
            fontSize: 13,
            fontWeight: 400,
            color: accentColor,
            opacity: 0.5,
            lineHeight: 1.4,
            marginTop: 3,
        },
        nav: {
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexShrink: 0,
            paddingTop: 2,
        },
        counter: {
            fontSize: 12,
            fontWeight: 400,
            color: accentColor,
            opacity: 0.45,
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "0.03em",
        },
        arrows: {
            display: "flex",
            gap: 12,
        },
        arrow: {
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            color: accentColor,
            fontSize: 18,
            lineHeight: 1,
            opacity: 0.7,
            transition: "opacity 0.2s",
            fontFamily: "inherit",
        },
    }

    // ── Render ────────────────────────────────────────────────────────────────

    const slide = slides[current] ?? slides[0]

    return (
        <div
            style={styles.root}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Image track */}
            <div style={styles.track} ref={containerRef}>
                <motion.div
                    style={{ ...styles.inner, x }}
                    drag="x"
                    dragConstraints={{
                        left: -(count - 1) * (containerRef.current?.offsetWidth ?? 0),
                        right: 0,
                    }}
                    dragElastic={0.08}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                >
                    {slides.map((s, i) => (
                        <div key={i} style={styles.slide}>
                            <img
                                src={s.imageUrl}
                                alt={s.title}
                                style={styles.img}
                                draggable={false}
                            />
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Caption */}
            <div style={styles.caption}>
                <div style={styles.captionText}>
                    <p style={styles.title}>{slide.title}</p>
                    {slide.subtitle && (
                        <p style={styles.subtitle}>{slide.subtitle}</p>
                    )}
                </div>

                <div style={styles.nav}>
                    {showCounter && (
                        <span style={styles.counter}>
                            {pad(current + 1)} / {pad(count)}
                        </span>
                    )}
                    {showArrows && (
                        <div style={styles.arrows}>
                            <button
                                style={{
                                    ...styles.arrow,
                                    opacity: current === 0 ? 0.2 : 0.7,
                                }}
                                onClick={() => goTo(current - 1)}
                                aria-label="Previous"
                            >
                                ←
                            </button>
                            <button
                                style={{
                                    ...styles.arrow,
                                    opacity: current === count - 1 ? 0.2 : 0.7,
                                }}
                                onClick={() => goTo(current + 1)}
                                aria-label="Next"
                            >
                                →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// ─── Framer Property Controls ─────────────────────────────────────────────────

addPropertyControls(SnohettaSlider, {
    slides: {
        type: ControlType.Array,
        title: "Slides",
        control: {
            type: ControlType.Object,
            controls: {
                imageUrl: {
                    type: ControlType.String,
                    title: "Image URL",
                    defaultValue:
                        "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1600&q=80",
                },
                title: {
                    type: ControlType.String,
                    title: "Title",
                    defaultValue: "Project Title",
                },
                subtitle: {
                    type: ControlType.String,
                    title: "Subtitle",
                    defaultValue: "Project description",
                },
                href: {
                    type: ControlType.String,
                    title: "Link URL",
                    defaultValue: "#",
                },
            },
        },
        defaultValue: DEFAULT_SLIDES,
    },
    height: {
        type: ControlType.Number,
        title: "Image height",
        defaultValue: 600,
        min: 200,
        max: 1200,
        unit: "px",
        step: 10,
    },
    autoPlay: {
        type: ControlType.Boolean,
        title: "Auto-advance",
        defaultValue: true,
    },
    interval: {
        type: ControlType.Number,
        title: "Interval",
        defaultValue: 4000,
        min: 1000,
        max: 10000,
        unit: "ms",
        step: 500,
        hidden(props) {
            return !props.autoPlay
        },
    },
    showCounter: {
        type: ControlType.Boolean,
        title: "Show counter",
        defaultValue: true,
    },
    showArrows: {
        type: ControlType.Boolean,
        title: "Show arrows",
        defaultValue: true,
    },
    font: {
        type: ControlType.String,
        title: "Font",
        defaultValue: "Inter, sans-serif",
    },
    accentColor: {
        type: ControlType.Color,
        title: "Text color",
        defaultValue: "#000000",
    },
    captionBackground: {
        type: ControlType.Color,
        title: "Caption bg",
        defaultValue: "#ffffff",
    },
})

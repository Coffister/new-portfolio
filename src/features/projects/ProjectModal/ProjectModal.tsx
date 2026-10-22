import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowSquareOut, CaretLeft, CaretRight, X } from "@phosphor-icons/react";
import Lenis from "lenis";

import { Box, Text } from "@/ui/primitives";
import Squircle from "@/ui/primitives/Squircle";
import Button from "@/ui/components/Button/Button";
import { getLenis } from "@/lib/scroll";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { spotlightPlan } from "@/features/pricing/pricing";

import styles from "./ProjectModal.module.css";
import { useCursor } from "@/providers/CursorProvider";

import type { Project } from "../projects";

interface ProjectModalProps {
    project: Project | null;
    onClose: () => void;
}

export default function ProjectModal({
    project,
    onClose,
}: ProjectModalProps) {
    const isOpen = project !== null;
    const { setVariant } = useCursor();
    const [loadedProjectId, setLoadedProjectId] = useState<string | null>(null);
    const [gallerySurface, setGallerySurface] = useState<HTMLDivElement | null>(null);
    // On mobile the whole modal is one scroll; the gallery gets no scroller of its own.
    const isMobile = useMediaQuery("(max-width: 768px)");
    const [galleryContent, setGalleryContent] = useState<HTMLDivElement | null>(null);
    const [descriptionElement, setDescriptionElement] = useState<HTMLDivElement | null>(null);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    // Index of the screenshot shown full-size; the modal itself turns into the viewer.
    const [viewerIndex, setViewerIndex] = useState<number | null>(null);
    const swipeStartX = useRef<number | null>(null);
    // a swipe ends with a click; this keeps that click from closing the viewer
    const justSwiped = useRef(false);
    const [canExpandDescription, setCanExpandDescription] = useState(false);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const lastFocusedRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!project) {
            setLoadedProjectId(null);
            return;
        }

        setLoadedProjectId(null);
        const timeoutId = window.setTimeout(() => {
            setLoadedProjectId(project.id);
        }, 400);

        return () => window.clearTimeout(timeoutId);
    }, [project]);

    const isLoading = isOpen && loadedProjectId !== project.id;

    useEffect(() => {
        setIsDescriptionExpanded(false);
        setViewerIndex(null);
        setCanExpandDescription(false);
    }, [project?.id]);

    useEffect(() => {
        if (isLoading || isDescriptionExpanded) return;

        if (!descriptionElement) return;

        const updateOverflow = () => {
            setCanExpandDescription(descriptionElement.scrollHeight > descriptionElement.clientHeight + 1);
        };

        updateOverflow();
        const resizeObserver = new ResizeObserver(updateOverflow);
        resizeObserver.observe(descriptionElement);

        return () => resizeObserver.disconnect();
    }, [descriptionElement, isDescriptionExpanded, isLoading, project?.id]);

    const stepViewer = (step: number) => {
        const count = project?.screenshots.length ?? 0;
        setViewerIndex((current) => (current === null || count === 0 ? current : (current + step + count) % count));
    };

    // ESC key
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (viewerIndex !== null) {
                // the viewer takes Esc and the arrows; Esc steps back to the project
                if (event.key === "Escape") setViewerIndex(null);
                if (event.key === "ArrowLeft") stepViewer(-1);
                if (event.key === "ArrowRight") stepViewer(1);
                return;
            }
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose, isOpen, viewerIndex]);

    // Move focus into the dialog on open and hand it back on close.
    useEffect(() => {
        if (!isOpen) return;

        lastFocusedRef.current = document.activeElement as HTMLElement | null;
        const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus(), 0);

        return () => {
            window.clearTimeout(focusTimer);
            lastFocusedRef.current?.focus?.();
        };
    }, [isOpen]);

    // Robust scroll lock: hide overflow and prevent wheel/touch/key scrolling
    useEffect(() => {
        const root = document.documentElement;
        const prevOverflow = root.style.overflow;
        const prevPaddingRight = root.style.paddingRight;
        // Reserve the scrollbar's width so locking the page doesn't shift content.
        const scrollbarWidth = window.innerWidth - root.clientWidth;

        // We'll lock scrolling by setting `overflow: hidden` on the root element.
        // Avoid attaching global wheel/touch/keydown listeners which can block
        // inner scrollable elements; letting the inner `.gallerySurface` handle
        // its own scrolling ensures expected behavior.

        const lenis = getLenis();
        if (isOpen) {
            root.style.overflow = "hidden";
            if (scrollbarWidth > 0) {
                root.style.paddingRight = `${scrollbarWidth}px`;
            }

            // attempt to pause Lenis if present
            if (lenis) {
                try {
                    if (typeof (lenis as any).pause === "function") {
                        (lenis as any).pause();
                    } else if (typeof (lenis as any).stop === "function") {
                        (lenis as any).stop();
                    }
                } catch (e) {
                    // ignore
                }
            }

            // no global listeners — `overflow: hidden` prevents background scroll
        }

        return () => {
            root.style.overflow = prevOverflow || "";
            root.style.paddingRight = prevPaddingRight || "";

            // resume Lenis if possible
            if (lenis) {
                try {
                    if (typeof (lenis as any).resume === "function") {
                        (lenis as any).resume();
                    } else if (typeof (lenis as any).start === "function") {
                        (lenis as any).start();
                    }
                } catch (e) {
                    // ignore
                }
            }

            // no listeners to remove
        };
    }, [isOpen]);

    useEffect(() => {
        if (!gallerySurface || !galleryContent || isMobile !== false) return;

        const galleryLenis = new Lenis({
            wrapper: gallerySurface,
            content: galleryContent,
            duration: 1.1,
            smoothWheel: true,
            syncTouch: true,
            orientation: "vertical",
            gestureOrientation: "vertical",
        });

        let animationFrameId = 0;
        const animate = (time: number) => {
            galleryLenis.raf(time);
            animationFrameId = window.requestAnimationFrame(animate);
        };

        animationFrameId = window.requestAnimationFrame(animate);

        return () => {
            window.cancelAnimationFrame(animationFrameId);
            galleryLenis.destroy();
        };
    }, [galleryContent, gallerySurface, isMobile]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className={styles.backdrop}
                    onClick={onClose}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                >
                    <motion.div
                        className={styles.modal}
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-label={project ? `${project.title} — detail projektu` : "Detail projektu"}
                        initial={{
                            opacity: 0,
                            y: 20,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        exit={{
                            opacity: 0,
                            y: 20,
                        }}
                        transition={{
                            duration: 0.28,
                            ease: "easeOut",
                        }}
                        >
                        <Squircle radius="lg" className={styles.squircle}>
                            <Box className={styles.content}>
                                <button
                                    ref={closeButtonRef}
                                    type="button"
                                    className={styles.closeButton}
                                    onClick={viewerIndex !== null ? () => setViewerIndex(null) : onClose}
                                    aria-label={viewerIndex !== null ? "Späť na projekt" : "Zavrieť"}
                                    onMouseEnter={() => setVariant("pointer")}
                                    onMouseLeave={() => setVariant("default")}
                                >
                                    <X size={18} weight="bold" aria-hidden="true" />
                                </button>

                                <AnimatePresence mode="wait" initial={false}>
                                    {isLoading ? (
                                        <motion.div
                                            key="loading"
                                            className={styles.loadingContent}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.18 }}
                                            aria-label="Loading project details"
                                            role="status"
                                        >
                                            <aside className={styles.sidebar}>
                                                <div className={styles.sidebarTop}>
                                                    <div className={`${styles.skeleton} ${styles.skeletonLogo}`} />
                                                    <div className={styles.skeletonSpacer} />
                                                    <div className={`${styles.skeleton} ${styles.skeletonTitle}`} />
                                                    <div className={styles.skeletonBadges}>
                                                        <div className={`${styles.skeleton} ${styles.skeletonBadge}`} />
                                                        <div className={`${styles.skeleton} ${styles.skeletonBadge} ${styles.skeletonBadgeShort}`} />
                                                    </div>
                                                    <div className={styles.skeletonCopy}>
                                                        <div className={`${styles.skeleton} ${styles.skeletonLine}`} />
                                                        <div className={`${styles.skeleton} ${styles.skeletonLine}`} />
                                                        <div className={`${styles.skeleton} ${styles.skeletonLine} ${styles.skeletonLineShort}`} />
                                                    </div>
                                                </div>
                                                <div className={`${styles.skeleton} ${styles.skeletonButton}`} />
                                            </aside>
                                            <section className={styles.gallery}>
                                                <div className={`${styles.gallerySurface} ${styles.skeletonGallery}`}>
                                                    <div className={styles.galleryInner}>
                                                        <div className={`${styles.skeleton} ${styles.skeletonScreen}`} />
                                                        <div className={`${styles.skeleton} ${styles.skeletonScreen}`} />
                                                        <div className={`${styles.skeleton} ${styles.skeletonScreen}`} />
                                                    </div>
                                                </div>
                                            </section>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key={project.id}
                                            className={styles.projectContent}
                                            data-lenis-prevent
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.38, ease: "easeOut" }}
                                            onWheel={(event) => event.stopPropagation()}
                                            onTouchStart={(event) => event.stopPropagation()}
                                            onTouchMove={(event) => event.stopPropagation()}
                                        >
                                <aside className={styles.sidebar}>
                                    <div className={styles.sidebarTop}>
                                        <img className={styles.logo} src={project.logo} alt={`${project.title} logo`} />
                                        <div style={{height: 8}} />

                                        <Text as="h3" variant="cardTitle">{project.title}</Text>

                                        <div className={styles.badgeRow}>
                                            <Button size="label" variant="ghost">{project.category}</Button>
                                            {project.year ? (
                                                <Button size="label" variant="ghost">{project.year}</Button>
                                            ) : null}
                                            {project.services?.map((service) => (
                                                <Button key={service} size="label" variant="ghost">{service}</Button>
                                            ))}
                                        </div>

                                        <div
                                            ref={setDescriptionElement}
                                            className={`${styles.description} ${isDescriptionExpanded ? styles.descriptionExpanded : ""}`}
                                            onWheel={(event) => event.stopPropagation()}
                                            onTouchStart={(event) => event.stopPropagation()}
                                            onTouchMove={(event) => event.stopPropagation()}
                                        >
                                            <Text variant="caption">
                                                {project.description.split(/\*\*(.+?)\*\*/).map((part, index) =>
                                                    // odd parts sat between ** markers
                                                    index % 2 ? <strong key={index}>{part}</strong> : part,
                                                )}
                                            </Text>
                                        </div>
                                        {project.disclaimer ? (
                                            <Text variant="caption" className={styles.disclaimer}>{project.disclaimer}</Text>
                                        ) : null}
                                        {canExpandDescription ? (
                                            <button
                                                className={styles.descriptionToggle}
                                                type="button"
                                                aria-expanded={isDescriptionExpanded}
                                                onClick={() => setIsDescriptionExpanded((expanded) => !expanded)}
                                            >
                                                {isDescriptionExpanded ? "Zobraziť menej" : "Zobraziť viac"}
                                            </button>
                                        ) : null}
                                    </div>

                                    <div className={styles.actions}>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => {
                                            const { planId } = project.cta;
                                            onClose();
                                            // after the close re-enables page scrolling
                                            setTimeout(() => spotlightPlan(planId));
                                        }}
                                    >
                                        {project.cta.label}
                                    </Button>
                                    {project?.url ? (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => {
                                                try {
                                                    window.open(project.url, "_blank", "noopener,noreferrer");
                                                } catch (e) {
                                                    // no-op
                                                }
                                            }}
                                            icon={<ArrowSquareOut size={14} weight="bold" />}
                                        >
                                            Zobraziť web
                                        </Button>
                                    ) : null}
                                    </div>
                                </aside>

                                <section className={styles.gallery} aria-hidden={false}>
                                                            <div
                                                                ref={setGallerySurface}
                                                                className={styles.gallerySurface}
                                                                tabIndex={0}
                                                                onWheel={(event) => event.stopPropagation()}
                                                                onTouchStart={(event) => event.stopPropagation()}
                                                                onTouchMove={(event) => event.stopPropagation()}
                                                            >
                                        <div ref={setGalleryContent} className={styles.galleryInner}>
                                            {project.screenshots.map((screenshot, index) => (
                                                <button
                                                    key={screenshot}
                                                    type="button"
                                                    className={styles.galleryItem}
                                                    onClick={() => setViewerIndex(index)}
                                                    aria-label={`Zväčšiť ukážku ${index + 1}`}
                                                    onMouseEnter={() => setVariant("pointer")}
                                                    onMouseLeave={() => setVariant("default")}
                                                >
                                                    {/* While it's in the viewer, an invisible copy holds its
                                                        place so the gallery doesn't jump. */}
                                                    {viewerIndex === index ? (
                                                        <Media src={screenshot} alt="" className={`${styles.galleryImage} ${styles.placeholder}`} />
                                                    ) : (
                                                        <Media
                                                            src={screenshot}
                                                            alt={`${project.title} ukážka ${index + 1}`}
                                                            className={styles.galleryImage}
                                                            layoutId={`${project.id}-${index}`}
                                                            lazy={index > 0}
                                                        />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <AnimatePresence>
                                    {project && !isLoading && viewerIndex !== null && (
                                        <motion.div
                                            key="viewer"
                                            className={styles.viewer}
                                            role="group"
                                            aria-label={`Ukážka ${viewerIndex + 1} z ${project.screenshots.length}`}
                                            initial={{ backgroundColor: "rgba(12, 12, 12, 0)" }}
                                            animate={{ backgroundColor: "rgba(12, 12, 12, 1)" }}
                                            exit={{ backgroundColor: "rgba(12, 12, 12, 0)" }}
                                            transition={{ duration: 0.3 }}
                                            onClick={() => {
                                                if (justSwiped.current) {
                                                    justSwiped.current = false;
                                                    return;
                                                }
                                                setViewerIndex(null);
                                            }}
                                            onPointerDown={(event) => { swipeStartX.current = event.clientX; }}
                                            onPointerUp={(event) => {
                                                const start = swipeStartX.current;
                                                swipeStartX.current = null;
                                                if (start === null || Math.abs(event.clientX - start) < 50) return;
                                                justSwiped.current = true;
                                                stepViewer(event.clientX < start ? 1 : -1);
                                            }}
                                        >
                                            <Media
                                                key={viewerIndex}
                                                src={project.screenshots[viewerIndex]}
                                                alt={`${project.title} ukážka ${viewerIndex + 1}`}
                                                className={styles.viewerMedia}
                                                layoutId={`${project.id}-${viewerIndex}`}
                                                onClick={(event) => event.stopPropagation()}
                                            />

                                            {project.screenshots.length > 1 && (
                                                <>
                                                    <button
                                                        type="button"
                                                        className={`${styles.viewerNav} ${styles.viewerPrev}`}
                                                        onClick={(event) => { event.stopPropagation(); stepViewer(-1); }}
                                                        aria-label="Predchádzajúca ukážka"
                                                    >
                                                        <CaretLeft size={20} weight="bold" aria-hidden="true" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={`${styles.viewerNav} ${styles.viewerNext}`}
                                                        onClick={(event) => { event.stopPropagation(); stepViewer(1); }}
                                                        aria-label="Ďalšia ukážka"
                                                    >
                                                        <CaretRight size={20} weight="bold" aria-hidden="true" />
                                                    </button>
                                                    <span className={styles.viewerCount}>
                                                        {viewerIndex + 1} / {project.screenshots.length}
                                                    </span>
                                                </>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Box>
                        </Squircle>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
interface MediaProps {
    src: string;
    alt: string;
    className: string;
    layoutId?: string;
    lazy?: boolean;
    onClick?: (event: React.MouseEvent) => void;
}

// A screenshot or a looping clip; layoutId lets it morph between the gallery and the viewer.
function Media({ src, alt, className, layoutId, lazy, onClick }: MediaProps) {
    const transition = { type: "spring" as const, stiffness: 320, damping: 34 };

    if (src.toLowerCase().endsWith(".webm")) {
        return (
            <motion.video
                className={className}
                src={src}
                layoutId={layoutId}
                transition={transition}
                onClick={onClick}
                aria-label={alt || undefined}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
            />
        );
    }

    return (
        <motion.img
            className={className}
            src={src}
            alt={alt}
            layoutId={layoutId}
            transition={transition}
            onClick={onClick}
            loading={lazy ? "lazy" : undefined}
            decoding="async"
        />
    );
}

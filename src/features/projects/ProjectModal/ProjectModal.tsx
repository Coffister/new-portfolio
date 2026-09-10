import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowSquareOut } from "@phosphor-icons/react";
import Lenis from "lenis";

import { Box, Text } from "@/ui/primitives";
import Squircle from "@/ui/primitives/Squircle";
import Button from "@/ui/components/Button/Button";
import { getLenis } from "@/lib/scroll";

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
    const [galleryContent, setGalleryContent] = useState<HTMLDivElement | null>(null);
    const [descriptionElement, setDescriptionElement] = useState<HTMLDivElement | null>(null);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
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

    // ESC key
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose, isOpen]);

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
        if (!gallerySurface || !galleryContent) return;

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
    }, [galleryContent, gallerySurface]);

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
                                    onClick={onClose}
                                    aria-label="Zavrieť"
                                    onMouseEnter={() => setVariant("pointer")}
                                    onMouseLeave={() => setVariant("default")}
                                >
                                    ✕
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
                                            <Text variant="caption">{project.description}</Text>
                                        </div>
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
                                                screenshot.toLowerCase().endsWith(".webm") ? (
                                                    <video
                                                        key={screenshot}
                                                        className={styles.galleryImage}
                                                        src={screenshot}
                                                        autoPlay
                                                        loop
                                                        muted
                                                        playsInline
                                                        preload="metadata"
                                                    />
                                                ) : (
                                                    <img
                                                        key={screenshot}
                                                        className={styles.galleryImage}
                                                        src={screenshot}
                                                        alt={`${project.title} screenshot ${index + 1}`}
                                                        loading={index === 0 ? undefined : "lazy"}
                                                        decoding="async"
                                                    />
                                                )
                                            ))}
                                        </div>
                                    </div>
                                </section>
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
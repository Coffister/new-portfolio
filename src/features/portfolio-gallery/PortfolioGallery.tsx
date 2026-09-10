import { useMemo } from "react";

import CircularGallery from "./CircularGallery";
import type { Project } from "@/features/projects/projects";

interface PortfolioGalleryProps {
    items: Project[];
    onActiveChange?: (index: number) => void;
}

export default function PortfolioGallery({
    items,
    onActiveChange,
}: PortfolioGalleryProps) {
    // CircularGallery only needs an image + label; keep the mapped array
    // referentially stable so its WebGL context is not rebuilt on every render.
    const galleryItems = useMemo(
        () => items.map((project) => ({ image: project.thumbnail, title: project.title })),
        [items],
    );

    return (
        <CircularGallery
            items={galleryItems}
            borderRadius={0.24}
            onActiveChange={onActiveChange}
        />
    );
}

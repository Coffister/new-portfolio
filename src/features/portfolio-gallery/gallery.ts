export interface GalleryItem {
    image: string;
    title: string;
    description?: string;
    slug: string;
}

export const projects: GalleryItem[] = [
    {
        image: "/test.jpg",
        title: "Test Project",
        description: "Testing gallery",
        slug: "test-project",
    },
];
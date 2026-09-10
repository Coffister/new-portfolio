import styles from "./LogoOverlay.module.css";

interface LogoOverlayProps {
    children: React.ReactNode;
    className?: string;
}

export default function LogoOverlay({
    children,
    className,
}: LogoOverlayProps) {
    return (
        <div className={`${styles.overlay} ${className ?? ""}`.trim()}>
            {children}
        </div>
    );
}
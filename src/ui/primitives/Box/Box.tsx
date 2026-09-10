import type {
    CSSProperties,
    ElementType,
    ReactNode,
    HTMLAttributes,
} from "react";
import { spacing } from "@/ui/foundation/spacing";

type SpacingValue = keyof typeof spacing;

export interface BoxProps
    extends HTMLAttributes<HTMLElement> {

    as?: ElementType;

    children?: ReactNode;

    w?: string;
    h?: string;

    m?: SpacingValue;
    mx?: SpacingValue;
    my?: SpacingValue;
    mt?: SpacingValue;
    mr?: SpacingValue;
    mb?: SpacingValue;
    ml?: SpacingValue;

    p?: SpacingValue;
    px?: SpacingValue;
    py?: SpacingValue;
    pt?: SpacingValue;
    pr?: SpacingValue;
    pb?: SpacingValue;
    pl?: SpacingValue;

    position?: CSSProperties["position"];
    overflow?: CSSProperties["overflow"];
    zIndex?: number;
}

export default function Box({
    as: Component = "div",
    children,

    className,
    style: customStyle,

    w,
    h,

    m,
    mx,
    my,
    mt,
    mr,
    mb,
    ml,

    p,
    px,
    py,
    pt,
    pr,
    pb,
    pl,

    position,
    overflow,
    zIndex,
    ...rest
}: BoxProps) {
    const style: CSSProperties = {
        width: w,
        height: h,

        margin: m ? spacing[m] : undefined,
        marginLeft: mx ? spacing[mx] : ml ? spacing[ml] : undefined,
        marginRight: mx ? spacing[mx] : mr ? spacing[mr] : undefined,
        marginTop: my ? spacing[my] : mt ? spacing[mt] : undefined,
        marginBottom: my ? spacing[my] : mb ? spacing[mb] : undefined,

        padding: p ? spacing[p] : undefined,
        paddingLeft: px ? spacing[px] : pl ? spacing[pl] : undefined,
        paddingRight: px ? spacing[px] : pr ? spacing[pr] : undefined,
        paddingTop: py ? spacing[py] : pt ? spacing[pt] : undefined,
        paddingBottom: py ? spacing[py] : pb ? spacing[pb] : undefined,

        position,
        overflow,
        zIndex,

        ...customStyle,
    };

    return (
        <Component className={className} style={style} {...rest}>
            {children}
        </Component>
    );
}
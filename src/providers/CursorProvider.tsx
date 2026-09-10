import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

export type CursorVariant =
  | "default"
  | "drag"
  | "pointer"
  | "pill";

interface CursorContextValue {
  variant: CursorVariant;
  setVariant: (variant: CursorVariant) => void;
}

const CursorContext =
  createContext<CursorContextValue | null>(null);

export function CursorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [variant, setVariant] =
    useState<CursorVariant>("default");

  const value = useMemo(
    () => ({
      variant,
      setVariant,
    }),
    [variant]
  );

  return (
    <CursorContext.Provider value={value}>
      {children}
    </CursorContext.Provider>
  );
}

export function useCursor() {
  const context = useContext(CursorContext);

  if (!context) {
    throw new Error(
      "useCursor must be used inside CursorProvider."
    );
  }

  return context;
}
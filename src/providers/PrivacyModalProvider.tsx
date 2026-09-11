import { createContext, useContext, useMemo, useState } from "react";

import PrivacyModal from "@/features/privacy/PrivacyModal";

interface PrivacyModalContextValue {
  open: () => void;
}

const PrivacyModalContext = createContext<PrivacyModalContextValue | null>(null);

export function PrivacyModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo(() => ({ open: () => setIsOpen(true) }), []);

  return (
    <PrivacyModalContext.Provider value={value}>
      {children}
      <PrivacyModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </PrivacyModalContext.Provider>
  );
}

export function usePrivacyModal() {
  const context = useContext(PrivacyModalContext);

  if (!context) {
    throw new Error("usePrivacyModal must be used inside PrivacyModalProvider.");
  }

  return context;
}

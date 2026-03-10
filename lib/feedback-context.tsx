"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface FeedbackContextValue {
  currentBrand: string | undefined;
  setCurrentBrand: (brand: string | undefined) => void;
}

const FeedbackContext = createContext<FeedbackContextValue>({
  currentBrand: undefined,
  setCurrentBrand: () => {},
});

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [currentBrand, setCurrentBrand] = useState<string | undefined>(undefined);
  return (
    <FeedbackContext.Provider value={{ currentBrand, setCurrentBrand }}>
      {children}
    </FeedbackContext.Provider>
  );
}

export function useFeedbackBrand() {
  return useContext(FeedbackContext);
}

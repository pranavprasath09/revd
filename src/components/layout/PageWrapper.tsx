import type { ReactNode } from "react";

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
}

export default function PageWrapper({ children, className = "" }: PageWrapperProps) {
  return (
    <div className={`mx-auto max-w-7xl px-4 py-8 ${className}`}>
      {children}
    </div>
  );
}

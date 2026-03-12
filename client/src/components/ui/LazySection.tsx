"use client";

import React, { useRef, useState, useEffect, ComponentType } from "react";

interface LazySectionProps {
  minHeight?: string;
  rootMargin?: string;
  children: React.ReactNode;
}

export function LazySection({
  children,
  minHeight = "60vh",
  rootMargin = "300px",
}: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.getBoundingClientRect().top < window.innerHeight + 300) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  if (visible) {
    return <div ref={ref}>{children}</div>;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const placeholderStyle: React.CSSProperties & Record<string, any> = {
    minHeight,
    contentVisibility: "auto",
    containIntrinsicSize: `0 ${minHeight}`,
  };

  return <div ref={ref} style={placeholderStyle} aria-hidden="true" />;
}

export function withLazySection<P extends object>(
  Component: ComponentType<P>,
  options?: Omit<LazySectionProps, "children">
): ComponentType<P> {
  const Wrapped = (props: P) => (
    <LazySection {...options}>
      <Component {...props} />
    </LazySection>
  );
  Wrapped.displayName = `LazySection(${Component.displayName ?? Component.name ?? "Component"})`;
  return Wrapped;
}

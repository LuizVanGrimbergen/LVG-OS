"use client";

import { useEffect, useRef, useState } from "react";
import type { Feature, FeatureCollection, Geometry } from "geojson";

type VisitedGlobeProps = {
  visited: Set<string>;
  /** Only these country ids can be toggled by tapping (no Antarctica, no disputed areas). */
  selectable: Set<string>;
  onToggle: (countryId: string) => void;
};

type CountryFeature = Feature<Geometry, { name: string }>;

// Midnight theme colours (canvas can't read CSS variables reliably).
const COLORS = {
  ocean: "#182030",
  land: "rgba(238, 242, 248, 0.16)",
  visited: "#eef2f8",
  border: "rgba(14, 20, 32, 0.9)",
  graticule: "rgba(238, 242, 248, 0.05)",
  rim: "rgba(238, 242, 248, 0.12)",
};

const AUTO_SPIN_DEG_PER_FRAME = 0.12;
const RESUME_SPIN_AFTER_MS = 3000;
const TAP_TOLERANCE_PX = 6;

/**
 * A spinning 3D globe with visited countries lit up. Drag to turn it, tap a country to mark it.
 * The geo data and d3 are loaded on demand, so they only download when the globe is shown.
 */
export function VisitedGlobe({ visited, selectable, onToggle }: VisitedGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [countries, setCountries] = useState<CountryFeature[] | null>(null);

  // Latest props for the animation loop without restarting it.
  const visitedRef = useRef(visited);
  const onToggleRef = useRef(onToggle);
  const selectableRef = useRef(selectable);
  useEffect(() => {
    visitedRef.current = visited;
    onToggleRef.current = onToggle;
    selectableRef.current = selectable;
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [{ feature }, world] = await Promise.all([
        import("topojson-client"),
        import("world-atlas/countries-110m.json"),
      ]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const topology = (world.default ?? world) as any;
      const collection = feature(topology, topology.objects.countries) as unknown as FeatureCollection<
        Geometry,
        { name: string }
      >;
      if (!cancelled) setCountries(collection.features);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!countries) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let frame = 0;
    let stopped = false;
    let cleanup = () => {};
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    (async () => {
      const { geoOrthographic, geoPath, geoGraticule10, geoContains } = await import("d3-geo");
      if (stopped) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Start with Europe facing you.
      let rotation: [number, number] = [-10, -30];
      let lastInteraction = 0;
      let size = 0;
      // Drag to rotate; a short tap toggles the country under your finger.
      let dragging = false;
      let start: { x: number; y: number; rotation: [number, number] } | null = null;
      const projection = geoOrthographic().clipAngle(90);
      const path = geoPath(projection, ctx);
      const graticule = geoGraticule10();

      const resize = () => {
        const dpr = window.devicePixelRatio || 1;
        size = container.clientWidth;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        projection.translate([size / 2, size / 2]).scale(size / 2 - 2);
      };
      resize();
      const observer = new ResizeObserver(resize);
      observer.observe(container);

      const draw = () => {
        projection.rotate(rotation);
        ctx.clearRect(0, 0, size, size);

        ctx.beginPath();
        path({ type: "Sphere" });
        ctx.fillStyle = COLORS.ocean;
        ctx.fill();

        ctx.beginPath();
        path(graticule);
        ctx.strokeStyle = COLORS.graticule;
        ctx.lineWidth = 0.5;
        ctx.stroke();

        for (const country of countries) {
          ctx.beginPath();
          path(country);
          ctx.fillStyle = visitedRef.current.has(String(country.id)) ? COLORS.visited : COLORS.land;
          ctx.fill();
          ctx.strokeStyle = COLORS.border;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }

        ctx.beginPath();
        path({ type: "Sphere" });
        ctx.strokeStyle = COLORS.rim;
        ctx.lineWidth = 1;
        ctx.stroke();
      };

      const tick = () => {
        const idle = performance.now() - lastInteraction > RESUME_SPIN_AFTER_MS;
        if (!reducedMotion && idle && !dragging) rotation = [rotation[0] + AUTO_SPIN_DEG_PER_FRAME, rotation[1]];
        draw();
        frame = requestAnimationFrame(tick);
      };

      const onPointerDown = (e: PointerEvent) => {
        canvas.setPointerCapture(e.pointerId);
        start = { x: e.offsetX, y: e.offsetY, rotation };
        lastInteraction = performance.now();
      };
      const onPointerMove = (e: PointerEvent) => {
        if (!start) return;
        const dx = e.offsetX - start.x;
        const dy = e.offsetY - start.y;
        if (!dragging && Math.hypot(dx, dy) < TAP_TOLERANCE_PX) return;
        dragging = true;
        const degreesPerPx = 180 / size;
        rotation = [start.rotation[0] + dx * degreesPerPx, Math.max(-80, Math.min(80, start.rotation[1] - dy * degreesPerPx))];
        lastInteraction = performance.now();
      };
      const onPointerUp = (e: PointerEvent) => {
        if (start && !dragging) {
          const point = projection.invert?.([e.offsetX, e.offsetY]);
          const hit = point && countries.find((c) => geoContains(c, point));
          const id = hit ? String(hit.id) : null;
          if (id && selectableRef.current.has(id)) onToggleRef.current(id);
        }
        start = null;
        dragging = false;
        lastInteraction = performance.now();
      };

      canvas.addEventListener("pointerdown", onPointerDown);
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerup", onPointerUp);
      canvas.addEventListener("pointercancel", onPointerUp);
      frame = requestAnimationFrame(tick);

      cleanup = () => {
        observer.disconnect();
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerup", onPointerUp);
        canvas.removeEventListener("pointercancel", onPointerUp);
      };
    })();

    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      cleanup();
    };
  }, [countries]);

  return (
    <div ref={containerRef} className="relative mx-auto aspect-square w-full max-w-sm">
      {!countries && <div className="absolute inset-4 animate-pulse rounded-full bg-card" />}
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Globe, ${visited.size} countries visited. Drag to turn, tap a country to mark it.`}
        className="touch-none"
      />
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import CategoryTile from '@/components/ds/CategoryTile';
import { categoryVisual } from '@/lib/category-visuals';

export interface HeroTileCat {
  slug: string;
  name: string;
}

// How often a flip happens (one tile at a time, round-robin), and how long
// the turn takes. Quiet by design: each individual tile only flips every
// FLIP_EVERY_MS * 4.
const FLIP_EVERY_MS = 4200;
const FLIP_DURATION_MS = 700;

interface TileState {
  rot: number; // cumulative Y rotation, multiples of 180
  faceA: HeroTileCat; // shown at rot % 360 === 0
  faceB: HeroTileCat; // shown at rot % 360 === 180
}

function Face({
  cat,
  subtitle,
  flipped,
}: {
  cat: HeroTileCat;
  subtitle: string;
  flipped: boolean;
}) {
  return (
    <div
      className="absolute inset-0 [backface-visibility:hidden]"
      style={flipped ? { transform: 'rotateY(180deg)' } : undefined}
    >
      <CategoryTile
        title={cat.name}
        subtitle={subtitle}
        image={categoryVisual(cat.slug)?.iconArt}
        size="sm"
        style={{ position: 'absolute', inset: 0, aspectRatio: 'auto' }}
      />
    </div>
  );
}

/* The hero's 2×2 category grid, staged as rounds of a night. Every few
 * seconds one tile turns around its vertical axis and reveals another
 * category from the pool — the hero cycles through the whole library over
 * time. Skipped entirely for users who prefer reduced motion. */
export default function HeroTileDeck({
  pool,
  labels,
}: {
  pool: HeroTileCat[];
  labels: string[]; // localized "Runde 1"…"Runde 4"
}) {
  const [tiles, setTiles] = useState<TileState[]>(() =>
    pool.slice(0, 4).map((cat) => ({ rot: 0, faceA: cat, faceB: cat }))
  );
  const counter = useRef(4 % pool.length);

  useEffect(() => {
    // More tiles than categories to cycle through, or reduced motion: stay static.
    if (pool.length <= 4) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let position = 0;
    const interval = setInterval(() => {
      const p = position;
      position = (position + 1) % 4;

      setTiles((prev) => {
        const visible = prev.map((t) =>
          t.rot % 360 === 0 ? t.faceA.slug : t.faceB.slug
        );
        // Next category from the pool that isn't currently on any tile.
        let idx = counter.current;
        for (let guard = 0; guard < pool.length; guard++) {
          if (!visible.includes(pool[idx].slug)) break;
          idx = (idx + 1) % pool.length;
        }
        counter.current = (idx + 1) % pool.length;

        const next = [...prev];
        const tile = prev[p];
        const showingA = tile.rot % 360 === 0;
        next[p] = {
          rot: tile.rot + 180,
          // Load the incoming category onto the hidden face, then turn.
          faceA: showingA ? tile.faceA : pool[idx],
          faceB: showingA ? pool[idx] : tile.faceB,
        };
        return next;
      });
    }, FLIP_EVERY_MS);

    return () => clearInterval(interval);
  }, [pool]);

  return (
    <div className="grid grid-cols-2 gap-4" aria-hidden>
      {tiles.map((tile, i) => (
        <div
          key={i}
          className={`relative [perspective:1200px] ${i % 2 === 1 ? 'mt-7' : ''}`}
          style={{ aspectRatio: '1 / 1' }}
        >
          <div
            className="absolute inset-0 [transform-style:preserve-3d]"
            style={{
              transform: `rotateY(${tile.rot}deg)`,
              transition: `transform ${FLIP_DURATION_MS}ms var(--ease-in-out)`,
            }}
          >
            <Face cat={tile.faceA} subtitle={labels[i]} flipped={false} />
            <Face cat={tile.faceB} subtitle={labels[i]} flipped />
          </div>
        </div>
      ))}
    </div>
  );
}

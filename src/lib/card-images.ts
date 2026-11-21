// Card thumbnails for section landings (/intervention, /services, /resources).
//
// Most detail_page records in WordPress have no image of their own, so every
// card used to fall back to the section hero (the same mountain photo on every
// /intervention card). Cards now use their own WordPress image when one is set
// (ACF `image` or the source page's featured image) and otherwise draw from a
// pool of distinct photos that are already used elsewhere on the site, so no
// two cards in a grid share a photo while the pool lasts and adjacent cards
// never repeat.
import { HERO_DEFAULT } from '@/lib/hero-images';

// Order is the visual order the fallbacks appear in. All are landscape photos
// in the site's calm nature style: the bundled hero assets plus the two
// Unsplash photos the home page "Specialties" carousel already uses.
export const CARD_FALLBACK_IMAGES: readonly string[] = [
  'https://images.unsplash.com/photo-1490604001847-b712b0c2f967?w=1200&q=80',
  'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1200&q=80',
  HERO_DEFAULT,
  '/images/hero-services.jpg',
  '/images/hero-v2-poster.jpg',
  '/images/hero-intervention.jpg',
];

/**
 * Resolve one image per card. `own` holds each card's WordPress image (or
 * undefined). `avoid` is an image the cards should only use as a last resort
 * (the section hero shown directly above the grid).
 */
export function assignCardImages(
  own: ReadonlyArray<string | undefined>,
  avoid?: string
): string[] {
  const pool = [
    ...CARD_FALLBACK_IMAGES.filter((src) => src !== avoid),
    ...CARD_FALLBACK_IMAGES.filter((src) => src === avoid),
  ];
  const used = new Set(own.filter((src): src is string => Boolean(src)));
  const result: string[] = [];
  let cursor = 0;

  own.forEach((src, i) => {
    if (src) {
      result.push(src);
      return;
    }
    const prev = result[i - 1];
    const next = own[i + 1];
    // First choice: a pool photo not yet used anywhere in this grid.
    let pick = pool.find((p) => !used.has(p));
    // Pool exhausted: rotate, only guaranteeing neighbours differ.
    if (!pick) {
      for (let n = 0; n < pool.length; n++) {
        const candidate = pool[(cursor + n) % pool.length];
        if (candidate !== prev && candidate !== next) {
          pick = candidate;
          cursor = (cursor + n + 1) % pool.length;
          break;
        }
      }
    }
    pick ??= pool[0];
    used.add(pick);
    result.push(pick);
  });

  return result;
}

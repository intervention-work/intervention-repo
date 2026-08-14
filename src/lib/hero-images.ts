// Bundled hero background images (design assets in /public/images) so every
// major page has a hero background regardless of what WordPress provides.
// intervention = mountains, services = beach, everything else = a neutral default.
export const HERO_DEFAULT = '/images/hero-default.jpg';

const HERO_BY_SECTION: Record<string, string> = {
  intervention: '/images/hero-intervention.jpg',
  services: '/images/hero-services.jpg',
};

export function heroForSection(slug: string): string {
  return HERO_BY_SECTION[slug] ?? HERO_DEFAULT;
}

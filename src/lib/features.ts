/**
 * Launch scope flags.
 *
 * Note the distinction: *browsing* traveller posts is part of the core
 * shipping flow (a receiver finds a traveller for a specific delivery),
 * so it is always on and is not flagged. What is hidden is bag space as a
 * standalone passive-income product: listing your own spare capacity, and
 * the homepage marketing for it.
 *
 * Hidden features keep all their code, database tables and server actions
 * intact — flip a flag back to `true` to re-enable everywhere at once.
 */
export const FEATURES = {
  /**
   * Publishing your own spare luggage capacity (`traveller_posts`) and
   * the marketing that promotes it as its own product.
   * Hidden surfaces: /dashboard/posts/new/trip, the "Need Extra Bag
   * Space?" homepage section, the My Trips tab and the Active Trips stat.
   *
   * Browsing and booking existing traveller posts (/find-a-traveller,
   * /traveller/[id], /traveller/[id]/book) is deliberately NOT behind
   * this flag — that is core shipping.
   */
  bagSpacePosting: false,

  /**
   * Travel Buddy. The routes and components were removed in an earlier
   * pass; this flag exists so the nav/marketing hooks stay consistent if
   * the feature is rebuilt.
   */
  travelBuddy: false,
} as const;

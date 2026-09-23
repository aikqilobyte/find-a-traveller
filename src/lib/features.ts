/**
 * Launch scope flags.
 *
 * The first release ships the package-shipping flow only: a receiver posts
 * a package, travellers browse those requests and offer to carry them.
 *
 * The features below are fully built and their code, database tables and
 * server actions are intentionally left untouched — they are only hidden
 * from the UI. Flip a flag back to `true` to re-enable the feature
 * everywhere at once; no other code changes should be required.
 */
export const FEATURES = {
  /**
   * "Extra bag space" marketplace: travellers publish spare luggage
   * capacity (`traveller_posts`) and receivers book it directly.
   * Hidden surfaces: /find-a-traveller, /traveller/[id],
   * /traveller/[id]/book, /dashboard/posts/new/trip, plus the related
   * homepage sections, nav entries and dashboard widgets.
   */
  bagSpaceMarketplace: false,

  /**
   * Travel Buddy. The routes and components were removed in an earlier
   * pass; this flag exists so the nav/marketing hooks stay consistent if
   * the feature is rebuilt.
   */
  travelBuddy: false,
} as const;

// Bangla/English copy for the public-facing surface. Bangladesh is the
// first market, so bn is a first-class language rather than an
// afterthought. Keys are grouped by area; `Dictionary` is derived from
// the English tree so a missing Bangla key is a type error.

export const LOCALES = ["en", "bn"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  bn: "বাংলা",
};

const en = {
  nav: {
    home: "Home",
    explorePosts: "Explore Posts",
    exploreAsTraveller: "Explore as Traveller",
    exploreAsTravellerHint: "See what senders need delivered",
    exploreAsSender: "Explore as Sender",
    exploreAsSenderHint: "See travellers with space on your route",
    about: "About us",
    dashboard: "Dashboard",
    offers: "Offers",
    orders: "Orders",
    myProfile: "My Profile",
    postNowFree: "Post now — it's free",
    joinToday: "Join Today",
    signIn: "Sign in",
    signOut: "Sign out",
    createPost: "Create a post",
  },
  home: {
    heroTitle: "Transform Transit into",
    heroTitleAccent: "Trust",
    heroSubtitle:
      "Send a package with a verified traveller already heading your way — or earn from the luggage space you aren't using. Cheaper than courier, tracked end to end, and your payment is held safely until delivery.",
    howItWorks: "How it works",
    howItWorksSubtitle:
      "Travellers have unused luggage space. Senders have packages to move. We connect the two — safely, and for a fraction of courier prices.",
    sendingTitle: "Sending a package?",
    sendingBody: "Find a verified traveller already heading your way and get it delivered for less.",
    sendingCta: "Find a Traveller",
    travellingTitle: "Travelling soon?",
    travellingBody: "Post your trip, carry a package on your route, and earn from space you aren't using.",
    travellingCta: "Find a Sender",
    safetyTitle: "Your",
    safetyTitleAccent: "safety",
    safetyTitleEnd: "is our priority",
    safetySubtitle:
      "Advanced verification, secure payments, and comprehensive insurance make every transaction safe and worry-free.",
    identityTitle: "Identity Verification",
    identityBody: "Identities stay private while you chat, and are revealed once a deal is funded.",
    paymentTitle: "Secure Payment",
    paymentBody: "Your payment is held safely and only released to the traveller after delivery.",
    reviewTitle: "Review System",
    reviewBody: "Every delivery ends with a two-way review, so trust builds with each trip.",
    exploreAll: "Explore All",
  },
  search: {
    sendingTab: "I'm sending a package",
    travellingTab: "I'm travelling",
    from: "From",
    to: "To",
    locationPlaceholder: "Country, city or airport",
    search: "Search",
    moreFilters: "Add dates, transport or weight (optional)",
    hideFilters: "Hide extra filters",
    fromDate: "From date",
    toDate: "To date",
    transport: "Mode of transport",
    weight: "Weight (kg)",
    any: "Any",
  },
  marketplace: {
    findTravellerTitle: "Find a traveller heading",
    findTravellerAccent: "your way",
    findSenderTitle: "Find a package to carry",
    findSenderAccent: "on your trip",
    filterBy: "Filter By",
    reset: "Reset",
    applyFilters: "Apply Filters",
    noTravellers: "No travellers found",
    noTravellersHint: "Try adjusting your filters or search a different route and date.",
    noSenders: "No packages found",
    noSendersHint: "Try adjusting your filters, or check back soon as new packages are posted daily.",
    viewDetails: "View Details",
    bookSpace: "Book Space",
    view: "View",
    makeOffer: "Make Offer",
  },
  footer: {
    tagline:
      "We help you find trusted travellers to bring your items from abroad. Simple, secure, and community-powered.",
    company: "Company",
    help: "Help",
    about: "About",
    contact: "Contact us",
    support: "Customer Support",
    delivery: "Delivery Details",
    terms: "Terms & Conditions",
    privacy: "Privacy Policy",
    newsletter: "Subscribe to our newsletter",
    emailPlaceholder: "Email address",
    subscribe: "Subscribe Now",
    subscribed: "Thanks for subscribing!",
    rights: "All rights reserved.",
  },
};

// Derived from the English tree, so a missing or misspelled Bangla key is
// a compile error. Values stay `string` (no `as const`) so translations
// aren't forced to match the English literal.
export type Dictionary = typeof en;

const bn: Dictionary = {
  nav: {
    home: "হোম",
    explorePosts: "পোস্ট দেখুন",
    exploreAsTraveller: "ভ্রমণকারী হিসেবে দেখুন",
    exploreAsTravellerHint: "প্রেরকরা কী পাঠাতে চান দেখুন",
    exploreAsSender: "প্রেরক হিসেবে দেখুন",
    exploreAsSenderHint: "আপনার রুটে জায়গা আছে এমন ভ্রমণকারী দেখুন",
    about: "আমাদের সম্পর্কে",
    dashboard: "ড্যাশবোর্ড",
    offers: "অফার",
    orders: "অর্ডার",
    myProfile: "আমার প্রোফাইল",
    postNowFree: "এখনই পোস্ট করুন — একদম ফ্রি",
    joinToday: "আজই যোগ দিন",
    signIn: "সাইন ইন",
    signOut: "সাইন আউট",
    createPost: "পোস্ট করুন",
  },
  home: {
    heroTitle: "ভ্রমণকে পরিণত করুন",
    heroTitleAccent: "বিশ্বাসে",
    heroSubtitle:
      "আপনার পথেই যাচ্ছেন এমন যাচাইকৃত ভ্রমণকারীর মাধ্যমে প্যাকেজ পাঠান — অথবা আপনার অব্যবহৃত লাগেজ স্পেস থেকে আয় করুন। কুরিয়ারের চেয়ে সাশ্রয়ী, শুরু থেকে শেষ পর্যন্ত ট্র্যাকযোগ্য, এবং ডেলিভারি না হওয়া পর্যন্ত আপনার টাকা নিরাপদে জমা থাকে।",
    howItWorks: "কীভাবে কাজ করে",
    howItWorksSubtitle:
      "ভ্রমণকারীদের আছে অব্যবহৃত লাগেজ স্পেস। প্রেরকদের আছে পাঠানোর প্যাকেজ। আমরা দুজনকে যুক্ত করি — নিরাপদে, কুরিয়ারের ভগ্নাংশ খরচে।",
    sendingTitle: "প্যাকেজ পাঠাতে চান?",
    sendingBody: "আপনার পথেই যাচ্ছেন এমন যাচাইকৃত ভ্রমণকারী খুঁজে নিন এবং কম খরচে পাঠান।",
    sendingCta: "ভ্রমণকারী খুঁজুন",
    travellingTitle: "শীঘ্রই ভ্রমণে যাচ্ছেন?",
    travellingBody: "আপনার ট্রিপ পোস্ট করুন, পথে একটি প্যাকেজ বহন করুন, আর অব্যবহৃত জায়গা থেকে আয় করুন।",
    travellingCta: "প্রেরক খুঁজুন",
    safetyTitle: "আপনার",
    safetyTitleAccent: "নিরাপত্তাই",
    safetyTitleEnd: "আমাদের অগ্রাধিকার",
    safetySubtitle:
      "উন্নত যাচাইকরণ, নিরাপদ পেমেন্ট এবং বিমা সুবিধা প্রতিটি লেনদেনকে নিরাপদ ও নিশ্চিন্ত করে।",
    identityTitle: "পরিচয় যাচাইকরণ",
    identityBody: "চ্যাটের সময় পরিচয় গোপন থাকে, চুক্তির টাকা জমা হলে তবেই তা প্রকাশ পায়।",
    paymentTitle: "নিরাপদ পেমেন্ট",
    paymentBody: "আপনার টাকা নিরাপদে জমা থাকে এবং ডেলিভারির পরেই ভ্রমণকারীকে দেওয়া হয়।",
    reviewTitle: "রিভিউ সিস্টেম",
    reviewBody: "প্রতিটি ডেলিভারি শেষে দুই পক্ষই রিভিউ দেয়, তাই প্রতি ট্রিপে বিশ্বাস বাড়ে।",
    exploreAll: "সব দেখুন",
  },
  search: {
    sendingTab: "আমি প্যাকেজ পাঠাচ্ছি",
    travellingTab: "আমি ভ্রমণ করছি",
    from: "কোথা থেকে",
    to: "কোথায়",
    locationPlaceholder: "দেশ, শহর বা এয়ারপোর্ট",
    search: "খুঁজুন",
    moreFilters: "তারিখ, বাহন বা ওজন যোগ করুন (ঐচ্ছিক)",
    hideFilters: "অতিরিক্ত ফিল্টার লুকান",
    fromDate: "শুরুর তারিখ",
    toDate: "শেষ তারিখ",
    transport: "যাতায়াতের মাধ্যম",
    weight: "ওজন (কেজি)",
    any: "যেকোনো",
  },
  marketplace: {
    findTravellerTitle: "আপনার পথে যাচ্ছেন এমন",
    findTravellerAccent: "ভ্রমণকারী খুঁজুন",
    findSenderTitle: "আপনার ট্রিপে বহন করার মতো",
    findSenderAccent: "প্যাকেজ খুঁজুন",
    filterBy: "ফিল্টার",
    reset: "রিসেট",
    applyFilters: "ফিল্টার প্রয়োগ করুন",
    noTravellers: "কোনো ভ্রমণকারী পাওয়া যায়নি",
    noTravellersHint: "ফিল্টার পরিবর্তন করুন অথবা অন্য রুট ও তারিখ দিয়ে খুঁজুন।",
    noSenders: "কোনো প্যাকেজ পাওয়া যায়নি",
    noSendersHint: "ফিল্টার পরিবর্তন করে দেখুন, প্রতিদিনই নতুন প্যাকেজ পোস্ট হচ্ছে।",
    viewDetails: "বিস্তারিত দেখুন",
    bookSpace: "জায়গা বুক করুন",
    view: "দেখুন",
    makeOffer: "অফার দিন",
  },
  footer: {
    tagline:
      "বিদেশ থেকে আপনার জিনিস আনতে বিশ্বস্ত ভ্রমণকারী খুঁজে পেতে আমরা সাহায্য করি। সহজ, নিরাপদ এবং কমিউনিটি-চালিত।",
    company: "কোম্পানি",
    help: "সহায়তা",
    about: "আমাদের সম্পর্কে",
    contact: "যোগাযোগ করুন",
    support: "কাস্টমার সাপোর্ট",
    delivery: "ডেলিভারি তথ্য",
    terms: "শর্তাবলী",
    privacy: "গোপনীয়তা নীতি",
    newsletter: "আমাদের নিউজলেটার সাবস্ক্রাইব করুন",
    emailPlaceholder: "ইমেইল ঠিকানা",
    subscribe: "সাবস্ক্রাইব করুন",
    subscribed: "সাবস্ক্রাইব করার জন্য ধন্যবাদ!",
    rights: "সর্বস্বত্ব সংরক্ষিত।",
  },
};

export const dictionaries: Record<Locale, Dictionary> = { en, bn };

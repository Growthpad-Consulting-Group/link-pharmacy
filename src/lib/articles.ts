// Educational articles. The content is general information, not medical advice.
// Add a new article by appending an entry; the blog listing and article pages pick it up automatically.
export type Block = { type: "p" | "h2" | "ul"; text?: string; items?: string[] };

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string; // ISO date
  readTime: string;
  image: string;
  body: Block[];
};

export const ARTICLE_CATEGORIES = ["Heart health", "Medicine safety", "Vitamins", "Personal care", "Family health"] as const;

export const ARTICLES: Article[] = [
  {
    slug: "understanding-blood-pressure-numbers",
    title: "Understanding your blood pressure numbers",
    excerpt: "What the top and bottom numbers mean, and when to talk to a pharmacist or doctor.",
    category: "Heart health",
    date: "2026-11-10",
    readTime: "5 min read",
    image: "/consultation-image.webp",
    body: [
      { type: "p", text: "Blood pressure is written as two numbers, such as 120/80 mmHg. The top number, systolic, is the pressure in your arteries when your heart beats. The bottom number, diastolic, is the pressure between beats." },
      { type: "h2", text: "What the ranges generally mean" },
      { type: "ul", items: ["Below 120/80: generally considered normal.", "120 to 129 / below 80: elevated, worth monitoring.", "130/80 or higher: the range where a doctor may discuss lifestyle changes or treatment.", "180/120 or higher: seek urgent medical advice straight away."] },
      { type: "h2", text: "Why one reading is not enough" },
      { type: "p", text: "Blood pressure changes through the day with activity, stress, caffeine and even talking. For a clearer picture, take readings at the same time each day, sit quietly for five minutes first, and keep a log to share with your clinician." },
      { type: "h2", text: "Where to get it checked" },
      { type: "p", text: "Many of our branches offer blood pressure checks. A pharmacist can take a reading, explain what it means and tell you when to see a doctor. This article is general information and does not replace advice from your own healthcare professional." },
    ],
  },
  {
    slug: "how-to-read-a-medicine-label",
    title: "How to read a medicine label",
    excerpt: "The key parts of a label, and the questions to ask before you take any medicine.",
    category: "Medicine safety",
    date: "2026-11-03",
    readTime: "4 min read",
    image: "/categories/medicines.svg",
    body: [
      { type: "p", text: "A medicine label packs in a lot of information. Knowing where to look helps you take the right dose, at the right time, safely." },
      { type: "h2", text: "The parts to check" },
      { type: "ul", items: ["Name and strength: check the medicine matches your prescription or the product you intended to buy.", "Active ingredient: useful if you take other medicines, so you do not double up.", "Dose and frequency: how much to take and how often.", "Expiry date: do not use medicine after this date.", "Warnings: side effects, what to avoid, and when to stop and seek help."] },
      { type: "h2", text: "Questions to ask a pharmacist" },
      { type: "ul", items: ["Can I take this with my other medicines or supplements?", "Should I take it with food, or on an empty stomach?", "What side effects should prompt me to call for help?", "Is it safe to drive or operate machinery while taking it?"] },
      { type: "p", text: "Keep medicines in their original packaging, store them as the label says, and never share prescription medicine with someone else." },
    ],
  },
  {
    slug: "vitamin-c-what-you-should-know",
    title: "Vitamin C: what it does and what to know",
    excerpt: "The role vitamin C plays in the body, where it comes from, and how much is useful.",
    category: "Vitamins",
    date: "2026-10-22",
    readTime: "4 min read",
    image: "/products/2.png",
    body: [
      { type: "p", text: "Vitamin C, or ascorbic acid, is an essential nutrient. The body cannot make it, so we need to get it from food or supplements." },
      { type: "h2", text: "What it does" },
      { type: "p", text: "Vitamin C helps the body make collagen for healthy skin, tendons and blood vessels, supports the immune system, and helps the body absorb iron from plant foods." },
      { type: "h2", text: "Good food sources" },
      { type: "ul", items: ["Citrus fruits such as oranges, lemons and grapefruit", "Peppers, especially red", "Strawberries, kiwi and guava", "Broccoli and leafy greens"] },
      { type: "h2", text: "Supplements" },
      { type: "p", text: "Most people who eat a varied diet get enough vitamin C. Supplements are useful for some people, but very high doses can cause stomach upset. If you take other medicines or have a health condition, check with a pharmacist before starting a supplement." },
    ],
  },
  {
    slug: "caring-for-dry-skin-in-cold-weather",
    title: "Caring for dry skin in cold weather",
    excerpt: "Simple habits that protect your skin when the weather turns dry and cold.",
    category: "Personal care",
    date: "2026-10-08",
    readTime: "3 min read",
    image: "/categories/personal-care.svg",
    body: [
      { type: "p", text: "Cold air holds less moisture, and indoor heating dries it out further. The result is often tight, flaky or itchy skin. A few simple habits make a real difference." },
      { type: "h2", text: "Everyday habits" },
      { type: "ul", items: ["Moisturise within a few minutes of washing, while the skin is still damp.", "Use lukewarm rather than hot water in the shower.", "Choose fragrance-free cleansers and products for sensitive skin.", "Protect your hands with gloves outdoors and a barrier cream at home."] },
      { type: "h2", text: "When to see a professional" },
      { type: "p", text: "If dryness does not improve after a few weeks, or if the skin is cracked, bleeding, painful or infected, speak to a pharmacist or doctor. Some conditions need specific treatment." },
    ],
  },
  {
    slug: "building-a-family-first-aid-kit",
    title: "Building a family first aid kit",
    excerpt: "The basics to keep at home for minor injuries and everyday family needs.",
    category: "Family health",
    date: "2026-09-26",
    readTime: "4 min read",
    image: "/categories/kids.svg",
    body: [
      { type: "p", text: "A well-stocked first aid kit helps you deal with small accidents calmly. Check it every few months and replace anything used or out of date." },
      { type: "h2", text: "Essentials to include" },
      { type: "ul", items: ["Sterile plasters in several sizes", "Sterile gauze pads and a roll of bandage", "Antiseptic wipes and saline solution", "Adhesive tape, scissors and tweezers", "A digital thermometer", "Any regular medicines your family needs, stored safely out of reach of children"] },
      { type: "h2", text: "Keep it safe and easy to find" },
      { type: "p", text: "Store the kit somewhere cool and dry, away from children. Keep a list of emergency numbers with it and make sure everyone at home knows where it is." },
    ],
  },
];

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function formatArticleDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

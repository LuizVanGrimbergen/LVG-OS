export type Quote = { text: string; author: string };

/**
 * Well-attributed quotes about discipline, growth and reflection.
 * Classical sources in common English translation; no internet misattributions.
 */
export const QUOTES: Quote[] = [
  { text: "It is not that we have a short time to live, but that we waste a lot of it.", author: "Seneca" },
  { text: "While we are postponing, life speeds by.", author: "Seneca" },
  { text: "We suffer more often in imagination than in reality.", author: "Seneca" },
  { text: "Begin at once to live, and count each separate day as a separate life.", author: "Seneca" },
  { text: "No man was ever wise by chance.", author: "Seneca" },
  { text: "Difficulties strengthen the mind, as labour does the body.", author: "Seneca" },
  { text: "Waste no more time arguing about what a good man should be. Be one.", author: "Marcus Aurelius" },
  { text: "The happiness of your life depends upon the quality of your thoughts.", author: "Marcus Aurelius" },
  {
    text: "Very little is needed to make a happy life; it is all within yourself, in your way of thinking.",
    author: "Marcus Aurelius",
  },
  { text: "If it is not right, do not do it; if it is not true, do not say it.", author: "Marcus Aurelius" },
  { text: "The best revenge is not to be like your enemy.", author: "Marcus Aurelius" },
  { text: "First say to yourself what you would be; and then do what you have to do.", author: "Epictetus" },
  { text: "No man is free who is not master of himself.", author: "Epictetus" },
  {
    text: "Wealth consists not in having great possessions, but in having few wants.",
    author: "Epictetus",
  },
  { text: "The unexamined life is not worth living.", author: "Socrates" },
  { text: "The beginning is the most important part of the work.", author: "Plato" },
  { text: "Well begun is half done.", author: "Aristotle" },
  { text: "No man ever steps in the same river twice.", author: "Heraclitus" },
  { text: "Do not spoil what you have by desiring what you have not.", author: "Epicurus" },
  { text: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
  { text: "Real knowledge is to know the extent of one's ignorance.", author: "Confucius" },
  { text: "Seize the day, put very little trust in tomorrow.", author: "Horace" },
  { text: "Well done is better than well said.", author: "Benjamin Franklin" },
  { text: "Lost time is never found again.", author: "Benjamin Franklin" },
  { text: "Knowing is not enough; we must apply. Willing is not enough; we must do.", author: "Goethe" },
  { text: "Write it on your heart that every day is the best day in the year.", author: "Ralph Waldo Emerson" },
  {
    text: "If one advances confidently in the direction of his dreams… he will meet with a success unexpected in common hours.",
    author: "Henry David Thoreau",
  },
  {
    text: "Nothing in the world is worth having or worth doing unless it means effort, pain, difficulty.",
    author: "Theodore Roosevelt",
  },
  { text: "Genius is one percent inspiration and ninety-nine percent perspiration.", author: "Thomas Edison" },
];

/** The same quote all day, a different one tomorrow. */
export function quoteForDay(dateKey: string): Quote {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dayNumber = Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
  return QUOTES[dayNumber % QUOTES.length];
}

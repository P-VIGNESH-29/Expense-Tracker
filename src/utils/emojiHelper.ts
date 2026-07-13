const emojiMap: Record<string, string> = {
  // By Name
  "house rent": "🏠",
  "electricity bill": "⚡",
  "internet bill": "🌐",
  "gas bill": "🔥",
  "transport": "🚗",
  "shopping": "🛍️",
  "entertainment": "🎬",
  "health": "🏥",
  "utilities": "🛠️",
  "food & drink": "🍔",
  "other": "📦",
  "travel/leisure": "✈️",
  "education/books": "📚",
  "fitness/gym": "💪",
  "groceries": "🛒",
  "investments/savings": "💰",
  "subscriptions/streaming": "📺",
  "gifts/donations": "🎁",
  // Fallbacks by hex colors (matching initial default colors if existing data is found)
  "#f27878": "🏠",
  "#7cc8ff": "⚡",
  "#7c9cff": "🌐",
  "#ff9e7c": "🔥",
  "#c47cff": "🛍️",
  "#5fd7a3": "🎬",
  "#f2b263": "🍔",
  "#8b90a0": "📦",
};

export const emojiList = [
  { emoji: "🏠", label: "House Rent" },
  { emoji: "⚡", label: "Electricity" },
  { emoji: "🌐", label: "Internet" },
  { emoji: "🔥", label: "Gas" },
  { emoji: "🚗", label: "Transport" },
  { emoji: "🛍️", label: "Shopping" },
  { emoji: "🎬", label: "Entertainment" },
  { emoji: "🏥", label: "Health" },
  { emoji: "🛠️", label: "Utilities" },
  { emoji: "🍔", label: "Food & Drink" },
  { emoji: "✈️", label: "Travel/Leisure" },
  { emoji: "📚", label: "Education/Books" },
  { emoji: "💪", label: "Fitness/Gym" },
  { emoji: "🛒", label: "Groceries" },
  { emoji: "💰", label: "Investments/Savings" },
  { emoji: "📺", label: "Subscriptions/Streaming" },
  { emoji: "🎁", label: "Gifts/Donations" },
  { emoji: "📦", label: "Other" }
];

export function getCategoryEmoji(categoryName: string, storedValue?: string): string {
  if (storedValue && storedValue.length <= 4 && !storedValue.startsWith("#")) {
    return storedValue;
  }
  const cleanName = categoryName.toLowerCase().trim();
  if (emojiMap[cleanName]) return emojiMap[cleanName];
  
  if (storedValue) {
    const cleanStored = storedValue.toLowerCase().trim();
    if (emojiMap[cleanStored]) return emojiMap[cleanStored];
  }
  return "📦"; // Default fallback
}

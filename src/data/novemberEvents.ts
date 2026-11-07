const categoryImages = {
  "Arts & Culture":
    "https://images.unsplash.com/photo-1561214115-f2f134cc4912?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
  Community:
    "https://images.unsplash.com/photo-1504159506876-f8338247a14a?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
  Family:
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
  "Food & Drink":
    "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
  Markets:
    "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
  Music:
    "https://images.unsplash.com/photo-1511192336575-5a79af67a629?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
  "Sports & Recreation":
    "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
} as const;

const novemberEventRows = [
  [108, "Delaware River Cleanup", "Community", "01", "9:00 AM – 12:00 PM", "Larry Holmes Drive"],
  [131, "Monday Morning Coffee Club", "Community", "02", "8:00 AM – 9:30 AM", "ThreeBirds Coffee House"],
  [132, "Pajama Storytime", "Family", "02", "6:30 PM – 7:15 PM", "Easton Public Library"],
  [119, "Election Day Coffee Social", "Community", "03", "7:00 AM – 10:00 AM", "Easton Area Neighborhood Center"],
  [133, "Downtown Architecture Sketch Walk", "Arts & Culture", "04", "10:00 AM – 11:30 AM", "Centre Square"],
  [134, "Easton Trivia League", "Food & Drink", "04", "7:00 PM – 9:00 PM", "Two Rivers Brewing Company"],
  [109, "Open Mic at the Public Market", "Music", "05", "7:00 PM – 9:00 PM", "Easton Public Market"],
  [135, "First Friday Gallery Walk", "Arts & Culture", "06", "5:00 PM – 8:00 PM", "Downtown Easton galleries"],
  [136, "Moonlight Market", "Markets", "06", "6:00 PM – 9:00 PM", "Easton Public Market plaza"],
  [120, "Indoor Vintage Market", "Markets", "07", "10:00 AM – 4:00 PM", "Simon Silk Mill"],
  [138, "Fresh Pasta Workshop", "Food & Drink", "10", "6:00 PM – 8:00 PM", "Easton Public Market Kitchen"],
  [121, "Local Authors Reading Night", "Arts & Culture", "12", "6:30 PM – 8:00 PM", "Easton Public Library"],
  [110, "Easton Book & Zine Fair", "Arts & Culture", "13", "4:00 PM – 8:00 PM", "Bank Street Annex"],
  [122, "Community Chili Cook-Off", "Food & Drink", "15", "1:00 PM – 4:00 PM", "College Hill Presbyterian Church"],
  [139, "Mindful Monday Meditation", "Sports & Recreation", "16", "8:00 AM – 8:45 AM", "Karl Stirner Arts Trail"],
  [140, "Independent Film Night", "Arts & Culture", "16", "7:00 PM – 9:15 PM", "Civic Theatre"],
  [141, "Teen Coding Lab", "Family", "17", "4:00 PM – 5:30 PM", "Easton Public Library"],
  [142, "Community Salsa Social", "Music", "18", "6:30 PM – 8:30 PM", "Easton Area Community Center"],
  [143, "Brewing History of Easton", "Food & Drink", "19", "6:00 PM – 7:30 PM", "Sigal Museum"],
  [123, "Friday Night Figure Drawing", "Arts & Culture", "20", "6:00 PM – 8:30 PM", "Karl Stirner Arts Trail studio"],
  [144, "Bushkill Creek Trail Run", "Sports & Recreation", "22", "8:30 AM – 10:00 AM", "Karl Stirner Arts Trail"],
  [145, "Easton Repair Café", "Community", "22", "1:00 PM – 4:00 PM", "Nurture Nature Center"],
  [146, "Monday Night Jazz Session", "Music", "23", "7:00 PM – 9:30 PM", "The Lafayette Bar"],
  [147, "Thanksgiving Pie Workshop", "Food & Drink", "24", "5:30 PM – 8:00 PM", "Easton Public Market Kitchen"],
  [148, "Community Gratitude Gathering", "Community", "25", "6:00 PM – 7:30 PM", "Centre Square"],
  [149, "Easton Turkey Trot", "Sports & Recreation", "26", "8:00 AM – 10:00 AM", "Scott Park"],
  [150, "Black Friday Artisan Market", "Markets", "27", "10:00 AM – 5:00 PM", "Simon Silk Mill"],
  [151, "Riverfront Lights Kickoff", "Family", "27", "6:00 PM – 8:00 PM", "Scott Park"],
  [124, "Small Business Saturday Stroll", "Markets", "28", "10:00 AM – 6:00 PM", "Downtown Easton"],
  [152, "Community Choir Sing-Along", "Music", "29", "3:00 PM – 4:30 PM", "First United Church of Christ"],
] as const;

export const novemberEvents = novemberEventRows.map(
  ([id, title, category, date, time, location]) => ({
    id,
    title,
    category,
    year: 2026,
    date,
    month: "NOV",
    day: new Date(2026, 10, Number(date)).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }),
    time,
    location,
    image: categoryImages[category],
    alt: `${title} in Easton`,
    description: `Join the Easton community for ${title}, a welcoming local event at ${location}.`,
  }),
);

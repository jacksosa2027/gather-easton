import { Hono, type Handler } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import type { CommunityEvent } from "../_shared/events.ts";
import * as kv from "./kv_store.tsx";
import { requireStaffPin } from "./staff_auth.ts";
import { EventSubmissionError, parseEventSubmission } from "./event_submission.ts";
const app = new Hono();
// Re-seed existing KV records so legacy seeds receive approved status.
const SEED_VERSION = 4;

const seedEvents: CommunityEvent[] = [
  {
    id: 101,
    title: "Easton Riverside Yoga",
    category: "Sports & Recreation",
    year: 2026,
    date: "03",
    month: "OCT",
    day: "Saturday, October 3",
    time: "9:00 AM – 10:00 AM",
    location: "Scott Park",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "A community yoga class practicing outdoors",
    description: "Start the weekend with an all-levels yoga session beside the Delaware River. Bring a mat, water, and a suggested donation for the Easton community pantry.",
  },
  {
    id: 102,
    title: "West Ward Porch Music Night",
    category: "Music",
    year: 2026,
    date: "08",
    month: "OCT",
    day: "Thursday, October 8",
    time: "6:00 PM – 8:30 PM",
    location: "West Ward neighborhood",
    image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "Musicians performing together with acoustic instruments",
    description: "Stroll between neighborhood porches for an evening of acoustic sets by local musicians, food pop-ups, and family-friendly activities.",
  },
  {
    id: 103,
    title: "Fall Makers Market",
    category: "Markets",
    year: 2026,
    date: "10",
    month: "OCT",
    day: "Saturday, October 10",
    time: "11:00 AM – 4:00 PM",
    location: "Silk Mill courtyard",
    image: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "Handmade goods displayed at an outdoor market",
    description: "Meet Lehigh Valley artists and shop small-batch ceramics, prints, textiles, jewelry, and seasonal goods in the Silk Mill courtyard.",
  },
  {
    id: 104,
    title: "Easton History After Hours",
    category: "Arts & Culture",
    year: 2026,
    date: "15",
    month: "OCT",
    day: "Thursday, October 15",
    time: "6:30 PM – 8:00 PM",
    location: "Sigal Museum",
    image: "https://images.unsplash.com/photo-1564399579883-451a5d44ec08?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "Visitors exploring exhibits in a history museum",
    description: "Explore Easton's industrial and cultural history through a curator-led gallery tour followed by refreshments and conversation.",
  },
  {
    id: 105,
    title: "College Hill Harvest Picnic",
    category: "Community",
    year: 2026,
    date: "17",
    month: "OCT",
    day: "Saturday, October 17",
    time: "12:00 PM – 3:00 PM",
    location: "Nevin Park",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "Neighbors sharing a picnic in a leafy park",
    description: "Bring a blanket and meet your neighbors for lawn games, a community potluck, children's crafts, and live folk music.",
  },
  {
    id: 106,
    title: "Downtown Soup Stroll",
    category: "Food & Drink",
    year: 2026,
    date: "22",
    month: "OCT",
    day: "Thursday, October 22",
    time: "5:00 PM – 8:00 PM",
    location: "Downtown Easton",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "Warm seasonal soup served in a ceramic bowl",
    description: "Sample seasonal soups from participating downtown restaurants while supporting Easton's food access programs.",
  },
  {
    id: 107,
    title: "Family Science Night",
    category: "Family",
    year: 2026,
    date: "27",
    month: "OCT",
    day: "Tuesday, October 27",
    time: "5:30 PM – 7:30 PM",
    location: "Nurture Nature Center",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "Children taking part in a hands-on science activity",
    description: "Try hands-on experiments, meet local scientists, and learn how weather and waterways shape the Lehigh Valley.",
  },
  {
    id: 108,
    title: "Delaware River Cleanup",
    category: "Community",
    year: 2026,
    date: "01",
    month: "NOV",
    day: "Sunday, November 1",
    time: "9:00 AM – 12:00 PM",
    location: "Larry Holmes Drive",
    image: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "Volunteers cleaning litter from a riverbank",
    description: "Join neighbors for a morning riverfront cleanup. Gloves, bags, and grabbers are provided, followed by coffee and snacks.",
  },
  {
    id: 109,
    title: "Open Mic at the Public Market",
    category: "Music",
    year: 2026,
    date: "05",
    month: "NOV",
    day: "Thursday, November 5",
    time: "7:00 PM – 9:00 PM",
    location: "Easton Public Market",
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "A performer singing into a microphone",
    description: "Local singers, poets, comics, and storytellers take the stage for a relaxed community open mic. Sign-ups begin at 6:30 PM.",
  },
  {
    id: 110,
    title: "Easton Book & Zine Fair",
    category: "Arts & Culture",
    year: 2026,
    date: "13",
    month: "NOV",
    day: "Friday, November 13",
    time: "4:00 PM – 8:00 PM",
    location: "Bank Street Annex",
    image: "https://images.unsplash.com/photo-1526243741027-444d633d7365?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "Independent books and zines arranged on a table",
    description: "Browse independent publications, meet regional writers and illustrators, and join a drop-in zine-making workshop.",
  },
  {
    id: 111,
    title: "Winter Lantern Workshop",
    category: "Family",
    year: 2026,
    date: "03",
    month: "DEC",
    day: "Thursday, December 3",
    time: "5:30 PM – 7:00 PM",
    location: "Easton Area Community Center",
    image: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "Glowing handmade lanterns at a winter celebration",
    description: "Create a glowing paper lantern with teaching artists ahead of Easton's winter festivities. Materials are included.",
  },
  {
    id: 112,
    title: "Holiday Jazz in the Square",
    category: "Music",
    year: 2026,
    date: "19",
    month: "DEC",
    day: "Saturday, December 19",
    time: "6:00 PM – 8:00 PM",
    location: "Centre Square",
    image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "A jazz band performing for an evening crowd",
    description: "Bundle up for a free outdoor concert featuring holiday standards and jazz favorites from Lehigh Valley performers.",
  },
  {
    id: 113,
    title: "Canal Trail Community Ride",
    category: "Sports & Recreation",
    year: 2026,
    date: "04",
    month: "OCT",
    day: "Sunday, October 4",
    time: "10:00 AM – 12:00 PM",
    location: "Hugh Moore Park",
    image: "https://images.unsplash.com/photo-1528629297340-d1d466945dc5?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "Cyclists riding together along a wooded trail",
    description: "Take a relaxed, family-friendly ride along the D&L Trail with local cycling volunteers. Helmets are required and all experience levels are welcome.",
  },
  {
    id: 114,
    title: "Taco Tuesday Taste Tour",
    category: "Food & Drink",
    year: 2026,
    date: "06",
    month: "OCT",
    day: "Tuesday, October 6",
    time: "5:30 PM – 8:30 PM",
    location: "Downtown Easton",
    image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "Colorful tacos served with fresh toppings",
    description: "Follow a self-guided tasting route through downtown restaurants featuring creative tacos, vegetarian options, and local drink pairings.",
  },
  {
    id: 115,
    title: "Paws in the Park",
    category: "Community",
    year: 2026,
    date: "11",
    month: "OCT",
    day: "Sunday, October 11",
    time: "11:00 AM – 2:00 PM",
    location: "Meuser Park",
    image: "https://images.unsplash.com/photo-1558788353-f76d92427f16?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "A happy dog spending time outdoors in a park",
    description: "Meet adoptable pets, visit local pet vendors, and enjoy a community dog walk benefiting regional animal rescue organizations.",
  },
  {
    id: 116,
    title: "Watercolor Postcards of Easton",
    category: "Arts & Culture",
    year: 2026,
    date: "14",
    month: "OCT",
    day: "Wednesday, October 14",
    time: "6:00 PM – 8:00 PM",
    location: "Easton Public Library",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "Watercolor paints and brushes on an artist's table",
    description: "Create a set of watercolor postcards inspired by Easton landmarks in a beginner-friendly workshop led by a local teaching artist.",
  },
  {
    id: 117,
    title: "Sunday Bluegrass Brunch",
    category: "Music",
    year: 2026,
    date: "18",
    month: "OCT",
    day: "Sunday, October 18",
    time: "11:00 AM – 2:00 PM",
    location: "Two Rivers Brewing Company",
    image: "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "An acoustic guitar being played during a live set",
    description: "Enjoy a seasonal brunch menu and live bluegrass from Lehigh Valley musicians in the heart of downtown Easton.",
  },
  {
    id: 118,
    title: "Pumpkin Painting Party",
    category: "Family",
    year: 2026,
    date: "20",
    month: "OCT",
    day: "Tuesday, October 20",
    time: "4:30 PM – 6:30 PM",
    location: "Cottingham Stadium plaza",
    image: "https://images.unsplash.com/photo-1506917728037-b6af01a7d403?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "Decorated pumpkins arranged for an autumn celebration",
    description: "Families can decorate pumpkins, sip cider, and enjoy autumn games. Pumpkins and washable art supplies are included while quantities last.",
  },
  {
    id: 119,
    title: "Election Day Coffee Social",
    category: "Community",
    year: 2026,
    date: "03",
    month: "NOV",
    day: "Tuesday, November 3",
    time: "7:00 AM – 10:00 AM",
    location: "Easton Area Neighborhood Center",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "Fresh coffee being poured into a ceramic cup",
    description: "Stop by before or after voting for complimentary coffee, breakfast snacks, and nonpartisan information about community resources.",
  },
  {
    id: 120,
    title: "Indoor Vintage Market",
    category: "Markets",
    year: 2026,
    date: "07",
    month: "NOV",
    day: "Saturday, November 7",
    time: "10:00 AM – 4:00 PM",
    location: "Simon Silk Mill",
    image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "Vintage clothing and home goods displayed at a market",
    description: "Shop curated vintage clothing, records, furniture, and home goods from independent sellers throughout the Lehigh Valley.",
  },
  {
    id: 121,
    title: "Local Authors Reading Night",
    category: "Arts & Culture",
    year: 2026,
    date: "12",
    month: "NOV",
    day: "Thursday, November 12",
    time: "6:30 PM – 8:00 PM",
    location: "Easton Public Library",
    image: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "An open book resting on a table in a library",
    description: "Hear new fiction, poetry, and memoir excerpts from Easton-area writers, followed by an audience conversation and book signing.",
  },
  {
    id: 122,
    title: "Community Chili Cook-Off",
    category: "Food & Drink",
    year: 2026,
    date: "15",
    month: "NOV",
    day: "Sunday, November 15",
    time: "1:00 PM – 4:00 PM",
    location: "College Hill Presbyterian Church",
    image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "A bowl of hearty chili topped with herbs",
    description: "Taste homemade chili from neighborhood teams and vote for your favorite. Proceeds support winter utility assistance for Easton families.",
  },
  {
    id: 123,
    title: "Friday Night Figure Drawing",
    category: "Arts & Culture",
    year: 2026,
    date: "20",
    month: "NOV",
    day: "Friday, November 20",
    time: "6:00 PM – 8:30 PM",
    location: "Karl Stirner Arts Trail studio",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "An artist sketching with pencils in a studio",
    description: "Practice observational drawing during a relaxed, facilitated studio session. Easels and basic drawing materials are available.",
  },
  {
    id: 124,
    title: "Small Business Saturday Stroll",
    category: "Markets",
    year: 2026,
    date: "28",
    month: "NOV",
    day: "Saturday, November 28",
    time: "10:00 AM – 6:00 PM",
    location: "Downtown Easton",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "Shoppers browsing a welcoming independent store",
    description: "Discover special offers, pop-up vendors, and warm drinks while supporting independent shops throughout downtown Easton.",
  },
  {
    id: 125,
    title: "Giving Tuesday Volunteer Fair",
    category: "Community",
    year: 2026,
    date: "01",
    month: "DEC",
    day: "Tuesday, December 1",
    time: "5:00 PM – 7:30 PM",
    location: "Bank Street Annex",
    image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "Community volunteers gathering around a table",
    description: "Meet Easton nonprofits, learn about winter volunteer opportunities, and find a local cause that matches your interests and schedule.",
  },
  {
    id: 126,
    title: "Easton Cookie Crawl",
    category: "Food & Drink",
    year: 2026,
    date: "05",
    month: "DEC",
    day: "Saturday, December 5",
    time: "12:00 PM – 4:00 PM",
    location: "Downtown Easton",
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "Freshly baked cookies on a wooden table",
    description: "Collect a different holiday cookie from participating downtown businesses and vote for the year's community favorite.",
  },
  {
    id: 127,
    title: "Winter Birding Walk",
    category: "Sports & Recreation",
    year: 2026,
    date: "08",
    month: "DEC",
    day: "Tuesday, December 8",
    time: "8:00 AM – 9:30 AM",
    location: "Karl Stirner Arts Trail",
    image: "https://images.unsplash.com/photo-1444464666168-49d633b86797?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "A small bird perched on a branch in winter",
    description: "Join a naturalist for a gentle morning walk to spot winter birds along Bushkill Creek. A limited number of binoculars are available.",
  },
  {
    id: 128,
    title: "Gingerbread House Workshop",
    category: "Family",
    year: 2026,
    date: "12",
    month: "DEC",
    day: "Saturday, December 12",
    time: "10:30 AM – 12:30 PM",
    location: "Easton Area Community Center",
    image: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "A decorated gingerbread house with colorful candy",
    description: "Build and decorate a gingerbread house with family and friends. Kits, icing, candy, and warm cocoa are provided with registration.",
  },
  {
    id: 129,
    title: "Candlelight Museum Tour",
    category: "Arts & Culture",
    year: 2026,
    date: "17",
    month: "DEC",
    day: "Thursday, December 17",
    time: "6:00 PM – 8:00 PM",
    location: "Sigal Museum",
    image: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "Warm candlelight illuminating a historic interior",
    description: "Experience local history after dark with candlelit galleries, seasonal stories, and live period music throughout the museum.",
  },
  {
    id: 130,
    title: "Festivus Fun Run",
    category: "Sports & Recreation",
    year: 2026,
    date: "23",
    month: "DEC",
    day: "Wednesday, December 23",
    time: "6:00 PM – 7:30 PM",
    location: "Centre Square",
    image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "A group of runners moving through a city street",
    description: "Wear your brightest winter gear for a casual evening run through downtown, followed by hot chocolate and an airing of good-natured grievances.",
  },
  {
    id: 131,
    title: "Monday Morning Coffee Club",
    category: "Community",
    year: 2026,
    date: "02",
    month: "NOV",
    day: "Monday, November 2",
    time: "8:00 AM – 9:30 AM",
    location: "ThreeBirds Coffee House",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "Coffee served at a neighborhood cafe",
    description: "Meet neighbors over coffee and pastries at this casual monthly community gathering.",
  },
  {
    id: 132,
    title: "Pajama Storytime",
    category: "Family",
    year: 2026,
    date: "02",
    month: "NOV",
    day: "Monday, November 2",
    time: "6:30 PM – 7:15 PM",
    location: "Easton Public Library",
    image: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "Colorful children's books arranged on a shelf",
    description: "Wear your coziest pajamas for stories, songs, and a simple bedtime craft for young children and their caregivers.",
  },
  {
    id: 133,
    title: "Downtown Architecture Sketch Walk",
    category: "Arts & Culture",
    year: 2026,
    date: "04",
    month: "NOV",
    day: "Wednesday, November 4",
    time: "10:00 AM – 11:30 AM",
    location: "Centre Square",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "An artist sketching city architecture",
    description: "Bring a sketchbook and explore the details of Easton's historic downtown buildings with a local illustrator.",
  },
  {
    id: 134,
    title: "Easton Trivia League",
    category: "Food & Drink",
    year: 2026,
    date: "04",
    month: "NOV",
    day: "Wednesday, November 4",
    time: "7:00 PM – 9:00 PM",
    location: "Two Rivers Brewing Company",
    image: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "Friends gathering around a table for trivia",
    description: "Build a team and test your knowledge of local history, music, movies, and general trivia.",
  },
  {
    id: 135,
    title: "First Friday Gallery Walk",
    category: "Arts & Culture",
    year: 2026,
    date: "06",
    month: "NOV",
    day: "Friday, November 6",
    time: "5:00 PM – 8:00 PM",
    location: "Downtown Easton galleries",
    image: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "Visitors viewing artwork in a gallery",
    description: "Visit downtown galleries and studios for new exhibitions, artist conversations, and light refreshments.",
  },
  {
    id: 136,
    title: "Moonlight Market",
    category: "Markets",
    year: 2026,
    date: "06",
    month: "NOV",
    day: "Friday, November 6",
    time: "6:00 PM – 9:00 PM",
    location: "Easton Public Market plaza",
    image: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "An evening market illuminated by warm lights",
    description: "Shop handmade goods and late-season produce from local vendors during an evening market with live music.",
  },
  {
    id: 138,
    title: "Fresh Pasta Workshop",
    category: "Food & Drink",
    year: 2026,
    date: "10",
    month: "NOV",
    day: "Tuesday, November 10",
    time: "6:00 PM – 8:00 PM",
    location: "Easton Public Market Kitchen",
    image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "Fresh pasta being prepared by hand",
    description: "Learn to mix, roll, and shape fresh pasta before sitting down to enjoy the finished dish.",
  },
  {
    id: 139,
    title: "Mindful Monday Meditation",
    category: "Sports & Recreation",
    year: 2026,
    date: "16",
    month: "NOV",
    day: "Monday, November 16",
    time: "8:00 AM – 8:45 AM",
    location: "Karl Stirner Arts Trail",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "A peaceful outdoor meditation session",
    description: "Begin the week with gentle movement and guided meditation beside Bushkill Creek.",
  },
  {
    id: 140,
    title: "Independent Film Night",
    category: "Arts & Culture",
    year: 2026,
    date: "16",
    month: "NOV",
    day: "Monday, November 16",
    time: "7:00 PM – 9:15 PM",
    location: "Civic Theatre",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "A classic cinema screen before a film",
    description: "Watch a new regional documentary followed by a conversation with the filmmaker and local community partners.",
  },
  {
    id: 141,
    title: "Teen Coding Lab",
    category: "Family",
    year: 2026,
    date: "17",
    month: "NOV",
    day: "Tuesday, November 17",
    time: "4:00 PM – 5:30 PM",
    location: "Easton Public Library",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "Students learning computer programming together",
    description: "Teens can experiment with beginner-friendly web coding challenges with help from volunteer mentors.",
  },
  {
    id: 142,
    title: "Community Salsa Social",
    category: "Music",
    year: 2026,
    date: "18",
    month: "NOV",
    day: "Wednesday, November 18",
    time: "6:30 PM – 8:30 PM",
    location: "Easton Area Community Center",
    image: "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "Couples dancing together at a social event",
    description: "Learn basic salsa steps during a short lesson, then stay for social dancing with a live DJ.",
  },
  {
    id: 143,
    title: "Brewing History of Easton",
    category: "Food & Drink",
    year: 2026,
    date: "19",
    month: "NOV",
    day: "Thursday, November 19",
    time: "6:00 PM – 7:30 PM",
    location: "Sigal Museum",
    image: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "Local beer served in tasting glasses",
    description: "Discover the people and places behind Easton's brewing history during a talk with optional local beer samples.",
  },
  {
    id: 144,
    title: "Bushkill Creek Trail Run",
    category: "Sports & Recreation",
    year: 2026,
    date: "22",
    month: "NOV",
    day: "Sunday, November 22",
    time: "8:30 AM – 10:00 AM",
    location: "Karl Stirner Arts Trail",
    image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "Runners following a wooded creek trail",
    description: "Join a social three-mile trail run at a conversational pace with coffee afterward.",
  },
  {
    id: 145,
    title: "Easton Repair Café",
    category: "Community",
    year: 2026,
    date: "22",
    month: "NOV",
    day: "Sunday, November 22",
    time: "1:00 PM – 4:00 PM",
    location: "Nurture Nature Center",
    image: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "Tools arranged for a community repair workshop",
    description: "Bring a small appliance, bicycle, garment, or household item and work with volunteers to give it a second life.",
  },
  {
    id: 146,
    title: "Monday Night Jazz Session",
    category: "Music",
    year: 2026,
    date: "23",
    month: "NOV",
    day: "Monday, November 23",
    time: "7:00 PM – 9:30 PM",
    location: "The Lafayette Bar",
    image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "Jazz musicians performing together",
    description: "Hear a house trio perform before opening the stage to guest musicians from around the Lehigh Valley.",
  },
  {
    id: 147,
    title: "Thanksgiving Pie Workshop",
    category: "Food & Drink",
    year: 2026,
    date: "24",
    month: "NOV",
    day: "Tuesday, November 24",
    time: "5:30 PM – 8:00 PM",
    location: "Easton Public Market Kitchen",
    image: "https://images.unsplash.com/photo-1572383672419-ab35444a6934?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "A freshly baked seasonal pie",
    description: "Prepare a seasonal pie from scratch and take it home ready to bake for Thanksgiving dinner.",
  },
  {
    id: 148,
    title: "Community Gratitude Gathering",
    category: "Community",
    year: 2026,
    date: "25",
    month: "NOV",
    day: "Wednesday, November 25",
    time: "6:00 PM – 7:30 PM",
    location: "Centre Square",
    image: "https://images.unsplash.com/photo-1504159506876-f8338247a14a?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "Neighbors gathered beneath warm outdoor lights",
    description: "Share warm cider, music, and messages of gratitude at a welcoming gathering for the whole community.",
  },
  {
    id: 149,
    title: "Easton Turkey Trot",
    category: "Sports & Recreation",
    year: 2026,
    date: "26",
    month: "NOV",
    day: "Thursday, November 26",
    time: "8:00 AM – 10:00 AM",
    location: "Scott Park",
    image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "Community runners taking part in a morning race",
    description: "Run or walk a festive 5K along the riverfront before Thanksgiving dinner. Costumes are encouraged.",
  },
  {
    id: 150,
    title: "Black Friday Artisan Market",
    category: "Markets",
    year: 2026,
    date: "27",
    month: "NOV",
    day: "Friday, November 27",
    time: "10:00 AM – 5:00 PM",
    location: "Simon Silk Mill",
    image: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "Handmade gifts displayed by local artisans",
    description: "Shop handmade holiday gifts from more than 40 regional artists and independent makers.",
  },
  {
    id: 151,
    title: "Riverfront Lights Kickoff",
    category: "Family",
    year: 2026,
    date: "27",
    month: "NOV",
    day: "Friday, November 27",
    time: "6:00 PM – 8:00 PM",
    location: "Scott Park",
    image: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "Festive lights glowing in a public park",
    description: "Celebrate the first night of the riverfront light display with cocoa, carolers, and family activities.",
  },
  {
    id: 152,
    title: "Community Choir Sing-Along",
    category: "Music",
    year: 2026,
    date: "29",
    month: "NOV",
    day: "Sunday, November 29",
    time: "3:00 PM – 4:30 PM",
    location: "First United Church of Christ",
    image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    alt: "A community choir singing together",
    description: "Sing seasonal favorites with Easton community choirs or simply listen and enjoy the music.",
  },
].map((event): CommunityEvent => ({ ...event, status: "approved" }));

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "X-Staff-Pin"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Protect staff paths before their handlers are registered.
app.use("/make-server-1f1ed1f9/events/pending", requireStaffPin);
app.use("/make-server-1f1ed1f9/events/:id/approve", requireStaffPin);
app.use("/make-server-1f1ed1f9/events/:id/reject", requireStaffPin);

// Health check endpoint
app.get("/make-server-1f1ed1f9/health", (c) => {
  return c.json({ status: "ok" });
});

app.get("/make-server-1f1ed1f9/events", async (c) => {
  try {
    const seedVersion = await kv.get("events:seed-version");

    if (seedVersion !== SEED_VERSION) {
      await kv.mset(
        seedEvents.map((event) => `event:seed:${event.id}`),
        seedEvents,
      );
      await kv.set("events:seed-version", SEED_VERSION);
    }

    const storedEvents: CommunityEvent[] = await kv.getByPrefix("event:");
    const events = storedEvents.filter((event) => event.status === "approved");
    events.sort(
      (a, b) =>
        new Date(`${a.year}-${String(eventMonthNumber(a.month)).padStart(2, "0")}-${a.date}`).getTime() -
        new Date(`${b.year}-${String(eventMonthNumber(b.month)).padStart(2, "0")}-${b.date}`).getTime(),
    );

    return c.json({ events });
  } catch (error) {
    console.log(`Failed to load events: ${error}`);
    return c.json({ error: "Unable to load events" }, 500);
  }
});

app.post("/make-server-1f1ed1f9/events", async (c) => {
  try {
    let input: unknown;
    try {
      input = await c.req.json();
    } catch {
      return c.json({ error: "Invalid JSON request body" }, 400);
    }

    const details = parseEventSubmission(input);
    // Use 53 random bits to preserve the shared model's safe-integer numeric IDs.
    const random = crypto.getRandomValues(new Uint32Array(2));
    const event: CommunityEvent = {
      ...details,
      id: random[0] * 2 ** 21 + (random[1] >>> 11),
      status: "pending",
      submittedAt: new Date().toISOString(),
    };

    await kv.set(`event:submission:${event.id}`, event);
    return c.json({ event }, 201);
  } catch (error) {
    if (error instanceof EventSubmissionError) {
      return c.json({ error: error.message }, 400);
    }
    console.log(`Failed to submit event: ${error}`);
    return c.json({ error: "Unable to submit event" }, 500);
  }
});

app.get("/make-server-1f1ed1f9/events/pending", async (c) => {
  try {
    const submissions: CommunityEvent[] = await kv.getByPrefix("event:submission:");
    const events = submissions
      .filter((event) => event.status === "pending")
      .sort((a, b) => (a.submittedAt ?? "").localeCompare(b.submittedAt ?? ""));
    return c.json({ events });
  } catch (error) {
    console.log(`Failed to load pending events: ${error}`);
    return c.json({ error: "Unable to load pending events" }, 500);
  }
});

app.post("/make-server-1f1ed1f9/events/:id/approve", reviewSubmission("approved"));
app.post("/make-server-1f1ed1f9/events/:id/reject", reviewSubmission("rejected"));

function reviewSubmission(status: "approved" | "rejected"): Handler {
  return async (c) => {
    try {
      const id = c.req.param("id") ?? "";
      if (!/^(0|[1-9]\d*)$/.test(id) || !Number.isSafeInteger(Number(id))) {
        return c.json({ error: "Invalid event ID" }, 400);
      }

      let rejectionReason: string | undefined;
      if (status === "rejected") {
        let input: unknown;
        try {
          input = await c.req.json();
        } catch {
          return c.json({ error: "Invalid JSON request body" }, 400);
        }
        if (
          !input || typeof input !== "object" || Array.isArray(input) ||
          !("rejectionReason" in input) || typeof input.rejectionReason !== "string" ||
          !input.rejectionReason.trim()
        ) {
          return c.json({ error: "rejectionReason is required" }, 400);
        }
        rejectionReason = input.rejectionReason.trim();
      }

      const key = `event:submission:${id}`;
      const event: CommunityEvent | undefined = await kv.get(key);
      if (!event) {
        return c.json({ error: "Event submission not found" }, 404);
      }
      if (event.status !== "pending") {
        return c.json({ error: "Event submission has already been reviewed" }, 409);
      }

      const reviewedEvent: CommunityEvent = {
        ...event,
        status,
        reviewedAt: new Date().toISOString(),
      };
      if (status === "rejected") {
        reviewedEvent.rejectionReason = rejectionReason;
      } else {
        delete reviewedEvent.rejectionReason;
      }
      await kv.set(key, reviewedEvent);
      return c.json({ event: reviewedEvent });
    } catch (error) {
      console.log(`Failed to review event submission: ${error}`);
      return c.json({ error: "Unable to review event submission" }, 500);
    }
  };
}

function eventMonthNumber(month: string) {
  return ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"].indexOf(month) + 1;
}

Deno.serve(app.fetch);

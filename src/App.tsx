import { useMemo, useState } from "react";

const images = {
  hero: "https://images.unsplash.com/photo-1731094114672-f6f446490ebb?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1800",
  market:
    "https://images.unsplash.com/photo-1645976442233-bcf005876613?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
  music:
    "https://images.unsplash.com/photo-1506157786151-b8491531f063?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
  art: "https://images.unsplash.com/photo-1615596277229-bd70facf04d6?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
  halloween:
    "https://images.unsplash.com/photo-1477516561410-f0b5dd8319e4?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
  race:
    "https://images.unsplash.com/photo-1735848249737-40ecc4638a2a?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
  holiday:
    "https://images.unsplash.com/photo-1765740692915-18c5729b91f0?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
};

type IconName =
  | "arrow"
  | "calendar"
  | "chevron"
  | "clock"
  | "heart"
  | "location"
  | "menu"
  | "search"
  | "spark"
  | "ticket"
  | "user"
  | "x";

function Icon({ name, filled = false }: { name: IconName; filled?: boolean }) {
  const paths: Record<IconName, React.ReactNode> = {
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />,
    location: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    spark: <path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" />,
    ticket: <><path d="M3 9a3 3 0 0 0 0 6v3h18v-3a3 3 0 0 0 0-6V6H3v3Z" /><path d="M13 6v12" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    x: <><path d="m6 6 12 12M18 6 6 18" /></>,
  };

  return (
    <svg
      aria-hidden="true"
      className="icon"
      fill={filled ? "currentColor" : "none"}
      viewBox="0 0 24 24"
    >
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
        {paths[name]}
      </g>
    </svg>
  );
}

type CommunityEvent = {
  id: number;
  title: string;
  category: string;
  date: string;
  month: string;
  day: string;
  time: string;
  location: string;
  image: string;
  alt: string;
  description: string;
  sourceUrl?: string;
};

const initialEvents: CommunityEvent[] = [
  {
    id: 1,
    title: "2nd Annual Witches Walk — Day 1",
    category: "Family",
    date: "23",
    month: "OCT",
    day: "Friday, October 23",
    time: "4:00 PM – 9:00 PM",
    location: "Centre Square",
    image: images.halloween,
    alt: "Glowing jack-o'-lanterns at night",
    description:
      "Explore downtown shops, art, and food during an immersive Halloween celebration filled with magic, mischief, and autumn fun.",
    sourceUrl: "https://www.eastonmainstreet.org/witches-walk-events",
  },
  {
    id: 2,
    title: "Easton Farmers' Market",
    category: "Markets",
    date: "24",
    month: "OCT",
    day: "Saturday, October 24",
    time: "9:00 AM – 1:00 PM",
    location: "Scott Park",
    image: images.market,
    alt: "Shoppers gathered around a farmers' market produce stand",
    description:
      "Shop from more than 50 local and regional vendors offering fresh food, prepared goods, and crafts.",
    sourceUrl: "https://www.eastonfarmersmarket.com",
  },
  {
    id: 3,
    title: "2nd Annual Witches Walk — Day 2",
    category: "Family",
    date: "24",
    month: "OCT",
    day: "Saturday, October 24",
    time: "3:00 PM – 8:00 PM",
    location: "Scott Park",
    image: images.halloween,
    alt: "Glowing jack-o'-lanterns at night",
    description:
      "Come dressed as a witch or warlock for potion-inspired treats, magical games, and a costume contest at Scott Park.",
    sourceUrl: "https://www.eastonmainstreet.org/witches-walk-events",
  },
  {
    id: 4,
    title: "Red, White & Brews 5K",
    category: "Sports & Recreation",
    date: "25",
    month: "OCT",
    day: "Sunday, October 25",
    time: "10:00 AM – 12:00 PM",
    location: "Weyerbacher Brewing",
    image: images.race,
    alt: "A group of runners taking part in an outdoor race",
    description:
      "Start your Sunday with a community 5K hosted at Weyerbacher Brewing in Easton.",
    sourceUrl: "https://weyerbacher.com/events/",
  },
  {
    id: 5,
    title: "Trunk or Treat",
    category: "Family",
    date: "25",
    month: "OCT",
    day: "Sunday, October 25",
    time: "1:00 PM – 3:00 PM",
    location: "The Neighborhood Center",
    image: images.halloween,
    alt: "Glowing jack-o'-lanterns at night",
    description:
      "Gather at The Neighborhood Center for an afternoon trunk-or-treat event for the Easton community.",
    sourceUrl: "https://www.facebook.com/TheNeighborhoodCenterEaston/",
  },
  {
    id: 6,
    title: "Phillipsburg Easton Halloween Parade",
    category: "Family",
    date: "25",
    month: "OCT",
    day: "Sunday, October 25",
    time: "3:00 PM – 4:00 PM",
    location: "Northampton Street to Centre Square",
    image: images.halloween,
    alt: "Glowing jack-o'-lanterns at night",
    description:
      "Watch an Easton tradition travel from Phillipsburg across the Free Bridge, along Northampton Street, and into Centre Square.",
    sourceUrl: "https://www.phillipsburgnj.org/",
  },
  {
    id: 7,
    title: "Halloween Senior Bingo",
    category: "Community",
    date: "29",
    month: "OCT",
    day: "Thursday, October 29",
    time: "11:00 AM – 1:00 PM",
    location: "Easton Area Community Center",
    image: images.halloween,
    alt: "Glowing jack-o'-lanterns at night",
    description:
      "Join the Easton Recreation Bureau for a Halloween-themed senior bingo gathering at the community center.",
    sourceUrl: "https://www.facebook.com/Eacc901",
  },
  {
    id: 8,
    title: "Easton Farmers' Market",
    category: "Markets",
    date: "31",
    month: "OCT",
    day: "Saturday, October 31",
    time: "9:00 AM – 1:00 PM",
    location: "Scott Park",
    image: images.market,
    alt: "Shoppers gathered around a farmers' market produce stand",
    description:
      "Shop from more than 50 local and regional vendors offering fresh food, prepared goods, and crafts.",
    sourceUrl: "https://www.eastonfarmersmarket.com",
  },
  {
    id: 9,
    title: "City of Easton Trick or Treat Night",
    category: "Family",
    date: "31",
    month: "OCT",
    day: "Saturday, October 31",
    time: "6:00 PM – 8:00 PM",
    location: "Participating residences citywide",
    image: images.halloween,
    alt: "Glowing jack-o'-lanterns at night",
    description:
      "Celebrate Halloween throughout Easton during the city's official trick-or-treat hours.",
    sourceUrl: "https://www.facebook.com/cityofeastonpa",
  },
  {
    id: 10,
    title: "Easton Farmers' Market",
    category: "Markets",
    date: "07",
    month: "NOV",
    day: "Saturday, November 7",
    time: "9:00 AM – 1:00 PM",
    location: "Scott Park",
    image: images.market,
    alt: "Shoppers gathered around a farmers' market produce stand",
    description:
      "Shop from more than 50 local and regional vendors offering fresh food, prepared goods, and crafts.",
    sourceUrl: "https://www.eastonfarmersmarket.com",
  },
  {
    id: 11,
    title: "Veterans Day Ceremony",
    category: "Community",
    date: "11",
    month: "NOV",
    day: "Wednesday, November 11",
    time: "10:30 AM – 11:30 AM",
    location: "Memorial Grove at Upper Hackett Park",
    image: images.art,
    alt: "Historic brick architecture in a community setting",
    description:
      "Gather with the community for Easton's Veterans Day ceremony at Memorial Grove.",
    sourceUrl: "https://www.facebook.com/cityofeastonpa",
  },
  {
    id: 12,
    title: "Easton Farmers' Market",
    category: "Markets",
    date: "14",
    month: "NOV",
    day: "Saturday, November 14",
    time: "9:00 AM – 1:00 PM",
    location: "Scott Park",
    image: images.market,
    alt: "Shoppers gathered around a farmers' market produce stand",
    description:
      "Shop from more than 50 local and regional vendors offering fresh food, prepared goods, and crafts.",
    sourceUrl: "https://www.eastonfarmersmarket.com",
  },
  {
    id: 13,
    title: "Easton Farmers' Market",
    category: "Markets",
    date: "21",
    month: "NOV",
    day: "Saturday, November 21",
    time: "9:00 AM – 1:00 PM",
    location: "Scott Park",
    image: images.market,
    alt: "Shoppers gathered around a farmers' market produce stand",
    description:
      "Shop from more than 50 local and regional vendors offering fresh food, prepared goods, and crafts.",
    sourceUrl: "https://www.eastonfarmersmarket.com",
  },
  {
    id: 14,
    title: "Santa Claus in Centre Square",
    category: "Family",
    date: "15",
    month: "DEC",
    day: "Tuesday, December 15",
    time: "10:00 AM – 11:00 AM",
    location: "Centre Square",
    image: images.holiday,
    alt: "A holiday market stall decorated with glowing lights",
    description:
      "Join the Easton Recreation Bureau for its annual free community visit with Santa in Centre Square.",
    sourceUrl: "https://www.facebook.com/cityofeastonpa",
  },
];

const categories = [
  "All events",
  "Markets",
  "Music",
  "Arts & Culture",
  "Family",
  "Food & Drink",
  "Community",
  "Sports & Recreation",
];

export default function App() {
  const [submittedEvents, setSubmittedEvents] = useState<CommunityEvent[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All events");
  const [saved, setSaved] = useState<number[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CommunityEvent | null>(null);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [upload, setUpload] = useState<{ name: string; url: string } | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [eventCalendarOpen, setEventCalendarOpen] = useState(false);
  const [connectedCalendar, setConnectedCalendar] = useState<"Google" | "Apple" | null>(null);
  const events = [...submittedEvents, ...initialEvents];
  const selectedEventSourceUrl = selectedEvent
    ? initialEvents.find((event) => event.id === selectedEvent.id)?.sourceUrl ?? selectedEvent.sourceUrl
    : undefined;

  const filteredEvents = useMemo(
    () =>
      events.filter(
        (event) =>
          (category === "All events" || event.category === category) &&
          `${event.title} ${event.location} ${event.category}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [category, query],
  );

  function scrollToEvents() {
    document.querySelector("#events")?.scrollIntoView({ behavior: "smooth" });
  }

  function openSubmission() {
    setMobileOpen(false);
    setSubmitted(false);
    setSubmitOpen(true);
  }

  function submitEvent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const eventDate = new Date(`${form.get("date")}T12:00:00`);
    const startTime = String(form.get("time"));
    const formattedTime = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(`2025-01-01T${startTime}`));

    setSubmittedEvents((current) => [
      {
        id: Date.now(),
        title: String(form.get("title")),
        category: String(form.get("category")),
        date: String(eventDate.getDate()).padStart(2, "0"),
        month: eventDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
        day: eventDate.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        }),
        time: `${formattedTime} onward`,
        location: String(form.get("location")),
        image: upload?.url || images.hero,
        alt: upload ? `Uploaded image for ${form.get("title")}` : "Downtown Easton event",
        description: String(form.get("description")),
      },
      ...current,
    ]);
    setCategory("All events");
    setQuery("");
    setSubmitted(true);
    setUpload(null);
    event.currentTarget.reset();
  }

  return (
    <main>
      <section className="hero">
        <img className="hero-image" src={images.hero} alt="A tree-lined Pennsylvania street glowing with autumn color" />
        <div className="hero-shade" />
        <nav className="nav shell" aria-label="Main navigation">
          <a className="brand" href="#" aria-label="Gather Easton home">
            <span className="brand-mark"><Icon name="spark" /></span>
            <span>Gather<span className="brand-dot">.</span>Easton</span>
          </a>
          <div className={`nav-links ${mobileOpen ? "is-open" : ""}`}>
            <a href="#events" onClick={() => setMobileOpen(false)}>Find events</a>
            <a href="#discover" onClick={() => setMobileOpen(false)}>Explore Easton</a>
            <button
              className="calendar-button"
              type="button"
              onClick={() => {
                setMobileOpen(false);
                setCalendarOpen(true);
              }}
            >
              <Icon name="calendar" />
              {connectedCalendar ? `${connectedCalendar} connected` : "Connect calendar"}
            </button>
            <button className="nav-submit" type="button" onClick={openSubmission}>Submit an event</button>
            <button className="profile-button" type="button" aria-label="Open profile">
              <Icon name="user" />
            </button>
          </div>
          <button
            className="menu-button"
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <Icon name={mobileOpen ? "x" : "menu"} />
          </button>
        </nav>

        <div className="hero-content shell">
          <p className="eyebrow"><span /> Your city, all in one place</p>
          <h1>There’s always<br />something happening.</h1>
          <p className="hero-copy">
            Markets, music, art, and everything in between. Discover what’s on in Easton and make
            your next plan.
          </p>
          <button className="primary-button" type="button" onClick={scrollToEvents}>
            Explore events <Icon name="arrow" />
          </button>
        </div>

        <div className="search-wrap shell">
          <div className="search-panel">
            <label className="search-field">
              <span>What are you looking for?</span>
              <div>
                <Icon name="search" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search events, places, and more"
                />
              </div>
            </label>
            <label className="search-field date-field">
              <span>When?</span>
              <div>
                <Icon name="calendar" />
                <select aria-label="Choose a date">
                  <option>Any date</option>
                  <option>This weekend</option>
                  <option>Next week</option>
                  <option>This month</option>
                </select>
              </div>
            </label>
            <button className="search-button" type="button" onClick={scrollToEvents}>
              Search <Icon name="arrow" />
            </button>
          </div>
        </div>
      </section>

      <section className="events-section" id="events">
        <div className="shell">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Plan something good</p>
              <h2>Happening soon</h2>
            </div>
            <button
              className="text-button"
              type="button"
              aria-haspopup="dialog"
              onClick={() => setEventCalendarOpen(true)}
            >
              View calendar <Icon name="arrow" />
            </button>
          </div>

          <div className="category-row" aria-label="Filter by category">
            {categories.map((item) => (
              <button
                className={category === item ? "category active" : "category"}
                key={item}
                type="button"
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          {filteredEvents.length ? (
            <div className="event-grid">
              {filteredEvents.map((event) => (
                <article className="event-card" key={event.id}>
                  <button
                    className="event-image-wrap"
                    type="button"
                    onClick={() => setSelectedEvent(event)}
                    aria-label={`View ${event.title}`}
                  >
                    <img className="event-image" src={event.image} alt={event.alt} />
                    <span className="event-category">{event.category}</span>
                  </button>
                  <div className="event-body">
                    <div className="date-block">
                      <strong>{event.date}</strong>
                      <span>{event.month}</span>
                    </div>
                    <div className="event-info">
                      <p className="event-title">{event.title}</p>
                      <p><Icon name="clock" /> {event.time}</p>
                      <p><Icon name="location" /> {event.location}</p>
                    </div>
                    <button
                      className={`save-button ${saved.includes(event.id) ? "saved" : ""}`}
                      type="button"
                      aria-label={saved.includes(event.id) ? "Remove from saved events" : "Save event"}
                      onClick={() =>
                        setSaved((current) =>
                          current.includes(event.id)
                            ? current.filter((id) => id !== event.id)
                            : [...current, event.id],
                        )
                      }
                    >
                      <Icon name="heart" filled={saved.includes(event.id)} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Icon name="calendar" />
              <p>No events match your search yet.</p>
              <button type="button" onClick={() => { setQuery(""); setCategory("All events"); }}>
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="discover-section" id="discover">
        <div className="discover-art" aria-hidden="true">
          <span className="ring ring-one" />
          <span className="ring ring-two" />
          <span className="river-line" />
          <Icon name="spark" />
        </div>
        <div className="discover-content">
          <p className="section-kicker light">More than a calendar</p>
          <h2>Made for the<br />whole community.</h2>
          <p>
            From weekly traditions to one-night-only moments, Gather Easton brings the city’s
            events into one welcoming place.
          </p>
          <div className="feature-list">
            <div><span><Icon name="search" /></span><p><strong>Easy to discover</strong>Find the right plan in a few clicks.</p></div>
            <div><span><Icon name="ticket" /></span><p><strong>Simple to share</strong>Local organizers can submit events quickly.</p></div>
          </div>
          <a
            className="secondary-button"
            href="https://www.easton-pa.com/308/Area-Attractions"
            target="_blank"
            rel="noreferrer"
          >
            Learn more about Easton <Icon name="arrow" />
          </a>
        </div>
      </section>

      <footer>
        <div className="shell footer-inner">
          <a className="brand footer-brand" href="#">
            <span className="brand-mark"><Icon name="spark" /></span>
            <span>Gather<span className="brand-dot">.</span>Easton</span>
          </a>
          <p>One city. Every event. Your next plan.</p>
          <div>
            <a href="#events">Browse events</a>
            <button type="button" onClick={openSubmission}>Submit an event</button>
          </div>
        </div>
      </footer>

      {eventCalendarOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={() => setEventCalendarOpen(false)}
        >
          <div
            className="event-calendar-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Easton event calendar"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              type="button"
              onClick={() => setEventCalendarOpen(false)}
              aria-label="Close event calendar"
            >
              <Icon name="x" />
            </button>
            <div className="event-calendar-heading">
              <p className="section-kicker">Upcoming in Easton</p>
              <h2>Community calendar</h2>
              <p>Select an event to see its full details and official listing.</p>
            </div>
            <div className="event-calendar-list">
              {events.map((event) => (
                <button
                  className="event-calendar-row"
                  type="button"
                  key={event.id}
                  onClick={() => {
                    setEventCalendarOpen(false);
                    setSelectedEvent(event);
                  }}
                >
                  <span className="calendar-row-date">
                    <strong>{event.date}</strong>
                    <small>{event.month}</small>
                  </span>
                  <span className="calendar-row-info">
                    <span className="calendar-row-category">{event.category}</span>
                    <strong>{event.title}</strong>
                    <small>{event.time} · {event.location}</small>
                  </span>
                  <Icon name="chevron" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedEvent && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelectedEvent(null)}>
          <div
            className="event-modal"
            role="dialog"
            aria-modal="true"
            aria-label={selectedEvent.title}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className="modal-close" type="button" onClick={() => setSelectedEvent(null)} aria-label="Close">
              <Icon name="x" />
            </button>
            <img src={selectedEvent.image} alt={selectedEvent.alt} />
            <div className="modal-content">
              <p className="section-kicker">{selectedEvent.category}</p>
              <h2>{selectedEvent.title}</h2>
              <div className="modal-meta">
                <p><Icon name="calendar" /> {selectedEvent.day}</p>
                <p><Icon name="clock" /> {selectedEvent.time}</p>
                <p><Icon name="location" /> {selectedEvent.location}</p>
              </div>
              <p className="modal-description">{selectedEvent.description}</p>
              <div className="modal-actions">
                <button className="primary-button" type="button">Add to my calendar <Icon name="arrow" /></button>
                {selectedEventSourceUrl && (
                  <a
                    className="source-link"
                    href={selectedEventSourceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Event organizer <Icon name="arrow" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {submitOpen && (
        <div className="modal-backdrop" role="presentation">
          <div className="submit-modal" role="dialog" aria-modal="true" aria-label="Submit an event">
            <button
              className="modal-close"
              type="button"
              onClick={() => setSubmitOpen(false)}
              aria-label="Close event submission"
            >
              <Icon name="x" />
            </button>

            {submitted ? (
              <div className="submission-success">
                <span className="success-icon"><Icon name="spark" /></span>
                <p className="section-kicker">Submission received</p>
                <h2>Thanks for adding to Easton.</h2>
                <p>
                  Your event has been added to the calendar preview. A community calendar
                  administrator would review it before publishing.
                </p>
                <div className="success-actions">
                  <button
                    className="primary-button"
                    type="button"
                    onClick={() => {
                      setSubmitOpen(false);
                      requestAnimationFrame(scrollToEvents);
                    }}
                  >
                    View calendar <Icon name="arrow" />
                  </button>
                  <button className="text-button" type="button" onClick={() => setSubmitted(false)}>
                    Submit another
                  </button>
                </div>
              </div>
            ) : (
              <form className="submission-form" onSubmit={submitEvent}>
                <div className="form-intro">
                  <p className="section-kicker">Share what’s happening</p>
                  <h2>Submit an event</h2>
                  <p>Tell us the essentials. All submissions are reviewed before going live.</p>
                </div>

                <div className="form-grid">
                  <label className="form-field full-field">
                    <span>Event name</span>
                    <input name="title" required placeholder="e.g. Riverside movie night" />
                  </label>

                  <label className="form-field">
                    <span>Category</span>
                    <select name="category" required defaultValue="">
                      <option value="" disabled>Choose a category</option>
                      {categories.slice(1).map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>

                  <label className="form-field">
                    <span>Venue or location</span>
                    <input name="location" required placeholder="Where is it happening?" />
                  </label>

                  <label className="form-field">
                    <span>Date</span>
                    <input name="date" type="date" required />
                  </label>

                  <label className="form-field">
                    <span>Start time</span>
                    <input name="time" type="time" required />
                  </label>

                  <label className="form-field full-field">
                    <span>Description</span>
                    <textarea
                      name="description"
                      required
                      rows={4}
                      placeholder="What should people know about your event?"
                    />
                  </label>

                  <label className="upload-field full-field">
                    <input
                      name="image"
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) setUpload({ name: file.name, url: URL.createObjectURL(file) });
                      }}
                    />
                    <span className="upload-icon"><Icon name="ticket" /></span>
                    <span>
                      <strong>{upload ? upload.name : "Add an event image"}</strong>
                      <small>{upload ? "Image ready to upload" : "PNG or JPG, up to 10 MB"}</small>
                    </span>
                    <span className="upload-action">{upload ? "Change" : "Browse"}</span>
                  </label>
                </div>

                <div className="form-footer">
                  <p>By submitting, you confirm that these event details are accurate.</p>
                  <button className="primary-button" type="submit">
                    Submit event <Icon name="arrow" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {calendarOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setCalendarOpen(false)}>
          <div
            className="calendar-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Connect your calendar"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              type="button"
              onClick={() => setCalendarOpen(false)}
              aria-label="Close calendar connection"
            >
              <Icon name="x" />
            </button>

            {connectedCalendar ? (
              <div className="calendar-connected">
                <span className="success-icon"><Icon name="calendar" /></span>
                <p className="section-kicker">Calendar connected</p>
                <h2>You’re synced with {connectedCalendar}.</h2>
                <p>
                  Easton events you save will now be ready to add to your {connectedCalendar} calendar.
                </p>
                <button className="primary-button" type="button" onClick={() => setCalendarOpen(false)}>
                  Start exploring <Icon name="arrow" />
                </button>
                <button
                  className="disconnect-button"
                  type="button"
                  onClick={() => setConnectedCalendar(null)}
                >
                  Disconnect calendar
                </button>
              </div>
            ) : (
              <div className="calendar-connect">
                <span className="calendar-modal-icon"><Icon name="calendar" /></span>
                <p className="section-kicker">Never miss a local event</p>
                <h2>Connect your calendar</h2>
                <p>
                  Choose a calendar to make adding Easton events to your schedule quick and easy.
                </p>
                <div className="calendar-options">
                  <button type="button" onClick={() => setConnectedCalendar("Google")}>
                    <span className="provider-mark google-mark">G</span>
                    <span><strong>Google Calendar</strong><small>Connect your Google account</small></span>
                    <Icon name="chevron" />
                  </button>
                  <button type="button" onClick={() => setConnectedCalendar("Apple")}>
                    <span className="provider-mark apple-mark">A</span>
                    <span><strong>Apple Calendar</strong><small>Sync with iCloud Calendar</small></span>
                    <Icon name="chevron" />
                  </button>
                </div>
                <p className="calendar-note">
                  You’ll always choose which events are added. Gather Easton cannot edit your calendar.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CommunityEvent } from "../supabase/functions/_shared/events";
import StaffReviewModal from "./components/StaffReviewModal";
import { novemberEvents } from "./data/novemberEvents";
import { createGoogleCalendarUrl } from "./utils/googleCalendar";
import { EventsApiError, eventsApi } from "./utils/eventsApi";
import { getEventDate, getEventDateRange, isEventInDateRange, type EventDateFilter } from "./utils/eventDateFilter";

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
].map((event): CommunityEvent => ({ ...event, status: "approved" }));

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

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getEventSourceUrl(event: CommunityEvent) {
  return event.sourceUrl?.trim() || initialEvents.find((seed) => seed.id === event.id)?.sourceUrl?.trim();
}

export default function App() {
  const [databaseEvents, setDatabaseEvents] = useState<CommunityEvent[]>(novemberEvents);
  const [isRefreshingEvents, setIsRefreshingEvents] = useState(false);
  const [publicEventsError, setPublicEventsError] = useState<string | null>(null);
  const publicEventsRequest = useRef<AbortController | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All events");
  const [dateFilter, setDateFilter] = useState<EventDateFilter>("any");
  const currentDay = new Date().toDateString();
  const dateRange = useMemo(() => getEventDateRange(dateFilter), [dateFilter, currentDay]);
  const rangeLastDay = dateRange ? new Date(dateRange.end) : null;
  rangeLastDay?.setDate(rangeLastDay.getDate() - 1);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CommunityEvent | null>(null);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const submissionInFlight = useRef(false);
  const [upload, setUpload] = useState<{ name: string; url: string } | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [staffReviewOpen, setStaffReviewOpen] = useState(false);
  const staffReviewReturnFocus = useRef<HTMLElement | null>(null);
  const mobileMenuButton = useRef<HTMLButtonElement>(null);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [connectedCalendar, setConnectedCalendar] = useState<"Google" | "Apple" | null>(null);
  const events = useMemo(
    () => [...initialEvents, ...databaseEvents].filter((event) => event.status === "approved"),
    [databaseEvents],
  );
  const selectedEventSourceUrl = selectedEvent
    ? getEventSourceUrl(selectedEvent)
    : undefined;
  const selectedEventDate = selectedEvent ? getEventDate(selectedEvent) : null;

  const matchingEvents = useMemo(
    () =>
      events.filter(
        (event) =>
          (category === "All events" || event.category === category) &&
          `${event.title} ${event.location} ${event.category}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [category, query, events],
  );

  const filteredEvents = useMemo(
    () => matchingEvents.filter((event) => isEventInDateRange(event, dateRange)),
    [matchingEvents, dateRange],
  );

  const refreshPublicEvents = useCallback(async () => {
    publicEventsRequest.current?.abort();
    const controller = new AbortController();
    publicEventsRequest.current = controller;
    setIsRefreshingEvents(true);
    setPublicEventsError(null);

    try {
      const events = await eventsApi.list({ signal: controller.signal });
      if (!controller.signal.aborted) setDatabaseEvents(events);
    } catch {
      if (!controller.signal.aborted) {
        setPublicEventsError("We couldn't refresh the calendar. Your current events are still shown.");
      }
    } finally {
      if (publicEventsRequest.current === controller) {
        publicEventsRequest.current = null;
        setIsRefreshingEvents(false);
      }
    }
  }, []);

  const handleEventApproved = useCallback((approvedEvent: CommunityEvent) => {
    if (approvedEvent.status !== "approved") return;
    setDatabaseEvents((current) => [
      ...current.filter((event) => event.id !== approvedEvent.id),
      approvedEvent,
    ]);
    void refreshPublicEvents();
  }, [refreshPublicEvents]);

  useEffect(() => {
    void refreshPublicEvents();
    return () => {
      const request = publicEventsRequest.current;
      publicEventsRequest.current = null;
      request?.abort();
    };
  }, [refreshPublicEvents]);

  const visibleMonthEvents = filteredEvents.filter((event) => {
    const date = getEventDate(event);
    return date?.getFullYear() === visibleMonth.getFullYear() && date?.getMonth() === visibleMonth.getMonth();
  });
  const daysInVisibleMonth = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth() + 1,
    0,
  ).getDate();
  const firstWeekDay = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth(),
    1,
  ).getDay();
  const calendarDays = Array.from(
    { length: Math.ceil((firstWeekDay + daysInVisibleMonth) / 7) * 7 },
    (_, index) => {
      const day = index - firstWeekDay + 1;
      return day > 0 && day <= daysInVisibleMonth ? day : null;
    },
  );
  const visibleMonthLabel = visibleMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  function changeDateFilter(value: EventDateFilter) {
    setDateFilter(value);
    const range = getEventDateRange(value);
    if (!range) return;
    const firstMatch = matchingEvents
      .map(getEventDate)
      .filter((date): date is Date => date !== null && date >= range.start && date < range.end)
      .sort((a, b) => a.getTime() - b.getTime())[0] ?? range.start;
    setVisibleMonth(new Date(firstMatch.getFullYear(), firstMatch.getMonth(), 1));
  }

  function changeMonth(offset: number) {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  }

  function addToGoogleCalendar(event: CommunityEvent) {
    const calendarUrl = createGoogleCalendarUrl({
      ...event,
      sourceUrl: getEventSourceUrl(event),
    });
    const calendarWindow = window.open(calendarUrl, "_blank", "noopener,noreferrer");
    if (calendarWindow) calendarWindow.opener = null;
  }

  function scrollToEvents() {
    document.querySelector("#events")?.scrollIntoView({ behavior: "smooth" });
  }

  function openSubmission() {
    if (submissionInFlight.current) return;
    setMobileOpen(false);
    setSubmitted(false);
    setSubmissionError(null);
    setUpload(null);
    setSubmitOpen(true);
  }

  function openStaffReview(event: React.MouseEvent<HTMLButtonElement>) {
    if (submissionInFlight.current) return;
    staffReviewReturnFocus.current = mobileOpen ? mobileMenuButton.current : event.currentTarget;
    setMobileOpen(false);
    setStaffReviewOpen(true);
  }

  async function submitEvent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionInFlight.current) return;
    const formElement = event.currentTarget;
    if (!formElement.reportValidity()) return;
    const form = new FormData(formElement);
    submissionInFlight.current = true;
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const eventDate = new Date(`${form.get("date")}T12:00:00`);
      const startTime = new Date(`2000-01-01T${form.get("time")}`);
      const formattedTime = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }).format(startTime);
      const sourceUrl = String(form.get("sourceUrl") ?? "").trim();

      await eventsApi.create({
        title: String(form.get("title")).trim(),
        category: String(form.get("category")),
        year: eventDate.getFullYear(),
        month: eventDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
        date: String(eventDate.getDate()).padStart(2, "0"),
        time: `${formattedTime} onward`,
        location: String(form.get("location")).trim(),
        description: String(form.get("description")).trim(),
        image: images.hero,
        alt: "Downtown Easton event",
        ...(sourceUrl ? { sourceUrl } : {}),
      });

      formElement.reset();
      setUpload(null);
      setSubmitted(true);
    } catch (error) {
      setSubmissionError(
        error instanceof EventsApiError
          ? error.message
          : "We couldn't submit your event. Check your connection and try again.",
      );
    } finally {
      submissionInFlight.current = false;
      setIsSubmitting(false);
    }
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
              className="staff-review-button"
              type="button"
              aria-haspopup="dialog"
              aria-controls="staff-review-dialog"
              aria-expanded={staffReviewOpen}
              onClick={openStaffReview}
            >
              Staff review
            </button>
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
            ref={mobileMenuButton}
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
                <select aria-label="Choose a date" value={dateFilter} onChange={(event) => changeDateFilter(event.target.value as EventDateFilter)}>
                  <option value="any">Any date</option>
                  <option value="weekend">This weekend</option>
                  <option value="week">Next week</option>
                  <option value="month">This month</option>
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
            <div className="month-navigation" aria-label="Calendar month navigation">
              <button
                className="month-arrow previous"
                type="button"
                onClick={() => changeMonth(-1)}
                aria-label="View previous month"
              >
                <Icon name="chevron" />
              </button>
              <p aria-live="polite">{visibleMonthLabel}</p>
              <button
                className="month-arrow"
                type="button"
                onClick={() => changeMonth(1)}
                aria-label="View next month"
              >
                <Icon name="chevron" />
              </button>
            </div>
          </div>

          {isRefreshingEvents && <p className="calendar-refresh-status" role="status">Updating calendar…</p>}
          {publicEventsError && (
            <div className="calendar-refresh-error" role="alert">
              <p>{publicEventsError}</p>
              <button className="text-button" type="button" onClick={() => { void refreshPublicEvents(); }}>
                Retry calendar refresh
              </button>
            </div>
          )}

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

          {dateRange && rangeLastDay && (
            <div className="date-filter-summary">
              <p role="status">
                Showing {dateRange.start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                {" – "}{rangeLastDay.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}.
                {filteredEvents.length > visibleMonthEvents.length && <span>Use the month arrows to view matching events in another month.</span>}
              </p>
              <button className="text-button" type="button" onClick={() => changeDateFilter("any")}>Clear date filter</button>
            </div>
          )}

          <div className="month-calendar">
            <div className="calendar-weekdays" aria-hidden="true">
              {weekDays.map((day) => <span key={day}>{day}</span>)}
            </div>
            <div className="calendar-grid">
              {calendarDays.map((day, index) => {
                const dayEvents = day
                  ? visibleMonthEvents.filter((event) => Number(event.date) === day)
                  : [];

                return (
                  <div
                    className={day ? "calendar-day" : "calendar-day outside-month"}
                    key={`${visibleMonthLabel}-${index}`}
                  >
                    {day && (
                      <>
                        <span className="calendar-day-number">{day}</span>
                        <div className="calendar-day-events">
                          {dayEvents.map((event) => (
                            <button
                              className="calendar-event"
                              type="button"
                              key={event.id}
                              onClick={() => setSelectedEvent(event)}
                              aria-label={`View ${event.title}, ${event.time}`}
                            >
                              <span>{event.time.split(" – ")[0]}</span>
                              <strong>{event.title}</strong>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            {!visibleMonthEvents.length && (
              <div className="calendar-empty">
                <Icon name="calendar" />
                <p>No matching events this month.</p>
                <span>Try another month or adjust your filters.</span>
              </div>
            )}
          </div>
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

      {selectedEvent && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelectedEvent(null)}>
          <div
            className="event-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-details-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className="modal-close" type="button" onClick={() => setSelectedEvent(null)} aria-label="Close">
              <Icon name="x" />
            </button>
            <img src={selectedEvent.image} alt={selectedEvent.alt} />
            <div className="modal-content">
              <p className="section-kicker">{selectedEvent.category}</p>
              <h2 id="event-details-title">{selectedEvent.title}</h2>
              <dl className="modal-meta">
                <div>
                  <dt><Icon name="calendar" /> Date</dt>
                  <dd>
                    {selectedEventDate ? (
                      <time dateTime={`${String(selectedEventDate.getFullYear()).padStart(4, "0")}-${String(selectedEventDate.getMonth() + 1).padStart(2, "0")}-${String(selectedEventDate.getDate()).padStart(2, "0")}`}>
                        {selectedEventDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                      </time>
                    ) : selectedEvent.day || "Date to be confirmed"}
                  </dd>
                </div>
                <div>
                  <dt><Icon name="clock" /> Time</dt>
                  <dd>{selectedEvent.time.trim() || "Time to be confirmed"}</dd>
                </div>
                <div>
                  <dt><Icon name="location" /> Venue</dt>
                  <dd>{selectedEvent.location.trim() || "Venue to be confirmed"}</dd>
                </div>
                {selectedEventSourceUrl && (
                  <div>
                    <dt>Source</dt>
                    <dd>
                      <a className="source-link" href={selectedEventSourceUrl} target="_blank" rel="noopener noreferrer">
                        Event organizer <Icon name="arrow" />
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
              <p className="modal-description">{selectedEvent.description}</p>
              <div className="modal-actions">
                <button
                  className="primary-button"
                  type="button"
                  onClick={() => addToGoogleCalendar(selectedEvent)}
                >
                  Add to Google Calendar <Icon name="arrow" />
                </button>
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
              disabled={isSubmitting}
              aria-label="Close event submission"
            >
              <Icon name="x" />
            </button>

            {submitted ? (
              <div className="submission-success" role="status" aria-live="polite">
                <span className="success-icon"><Icon name="spark" /></span>
                <p className="section-kicker">Submission saved</p>
                <h2>Awaiting review.</h2>
                <p>
                  Your event has been saved for staff review. It will stay off the
                  public calendar until a staff member approves it.
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
              <form className="submission-form" onSubmit={submitEvent} aria-busy={isSubmitting}>
                <div className="form-intro">
                  <p className="section-kicker">Share what’s happening</p>
                  <h2>Submit an event</h2>
                  <p>Tell us the essentials. All submissions are reviewed before going live.</p>
                </div>

                <fieldset className="submission-fields" disabled={isSubmitting}>
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

                    <label className="form-field full-field">
                      <span>Source / organizer link (optional)</span>
                      <input
                        name="sourceUrl"
                        type="url"
                        pattern="https?://.+"
                        placeholder="https://example.com/event"
                        title="Enter a full link starting with http:// or https://."
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
                        <strong>{upload ? upload.name : "Add an image preview"}</strong>
                        <small>Preview only. Images are not saved with your submission.</small>
                      </span>
                      <span className="upload-action">{upload ? "Change" : "Browse"}</span>
                    </label>
                  </div>

                  {submissionError && (
                    <p className="submission-error" role="alert">
                      {submissionError} Your details have been kept so you can try again.
                    </p>
                  )}

                  <div className="form-footer">
                    <p>By submitting, you confirm that these event details are accurate.</p>
                    <button className="primary-button" type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting…" : "Submit event"} <Icon name="arrow" />
                    </button>
                  </div>
                </fieldset>
              </form>
            )}
          </div>
        </div>
      )}

      {staffReviewOpen && (
        <StaffReviewModal
          onClose={() => setStaffReviewOpen(false)}
          returnFocusTo={staffReviewReturnFocus.current}
          onApproved={handleEventApproved}
        />
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

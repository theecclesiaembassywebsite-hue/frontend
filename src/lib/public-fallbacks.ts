export function cloneFallback<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as T;
}

export const DEFAULT_SERVICE_SCHEDULE = [
  {
    id: "svc-sunday-word-life",
    day: "Sunday",
    name: "Word & Life Service",
    time: "8:00 AM",
    description:
      "Our flagship gathering for worship, the Word, and life application.",
  },
  {
    id: "svc-tuesday-intercession",
    day: "Tuesday",
    name: "Prayer Service",
    time: "5:30 PM",
    description:
      "A time of corporate prayer, intercession, and spiritual warfare.",
  },
  {
    id: "svc-friday-worship",
    day: "Friday",
    name: "Worship Service",
    time: "5:30 PM",
    description:
      "An evening of deep worship and encounter with God's presence.",
  },
  {
    id: "svc-monthly-as-unto",
    day: "1st - 3rd",
    dayLabel: "of every month",
    name: "As Unto The Lord",
    time: "6:00 AM & 6:00 PM",
    description:
      "Special consecration services to begin each month in God's presence.",
  },
];

export const DEFAULT_ANNOUNCEMENTS = [
  {
    id: "announcement-welcome-home",
    title: "Welcome Home to The Ecclesia Embassy",
    content:
      "Join us this week for worship, fellowship, and sound teaching as we continue raising Word-cultured ambassadors.",
    published: true,
    publishDate: "2026-01-12T09:00:00.000Z",
    createdAt: "2026-01-12T09:00:00.000Z",
  },
  {
    id: "announcement-cith",
    title: "Church in the House Gatherings Continue Across the City",
    content:
      "Our Church in the House hubs are meeting weekly for prayer, discipleship, and community. Find a hub near you, or join the e-Hub online if no hub is close to you or you are unable to make your home one.",
    published: true,
    publishDate: "2026-02-02T09:00:00.000Z",
    createdAt: "2026-02-02T09:00:00.000Z",
  },
  {
    id: "announcement-intentionality",
    title: "Enrollment Open for the Intentionality Class",
    content:
      "Registrations are open for the next Intentionality Class cohort. This foundational journey will help you grow in doctrine, discipline, and kingdom responsibility.",
    published: true,
    publishDate: "2026-02-16T09:00:00.000Z",
    createdAt: "2026-02-16T09:00:00.000Z",
  },
];

export const DEFAULT_LATEST_MESSAGE = {
  id: "latest-message-intentionality",
  title: "The Place of Intentionality",
  description:
    "A charge to live with clarity, spiritual discipline, and kingdom focus.",
  youtubeId: "K5S6n9czMYU",
  videoUrl: "https://www.youtube.com/watch?v=K5S6n9czMYU",
  createdAt: "2026-03-01T09:00:00.000Z",
};


export const DEFAULT_VIDEO_MESSAGES = [
  {
    id: "video-intentionality",
    title: "The Place of Intentionality",
    youtubeUrl: "https://www.youtube.com/watch?v=K5S6n9czMYU",
    speaker: "Victor Oluwadamilare",
    description:
      "A charge to live with spiritual focus and kingdom purpose.",
    series: "Intentionality",
    createdAt: "2026-03-01T09:00:00.000Z",
    date: "2026-03-01T09:00:00.000Z",
  },
  {
    id: "video-kingdom-patterns",
    title: "Kingdom Patterns for Daily Living",
    youtubeUrl: "https://www.youtube.com/watch?v=K5S6n9czMYU",
    speaker: "Victor Oluwadamilare",
    description:
      "Building a life governed by kingdom values and godly discipline.",
    series: "Kingdom Patterns",
    createdAt: "2026-02-15T09:00:00.000Z",
    date: "2026-02-15T09:00:00.000Z",
  },
  {
    id: "video-prayer-altar",
    title: "Keeping the Prayer Altar Burning",
    youtubeUrl: "https://www.youtube.com/watch?v=K5S6n9czMYU",
    speaker: "Victor Oluwadamilare",
    description:
      "A teaching on prayer, consecration, and sustaining spiritual fire.",
    series: "Prayer & Consecration",
    createdAt: "2026-01-25T09:00:00.000Z",
    date: "2026-01-25T09:00:00.000Z",
  },
];


const ART = {
  jesusIsKing: "https://images.unsplash.com/photo-1504704911898-68304a7d2807?w=400&q=80",
  psalmos: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&q=80",
  proclaimHim: "https://images.unsplash.com/photo-1477233534935-f5e6fe7c1159?w=400&q=80",
  eternalSpirit: "https://images.unsplash.com/photo-1491466424936-e304919aada7?w=400&q=80",
  thisSameJesus: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80",
  greatnessOfGod: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&q=80",
  spirit: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=400&q=80",
  zamar: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80",
  singles: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=400&q=80",
};

const SP = {
  jesusIsKing: "https://open.spotify.com/album/1ZLtFziPv7gGmVLvYKFH3O",
  psalmos: "https://open.spotify.com/album/1Soo1P1jbdC2kqEPaFbizk",
  awamaridi: "https://open.spotify.com/album/6hi28SJ4uqeo3zIV3rK1Dg",
  proclaimHim: "https://open.spotify.com/album/0iOq7qbgH4nhsK01epv3Ic",
  liftTheName: "https://open.spotify.com/album/4LBespD6I4x5V5mhslfDLe",
  godOfSigns: "https://open.spotify.com/album/69ILTyrb5uMaWpVSTDMN5F",
  eternalSpirit: "https://open.spotify.com/album/4pBLiGjuZUi6u6FyGisc7t",
  thisSameJesus: "https://open.spotify.com/album/1I0nmZ6b7F90XArMHerE2o",
  greatnessOfGod: "https://open.spotify.com/album/7nrbiJPKgHjVbKGMKvUa0w",
  spirit: "https://open.spotify.com/album/3a2ufLJWcHeviLNZwJeVwh",
  zamar: "https://open.spotify.com/album/3yfUntEuN9h5IVGzXjOeTd",
  artist: "https://open.spotify.com/artist/1PP9KSpeqiUq7eGyVe8F1p",
};

export const DEFAULT_MUSIC_TRACKS = [
  // ── Jesus is King (2025) ────────────────────────────────────────────────
  { id: "music-shout-of-the-king", title: "Shout of the King", album: "Jesus is King", artworkUrl: ART.jesusIsKing, audioUrl: SP.jesusIsKing, duration: "06:28", price: 0, createdAt: "2025-01-15T09:00:00.000Z" },
  { id: "music-his-name-is-jesus", title: "His Name is Jesus", album: "Jesus is King", artworkUrl: ART.jesusIsKing, audioUrl: SP.jesusIsKing, duration: "06:45", price: 0, createdAt: "2025-01-15T09:00:00.000Z" },
  { id: "music-hail-to-the-high-priest", title: "Hail to The High Priest", album: "Jesus is King", artworkUrl: ART.jesusIsKing, audioUrl: SP.jesusIsKing, duration: "07:02", price: 0, createdAt: "2025-01-15T09:00:00.000Z" },
  { id: "music-jesus-is-my-king", title: "Jesus is My King", album: "Jesus is King", artworkUrl: ART.jesusIsKing, audioUrl: SP.jesusIsKing, duration: "06:15", price: 0, createdAt: "2025-01-15T09:00:00.000Z" },
  { id: "music-i-belong", title: "I Belong", album: "Jesus is King", artworkUrl: ART.jesusIsKing, audioUrl: SP.jesusIsKing, duration: "05:48", price: 0, createdAt: "2025-01-15T09:00:00.000Z" },
  { id: "music-blow-my-mind", title: "Blow My Mind", album: "Jesus is King", artworkUrl: ART.jesusIsKing, audioUrl: SP.jesusIsKing, duration: "06:37", price: 0, createdAt: "2025-01-15T09:00:00.000Z" },
  { id: "music-our-rock", title: "Our Rock", album: "Jesus is King", artworkUrl: ART.jesusIsKing, audioUrl: SP.jesusIsKing, duration: "07:12", price: 0, createdAt: "2025-01-15T09:00:00.000Z" },
  { id: "music-a-new-song", title: "A New Song", album: "Jesus is King", artworkUrl: ART.jesusIsKing, audioUrl: SP.jesusIsKing, duration: "07:00", price: 0, createdAt: "2025-01-15T09:00:00.000Z" },
  // ── Awamaridi single (2024) ─────────────────────────────────────────────
  { id: "music-awamaridi", title: "Awamaridi (The Infinitely Unsearchable God)", album: "Awamaridi", artworkUrl: ART.psalmos, audioUrl: SP.awamaridi, duration: "05:59", price: 0, createdAt: "2024-09-01T09:00:00.000Z" },
  // ── PSALMOS: The Witness (2024) ─────────────────────────────────────────
  { id: "music-holy-is-the-lord", title: "Holy is the Lord", album: "PSALMOS (The Witness)", artworkUrl: ART.psalmos, audioUrl: SP.psalmos, duration: "05:45", price: 0, createdAt: "2024-10-01T09:00:00.000Z" },
  { id: "music-song-of-a-child", title: "The Song of a Child to a Father", album: "PSALMOS (The Witness)", artworkUrl: ART.psalmos, audioUrl: SP.psalmos, duration: "06:12", price: 0, createdAt: "2024-10-01T09:00:00.000Z" },
  { id: "music-i-will-love-you", title: "I will Love You", album: "PSALMOS (The Witness)", artworkUrl: ART.psalmos, audioUrl: SP.psalmos, duration: "04:58", price: 0, createdAt: "2024-10-01T09:00:00.000Z" },
  { id: "music-if-they-had-known", title: "If They Had Known", album: "PSALMOS (The Witness)", artworkUrl: ART.psalmos, audioUrl: SP.psalmos, duration: "05:23", price: 0, createdAt: "2024-10-01T09:00:00.000Z" },
  { id: "music-agbanilagbatan", title: "Agbanilagbatan", album: "PSALMOS (The Witness)", artworkUrl: ART.psalmos, audioUrl: SP.psalmos, duration: "04:47", price: 0, createdAt: "2024-10-01T09:00:00.000Z" },
  { id: "music-nobody-do-pass-you", title: "Nobody Do Pass You", album: "PSALMOS (The Witness)", artworkUrl: ART.psalmos, audioUrl: SP.psalmos, duration: "05:08", price: 0, createdAt: "2024-10-01T09:00:00.000Z" },
  { id: "music-bulie-jesus", title: "Bulie Jesus", album: "PSALMOS (The Witness)", artworkUrl: ART.psalmos, audioUrl: SP.psalmos, duration: "05:31", price: 0, createdAt: "2024-10-01T09:00:00.000Z" },
  { id: "music-hosanna-eh", title: "Hosanna eh", album: "PSALMOS (The Witness)", artworkUrl: ART.psalmos, audioUrl: SP.psalmos, duration: "04:51", price: 0, createdAt: "2024-10-01T09:00:00.000Z" },
  // ── Proclaim Him (2023) ─────────────────────────────────────────────────
  { id: "music-joy-in-the-holy-ghost", title: "Joy in the Holy Ghost", album: "Proclaim Him", artworkUrl: ART.proclaimHim, audioUrl: SP.proclaimHim, duration: "06:23", price: 0, createdAt: "2023-06-01T09:00:00.000Z" },
  { id: "music-hosanna-to-the-king", title: "Hosanna to the King of kings", album: "Proclaim Him", artworkUrl: ART.proclaimHim, audioUrl: SP.proclaimHim, duration: "05:48", price: 0, createdAt: "2023-06-01T09:00:00.000Z" },
  { id: "music-kings-will-rise", title: "Kings will Rise, Kings will Fall", album: "Proclaim Him", artworkUrl: ART.proclaimHim, audioUrl: SP.proclaimHim, videoUrl: "https://www.youtube.com/watch?v=ViPVorfvpDk", duration: "06:15", price: 0, createdAt: "2023-06-01T09:00:00.000Z" },
  { id: "music-holy-holy-holy", title: "Holy Holy Holy", album: "Proclaim Him", artworkUrl: ART.proclaimHim, audioUrl: SP.proclaimHim, duration: "05:02", price: 0, createdAt: "2023-06-01T09:00:00.000Z" },
  { id: "music-morale-eh", title: "Morale eh", album: "Proclaim Him", artworkUrl: ART.proclaimHim, audioUrl: SP.proclaimHim, duration: "07:12", price: 0, createdAt: "2023-06-01T09:00:00.000Z" },
  // ── Singles (2022) ──────────────────────────────────────────────────────
  { id: "music-lift-the-name-of-jesus", title: "Lift the Name of Jesus", album: "Single", artworkUrl: ART.singles, audioUrl: SP.liftTheName, duration: "05:48", price: 0, createdAt: "2022-09-01T09:00:00.000Z" },
  { id: "music-god-of-signs", title: "God of Signs", album: "Single", artworkUrl: ART.singles, audioUrl: SP.godOfSigns, duration: "05:22", price: 0, createdAt: "2022-06-01T09:00:00.000Z" },
  // ── Eternal Spirit (2023) ───────────────────────────────────────────────
  { id: "music-eternal-spirit", title: "Eternal Spirit", album: "Eternal Spirit", artworkUrl: ART.eternalSpirit, audioUrl: SP.eternalSpirit, duration: "08:14", price: 0, createdAt: "2023-02-01T09:00:00.000Z" },
  { id: "music-i-offer-my-life", title: "I Offer My Life", album: "Eternal Spirit", artworkUrl: ART.eternalSpirit, audioUrl: SP.eternalSpirit, duration: "06:45", price: 0, createdAt: "2023-02-01T09:00:00.000Z" },
  { id: "music-ruach-hakodesh", title: "Ruach HaKodesh", album: "Eternal Spirit", artworkUrl: ART.eternalSpirit, audioUrl: SP.eternalSpirit, duration: "07:28", price: 0, createdAt: "2023-02-01T09:00:00.000Z" },
  { id: "music-spirit-chant", title: "Spirit Chant", album: "Eternal Spirit", artworkUrl: ART.eternalSpirit, audioUrl: SP.eternalSpirit, duration: "06:52", price: 0, createdAt: "2023-02-01T09:00:00.000Z" },
  { id: "music-ill-be-there", title: "I'll Be There", album: "Eternal Spirit", artworkUrl: ART.eternalSpirit, audioUrl: SP.eternalSpirit, duration: "05:56", price: 0, createdAt: "2023-02-01T09:00:00.000Z" },
  // ── This Same Jesus (2021) ──────────────────────────────────────────────
  { id: "music-hes-christ", title: "He's Christ", album: "This Same Jesus", artworkUrl: ART.thisSameJesus, audioUrl: SP.thisSameJesus, duration: "06:02", price: 0, createdAt: "2021-11-01T09:00:00.000Z" },
  { id: "music-wind-beneath", title: "You are the Wind Beneath", album: "This Same Jesus", artworkUrl: ART.thisSameJesus, audioUrl: SP.thisSameJesus, duration: "05:48", price: 0, createdAt: "2021-11-01T09:00:00.000Z" },
  { id: "music-jesus-we-love-you", title: "Jesus, We love You", album: "This Same Jesus", artworkUrl: ART.thisSameJesus, audioUrl: SP.thisSameJesus, duration: "06:15", price: 0, createdAt: "2021-11-01T09:00:00.000Z" },
  { id: "music-oh-lamb-of-god", title: "Oh Lamb of God", album: "This Same Jesus", artworkUrl: ART.thisSameJesus, audioUrl: SP.thisSameJesus, duration: "05:32", price: 0, createdAt: "2021-11-01T09:00:00.000Z" },
  { id: "music-jesus-na-you-biko", title: "Jesus na You biko", album: "This Same Jesus", artworkUrl: ART.thisSameJesus, audioUrl: SP.thisSameJesus, duration: "06:47", price: 0, createdAt: "2021-11-01T09:00:00.000Z" },
  { id: "music-they-are-one", title: "They are One (Trinity song)", album: "This Same Jesus", artworkUrl: ART.thisSameJesus, audioUrl: SP.thisSameJesus, duration: "05:36", price: 0, createdAt: "2021-11-01T09:00:00.000Z" },
  // ── The Greatness of Our God (2021) ─────────────────────────────────────
  { id: "music-who-is-like-the-lord", title: "Who is like the Lord", album: "The Greatness of Our God", artworkUrl: ART.greatnessOfGod, audioUrl: SP.greatnessOfGod, duration: "05:22", price: 0, createdAt: "2021-08-01T09:00:00.000Z" },
  { id: "music-who-is-like-the-lord-reprise", title: "Who is like the Lord (Reprise)", album: "The Greatness of Our God", artworkUrl: ART.greatnessOfGod, audioUrl: SP.greatnessOfGod, duration: "03:18", price: 0, createdAt: "2021-08-01T09:00:00.000Z" },
  { id: "music-yaweh-malak", title: "Yaweh Malak", album: "The Greatness of Our God", artworkUrl: ART.greatnessOfGod, audioUrl: SP.greatnessOfGod, duration: "05:47", price: 0, createdAt: "2021-08-01T09:00:00.000Z" },
  { id: "music-victorious-god", title: "Victorious God", album: "The Greatness of Our God", artworkUrl: ART.greatnessOfGod, audioUrl: SP.greatnessOfGod, duration: "05:14", price: 0, createdAt: "2021-08-01T09:00:00.000Z" },
  { id: "music-great-god", title: "Great God", album: "The Greatness of Our God", artworkUrl: ART.greatnessOfGod, audioUrl: SP.greatnessOfGod, duration: "05:02", price: 0, createdAt: "2021-08-01T09:00:00.000Z" },
  { id: "music-big-big-god", title: "Big Big God", album: "The Greatness of Our God", artworkUrl: ART.greatnessOfGod, audioUrl: SP.greatnessOfGod, duration: "04:58", price: 0, createdAt: "2021-08-01T09:00:00.000Z" },
  { id: "music-you-are-the-lord", title: "You are The Lord", album: "The Greatness of Our God", artworkUrl: ART.greatnessOfGod, audioUrl: SP.greatnessOfGod, duration: "05:35", price: 0, createdAt: "2021-08-01T09:00:00.000Z" },
  { id: "music-to-the-lamb", title: "To the Lamb Who sits on the Throne", album: "The Greatness of Our God", artworkUrl: ART.greatnessOfGod, audioUrl: SP.greatnessOfGod, videoUrl: "https://www.youtube.com/watch?v=jptbV5aHDwA", duration: "05:26", price: 0, createdAt: "2021-08-01T09:00:00.000Z" },
  // ── Spirit (2021) ────────────────────────────────────────────────────────
  { id: "music-holy-ghost-lead-me", title: "Holy Ghost Lead Me Into Christ", album: "Spirit", artworkUrl: ART.spirit, audioUrl: SP.spirit, duration: "09:12", price: 0, createdAt: "2021-05-01T09:00:00.000Z" },
  { id: "music-just-like-2-lovers", title: "Just Like 2 Lovers", album: "Spirit", artworkUrl: ART.spirit, audioUrl: SP.spirit, duration: "07:48", price: 0, createdAt: "2021-05-01T09:00:00.000Z" },
  { id: "music-spirit-you-are", title: "Spirit You Are", album: "Spirit", artworkUrl: ART.spirit, audioUrl: SP.spirit, duration: "08:04", price: 0, createdAt: "2021-05-01T09:00:00.000Z" },
  { id: "music-holy-holy-holy-ghost", title: "Holy Holy Holy Ghost", album: "Spirit", artworkUrl: ART.spirit, audioUrl: SP.spirit, duration: "07:52", price: 0, createdAt: "2021-05-01T09:00:00.000Z" },
  { id: "music-i-worship-the-father", title: "I Worship The Father", album: "Spirit", artworkUrl: ART.spirit, audioUrl: SP.spirit, duration: "08:45", price: 0, createdAt: "2021-05-01T09:00:00.000Z" },
  { id: "music-i-raise-incense", title: "I Raise Incense", album: "Spirit", artworkUrl: ART.spirit, audioUrl: SP.spirit, duration: "09:02", price: 0, createdAt: "2021-05-01T09:00:00.000Z" },
  { id: "music-holy-ghost-chant", title: "Holy Ghost Chant", album: "Spirit", artworkUrl: ART.spirit, audioUrl: SP.spirit, duration: "06:58", price: 0, createdAt: "2021-05-01T09:00:00.000Z" },
  { id: "music-river-flow", title: "River Flow", album: "Spirit", artworkUrl: ART.spirit, audioUrl: SP.spirit, duration: "08:48", price: 0, createdAt: "2021-05-01T09:00:00.000Z" },
  { id: "music-spirit-burn", title: "Spirit Burn", album: "Spirit", artworkUrl: ART.spirit, audioUrl: SP.spirit, duration: "10:31", price: 0, createdAt: "2021-05-01T09:00:00.000Z" },
  // ── ZAMAR: Sounds of Worship (2022) ─────────────────────────────────────
  { id: "music-piano-medley", title: "Piano Medley", album: "ZAMAR: Sounds of Worship", artworkUrl: ART.zamar, audioUrl: SP.zamar, duration: "04:45", price: 0, createdAt: "2022-01-01T09:00:00.000Z" },
  { id: "music-give-thanks", title: "Give Thanks", album: "ZAMAR: Sounds of Worship", artworkUrl: ART.zamar, audioUrl: SP.zamar, duration: "05:12", price: 0, createdAt: "2022-01-01T09:00:00.000Z" },
  { id: "music-hes-able", title: "He's Able", album: "ZAMAR: Sounds of Worship", artworkUrl: ART.zamar, audioUrl: SP.zamar, duration: "04:58", price: 0, createdAt: "2022-01-01T09:00:00.000Z" },
  { id: "music-this-is-the-day", title: "This is the Day / Praising the Lord", album: "ZAMAR: Sounds of Worship", artworkUrl: ART.zamar, audioUrl: SP.zamar, duration: "05:34", price: 0, createdAt: "2022-01-01T09:00:00.000Z" },
  { id: "music-jesus-at-the-center", title: "Jesus at the Center / All About You", album: "ZAMAR: Sounds of Worship", artworkUrl: ART.zamar, audioUrl: SP.zamar, duration: "05:47", price: 0, createdAt: "2022-01-01T09:00:00.000Z" },
  { id: "music-i-will-call-upon-the-lord", title: "I will Call upon the Lord / Hallelujah", album: "ZAMAR: Sounds of Worship", artworkUrl: ART.zamar, audioUrl: SP.zamar, duration: "05:02", price: 0, createdAt: "2022-01-01T09:00:00.000Z" },
  { id: "music-what-can-i-offer", title: "What can I Offer / Elohim Adonai", album: "ZAMAR: Sounds of Worship", artworkUrl: ART.zamar, audioUrl: SP.zamar, duration: "04:44", price: 0, createdAt: "2022-01-01T09:00:00.000Z" },
  // ── Additional tracks ────────────────────────────────────────────────────
  { id: "music-out-of-fullness", title: "Out of Fullness", album: "The Ecclesia Levites", artworkUrl: ART.spirit, audioUrl: SP.artist, videoUrl: "https://www.youtube.com/watch?v=yuZC2zjgzV8", duration: "06:14", price: 0, createdAt: "2021-03-01T09:00:00.000Z" },
  { id: "music-we-have-fellowship", title: "We Have Fellowship", album: "The Ecclesia Levites", artworkUrl: ART.singles, audioUrl: SP.artist, duration: "06:12", price: 0, createdAt: "2021-01-01T09:00:00.000Z" },
  { id: "music-kadosh", title: "Kadosh / The Reigning King", album: "The Ecclesia Levites", artworkUrl: ART.singles, audioUrl: SP.artist, duration: "07:08", price: 0, createdAt: "2021-01-01T09:00:00.000Z" },
  { id: "music-unto-the-master", title: "Unto The Master I Come", album: "The Ecclesia Levites", artworkUrl: ART.singles, audioUrl: SP.artist, duration: "05:45", price: 0, createdAt: "2021-01-01T09:00:00.000Z" },
  { id: "music-most-high", title: "Most High", album: "The Ecclesia Levites", artworkUrl: ART.singles, audioUrl: SP.artist, duration: "06:02", price: 0, createdAt: "2021-01-01T09:00:00.000Z" },
  { id: "music-your-greatness", title: "Your Greatness", album: "The Ecclesia Levites", artworkUrl: ART.singles, audioUrl: SP.artist, duration: "05:38", price: 0, createdAt: "2021-01-01T09:00:00.000Z" },
  { id: "music-i-rejoice", title: "I Rejoice", album: "The Ecclesia Levites", artworkUrl: ART.singles, audioUrl: SP.artist, duration: "04:52", price: 0, createdAt: "2021-01-01T09:00:00.000Z" },
  { id: "music-god-of-light-and-glory", title: "God of Light and Glory", album: "The Ecclesia Levites", artworkUrl: ART.singles, audioUrl: SP.artist, duration: "05:56", price: 0, createdAt: "2021-01-01T09:00:00.000Z" },
];


export const DEFAULT_BLOG_POSTS = [
  {
    id: "blog-word-culture",
    slug: "raising-word-cultured-ambassadors",
    title: "Raising Word-Cultured Ambassadors",
    excerpt:
      "What it means to be shaped by Scripture until it governs posture, decisions, and daily life.",
    content:
      "<p>The call of The Ecclesia Embassy is not merely to gather believers, but to raise men and women whose lives are governed by the Word of God. A Word-cultured believer is not moved by trends, pressure, or emotion first; he is framed by truth.</p><p>When the Word becomes culture, devotion moves beyond routine and becomes nature. It shapes how we think, how we speak, how we serve, and how we respond in moments of uncertainty.</p><p>This is the burden of our ministry: to form believers who carry heaven's values into homes, workplaces, cities, and nations.</p>",
    category: "Teaching",
    imageUrl:
      "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1200&q=80",
    createdAt: "2026-01-06T09:00:00.000Z",
    publishedAt: "2026-01-06T09:00:00.000Z",
    authorName: "The Ecclesia Embassy",
    tags: ["Word", "Discipleship", "Identity"],
    comments: [
      {
        id: "comment-word-culture",
        content: "This was a timely reminder to build my life around Scripture.",
        createdAt: "2026-01-07T09:00:00.000Z",
        user: {
          profile: {
            firstName: "Grace",
            lastName: "A.",
          },
        },
      },
    ],
  },
  {
    id: "blog-prayer-altar",
    slug: "keeping-the-prayer-altar-burning",
    title: "Keeping the Prayer Altar Burning",
    excerpt:
      "Prayer is not an emergency valve for the believer; it is the atmosphere of kingdom life.",
    content:
      "<p>Prayer sustains sensitivity, alignment, and spiritual fire. When the altar is neglected, discernment weakens and devotion becomes mechanical.</p><p>Corporate prayer and personal prayer are both necessary. One teaches us to stand together; the other trains us to remain before God in secret.</p><p>The believer who keeps the altar burning carries clarity in public because he has cultivated communion in private.</p>",
    category: "Devotional",
    imageUrl:
      "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1200&q=80",
    createdAt: "2026-01-20T09:00:00.000Z",
    publishedAt: "2026-01-20T09:00:00.000Z",
    authorName: "The Ecclesia Embassy",
    tags: ["Prayer", "Consecration"],
    comments: [],
  },
  {
    id: "blog-service-lifestyle",
    slug: "service-as-a-lifestyle",
    title: "Service as a Lifestyle",
    excerpt:
      "Kingdom service is not an occasional activity. It is the outworking of love, stewardship, and maturity.",
    content:
      "<p>In the Kingdom, service is not menial. It is holy. We serve because we have seen the nature of Christ, who came not to be served but to serve.</p><p>Healthy ministry cultures are built when service stops being transactional and starts becoming a joyful response to grace.</p><p>Where service thrives, community strengthens, burdens are shared, and people are shepherded well.</p>",
    category: "Update",
    imageUrl:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200&q=80",
    createdAt: "2026-02-03T09:00:00.000Z",
    publishedAt: "2026-02-03T09:00:00.000Z",
    authorName: "The Ecclesia Embassy",
    tags: ["Service", "Community", "Stewardship"],
    comments: [],
  },
];

export function getDefaultBlogPost(identifier: string) {
  return cloneFallback(
    DEFAULT_BLOG_POSTS.find(
      (post) => post.id === identifier || post.slug === identifier
    ) || null
  );
}

export const DEFAULT_LIVESTREAM_CONFIG = {
  isLive: false,
  embedUrl: "",
  nextService: null,
};


export const DEFAULT_SQUADS = [
  {
    id: "squad-aged",
    name: "Aged Kingdom Life Squad",
    description:
      "Taking care of individuals who are advanced in age and require aid at different levels. Support ranges from food items, toiletries, eye glasses, clothes, medical attention, and more.",
    leader: null,
    meetingDay: null,
    meetingTime: null,
    activities: "Provision of food, toiletries, clothing, and medical support to the elderly.",
    _count: { members: 0 },
  },
  {
    id: "squad-blessed-people",
    name: "Blessed People Kingdom Life Squad",
    description:
      'Reaching out to "area boys", prostitutes, drug addicts, repentant criminals and similar individuals; turning their lives around to be Christ-like and giving them a new beginning.',
    leader: null,
    meetingDay: null,
    meetingTime: null,
    activities: "Rehabilitation, evangelism, social reintegration, and welfare support.",
    _count: { members: 0 },
  },
  {
    id: "squad-church-ministry",
    name: "Church and Ministry Kingdom Life Squad",
    description:
      "Reaching out to Churches, Ministries, NGOs, and Ministers challenged in areas of need — providing chairs, furniture, musical and sound equipment, and other peculiar needs.",
    leader: null,
    meetingDay: null,
    meetingTime: null,
    activities: "Equipment provision, minister welfare, and ministry support.",
    _count: { members: 0 },
  },
  {
    id: "squad-community-dev",
    name: "Community Development Kingdom Life Squad",
    description:
      "Visiting remote and underdeveloped communities to help meet needs for good roads, electricity, pipe-borne water, and other social amenities.",
    leader: null,
    meetingDay: null,
    meetingTime: null,
    activities: "Community projects, infrastructure support, and social amenity provision.",
    _count: { members: 0 },
  },
  {
    id: "squad-enabled",
    name: "Enabled Kingdom Life Squad",
    description:
      "Reaching out to disabled individuals of all sorts — the blind, lame, deaf, dumb, and handicapped — by visiting them and being a blessing through every available means.",
    leader: null,
    meetingDay: null,
    meetingTime: null,
    activities: "Visitation, welfare provision, and disability support.",
    _count: { members: 0 },
  },
  {
    id: "squad-hospital",
    name: "Hospital Kingdom Life Squad",
    description:
      "Taking care of the sick in hospitals, health centers, and as outdoor patients. Demonstrating the love of God by meeting medical needs and praying for healing.",
    leader: null,
    meetingDay: null,
    meetingTime: null,
    activities: "Hospital visitation, medical support, and prayer for healing.",
    _count: { members: 0 },
  },
  {
    id: "squad-inreach",
    name: "In-Reach Kingdom Life Squad",
    description:
      "Meeting the needs of individuals within The Ecclesia Embassy — because charity begins at home. Committed to doing good especially to those of our household of faith (Galatians 6:10).",
    leader: null,
    meetingDay: null,
    meetingTime: null,
    activities: "Members' welfare, in-house support, and family care.",
    _count: { members: 0 },
  },
  {
    id: "squad-privileged",
    name: "Privileged Kingdom Life Squad",
    description:
      "Meeting the needs of the less privileged and poor individuals in our community who may not fall into any other categorized squad.",
    leader: null,
    meetingDay: null,
    meetingTime: null,
    activities: "Community welfare, needs assessment, and targeted support.",
    _count: { members: 0 },
  },
  {
    id: "squad-market",
    name: "Market Kingdom Life Squad",
    description:
      "Reaching out to market men and women through fellowship, cleaning the market environment, providing necessities like waste bins and drainages, and distributing gospel tracts.",
    leader: null,
    meetingDay: null,
    meetingTime: null,
    activities: "Market fellowships, environmental cleanup, and gospel outreach.",
    _count: { members: 0 },
  },
  {
    id: "squad-orphanage",
    name: "Orphanage Kingdom Life Squad",
    description:
      "Reaching out to orphans — taking care of those around us and visiting orphanages with basic needs, fellowship, and love.",
    leader: null,
    meetingDay: null,
    meetingTime: null,
    activities: "Orphanage visitation, welfare provision, and fellowship.",
    _count: { members: 0 },
  },
  {
    id: "squad-schools",
    name: "Primary and Secondary Schools Kingdom Life Squad",
    description:
      "Reaching out to children and teenagers in Primary and Secondary schools, visiting to meet needs, and initiating life-transforming programs that educate and improve their lives.",
    leader: null,
    meetingDay: null,
    meetingTime: null,
    activities: "School visitation, educational programs, and youth development.",
    _count: { members: 0 },
  },
  {
    id: "squad-free-changed",
    name: "Free and Changed Men Kingdom Life Squad",
    description:
      "Concerned with prisoners — their welfare, spiritual life, and rehabilitation. Visiting prisons to bless and transform lives, and offering legal aid to those who need it.",
    leader: null,
    meetingDay: null,
    meetingTime: null,
    activities: "Prison visitation, legal aid, rehabilitation, and spiritual support.",
    _count: { members: 0 },
  },
  {
    id: "squad-remind",
    name: "Re-Mind Kingdom Life Squad",
    description:
      "Helping individuals with mental disorders — mood disorders, anxiety, psychotic disorders, depression, and other related issues — to regain sanity and order.",
    leader: null,
    meetingDay: null,
    meetingTime: null,
    activities: "Mental health outreach, counselling support, and psychiatric welfare.",
    _count: { members: 0 },
  },
  {
    id: "squad-special-children",
    name: "Special Children Kingdom Life Squad",
    description:
      "Meeting the needs of children with Autism, Down Syndrome, Cerebral Palsy, ADHD, ADD, and other learning difficulties — giving them love unreservedly and attending to their other needs.",
    leader: null,
    meetingDay: null,
    meetingTime: null,
    activities: "Special needs outreach, therapy support, and parental assistance.",
    _count: { members: 0 },
  },
  {
    id: "squad-jesus-bride",
    name: "Jesus' Bride Kingdom Life Squad",
    description:
      "Reaching out to widows and single mothers abandoned by their husbands — locating those who genuinely need help and reaching out with care and available resources.",
    leader: null,
    meetingDay: null,
    meetingTime: null,
    activities: "Widow welfare, single-mother support, and community care.",
    _count: { members: 0 },
  },
];

export function getDefaultSquad(identifier: string) {
  return cloneFallback(
    DEFAULT_SQUADS.find((squad) => squad.id === identifier) || null
  );
}

export const DEFAULT_TESTIMONIES = [
  {
    id: "testimony-healing",
    title: "The Lord Brought Complete Healing",
    content:
      "I trusted God through a season of uncertainty, and the Lord showed Himself faithful with complete healing and renewed strength.",
    photoUrl: "",
    createdAt: "2026-01-18T09:00:00.000Z",
  },
  {
    id: "testimony-provision",
    title: "Timely Provision in a Critical Season",
    content:
      "God came through for my family with provision at exactly the right time. We are grateful for His faithfulness and care.",
    photoUrl: "",
    createdAt: "2026-02-08T09:00:00.000Z",
  },
  {
    id: "testimony-direction",
    title: "Clarity and Direction Through Prayer",
    content:
      "During a confusing period, the Lord granted me clarity through the Word and prayer, and He aligned every next step.",
    photoUrl: "",
    createdAt: "2026-02-22T09:00:00.000Z",
  },
];


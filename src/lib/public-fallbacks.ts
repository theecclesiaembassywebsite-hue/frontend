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
    name: "Warfare & Intercession",
    time: "5:30 PM",
    description:
      "A time of corporate prayer, intercession, and spiritual warfare.",
  },
  {
    id: "svc-friday-worship",
    day: "Friday",
    name: "Worship Encounter",
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
      "Our Church in the House hubs are meeting weekly for prayer, discipleship, and community. Find a hub near you or join the e-Hub online.",
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

export const DEFAULT_AUDIO_SERMONS = [
  {
    id: "audio-word-cultured",
    title: "Raising Word-Cultured Ambassadors",
    speaker: "Brother Victor Oluwadamilare",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    description:
      "A call to become believers who are shaped by the Word in thought, posture, and practice.",
    series: "Foundation Series",
    topic: "Doctrine",
    duration: "42:10",
    createdAt: "2026-01-05T08:00:00.000Z",
    date: "2026-01-05T08:00:00.000Z",
  },
  {
    id: "audio-priesthood",
    title: "The Believer's Priestly Ministry",
    speaker: "Brother Victor Oluwadamilare",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    description:
      "Understanding consecration, intercession, and the priestly call of the believer.",
    series: "Kingdom Identity",
    topic: "Prayer",
    duration: "38:45",
    createdAt: "2026-01-19T08:00:00.000Z",
    date: "2026-01-19T08:00:00.000Z",
  },
  {
    id: "audio-kingdom-service",
    title: "Service as a Lifestyle",
    speaker: "Brother Victor Oluwadamilare",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    description:
      "Seeing service as worship and embracing responsibility in the house of God.",
    series: "Kingdom Expressions",
    topic: "Service",
    duration: "47:02",
    createdAt: "2026-02-02T08:00:00.000Z",
    date: "2026-02-02T08:00:00.000Z",
  },
];

export const DEFAULT_VIDEO_MESSAGES = [
  {
    id: "video-intentionality",
    title: "The Place of Intentionality",
    youtubeUrl: "https://www.youtube.com/watch?v=K5S6n9czMYU",
    speaker: "Brother Victor Oluwadamilare",
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
    speaker: "Brother Victor Oluwadamilare",
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
    speaker: "Brother Victor Oluwadamilare",
    description:
      "A teaching on prayer, consecration, and sustaining spiritual fire.",
    series: "Prayer & Consecration",
    createdAt: "2026-01-25T09:00:00.000Z",
    date: "2026-01-25T09:00:00.000Z",
  },
];

export const DEFAULT_LIBRARY_RESOURCES = [
  {
    id: "library-word-cultured",
    title: "Raising Word-Cultured Ambassadors",
    author: "The Ecclesia Embassy",
    description:
      "A foundational ministry resource on doctrine, identity, and kingdom formation.",
    coverUrl:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80",
    fileUrl: "https://www.orimi.com/pdf-test.pdf",
    type: "BOOK",
    isFree: true,
    price: 0,
    createdAt: "2026-01-08T09:00:00.000Z",
  },
  {
    id: "library-prayer-bulletin",
    title: "Prayer & Intercession Bulletin",
    author: "The Ecclesia Embassy",
    description:
      "A prayer guide for personal consecration, corporate prayer, and strategic intercession.",
    coverUrl:
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&q=80",
    fileUrl: "https://www.orimi.com/pdf-test.pdf",
    type: "BULLETIN",
    isFree: true,
    price: 0,
    createdAt: "2026-01-22T09:00:00.000Z",
  },
  {
    id: "library-kingdom-living",
    title: "Kingdom Living Handbook",
    author: "The Ecclesia Embassy",
    description:
      "A practical handbook on stewardship, service, community, and kingdom culture.",
    coverUrl:
      "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=800&q=80",
    fileUrl: "https://www.orimi.com/pdf-test.pdf",
    type: "HANDBOOK",
    isFree: false,
    price: 2500,
    createdAt: "2026-02-05T09:00:00.000Z",
  },
];

export const DEFAULT_MUSIC_TRACKS = [
  {
    id: "music-he-is-worthy",
    title: "He Is Worthy",
    album: "Worship Sessions",
    artworkUrl:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    musicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    duration: "05:12",
    price: 0,
    createdAt: "2026-01-10T09:00:00.000Z",
  },
  {
    id: "music-on-the-altar",
    title: "On the Altar",
    album: "Worship Sessions",
    artworkUrl:
      "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    musicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    duration: "04:36",
    price: 0,
    createdAt: "2026-01-24T09:00:00.000Z",
  },
  {
    id: "music-kingdom-anthem",
    title: "Kingdom Anthem",
    album: "Worship Sessions",
    artworkUrl:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    musicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    duration: "06:01",
    price: 0,
    createdAt: "2026-02-07T09:00:00.000Z",
  },
];

export const DEFAULT_EVENTS = [
  {
    id: "event-feast-of-tabernacles",
    slug: "feast-of-tabernacles",
    title: "Feast of Tabernacles",
    description:
      "A corporate season of worship, communion, teaching, and celebration as we mark another year of God's faithfulness at The Ecclesia Embassy.",
    date: "2026-11-12T17:00:00.000Z",
    location: "The Ecclesia Embassy, Abuja",
    imageUrl:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80",
    capacity: 600,
    registered: 214,
    isFree: true,
    speakers: [
      { name: "Brother Victor Oluwadamilare", title: "Lead Brother" },
    ],
    createdAt: "2026-01-05T09:00:00.000Z",
    updatedAt: "2026-01-05T09:00:00.000Z",
  },
  {
    id: "event-gilgal",
    slug: "gilgal",
    title: "Gilgal Camp Meetings",
    description:
      "A retreat experience for consecration, prayer, discipleship, and encounters that reposition believers for kingdom effectiveness.",
    date: "2026-08-21T09:00:00.000Z",
    location: "Retreat Grounds, Abuja",
    imageUrl:
      "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1200&q=80",
    capacity: 400,
    registered: 168,
    isFree: false,
    fee: 15000,
    currency: "NGN ",
    speakers: [
      { name: "Brother Victor Oluwadamilare", title: "Lead Brother" },
    ],
    createdAt: "2026-01-10T09:00:00.000Z",
    updatedAt: "2026-01-10T09:00:00.000Z",
  },
  {
    id: "event-as-unto-the-lord",
    slug: "as-unto-the-lord",
    title: "As Unto The Lord",
    description:
      "A monthly consecration gathering held on the first three days of the month to seek the Lord in worship, prayer, and devotion.",
    date: "2026-04-01T06:00:00.000Z",
    location: "The Ecclesia Embassy, Abuja",
    imageUrl:
      "https://images.unsplash.com/photo-1438032005730-c779502df39b?w=1200&q=80",
    capacity: 500,
    registered: 122,
    isFree: true,
    speakers: [
      { name: "Brother Victor Oluwadamilare", title: "Lead Brother" },
    ],
    createdAt: "2026-01-15T09:00:00.000Z",
    updatedAt: "2026-01-15T09:00:00.000Z",
  },
];

export function getDefaultEvent(identifier: string) {
  return cloneFallback(
    DEFAULT_EVENTS.find(
      (event) => event.id === identifier || event.slug === identifier
    ) || null
  );
}

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
  nextService: "2026-04-28T17:30:00.000Z",
};

export const DEFAULT_CITH_HUBS = [
  {
    id: "hub-asokoro-east",
    name: "Asokoro East Hub",
    leader: {
      id: "leader-asokoro-east",
      email: "leader@ecclesia.test",
      profile: {
        firstName: "Daniel",
        lastName: "O.",
      },
    },
    location: "Asokoro, Abuja",
    area: "Asokoro",
    city: "Abuja",
    state: "FCT",
    meetingDay: "Wednesday",
    meetingTime: "6:00 PM",
    capacity: 30,
    description:
      "A warm midweek fellowship for prayer, discipleship, and shared growth in the Word.",
    _count: { members: 18 },
  },
  {
    id: "hub-lugbe-central",
    name: "Lugbe Central Hub",
    leader: {
      id: "leader-lugbe-central",
      email: "leader2@ecclesia.test",
      profile: {
        firstName: "Miriam",
        lastName: "A.",
      },
    },
    location: "Lugbe, Abuja",
    area: "Lugbe",
    city: "Abuja",
    state: "FCT",
    meetingDay: "Thursday",
    meetingTime: "6:00 PM",
    capacity: 25,
    description:
      "A neighborhood hub committed to fellowship, accountability, and kingdom community.",
    _count: { members: 14 },
  },
  {
    id: "hub-gwarinpa",
    name: "Gwarinpa e-Hub Connect",
    leader: {
      id: "leader-gwarinpa",
      email: "leader3@ecclesia.test",
      profile: {
        firstName: "Tosin",
        lastName: "E.",
      },
    },
    location: "Gwarinpa, Abuja",
    area: "Gwarinpa",
    city: "Abuja",
    state: "FCT",
    meetingDay: "Saturday",
    meetingTime: "5:00 PM",
    capacity: 40,
    description:
      "A hybrid hub for believers desiring consistent fellowship and practical kingdom growth.",
    _count: { members: 21 },
  },
];

export function getDefaultCithHub(identifier: string) {
  return cloneFallback(
    DEFAULT_CITH_HUBS.find((hub) => hub.id === identifier) || null
  );
}

export const DEFAULT_SQUADS = [
  {
    id: "squad-worship",
    name: "Worship Squad",
    description:
      "Serving the house through music, worship culture, and an atmosphere of reverence.",
    leader: {
      id: "leader-worship",
      email: "worship@ecclesia.test",
      profile: {
        firstName: "Naomi",
        lastName: "K.",
        bio: "A worship leader committed to raising musicians with spiritual depth and excellence.",
      },
    },
    meetingDay: "Saturday",
    meetingTime: "3:00 PM",
    activities: "Rehearsals, worship sets, ministry support, and music development.",
    _count: { members: 24 },
  },
  {
    id: "squad-prayer",
    name: "Prayer Squad",
    description:
      "A team devoted to intercession, spiritual covering, and cultivating prayer in the community.",
    leader: {
      id: "leader-prayer",
      email: "prayer@ecclesia.test",
      profile: {
        firstName: "Samuel",
        lastName: "B.",
        bio: "Focused on raising believers who can stand in prayer with insight and endurance.",
      },
    },
    meetingDay: "Monday",
    meetingTime: "6:00 PM",
    activities: "Prayer watches, intercession, prayer support, and consecration meetings.",
    _count: { members: 19 },
  },
  {
    id: "squad-teaching",
    name: "Teaching Squad",
    description:
      "A team helping to preserve doctrine, support learning environments, and communicate truth clearly.",
    leader: {
      id: "leader-teaching",
      email: "teaching@ecclesia.test",
      profile: {
        firstName: "Esther",
        lastName: "D.",
        bio: "Passionate about doctrine, discipleship, and helping believers grow in understanding.",
      },
    },
    meetingDay: "Thursday",
    meetingTime: "5:30 PM",
    activities: "Curriculum support, discipleship groups, study facilitation, and learning resources.",
    _count: { members: 12 },
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

export const DEFAULT_INTENTIONALITY_COURSES = [
  {
    id: "course-intentionality-core",
    title: "Intentionality Class Core Track",
    description:
      "A foundational course on faith, culture, stewardship, and kingdom responsibility.",
    modules: [
      { id: "module-foundation", title: "Foundation", order: 1 },
      { id: "module-transformation", title: "Transformation", order: 2 },
      { id: "module-responsibility", title: "Responsibility", order: 3 },
    ],
    _count: { enrollments: 48 },
  },
];

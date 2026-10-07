import { ChangelogEntry, UserFeedbackUpdate } from '../types';

export const INITIAL_CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    version: 'v1.5.0',
    releaseDate: 'October 2026',
    title: 'Workspace Re-organization & Character Onboarding Flow',
    type: 'user-suggested',
    description: 'Complete overhaul of workspace organization with filing cabinet directory, removal of starting template dummy notes for a pristine clean slate, and optional character persona / referral onboarding on start.',
    highlights: [
      'Remade filing drawers and boards directory with all-boards overview mode',
      'Purged all pre-seeded dummy template notes so users start with clean, unpolluted desks',
      'Optional onboarding modal on start/sign-in: pen name, character explanation, and referral source (YouTube, WhatsApp, Twitter, Instagram, other)',
      'Prominent skip action ensuring onboarding is strictly non-intrusive and optional',
      'New Desk Persona settings tab to review or edit character profile at any time'
    ],
    userRequestRef: 'User Request: "organization for the website like fully remake of organization and remove starting templates and make some thing on start when user sign in like what does explain ur character... and what is ur name optional also and where did u hear from us"',
    lifecycleStatus: 'shipped',
  },
  {
    version: 'v1.4.0',
    releaseDate: 'October 2026',
    title: 'Live User Suggestions & Transparent Lifecycle Tracker',
    type: 'user-suggested',
    description: 'Direct accountability tracker in Settings. Users can submit feature suggestions and track their entire lifecycle from submission, review, planning, to production deployment.',
    highlights: [
      'Interactive Suggestion Submission directly inside the Settings Changelog tab',
      'Transparent status tags (Submitted → Under Review → In Progress → Shipped)',
      'Accountability log displaying user-submitted improvements with author attribution and timestamp',
      'Audit log viewable across devices with instant cloud sync'
    ],
    userRequestRef: 'Community Feedback #24 - Complete transparency in product development & feature evolution',
    lifecycleStatus: 'shipped',
  },
  {
    version: 'v1.3.0',
    releaseDate: 'October 2026',
    title: 'Client-Side AES-GCM 256 End-to-End Encryption',
    type: 'security',
    description: 'Zero-knowledge encryption for all note contents, rich text bodies, checklist items, and photo attachments. Data is sealed client-side before touching cloud databases.',
    highlights: [
      'PBKDF2 key derivation using 100,000 iterations of SHA-256',
      'AES-GCM 256-bit envelope encryption with unique cryptographic salt & initialization vector (IV) per note',
      'Raw Ciphertext Inspector modal allowing users to inspect the exact cipher string stored in Firestore',
      'Custom Passphrase management and cryptographic key fingerprint verification (SHA-256)',
      'Automatic client-side decryption lock/unlock state in session memory'
    ],
    userRequestRef: 'Security Audit & User Request: "implement end-to-end encryption for all stored note data"',
    lifecycleStatus: 'shipped',
  },
  {
    version: 'v1.2.0',
    releaseDate: 'October 2026',
    title: 'Tactile Paper Board Architecture & Note Move Engine',
    type: 'design',
    description: 'Complete removal of modern synthetic/blue aesthetics in favor of warm tactile paper craft, index cards, kraft stationery, brass pins, and board-based idea organization.',
    highlights: [
      'Eliminated all blue corporate UI elements in favor of kraft tan, terracotta wax, charcoal ink, and aged parchment',
      'Idea-to-Board paradigm: Every note is created inside a dedicated tactile board',
      'Move Note Engine: Seamlessly move any idea card between boards across folders or within loose boards',
      'Multiple paper finishes: Manila Card, Kraft Grain, Parchment, Sage Linen, Terracotta, Charcoal Slate',
      'Notebook ruled lines toggle, brass push-pins, washi tape headers, and realistic card drop-shadows'
    ],
    userRequestRef: 'Design Directive: "no blue or modern shit all paper style and notes should feel like they r in boards every idea should be created inside a board and u can move it or delete it"',
    lifecycleStatus: 'shipped',
  },
  {
    version: 'v1.1.0',
    releaseDate: 'September 2026',
    title: 'Multi-Image Attachment & Picture Gallery in Notes',
    type: 'feature',
    description: 'Direct picture attachment workflow inside notes, with local drag-and-drop, image previewing, and seamless encrypted storage.',
    highlights: [
      'Direct "+ Add Pictures" tool inside the Note creation card',
      'Client-side image compression and safe base64 envelope encoding for instant rendering',
      'Multi-photo grid display directly on paper note cards with zoom previews',
      'Image deletion and reordering capabilities'
    ],
    userRequestRef: 'User Request: "also add a add not button to write notes and add pictures"',
    lifecycleStatus: 'shipped',
  },
  {
    version: 'v1.0.0',
    releaseDate: 'September 2026',
    title: 'Organized Folders & Google Cloud Multi-Device Sync',
    type: 'milestone',
    description: 'Core organizational hierarchy with folder groupings, multi-board structure, Google Sign-in authentication, and real-time cross-device Firestore synchronization.',
    highlights: [
      'Nested Folder tree for organizing boards (e.g. Work, Journal, Brainstorming, Sketches)',
      'Google Sign-in with Firebase Auth popup flow',
      'Real-time Firestore listeners (onSnapshot) for instant multi-device synchronicity',
      'Offline-first fallback to local device storage with auto-sync when online',
      'Attribute-Based Access Control (ABAC) Firestore security rules deployed'
    ],
    userRequestRef: 'Foundational Requirement: "store them in organized folders for easy access... include cloud synchronization across all devices... sign in using google"',
    lifecycleStatus: 'shipped',
  },
  {
    version: 'v0.9.0-beta',
    releaseDate: 'August 2026',
    title: 'Aged Paper Dark Mode & Eye Strain Relief',
    type: 'design',
    description: 'Designed a soothing dark mode inspired by charred drafting paper and deep espresso notebook textures to drastically reduce eye strain in low-light environments.',
    highlights: [
      'Warm charred charcoal background (#141210) with aged parchment typography (#EAE4D8)',
      'Dark kraft cards with warm bronze and amber accents instead of harsh neon dark modes',
      'Instant toggle in top header and preferences menu with persistent state storage'
    ],
    userRequestRef: 'User Request: "include a dark mode option to reduce eye strain"',
    lifecycleStatus: 'shipped',
  }
];

export const INITIAL_USER_FEEDBACK_UPDATES: UserFeedbackUpdate[] = [
  {
    id: 'req-001',
    ownerId: 'aminmiami97@gmail.com',
    authorName: 'Amin (User)',
    title: 'Aged Paper Style Aesthetic (No Blue Modern Look)',
    description: 'Requested complete elimination of standard corporate blue styling in favor of warm tactile paper craft, index cards, and desk boards.',
    category: 'Paper Styling',
    status: 'shipped',
    createdAt: '2026-09-18T14:20:00Z',
  },
  {
    id: 'req-002',
    ownerId: 'aminmiami97@gmail.com',
    authorName: 'Amin (User)',
    title: 'End-to-End Encryption for all Stored Note Data',
    description: 'Require mathematical zero-knowledge client encryption before syncing note text, titles, and pictures to cloud storage.',
    category: 'Security & Encryption',
    status: 'shipped',
    createdAt: '2026-09-22T09:15:00Z',
  },
  {
    id: 'req-003',
    ownerId: 'aminmiami97@gmail.com',
    authorName: 'Amin (User)',
    title: 'Organized Folders & Board Hierarchy with Moving Cards',
    description: 'Enable organizing boards into distinct folders, creating idea notes inside boards, and moving notes between boards with full deletion controls.',
    category: 'Boards & Organization',
    status: 'shipped',
    createdAt: '2026-09-28T16:40:00Z',
  },
  {
    id: 'req-004',
    ownerId: 'aminmiami97@gmail.com',
    authorName: 'Amin (User)',
    title: 'Add Pictures & Floating Add Note Action',
    description: 'Include an add note button with quick picture attachments and checklist items.',
    category: 'Media & Notes',
    status: 'shipped',
    createdAt: '2026-10-02T11:05:00Z',
  },
  {
    id: 'req-005',
    ownerId: 'aminmiami97@gmail.com',
    authorName: 'Amin (User)',
    title: 'Transparent User Updates History in Settings Menu',
    description: 'Display an exhaustive changelog and development lifecycle history in settings to provide complete transparency into every update and user suggestion evolution.',
    category: 'Changelog & Accountability',
    status: 'shipped',
    createdAt: '2026-10-06T18:30:00Z',
  },
];

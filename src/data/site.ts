// ─────────────────────────────────────────────────────────────────────────────
// Site-wide settings. Edit the values below; everything else on the page is
// driven by the other files in this folder (about.md, lineage.yaml,
// publications.yaml, projects.yaml).
// ─────────────────────────────────────────────────────────────────────────────

export const site = {
  name: 'Prateek Arora',

  // Shown under your name in the hero.
  title: 'PhD Candidate · Computer Science and Engineering · University of Nevada, Reno',
  tagline: 'Developing autonomous systems capable of overcoming mobility and manipulation constraints',

  // Used for search engines and link previews (Slack, X, LinkedIn...).
  description:
    'Prateek Arora — PhD candidate in Computer Science and Engineering at the University of Nevada, Reno, working on developing autonomous systems capable of overcoming mobility and manipulation constraints.',

  email: 'prateeka@unr.edu',

  // Put your CV in public/files/ and point to it here ('' hides the CV link).
  cv: '/files/cv.pdf',

  // Names that get bolded in publication author lists.
  authorNames: ['Prateek Arora', 'P. Arora'],

  // Venues (by abbreviation in the venue text) that get a highlighted tag in
  // the publication list, e.g. "IEEE ... (ICRA), 2025" -> [ICRA 2025].
  highlightVenues: ['ICRA', 'IROS'],

  // Social links shown in the hero and (after scrolling) in the nav bar.
  // Leave url as '' to hide an entry. Icons: https://icon-sets.iconify.design
  // (only the mdi, academicons and lucide sets are installed).
  socials: [
    { label: 'Google Scholar', icon: 'academicons:google-scholar', url: 'https://scholar.google.com/citations?hl=en&user=75jWjsgAAAAJ' }, 
    { label: 'GitHub', icon: 'mdi:github', url: 'https://github.com/pratiquea' },
    { label: 'LinkedIn', icon: 'mdi:linkedin', url: 'https://www.linkedin.com/in/prateekarorav2/' },
    // { label: 'YouTube', icon: 'mdi:youtube', url: '' }, // optional
    { label: 'Email', icon: 'mdi:email-outline', url: 'mailto:prateeka@unr.edu' },
  ],

  // Hero background videos (files live in public/media/hero/). They play one
  // after another and loop. `mobile` is used on screens up to 700px wide.
  heroVideos: [
    { desktop: '/media/hero/wall.mp4', mobile: '/media/hero/wall_mobile.mp4' },
    { desktop: '/media/hero/window.mp4', mobile: '/media/hero/window_mobile.mp4' },
  ],
  // Still image shown before the video starts (file in src/assets/hero/).
  heroPoster: 'poster.jpg',

  // About-section photo (file in src/assets/profile/).
  profilePhoto: 'me.jpg',

  // GitHub repos with this topic are added to the Projects section
  // automatically at build time (after the manual entries in projects.yaml).
  github: { user: 'Pratiquea', topic: 'showcase' },

  // How many project cards are visible before the "Show all" button.
  projectsInitiallyVisible: 9,
};

export type Site = typeof site;

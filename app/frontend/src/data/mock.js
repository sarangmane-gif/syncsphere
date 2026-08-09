export const COMPANY = {
  name: "Syncsphere",
  tagline: "The Operating System of Novaterra Industries",
  ceo: {
    name: "Elara Solberg",
    title: "Chief Executive Officer",
    avatar: "https://images.unsplash.com/photo-1758691736975-9f7f643d178e?crop=entropy&cs=srgb&fm=jpg&q=85&w=400",
  },
  mission:
    "To engineer the infrastructure that enables our teams and customers to do their best, most ambitious work.",
  vision:
    "A world where distance is solved and every team operates with clarity, craft, and ownership.",
};

export const IMAGES = {
  ceoBg:
    "https://images.unsplash.com/photo-1578426187376-19bd5aeaeaa0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1Mjh8MHwxfHNlYXJjaHw0fHxkYXJrJTIwbW9udW1lbnRhbCUyMGFyY2hpdGVjdHVyZSUyMGx1eHVyeXxlbnwwfHx8fDE3ODYxMjgwMDN8MA&ixlib=rb-4.1.0&q=85",
  nebula:
    "https://images.unsplash.com/photo-1744138147319-f86f8a0d9667?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzR8MHwxfHNlYXJjaHwzfHxhYnN0cmFjdCUyMGRhcmslMjBzcGFjZSUyMG5lYnVsYSUyMGZsb2F0aW5nJTIwcGFydGljbGVzfGVufDB8fHx8MTc4NjEyODAwM3ww&ixlib=rb-4.1.0&q=85",
  team:
    "https://images.unsplash.com/photo-1758691736975-9f7f643d178e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzN8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBkaXZlcnNlJTIwZW1wbG95ZWVzJTIwb2ZmaWNlJTIwcG9ydHJhaXR8ZW58MHx8fHwxNzg2MTI4MDA0fDA&ixlib=rb-4.1.0&q=85",
  hq:
    "https://images.unsplash.com/photo-1472803828399-39d4ac53c6e5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1Mjh8MHwxfHNlYXJjaHwyfHxkYXJrJTIwbW9udW1lbnRhbCUyMGFyY2hpdGVjdHVyZSUyMGx1eHVyeXxlbnwwfHx8fDE3ODYxMjgwMDN8MA&ixlib=rb-4.1.0&q=85",
};

export const STATS = [
  { label: "People Worldwide", value: "14,208", delta: "+6.2%" },
  { label: "Active Projects", value: "312", delta: "+18" },
  { label: "Annual Revenue", value: "$8.4B", delta: "+21.5%" },
  { label: "Global Locations", value: "27", delta: "+3" },
];

export const GROWTH = [
  { year: "2019", revenue: 1.2, crew: 2.1 },
  { year: "2020", revenue: 1.9, crew: 3.4 },
  { year: "2021", revenue: 3.1, crew: 5.6 },
  { year: "2022", revenue: 4.4, crew: 8.2 },
  { year: "2023", revenue: 5.9, crew: 10.7 },
  { year: "2024", revenue: 7.1, crew: 12.9 },
  { year: "2025", revenue: 8.4, crew: 14.2 },
];

export const CEO_MESSAGES = [
  {
    id: "cm-1",
    pinned: true,
    title: "We are no longer just building products. We are building what comes next.",
    date: "18 June 2026",
    duration: "07:42",
    excerpt:
      "Seven years ago Novaterra was forty people in a hangar in Reykjavík. This quarter we crossed fourteen thousand. What has not changed is the discipline: we ship what we can defend.",
    body: `Team,

Seven years ago Novaterra was forty people in a hangar outside Reykjavík, arguing about designs on a whiteboard that never fully erased. This quarter we crossed fourteen thousand people across twenty-seven locations, and the whiteboard is now a shared record of our decisions.

What has not changed is the discipline. We ship what we can defend. We measure before we celebrate. And we treat every colleague as an operator with ownership.

The next eighteen months are the most consequential in our history. Our Platform moves from product to standard. Our reasoning layer graduates from research to revenue. And the Horizon campus opens its doors in October — our first building designed entirely by our internal teams.

I am asking for two things. First: precision. Second: candour. If something is wrong, say it early and say it loudly. The most expensive failures in this company have always been the ones somebody saw coming and stayed quiet about.

Onward,
Elara`,
  },
  {
    id: "cm-2",
    title: "On the Horizon campus and why architecture is strategy",
    date: "02 May 2026",
    duration: "05:18",
    excerpt:
      "A building is a hypothesis about how people should work. Horizon is the most expensive hypothesis we have ever written down.",
    body: "A building is a hypothesis about how people should work together. Horizon is the most expensive hypothesis this company has ever committed to concrete — twelve floors of adaptive light, zero fixed desks, and a simulation lab that runs at ninety-four percent utilisation.",
  },
  {
    id: "cm-3",
    title: "Quarterly candour: what we got wrong in Q1",
    date: "14 March 2026",
    duration: "09:03",
    excerpt:
      "We missed the Atlas migration deadline by five weeks. Here is exactly why, and what we changed.",
    body: "We missed the Atlas migration deadline by five weeks. The cause was not engineering capacity; it was a review process that rewarded consensus over decisions. We have replaced it with the Duty Architect model.",
  },
  {
    id: "cm-4",
    title: "Welcoming the Vector Dynamics team",
    date: "09 January 2026",
    duration: "04:27",
    excerpt: "Eleven hundred new colleagues, one shared standard of craft.",
    body: "Eleven hundred colleagues from Vector Dynamics joined us this month. Integration is not assimilation — we are adopting their reliability review protocol company-wide because it is better than ours.",
  },
];

export const NOTICES = [
  {
    id: "n-1",
    level: "emergency",
    title: "Horizon Campus — Level 6 fire drill at 15:00 GMT",
    detail: "Full evacuation. Muster point: North Plaza. Wardens in gold vests.",
    expires: "Today 16:00",
  },
  {
    id: "n-2",
    level: "critical",
    title: "Platform production freeze active until 18 July",
    detail: "Dual sign-off required for any emergency patch.",
    expires: "18 Jul",
  },
  {
    id: "n-3",
    level: "info",
    title: "Payroll cutoff moves to the 22nd this month",
    detail: "Submit expense claims before 21 July 23:59 local time.",
    expires: "21 Jul",
  },
];

export const NEWS = [
  {
    id: "nw-1",
    category: "Milestone",
    title: "Novaterra crosses $8.4B in annual revenue",
    excerpt:
      "Driven by Platform adoption across enterprise sectors.",
    date: "20 June 2026",
    image: IMAGES.hq,
    readTime: "4 min",
  },
  {
    id: "nw-2",
    category: "Product",
    title: "Nova Intelligence enters general availability",
    excerpt:
      "The reasoning layer now serves 2.1M inference calls per hour with 99.99% availability.",
    date: "11 June 2026",
    image: IMAGES.nebula,
    readTime: "6 min",
  },
  {
    id: "nw-3",
    category: "Campus",
    title: "Horizon opens in October — first look inside",
    excerpt:
      "Twelve floors, adaptive daylight, and a collaboration lab designed by our own teams.",
    date: "03 June 2026",
    image: IMAGES.ceoBg,
    readTime: "3 min",
  },
  {
    id: "nw-4",
    category: "People",
    title: "Vector Dynamics integration completes ahead of plan",
    excerpt: "1,100 colleagues fully onboarded across four engineering orgs.",
    date: "28 May 2026",
    image: IMAGES.team,
    readTime: "5 min",
  },
];

export const MILESTONES = [
  { year: "2019", label: "Founded in Reykjavík with 40 engineers" },
  { year: "2021", label: "Titan platform ships to first 12 enterprises" },
  { year: "2023", label: "Series D — $1.4B at a $12B valuation" },
  { year: "2025", label: "Nova Intelligence research lab established" },
  { year: "2026", label: "14,208 people across 27 locations" },
];

export const EMPLOYEES = [
  { id: "e-1", name: "Miyamoto Musashi", role: "Strategy Advisor", dept: "Executive", location: "Reykjavík", email: "miyamoto.musashi@novaterra.io", phone: "+354 511 0101", status: "In office", years: 7, skills: ["Strategy", "Leadership", "Discipline"] },
  { id: "e-2", name: "Marcus Auralis", role: "Operations Lead", dept: "Operations", location: "London", email: "marcus.auralis@novaterra.io", phone: "+44 20 7946 0211", status: "In office", years: 6, skills: ["Logistics", "Execution", "Scale"] },
  { id: "e-3", name: "Alexander The OG", role: "People Ops", dept: "Human Resources", location: "Austin", email: "alexander.og@novaterra.io", phone: "+1 512 555 0183", status: "Remote", years: 5, skills: ["Culture", "Coaching", "Systems"] },
  { id: "e-4", name: "Niccolo Machiavelli", role: "Political Strategist", dept: "Strategy", location: "Milan", email: "niccolo.m@novaterra.io", phone: "+39 02 8901 0045", status: "In meeting", years: 8, skills: ["Influence", "Negotiation", "Game Theory"] },
  { id: "e-5", name: "Friedrich Nietzsche", role: "Culture Analyst", dept: "Research", location: "Berlin", email: "friedrich.n@novaterra.io", phone: "+49 30 5557 0204", status: "In office", years: 4, skills: ["Philosophy", "Trend Analysis", "Narrative"] },
  { id: "e-6", name: "Socrates", role: "Philosophy Coach", dept: "Learning", location: "Athens", email: "socrates@novaterra.io", phone: "+30 21 555 0133", status: "Remote", years: 12, skills: ["Inquiry", "Mentorship", "Dialogue"] },
  { id: "e-7", name: "Aristotle", role: "Knowledge Architect", dept: "Product", location: "Athens", email: "aristotle@novaterra.io", phone: "+30 21 555 0134", status: "In office", years: 10, skills: ["Systems", "Logic", "Product Strategy"] },
  { id: "e-8", name: "Plato", role: "Systems Designer", dept: "Design", location: "Athens", email: "plato@novaterra.io", phone: "+30 21 555 0135", status: "In meeting", years: 11, skills: ["Concept", "Architecture", "Vision"] },
  { id: "e-9", name: "Karl Marx", role: "Labor Relations", dept: "People Operations", location: "Vienna", email: "karl.marx@novaterra.io", phone: "+43 1 555 0140", status: "On leave", years: 9, skills: ["Policy", "Equity", "Organizational Dynamics"] },
  { id: "e-10", name: "Confucius", role: "Ethics Advisor", dept: "Legal", location: "Beijing", email: "confucius@novaterra.io", phone: "+86 10 5555 0160", status: "In office", years: 13, skills: ["Ethics", "Governance", "Standards"] },
  { id: "e-11", name: "Cooper", role: "Innovation Lead", dept: "Innovation", location: "San Francisco", email: "cooper@novaterra.io", phone: "+1 415 555 0172", status: "In office", years: 3, skills: ["Experimentation", "Product Discovery", "Creative Direction"] },
  { id: "e-12", name: "T.A.R.S", role: "AI Systems Analyst", dept: "Engineering", location: "Remote", email: "tars@novaterra.io", phone: "+1 800 555 0199", status: "Remote", years: 2, skills: ["AI", "Automation", "Inference"] },
];

export const DEPARTMENTS = [
  {
    id: "d-1",
    name: "Engineering",
    head: "Dr. Kenji Watanabe",
    headcount: 4820,
    description:
      "Owns the core Platform, the operational telemetry stack and every production surface that carries customer load.",
    projects: ["Platform v9 Certification", "Atlas Migration", "Edge Mesh"],
    resources: ["Runbook Library", "Architecture Review Board", "Chaos Lab"],
    notices: ["Production freeze 14–18 July", "Duty Architect rota published"],
  },
  {
    id: "d-2",
    name: "Research",
    head: "Priya Raghunathan",
    headcount: 610,
    description:
      "Nova Intelligence — reasoning systems, inference efficiency and long-horizon simulation research.",
    projects: ["Nova Reasoning v3", "Sparse Inference", "Simulation Fidelity"],
    resources: ["Paper Archive", "Compute Allocation Desk", "Ethics Council"],
    notices: ["Q3 compute allocations open 1 July"],
  },
  {
    id: "d-3",
    name: "Design",
    head: "Sofia Marchetti",
    headcount: 240,
    description:
      "Design systems, spatial interfaces and the Novaterra visual language across product and campus.",
    projects: ["Intranet Design System", "Horizon Wayfinding", "Operations Console"],
    resources: ["Component Library", "Motion Guidelines", "Print Studio"],
    notices: ["Design System 4.0 tokens shipped"],
  },
  {
    id: "d-4",
    name: "Operations",
    head: "Dmitri Volkov",
    headcount: 3110,
    description:
      "Global logistics, manufacturing coordination and supply resilience.",
    projects: ["Rollout Cadence 2027", "Supplier Redundancy", "Cold Chain"],
    resources: ["Logistics Control Room", "Vendor Registry"],
    notices: ["Berlin dock inspection 26 June"],
  },
  {
    id: "d-5",
    name: "Human Resources",
    head: "Noor Haddad",
    headcount: 320,
    description:
      "People operations, talent, compensation philosophy and the team experience end to end.",
    projects: ["Wellness Credits", "Horizon Relocation", "Career Lattice"],
    resources: ["Policy Vault", "Leave Portal", "Handbook"],
    notices: ["Badge migration deadline 30 July"],
  },
  {
    id: "d-6",
    name: "Security",
    head: "Kofi Mensah",
    headcount: 410,
    description:
      "Zero-trust architecture, cryptographic standards and incident response across all campuses.",
    projects: ["Zero Trust Phase 3", "Credential Rotation", "Red Team 2026"],
    resources: ["Threat Intel Feed", "Response Playbooks"],
    notices: ["Phishing simulation window active"],
  },
];

export const MEETINGS_TODAY = [
  { id: "m-1", title: "Q3 Company All-Hands", time: "15:00", room: "Helix Auditorium", host: "Elara Solberg", attendees: 1420 },
  { id: "m-2", title: "Platform Freeze Readiness", time: "11:30", room: "Control Room 2", host: "Marcus Oyelaran", attendees: 18 },
  { id: "m-3", title: "Strategy Review", time: "09:00", room: "Lab North", host: "Priya Raghunathan", attendees: 11 },
  { id: "m-4", title: "Horizon Orientation Session", time: "17:15", room: "Studio Milan", host: "Sofia Marchetti", attendees: 9 },
];

export const PARTICIPANTS = [
  { id: "p-1", name: "Elara Solberg", role: "Host", muted: false, video: true, hand: false, speaking: true },
  { id: "p-2", name: "Kenji Watanabe", role: "Presenter", muted: false, video: true, hand: false, speaking: false },
  { id: "p-3", name: "Priya Raghunathan", role: "Attendee", muted: true, video: false, hand: true, speaking: false },
  { id: "p-4", name: "Marcus Oyelaran", role: "Attendee", muted: true, video: true, hand: false, speaking: false },
  { id: "p-5", name: "Sofia Marchetti", role: "Attendee", muted: false, video: false, hand: false, speaking: false },
  { id: "p-6", name: "Ines Duarte", role: "Attendee", muted: true, video: true, hand: true, speaking: false },
];

export const MEETING_CHAT = [
  { id: "c-1", author: "Kenji Watanabe", body: "Sharing the freeze protocol slide now.", time: "15:02" },
  { id: "c-2", author: "Ines Duarte", body: "Revenue slide numbers are final as of this morning.", time: "15:04" },
  { id: "c-3", author: "Priya Raghunathan", body: "Question on compute allocation when you reach slide 14.", time: "15:06" },
];

export const HOLIDAYS = [
  { id: "h-1", name: "Independence Day", date: "04 Jul 2026", country: "United States", dept: "All" },
  { id: "h-2", name: "Bastille Day", date: "14 Jul 2026", country: "France", dept: "All" },
  { id: "h-3", name: "Marine Day", date: "20 Jul 2026", country: "Japan", dept: "All" },
  { id: "h-4", name: "Eid al-Adha", date: "27 Jul 2026", country: "UAE", dept: "All" },
  { id: "h-5", name: "Founders Day", date: "12 Aug 2026", country: "Global", dept: "All" },
  { id: "h-6", name: "Republic Day", date: "26 Jan 2027", country: "India", dept: "All" },
];

export const SPOTLIGHTS = [
  { id: "s-1", kind: "Employee of the Month", name: "Marcus Oyelaran", note: "Cut Platform mean-time-to-recovery by 62% in a single quarter.", dept: "Engineering" },
  { id: "s-2", kind: "Star Performer", name: "Hana Kobayashi", note: "Shipped the Platform Console pricing model three weeks early.", dept: "Product" },
  { id: "s-3", kind: "Work Anniversary", name: "Sofia Marchetti", note: "Six years designing the Novaterra visual language.", dept: "Design" },
  { id: "s-4", kind: "Birthday", name: "Kofi Mensah", note: "Celebrating today in Accra.", dept: "Security" },
];

export const PROJECT_GROUPS = [
  { id: "g-1", name: "Platform v9 Certification", members: 24, privacy: "Private", progress: 78, tasks: 142, docs: 63, unread: 5 },
  { id: "g-2", name: "Nova Reasoning v3", members: 17, privacy: "Private", progress: 41, tasks: 96, docs: 51, unread: 12 },
  { id: "g-3", name: "Horizon Campus Launch", members: 38, privacy: "Restricted", progress: 63, tasks: 210, docs: 118, unread: 0 },
  { id: "g-4", name: "Workspace Design System", members: 12, privacy: "Open", progress: 88, tasks: 74, docs: 42, unread: 3 },
];

export const OFFICES = [
  { id: "o-1", city: "Reykjavík", country: "Iceland", hq: true, crew: 1240, hours: "08:00 – 17:00 GMT", x: 44, y: 21 },
  { id: "o-2", city: "London", country: "United Kingdom", crew: 2110, hours: "09:00 – 18:00 BST", x: 48, y: 30 },
  { id: "o-3", city: "Tokyo", country: "Japan", crew: 1890, hours: "09:00 – 18:00 JST", x: 84, y: 38 },
  { id: "o-4", city: "Austin", country: "United States", crew: 1650, hours: "08:30 – 17:30 CDT", x: 23, y: 42 },
  { id: "o-5", city: "Bengaluru", country: "India", crew: 2480, hours: "09:30 – 18:30 IST", x: 71, y: 50 },
  { id: "o-6", city: "Dubai", country: "UAE", crew: 720, hours: "08:00 – 17:00 GST", x: 63, y: 46 },
];

export const WORLD_CLOCKS = [
  { city: "Reykjavík", tz: "Atlantic/Reykjavik" },
  { city: "London", tz: "Europe/London" },
  { city: "Dubai", tz: "Asia/Dubai" },
  { city: "Tokyo", tz: "Asia/Tokyo" },
];

export const WEATHER = [
  { city: "Reykjavík", temp: "7°", cond: "Overcast" },
  { city: "London", temp: "19°", cond: "Light rain" },
  { city: "Tokyo", temp: "28°", cond: "Humid" },
];

export const MARKET = {
  size: [
    { year: "2022", tam: 68 },
    { year: "2023", tam: 84 },
    { year: "2024", tam: 106 },
    { year: "2025", tam: 131 },
    { year: "2026", tam: 164 },
  ],
  share: [
    { name: "Novaterra", value: 31 },
    { name: "Orbis Systems", value: 24 },
    { name: "Helion Labs", value: 18 },
    { name: "Meridian", value: 14 },
    { name: "Others", value: 13 },
  ],
  competitors: [
    { name: "Orbis Systems", strength: "Legacy defence contracts", pricing: "$$$$", growth: "+9%" },
    { name: "Helion Labs", strength: "Research talent density", pricing: "$$$", growth: "+22%" },
    { name: "Meridian", strength: "Regional distribution", pricing: "$$", growth: "+5%" },
  ],
  swot: {
    strengths: ["Titan platform lock-in", "Reliability track record", "Vertically integrated simulation"],
    weaknesses: ["Concentration in three verticals", "Hardware lead times"],
    opportunities: ["Market expansion planning", "Nova Intelligence licensing"],
    threats: ["Helion research velocity", "Export control volatility"],
  },
};

export const KB_ARTICLES = [
  { id: "kb-1", cat: "Founder Story", title: "The early years: 2019–2021", body: "How forty engineers built the first Platform prototype on a budget of $2.1M and a rented workshop." },
  { id: "kb-2", cat: "Culture", title: "Precision and candour: our two rules", body: "Why we optimise for early, loud disagreement over comfortable consensus." },
  { id: "kb-3", cat: "Technology", title: "Platform architecture in ten minutes", body: "Control plane, telemetry mesh, and the deterministic scheduler that keeps 900 enterprises in sync." },
  { id: "kb-4", cat: "Office Guides", title: "Working from Horizon", body: "Zero fixed desks, adaptive light zones, and how to book collaboration spaces." },
  { id: "kb-5", cat: "FAQ", title: "How do I request compute?", body: "Open the Compute Allocation Desk in Research resources and file a Tier request." },
  { id: "kb-6", cat: "Leadership", title: "Who decides what", body: "The Duty Architect model and the four decision classes." },
];

export const DOCUMENTS = [
  { id: "doc-1", name: "Platform Freeze Protocol v9", folder: "Engineering", tags: ["protocol", "reliability"], size: "2.4 MB", updated: "2 days ago", version: 9, pinned: true },
  { id: "doc-2", name: "Employee Handbook 2026", folder: "HR", tags: ["policy", "handbook"], size: "8.1 MB", updated: "1 week ago", version: 12, pinned: true },
  { id: "doc-3", name: "Nova Reasoning v3 Design Doc", folder: "Research", tags: ["design", "ml"], size: "5.6 MB", updated: "yesterday", version: 4, pinned: false },
  { id: "doc-4", name: "Horizon Campus Floorplans", folder: "Facilities", tags: ["campus"], size: "22.9 MB", updated: "3 days ago", version: 6, pinned: false },
  { id: "doc-5", name: "Q3 Board Deck", folder: "Finance", tags: ["board", "confidential"], size: "14.2 MB", updated: "5 hours ago", version: 3, pinned: false },
  { id: "doc-6", name: "Incident Response Playbook", folder: "Security", tags: ["security", "runbook"], size: "1.8 MB", updated: "1 month ago", version: 21, pinned: true },
];

export const POLICIES = [
  { id: "p-1", cat: "Workplace", title: "Remote & Hybrid Working", progress: 100, minutes: 8 },
  { id: "p-2", cat: "Conduct", title: "POSH & Anti-Harassment", progress: 100, minutes: 14 },
  { id: "p-3", cat: "Security", title: "Data Classification Standard", progress: 45, minutes: 11 },
  { id: "p-4", cat: "Finance", title: "Travel & Expense", progress: 0, minutes: 9 },
  { id: "p-5", cat: "Conduct", title: "Code of Ethics", progress: 70, minutes: 12 },
  { id: "p-6", cat: "Workplace", title: "Leave & Sabbatical", progress: 20, minutes: 7 },
];

export const HANDBOOK = [
  { id: "hb-1", chapter: "01", title: "Welcome to the team", body: "Your first thirty days, your equipment, your colleagues, and the three systems you will use every day." },
  { id: "hb-2", chapter: "02", title: "How we decide", body: "Decision classes, the Duty Architect, and how to escalate without drama." },
  { id: "hb-3", chapter: "03", title: "How we pay", body: "Compensation bands, equity refresh cycles, and the annual calibration process." },
  { id: "hb-4", chapter: "04", title: "How we protect each other", body: "Safety, POSH, SOS escalation and the confidentiality guarantees around reporting." },
  { id: "hb-5", chapter: "05", title: "How we grow", body: "The career lattice, mentorship pairings, and internal mobility windows." },
];

export const HR_FORMS = [
  { id: "f-1", name: "Leave Request", cat: "Leave", format: "Digital" },
  { id: "f-2", name: "Travel Authorisation", cat: "Travel", format: "PDF" },
  { id: "f-3", name: "Expense Claim", cat: "Expense", format: "Digital" },
  { id: "f-4", name: "Medical Reimbursement", cat: "Reimbursement", format: "PDF" },
  { id: "f-5", name: "Referral Submission", cat: "Recruitment", format: "Digital" },
  { id: "f-6", name: "Equipment Request", cat: "Facilities", format: "Digital" },
];

export const EVENTS = [
  { id: "ev-1", title: "Q3 Company All-Hands", date: "2026-06-30T15:00:00Z", venue: "Helix Auditorium, Reykjavík", rsvp: 1420, capacity: 1600 },
  { id: "ev-2", title: "Horizon Campus Preview Night", date: "2026-07-18T18:30:00Z", venue: "Horizon, Level 12", rsvp: 340, capacity: 400 },
  { id: "ev-3", title: "Nova Research Symposium", date: "2026-08-06T09:00:00Z", venue: "Bengaluru Lab North", rsvp: 210, capacity: 250 },
  { id: "ev-4", title: "Founders Day Gala", date: "2026-08-12T19:00:00Z", venue: "London Guildhall", rsvp: 780, capacity: 900 },
];

export const CALENDAR_ITEMS = [
  { id: "ci-1", type: "Meeting", title: "Platform Freeze Readiness", date: "26 Jun", owner: "Marcus O." },
  { id: "ci-2", type: "Deadline", title: "Expense cutoff", date: "21 Jul", owner: "Finance" },
  { id: "ci-3", type: "Milestone", title: "Platform v9 certification", date: "18 Jul", owner: "Engineering" },
  { id: "ci-4", type: "MoM", title: "Nova Review minutes published", date: "24 Jun", owner: "Priya R." },
];

export const CALENDAR_EVENTS = [
  {
    id: "ev-1",
    title: "Q3 Company All-Hands",
    description: "Strategic alignment across the Platform and Nova product lines.",
    start: "2026-06-30T15:00:00",
    end: "2026-06-30T16:30:00",
    location: "Helix Auditorium, Reykjavík",
    department: "Executive",
    participants: ["Elara Solberg", "Marcus Oyelaran", "Kenji Watanabe"],
    reminder: "10 minutes before",
    repeat: "Monthly",
    category: "Meeting",
    meetingProvider: "SyncSphere Meeting",
    meetingUrl: "https://syncsphere.novaterra.com/meet/ev-1",
  },
  {
    id: "ev-2",
    title: "Engineering production freeze review",
    description: "Review the platform production freeze plan and rollout milestones.",
    start: "2026-07-01T09:00:00",
    end: "2026-07-01T10:30:00",
    location: "Operations Hub, Reykjavík",
    department: "Engineering",
    participants: ["Marcus Oyelaran", "Priya Raghunathan"],
    reminder: "15 minutes before",
    repeat: "None",
    category: "Department Event",
    meetingProvider: "Microsoft Teams",
    meetingUrl: "https://teams.microsoft.com/l/meetup-join/ev-2",
  },
  {
    id: "ev-3",
    title: "Expense deadline",
    description: "Last day for Q3 expense claims and invoice submission.",
    start: "2026-07-21T00:00:00",
    end: "2026-07-21T23:59:00",
    location: "Global",
    department: "Finance",
    participants: ["Ines Duarte"],
    reminder: "1 day before",
    repeat: "None",
    category: "Deadline",
    meetingProvider: "No Meeting",
    meetingUrl: "",
  },
  {
    id: "ev-4",
    title: "Horizon opening countdown",
    description: "Final rehearsal for the Horizon campus opening sequence.",
    start: "2026-07-18T18:00:00",
    end: "2026-07-18T20:00:00",
    location: "Horizon, Level 12",
    department: "Operations",
    participants: ["Dmitri Volkov", "Sofia Marchetti"],
    reminder: "30 minutes before",
    repeat: "None",
    category: "Company Event",
    meetingProvider: "Zoom",
    meetingUrl: "https://zoom.us/j/ev-4",
  },
  {
    id: "ev-5",
    title: "Priya time off",
    description: "Personal leave day.",
    start: "2026-07-20T09:00:00",
    end: "2026-07-20T17:00:00",
    location: "Remote",
    department: "Research",
    participants: ["Priya Raghunathan"],
    reminder: "None",
    repeat: "None",
    category: "Leave",
    meetingProvider: "No Meeting",
    meetingUrl: "",
  },
  {
    id: "ev-6",
    title: "Nova Intelligence roadmap",
    description: "Product planning and roadmap review for next quarter.",
    start: "2026-07-04T14:00:00",
    end: "2026-07-04T15:30:00",
    location: "Lab North, Tokyo",
    department: "Research",
    participants: ["Priya Raghunathan", "Elara Solberg"],
    reminder: "10 minutes before",
    repeat: "Weekly",
    category: "Meeting",
    meetingProvider: "Google Meet",
    meetingUrl: "https://meet.google.com/ev-6",
  },
];

export const CALENDAR_CATEGORIES = [
  "Meeting",
  "Deadline",
  "Company Event",
  "Department Event",
  "Leave",
  "Personal",
];

export const MEETING_PROVIDERS = [
  "SyncSphere Meeting",
  "Zoom",
  "Google Meet",
  "Microsoft Teams",
  "External Link",
  "No Meeting",
];

export const EVENT_DEPARTMENTS = [
  "Executive",
  "Engineering",
  "Research",
  "Design",
  "Operations",
  "Human Resources",
  "Finance",
  "Product",
  "Marketing",
];

export const EVENT_REMINDERS = [
  "None",
  "5 minutes before",
  "10 minutes before",
  "15 minutes before",
  "30 minutes before",
  "1 hour before",
];

export const EVENT_REPEAT = [
  "None",
  "Daily",
  "Weekly",
  "Monthly",
];

export const EVENT_LOCATIONS = [
  "Helix Auditorium, Reykjavík",
  "Control Room 2, Reykjavík",
  "Lab North, Tokyo",
  "Horizon, Level 12",
  "London Guildhall",
  "Remote",
];

export const EVENT_PARTICIPANTS = [
  "Elara Solberg",
  "Marcus Oyelaran",
  "Kenji Watanabe",
  "Priya Raghunathan",
  "Sofia Marchetti",
  "Ines Duarte",
  "Dmitri Volkov",
  "Hana Kobayashi",
];

export const CALENDAR_CATEGORY_TONE = {
  Meeting: "gold",
  Deadline: "red",
  "Company Event": "blue",
  "Department Event": "amber",
  Leave: "green",
  Personal: "gold",
};

export const CALENDAR_CATEGORY_LABELS = CALENDAR_CATEGORIES;

export const EVENT_MEETING_PROVIDERS = MEETING_PROVIDERS;

export const CALENDAR_EVENT_CARDS = CALENDAR_EVENTS;

export const EMERGENCY_CONTACTS = [
  { id: "ec-1", label: "Global Security Desk", value: "+354 511 0999", note: "24/7 — all campuses" },
  { id: "ec-2", label: "POSH Committee Chair", value: "posh@novaterra.io", note: "Confidential, 24h response" },
  { id: "ec-3", label: "Medical Response", value: "+354 511 0911", note: "On-site paramedic teams" },
  { id: "ec-4", label: "Ethics Hotline", value: "ethics@novaterra.io", note: "Anonymous submissions accepted" },
];

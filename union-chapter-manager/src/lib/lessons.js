// ---------------------------------------------------------------------------
// Course + free lessons config.
//
// This drives the in-app "Learn" tab. The free lessons act as the top of the
// funnel: they teach a slice of the workflow the app implements, then point to
// the full paid course. Point COURSE.url at your own course platform page
// (Podia / Teachable / Gumroad / etc.).
// ---------------------------------------------------------------------------

export const COURSE = {
  name: 'How to Run Your Union Local',
  tagline: 'The complete operating system for chapter officers and stewards — from grievances to elections.',
  // Replace with your real course/checkout URL. Left as '#' so the CTA is
  // visible-but-inert until you wire up a platform.
  url: '#',
  price: '$149',
  bullets: [
    '8 modules · ~3 hours of focused video',
    'Downloadable templates: grievance intake, RIF checklist, meeting agendas',
    'Lifetime access + future updates',
  ],
}

// Free bite-size lessons shown in-app. Keep them short and operational — they
// are a taste of the course, not a replacement for it.
export const LESSONS = [
  {
    id: 'source-of-truth',
    title: 'Your chapter’s single source of truth',
    minutes: 4,
    summary: 'Why a scattered roster costs you grievances, and how to fix it.',
    body: [
      'The first job of any chapter is knowing who your members are and where they work. When that lives in three spreadsheets and someone’s inbox, deadlines get missed and members fall through the cracks.',
      'Start with two lists: members and worksites. Every member should map to a worksite and a role (member, steward, e-board, officer). That single structure powers everything else — who to notify, who your stewards cover, and who’s affected when a layoff hits a building.',
      'In this app: build the roster on the Members tab and assign each person a worksite and role. Do this once and every other feature gets easier.',
    ],
  },
  {
    id: 'log-every-contact',
    title: 'Log every member contact',
    minutes: 3,
    summary: 'The habit that wins grievances and elections.',
    body: [
      'Representation is a paper trail. The chapter that logs every conversation — date, topic, what was said — is the chapter that can prove a pattern, jog its own memory a year later, and hand off cleanly when officers change.',
      'Make it a reflex: after any real conversation with a member, log it. Thirty seconds now saves hours during a hearing.',
      'In this app: use the Interactions tab. Tie each entry to a member, add the topic, and archive old ones instead of deleting so the history survives.',
    ],
  },
  {
    id: 'grievance-intake',
    title: 'Grievance handling: intake to resolution',
    minutes: 6,
    summary: 'A simple pipeline so nothing stalls or blows a deadline.',
    body: [
      'Most grievances are lost on timelines, not merits. Treat every issue as a case that moves through stages — Open, In Progress, Resolved, Closed — with a dated note at every step.',
      'At intake, capture the member, the category (discipline, pay, safety, contract), and the priority. Then add a note every time something happens: filed, meeting held, response received. The timeline is your evidence and your deadline tracker.',
      'In this app: the Issues tab is built for exactly this. Set status and priority, and add a timeline note at each step so the next officer can pick it up cold.',
    ],
  },
  {
    id: 'steward-network',
    title: 'Building a steward network that scales',
    minutes: 5,
    summary: 'You can’t represent everyone alone. Deputize.',
    body: [
      'A chapter runs on its stewards. Your job as an officer is less about handling every case and more about making sure every worksite has a trained steward who catches problems early.',
      'Map stewards to worksites so there are no blind spots. Where you have a gap, that’s your next recruitment target.',
      'In this app: mark stewards with the Steward role on the Members tab, and use Worksites to see which buildings have coverage and which don’t.',
    ],
  },
  {
    id: 'rif-prep',
    title: 'Being ready before a layoff (RIF)',
    minutes: 5,
    summary: 'Reductions in force reward the prepared and punish the scrambling.',
    body: [
      'When a reduction in force is announced, you’re on a clock — seniority lists, bumping rights, and notice requirements all move fast. Chapters that prepared in calm times protect far more jobs.',
      'Keep an up-to-date roster with hire dates / seniority and worksite assignments so you can model who’s affected the moment numbers land. Have your notice and information-request templates ready to send.',
      'This is covered in depth in the full course, including a RIF checklist template.',
    ],
  },
]

// A small disclaimer to show under lessons — this is operational guidance, not
// legal advice, and specifics vary by contract and jurisdiction.
export const LEARN_DISCLAIMER =
  'General operational guidance, not legal advice. Your contract, bylaws, and local labor law govern — consult your labor rep or counsel for specifics.'

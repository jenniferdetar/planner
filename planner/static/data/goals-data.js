// goals-data.js
// Central data store for all SMART goals + weekly tasks + how they tie together.

export const GOALS = {
  "Lose 50 lbs": {
    category: "Health",
    tiesTo: [
      "Exercise more (start with walking)",
      "Journal at least 3x a week",
      "Make more home made meals",
      "Attend church more often",
      "Have monthly outing w/ Jeff"
    ],
    specific:
      "I want to lose 50 lbs to improve my health, energy, and confidence so I can better care for Jeff and keep up with work and life demands.",
    measurable:
      "Track progress with weekly weigh-ins and monthly body measurements, aiming for an average loss of 1–2 lbs per week until I reach 50 lbs lost.",
    achievable:
      "I will focus on sustainable habits: consistent movement, planned meals, and realistic routines that fit my schedule and caregiving responsibilities.",
    relevant:
      "This supports my priorities by improving stamina, reducing stress, and increasing my ability to show up for Jeff, work, and my long-term goals.",
    timebound:
      "Deadline: December 31, 2026 (steady, healthy pace).",
    weeklyTasks: [
      "1 weigh-in + quick note",
      "Plan meals for the week (10–15 min)",
      "Prep 2 protein-forward staples",
      "Review wins/obstacles (5 min)"
    ],
    statement:
      "By December 31, 2026, I will lose 50 lbs by maintaining sustainable nutrition and movement routines, tracking weekly weigh-ins and monthly measurements, and adjusting habits based on consistent review."
  },

  "Exercise more (start with walking)": {
    category: "Health",
    tiesTo: ["Lose 50 lbs", "Journal at least 3x a week", "Attend church more often"],
    specific:
      "I will increase activity by starting with walking to support my weight loss, stamina, and stress management.",
    measurable:
      "Walk at least 30 minutes, 5 days per week, tracked by a phone app or step counter.",
    achievable:
      "Walking requires minimal equipment and can be done near home or in short blocks if needed.",
    relevant:
      "Walking supports weight loss, mood, and heart health, and builds consistency without burnout.",
    timebound:
      "Start this week and maintain through December 31, 2026, increasing pace or distance gradually.",
    weeklyTasks: [
      "Schedule 5 walks on calendar",
      "Complete 5 walks (even if short)",
      "Do 1 longer walk (45–60 min) if able",
      "Stretch 2x (5 minutes)"
    ],
    statement:
      "By December 31, 2026, I will support my 50-lb weight loss goal by walking 30 minutes at least 5 days per week and tracking completion consistently."
  },

  "Journal at least 3x a week": {
    category: "Personal Growth",
    tiesTo: [
      "Lose 50 lbs",
      "Exercise more (start with walking)",
      "Make more home made meals",
      "Build relationships/network",
      "Promote, if possible",
      "Get side gigs to leave LAUSD"
    ],
    specific:
      "I will journal at least 3x/week to improve clarity and decision-making about health, work, emotions, relationships, and income goals.",
    measurable:
      "Write 3 entries per week and do 1 weekly review to identify patterns and next actions.",
    achievable:
      "Entries can be short (5–10 minutes). I can use a notebook or notes app.",
    relevant:
      "Journaling helps reduce stress, supports accountability, and improves follow-through across priorities.",
    timebound:
      "Start now and continue through December 31, 2026, reviewing weekly and monthly.",
    weeklyTasks: [
      "3 entries (5–10 min each)",
      "1 weekly review: what worked/what didn’t",
      "Pick 1 focus improvement for next week"
    ],
    statement:
      "By December 31, 2026, I will journal at least three times per week and complete a weekly review to improve my health habits, emotional regulation, relationships, and income decisions."
  },

  "Attend church more often": {
    category: "Faith",
    tiesTo: ["Journal at least 3x a week", "Have monthly outing w/ Jeff", "Lose 50 lbs"],
    specific:
      "I will attend church more often to strengthen my faith, stay grounded, and support emotional resilience.",
    measurable:
      "Attend church at least twice per month and track attendance on my calendar.",
    achievable:
      "I can plan ahead and choose in-person or livestream when needed.",
    relevant:
      "This supports my mental and emotional health during a demanding season and helps me stay aligned with my values.",
    timebound:
      "Start this month and continue through December 31, 2026.",
    weeklyTasks: [
      "Check service times for the week",
      "Write 1 reflection line after service"
    ],
    statement:
      "By December 31, 2026, I will attend church at least twice per month to strengthen my faith and support emotional resilience and values-based living."
  },

  "Have monthly outing w/ Jeff": {
    category: "Relationships",
    tiesTo: ["Attend church more often", "Journal at least 3x a week", "Lose 50 lbs"],
    specific:
      "Jeff and I will have one intentional outing per month to protect our relationship and make meaningful memories.",
    measurable:
      "Complete 1 outing per month and track it on our calendar (date + activity).",
    achievable:
      "We’ll choose flexible, health-friendly options (short drives, quiet meals, scenic stops, low-energy activities).",
    relevant:
      "This strengthens our connection and reduces stress while we navigate health and life responsibilities.",
    timebound:
      "Start this month and continue through December 31, 2026.",
    weeklyTasks: [
      "Brainstorm 2 outing ideas",
      "Check Jeff’s energy/health needs",
      "Schedule or confirm the outing date"
    ],
    statement:
      "By December 31, 2026, Jeff and I will complete one planned outing per month to strengthen our relationship and support emotional well-being."
  },

  "Get nails done": {
    category: "Self-care",
    tiesTo: ["Journal at least 3x a week", "Promote, if possible"],
    specific:
      "I will maintain regular nail care as part of personal upkeep and confidence.",
    measurable:
      "Schedule nail care every 4–6 weeks and track appointments on my calendar.",
    achievable:
      "I can schedule ahead and choose salon or at-home maintenance depending on time and budget.",
    relevant:
      "This supports confidence, professional presence, and self-care consistency.",
    timebound:
      "Start this month and maintain through December 31, 2026.",
    weeklyTasks: [
      "Check next appointment date",
      "Set aside small self-care budget if needed",
      "Quick at-home maintenance once weekly (10 min)"
    ],
    statement:
      "By December 31, 2026, I will maintain regular nail care every 4–6 weeks to support confidence, self-care, and professional presence."
  },

  "Make more home made meals": {
    category: "Home/Health",
    tiesTo: ["Lose 50 lbs", "Can meals", "Save up for a freeze dryer"],
    specific:
      "I will cook more meals at home to support weight loss, save money, and reduce decision fatigue.",
    measurable:
      "Cook at home at least 4 nights per week and track meals in a simple checklist.",
    achievable:
      "I will use simple recipes and repeatable staples and plan around busy days.",
    relevant:
      "Home meals support health goals and free up money for savings and stability.",
    timebound:
      "Start this week and maintain through December 31, 2026.",
    weeklyTasks: [
      "Meal plan (10–15 min)",
      "Grocery list + shop",
      "Cook 4 dinners",
      "Prep 2 grab-and-go lunches"
    ],
    statement:
      "By December 31, 2026, I will cook at least four home-made dinners per week to support my health goals and reduce food spending."
  },

  "Can meals": {
    category: "Home/Preparedness",
    tiesTo: ["Make more home made meals", "Fully Funded Emergency Fund"],
    specific:
      "I will can meals to build a home food buffer and reduce reliance on last-minute convenience food.",
    measurable:
      "Complete at least 1 canning batch per month and log what was made and stored.",
    achievable:
      "I can start with simple, familiar recipes and scale up over time.",
    relevant:
      "This improves food security and supports health and budget goals.",
    timebound:
      "Start this month and continue through December 31, 2026.",
    weeklyTasks: [
      "Pick 1 recipe for the month",
      "Check supplies/jars",
      "Prep ingredients when convenient",
      "Canning session when scheduled"
    ],
    statement:
      "By December 31, 2026, I will complete at least one canning batch per month to strengthen food security and support budget and health goals."
  },

  "Save up for a freeze dryer": {
    category: "Financial",
    tiesTo: ["Fully Funded Emergency Fund", "Can meals", "Make more home made meals"],
    specific:
      "I will save enough to purchase a freeze dryer to support long-term food preparedness and cost control.",
    measurable:
      "Save a set amount monthly until I reach my target (set target amount and date).",
    achievable:
      "I will automate savings and reduce discretionary spending by using more home meals and planned shopping.",
    relevant:
      "This supports long-term preparedness and financial stability.",
    timebound:
      "Target deadline: December 31, 2026 (adjust once target amount is finalized).",
    weeklyTasks: [
      "Transfer weekly savings amount to a dedicated account",
      "Track freeze-dryer fund balance",
      "Identify 1 spending cut or swap each week"
    ],
    statement:
      "By December 31, 2026, I will save toward a freeze dryer by making regular automated contributions and tracking progress monthly."
  },

  "Promote, if possible": {
    category: "Career",
    tiesTo: ["Complete MBA", "Build relationships/network", "Talk to more members"],
    specific:
      "I will position myself for promotion by documenting impact, increasing visibility, and strengthening leadership skills.",
    measurable:
      "Maintain a weekly accomplishment log and complete at least 1 visibility/leadership action per week.",
    achievable:
      "I can do this using small consistent actions and good documentation—no heroics required.",
    relevant:
      "Promotion supports income, stability, and long-term options.",
    timebound:
      "Start now and reassess quarterly through December 31, 2026.",
    weeklyTasks: [
      "Add 2 accomplishments to your log",
      "Do 1 leadership/visibility action",
      "Review priorities and align work"
    ],
    statement:
      "By December 31, 2026, I will increase my promotion readiness by documenting accomplishments weekly and taking consistent leadership and visibility actions."
  },

  "Read": {
    category: "Hobbies",
    tiesTo: ["Promote, if possible", "Get side gigs to leave LAUSD", "Complete MBA", "Build relationships/network"],
    specific:
      "I will read business and entrepreneurship books, at least one chapter per day, finishing each book before starting the next.",
    measurable:
      "Track one chapter completed daily; finish at least one business book at a time and mark it complete.",
    achievable:
      "Block 25–30 minutes daily, keep the current business book selected in Books to Read, and use a simple tracker in the planner.",
    relevant:
      "Business reading strengthens decision-making, supports career growth, and helps future side gigs and financial goals.",
    timebound:
      "Daily through December 31, 2026, starting the next business book immediately after finishing the current one.",
    weeklyTasks: [
      "Choose the current business book from Books to Read",
      "Schedule a daily 25–30 minute reading block",
      "Complete at least 7 chapters per week",
      "Log key takeaways when a book is finished"
    ],
    statement:
      "By December 31, 2026, I will read one chapter per day from business books, finishing each before starting the next, to strengthen career and income goals while tracking completions weekly."
  },

  "Get side gigs to leave LAUSD": {
    category: "Career/Income",
    tiesTo: ["Complete coding course strong", "Build relationships/network", "Fully Funded Emergency Fund"],
    specific:
      "I will build consistent side income to increase options and reduce dependence on my current job.",
    measurable:
      "Apply/outreach weekly and track leads, interviews, and income earned.",
    achievable:
      "I will focus on realistic opportunities aligned with my skills and available time.",
    relevant:
      "This increases financial security and long-term flexibility.",
    timebound:
      "Start now and build momentum through December 31, 2026.",
    weeklyTasks: [
      "Send 2 applications/outreach messages",
      "Work 2 hours on skills/portfolio",
      "Track leads and follow-ups"
    ],
    statement:
      "By December 31, 2026, I will build side income by taking weekly outreach actions, developing skills consistently, and tracking opportunities and earnings."
  },

  "Help Jeff with Disability": {
    category: "Family/Administration",
    tiesTo: ["Fully Funded Emergency Fund", "Have monthly outing w/ Jeff"],
    specific:
      "I will support Jeff’s disability process with organized documentation, consistent follow-ups, and timely submissions.",
    measurable:
      "Maintain a checklist of requirements and complete at least one disability-related action weekly until resolved.",
    achievable:
      "I can break tasks into small steps and keep everything in one organized folder (digital + physical).",
    relevant:
      "This supports family stability, reduces stress, and protects household finances.",
    timebound:
      "Start now and complete weekly actions until the process is finalized.",
    weeklyTasks: [
      "Review checklist/status once weekly",
      "Complete 1 follow-up call/email or document task",
      "File new paperwork in the correct folder"
    ],
    statement:
      "Starting this week, I will complete at least one disability-related task weekly to move Jeff’s disability process forward until finalized."
  },

  "Fully Funded Emergency Fund": {
    category: "Financial",
    tiesTo: ["Get side gigs to leave LAUSD", "Can meals", "Save up for a freeze dryer"],
    specific:
      "I will build and maintain a fully funded emergency fund to protect the household from surprises and reduce stress.",
    measurable:
      "Save until I reach 3–6 months of essential expenses (choose target) and track monthly balance progress.",
    achievable:
      "I will automate contributions and adjust budget using home meals and reduced discretionary spending.",
    relevant:
      "This creates stability during health challenges and career transitions.",
    timebound:
      "Target deadline: December 31, 2026 (or earlier if feasible).",
    weeklyTasks: [
      "Automatic transfer + verify it posted",
      "Review spending for 1 category weekly",
      "Add extra savings from any windfall"
    ],
    statement:
      "By December 31, 2026, I will build a 3–6 month emergency fund by automating savings contributions and tracking progress monthly."
  },

  "De-clutter the living room": {
    category: "Home",
    tiesTo: ["Donate what's not being used", "Clean up the office", "Journal at least 3x a week"],
    specific:
      "I will declutter the living room to reduce stress, improve function, and create a calmer home environment.",
    measurable:
      "Complete one declutter session weekly and remove at least one bag/box of items per week (donate/trash).",
    achievable:
      "Short sessions keep it manageable and prevent overwhelm.",
    relevant:
      "A calmer space supports mental health, routines, and relationship quality.",
    timebound:
      "Start this week and maintain weekly sessions through March 31, 2026, then sustain.",
    weeklyTasks: [
      "30–60 minute declutter session",
      "Fill 1 donate/trash bag",
      "Reset surfaces (5 minutes)"
    ],
    statement:
      "By March 31, 2026, I will declutter the living room by completing a weekly session and removing at least one bag/box of unused items each week."
  },

  "Clean up the office": {
    category: "Home/Work",
    tiesTo: ["Promote, if possible", "Complete MBA", "Complete coding course strong"],
    specific:
      "I will organize my office to improve focus, reduce paper chaos, and support consistent work output.",
    measurable:
      "Complete one office reset weekly and process papers to inbox/file/shred with a clear system.",
    achievable:
      "Small weekly resets prevent buildup and reduce time waste.",
    relevant:
      "A clean office supports productivity, income, and stress reduction.",
    timebound:
      "Start this week and maintain through March 31, 2026, then sustain.",
    weeklyTasks: [
      "15-minute desk reset",
      "Process one paper stack (inbox/file/shred)",
      "Prep workspace for Monday"
    ],
    statement:
      "By March 31, 2026, I will maintain an organized office by completing a weekly reset and processing paper clutter into a simple filing system."
  },

  "Donate what's not being used": {
    category: "Home",
    tiesTo: ["De-clutter the living room", "Clean up the office"],
    specific:
      "I will donate unused items regularly to reduce clutter and benefit others.",
    measurable:
      "Create a donation box and drop off donations at least once per month.",
    achievable:
      "I can add a few items weekly and schedule one monthly drop-off.",
    relevant:
      "This supports a calmer home and consistent decluttering progress.",
    timebound:
      "Start now and continue through December 31, 2026.",
    weeklyTasks: [
      "Add 5 items to donation box",
      "Keep donation box visible/accessible",
      "Schedule monthly drop-off"
    ],
    statement:
      "By December 31, 2026, I will reduce clutter by collecting donation items weekly and completing at least one donation drop-off per month."
  },

  "Keep to commuter/work only": {
    category: "Work/Boundaries",
    tiesTo: ["Lose 50 lbs", "Promote, if possible", "Fully Funded Emergency Fund"],
    specific:
      "I will limit my time and travel to essential work/commute needs to protect energy and reduce burnout.",
    measurable:
      "Review weekly schedule and decline or reschedule non-essential commitments when possible.",
    achievable:
      "This is realistic with planning and clearer boundaries.",
    relevant:
      "Protecting energy supports health, caregiving, and consistent progress on income goals.",
    timebound:
      "Start this week and reassess monthly through December 31, 2026.",
    weeklyTasks: [
      "Weekly schedule review (10 min)",
      "Identify 1 thing to decline/defer",
      "Block time for top priorities"
    ],
    statement:
      "Through December 31, 2026, I will protect my energy by limiting commitments to essential work/commute items and reviewing boundaries weekly."
  },

  "Complete coding course strong": {
    category: "Career/Skills",
    tiesTo: ["Get side gigs to leave LAUSD", "Promote, if possible"],
    specific:
      "I will complete my coding course with consistent practice to expand income options and career flexibility.",
    measurable:
      "Complete a set number of lessons per week and build small practice projects to demonstrate skills.",
    achievable:
      "I will schedule short, consistent study blocks instead of relying on long sessions.",
    relevant:
      "Coding skills directly support side gigs and long-term earning potential.",
    timebound:
      "Complete course by (set your course end date), and build portfolio through December 31, 2026.",
    weeklyTasks: [
      "2–4 study sessions scheduled",
      "Complete X lessons/modules",
      "1 hands-on practice exercise"
    ],
    statement:
      "By the course end date, I will complete my coding course by studying weekly, completing modules, and building practice projects to support income growth."
  },

  "Complete MBA": {
    category: "Career/Education",
    tiesTo: ["Promote, if possible", "Fully Funded Emergency Fund"],
    specific:
      "I will make consistent progress toward completing my MBA to strengthen leadership and income potential.",
    measurable:
      "Track assignments weekly and meet all deadlines each term.",
    achievable:
      "I will plan around busy weeks and use small, consistent work blocks.",
    relevant:
      "An MBA supports promotion readiness, leadership credibility, and long-term stability.",
    timebound:
      "Complete MBA by (set graduation target), maintaining steady progress through each term.",
    weeklyTasks: [
      "Review syllabi/deadlines",
      "Complete readings/assignments",
      "Block 2 focused study sessions"
    ],
    statement:
      "By my target graduation date, I will complete my MBA by tracking deadlines, completing weekly coursework, and maintaining consistent study routines."
  },

  "Build relationships/network": {
    category: "Career/Community",
    tiesTo: ["Promote, if possible", "Get side gigs to leave LAUSD", "Talk to more members"],
    specific:
      "I will intentionally build and maintain relationships that support career growth, advocacy work, and income opportunities.",
    measurable:
      "Make at least 1 meaningful connection action per week (reach out, follow up, coffee/chat).",
    achievable:
      "Small consistent outreach is realistic and doesn’t require big time blocks.",
    relevant:
      "Networks create opportunities for promotions, gigs, and better support systems.",
    timebound:
      "Start now and continue through December 31, 2026.",
    weeklyTasks: [
      "1 outreach message",
      "1 follow-up",
      "Add notes to contact log"
    ],
    statement:
      "By December 31, 2026, I will strengthen my network by completing at least one outreach/follow-up action each week and tracking relationships intentionally."
  },

  "Talk to more members": {
    category: "CSEA/Leadership",
    tiesTo: ["Represent more members", "Re-elected for MB Committee", "Find ways to grow meetings"],
    specific:
      "I will talk to more members to understand needs, build trust, and strengthen representation.",
    measurable:
      "Have at least 1 member conversation per week and capture key themes.",
    achievable:
      "Short check-ins are doable during the week or around meetings.",
    relevant:
      "This improves representation, meeting growth, and re-election readiness.",
    timebound:
      "Start now and continue through the next election cycle.",
    weeklyTasks: [
      "1 member check-in",
      "Log 1–3 key themes/issues",
      "Follow up on one item"
    ],
    statement:
      "Starting this week through the next election cycle, I will engage at least one member weekly to improve representation and committee effectiveness."
  },

  "Re-elected for MB Committee": {
    category: "CSEA/Leadership",
    tiesTo: ["Talk to more members", "Represent more members"],
    specific:
      "I will position myself for re-election by demonstrating consistent service, communication, and results for members.",
    measurable:
      "Maintain a weekly impact log and complete at least 1 visibility/service action weekly.",
    achievable:
      "Small weekly actions build a strong track record over time.",
    relevant:
      "Re-election supports continued advocacy and influence for member needs.",
    timebound:
      "Through the next election date (set election date when known).",
    weeklyTasks: [
      "Add 2 items to impact log",
      "Do 1 member-focused service action",
      "Share 1 useful update with members"
    ],
    statement:
      "By the next election date, I will strengthen my re-election readiness by documenting weekly impact and completing consistent member-focused actions."
  },

  "Represent more members": {
    category: "CSEA/Leadership",
    tiesTo: ["Talk to more members", "Find ways to grow meetings"],
    specific:
      "I will represent more members by improving outreach, follow-through, and responsiveness to concerns.",
    measurable:
      "Track member concerns and take at least 1 advocacy action per week.",
    achievable:
      "One action per week is manageable and keeps momentum.",
    relevant:
      "Representation builds trust, strengthens the committee, and supports meeting growth.",
    timebound:
      "Start now and continue through December 31, 2026 (or election cycle).",
    weeklyTasks: [
      "Review member themes/issues",
      "Take 1 advocacy action",
      "Send 1 follow-up/update"
    ],
    statement:
      "Through December 31, 2026, I will strengthen representation by tracking member concerns and taking at least one advocacy action weekly."
  },

  "Find ways to grow meetings": {
    category: "CSEA/Leadership",
    tiesTo: ["Talk to more members", "Represent more members"],
    specific:
      "I will grow meeting engagement by improving outreach, agenda value, and member participation.",
    measurable:
      "Test at least 1 improvement per month (format, reminders, topics) and track attendance/engagement.",
    achievable:
      "Small experiments are realistic and easy to adjust.",
    relevant:
      "Better meetings increase member connection and strengthen leadership outcomes.",
    timebound:
      "Start now and evaluate monthly through December 31, 2026.",
    weeklyTasks: [
      "Send 1 meeting reminder/value message",
      "Collect 1 topic idea from members",
      "Note attendance and feedback"
    ],
    statement:
      "By December 31, 2026, I will improve meeting engagement by running monthly improvements and tracking attendance and feedback consistently."
  }
};

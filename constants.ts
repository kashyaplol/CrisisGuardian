import { DisasterModule, DisasterType, Achievement, AchievementId, AchievementTier } from './types';
import { 
  Avatar1Icon, Avatar2Icon, Avatar3Icon, Avatar4Icon,
  TrophyBronzeIcon, TrophySilverIcon, TrophyGoldIcon
} from './components/icons/Icons';

// --- Icon Data URLs (Representing WebP/Image format) ---
// Using SVG data URLs as a stand-in for WebP format. This allows using them in <img> tags.
const ICONS = {
  earthquake: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iYmxhY2siPjxwYXRoIGQ9Ik0yMSAxMS4yVjIwaC01LjJsLS42LS44IDIuOC0zLjctMS42LTEuMi0yLjggMy44LTIuMy0xLjdWNC45TDIxIDExLjN6TTExLjIgMjBIM3YtOC4xbDcuOC02TDEyIDYuOHY3LjJsMS42IDEuMi0yIDIuN0wxMS4yIDIwek0yMi41IDIxaC0yMXYyaDIxVjIxek0iLz48L3N2Zz4=',
  flood: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iYmxhY2siPjxwYXRoIGQ9Ik0xMiAzTDQgMTJoM3Y1aDEwbC0xLTRoM0wxMiAzek0yLjUgMjEuNWMxLjQtLjkgMy4xLS45IDQuNSAwczMuMSAxIDQuNSAwIDMuMS0xIDQuNSAwIDMuMS45IDQuNSAwdi0zYy0xLjQuOS0zLjEuOS00LjUgMHMtMy4xLTEtNC41IDAtMy4xIDEtNC41IDAtMy4xLS45LTQuNSAwdiN6Ii8+PC9zdmc+',
  fire: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iYmxhY2siPjxwYXRoIGQ9Ik05LjIgMjJjLS4zLTIuMS0xLjItNC4xLTIuNS01LjhDNC4zIDEzLjEgMy4xIDExLjkgMi40IDEyLjMgNi4xIDkgOC41IDQuNyAxMi41IDIuNGMuNSAxLjQuNyAyLjguNyA0LjMgMCAyLjgtLjkgNS4zLTIuNSA3LjVDMTIuMyAxNS42IDE0IDE3LjcgMTQgMjAuMmMwIC41LS4xIDEuMS0uMiAxLjYtMS40LS4yLTIuOS0uMi00LjYtLjJ6Ii8+PHBhdGggZD0iTTE1IDcuNWMtLjYgMS42LTEuNSAzLjEtMi43IDQuNCAyLjQgMS4yIDQgMy42IDQgNi4zIDAgLjEgMCAuMiAwIC4zIDMuNC0xLjIgNS44LTQuNCA1LjgtOC4yQzIyIDEyLjUgMTguMiA4LjYgMTUgNy41eiIvPjwvc3ZnPg==',
  cyclone: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iYmxhY2siPjxwYXRoIGQ9Ik0xMiAyYzIuOCAwIDUuMyAxLjIgNy4xIDMuMS0xIDEuMy0yLjUgMi4xLTQuMSAyLjEtMi44IDAtNS0yLjItNS01IDAtMS43LjgtMy4yIDIuMS00LjEuNiAwIC42IDAgLjYgMHptNi45LTIuMkMxNyAzLjEgMTQuNiAyIDEyIDJzLTUgMS4xLTYuOSAyLjlDNy45LjggOS40IDAgMTEgMGMxLjggMCAzLjQgMS4xIDQuMSAyLjFDMTUgNy4zIDE3LjUgNi4xIDE4LjkgNC45em0tMTMuOCAxNGMxLjkgMS45IDQuMyAzIDYuOSAzczUtMS4xIDYuOS0yLjljLTEuOSAxLjktNC4zIDMtNi45IDNzLTUtMS4xLTYuOS0yLjljLTEtMS4zLTEuNi0yLjgtMS42LTQuNSAwLTIuOCAxLjItNS4zIDMuMS03LjFDNC4xIDIuMiAyLjUgMyAxLjMgNC4xLTEuMyA2LjcgMCAxMS4yIDAgMTRjMCAyLjggMS4yIDUuMyAzLjEgNy4xeiIvPjwvc3ZnPg==',
};

export const DISASTER_MODULES: DisasterModule[] = [
  {
    type: DisasterType.Earthquake,
    title: 'Earthquake Safety',
    description: 'Learn how to react before, during, and after an earthquake. Practice "Drop, Cover, and Hold On".',
    icon: ICONS.earthquake,
    studyMaterial: {
      introduction: "India's high disaster vulnerability index, as noted by the NDMA, makes earthquake preparedness in schools critical. This module follows UNDRR recommendations for integrating disaster risk reduction into education.",
      keyPoints: [
        { title: 'Drop, Cover, and Hold On', detail: 'During an earthquake, drop to the ground, take cover under a sturdy desk or table, and hold on until the shaking stops.' },
        { title: 'Identify Safe Spots', detail: 'Before a drill, identify safe spots in each room, away from windows, glass, or heavy objects that could fall.' },
        { title: 'Evacuation Routes', detail: 'Know your school\'s evacuation routes and assembly points. Practice evacuating in an orderly manner.' },
        { title: 'After the Shaking', detail: 'Once shaking stops, evacuate cautiously. Be aware of aftershocks and potential hazards like falling debris.' },
        { title: 'Securing Your Space', detail: 'Anchor heavy furniture, cupboards, and appliances to the walls or floor to prevent them from falling during an earthquake.' },
        { title: 'Emergency Kit', detail: 'Keep a readily accessible kit with water, non-perishable food, a first-aid kit, a flashlight, and a battery-powered radio.' },
        { title: 'During Shaking: If Outdoors', detail: 'Move to an open area away from buildings, trees, streetlights, and utility wires. Drop to the ground and stay there until the shaking stops.' },
        { title: 'Post-Earthquake Communication', detail: 'Use text messages or social media to communicate. Phone lines are often overwhelmed, so save calls for life-threatening emergencies.' },
      ],
    },
  },
  {
    type: DisasterType.Flood,
    title: 'Flood Preparedness',
    description: 'Understand flood warnings, evacuation procedures, and how to stay safe from water-borne dangers.',
    icon: ICONS.flood,
    studyMaterial: {
      introduction: 'Many regions in India are prone to flooding. Low awareness in schools can be dangerous. This material is designed to build resilience through education.',
      keyPoints: [
        { title: 'Understand Warnings', detail: 'Pay attention to flood warnings from the Indian Meteorological Department (IMD). Understand the difference between a flood watch and a flood warning.' },
        { title: 'Emergency Kit', detail: 'Prepare a waterproof emergency kit with first-aid supplies, drinking water, non-perishable food, and a flashlight.' },
        { title: 'Evacuate to Higher Ground', detail: 'If instructed to evacuate, move to a designated safe shelter or higher ground immediately. Never walk or drive through floodwaters.' },
        { title: 'Post-Flood Health Hazards', detail: 'Be cautious of contaminated water and the risk of waterborne diseases after a flood. Do not use tap water until authorities declare it safe.' },
        { title: 'Protect Your Home', detail: 'If time permits, move essential items to an upper floor. Turn off utilities at the main switches or valves if instructed by authorities.' },
        { title: 'Turn Around, Don\'t Drown®', detail: 'Never drive through flooded roads. As little as six inches of moving water can knock you down, and one to two feet can sweep your vehicle away.' },
        { title: 'Avoid Electrocution Risk', detail: 'Do not touch electrical equipment if you are wet or standing in water. Be aware of underground or downed power lines.' },
        { title: 'Listen to Authorities', detail: 'Follow the advice and directives of local emergency management officials. They provide the most accurate information and instructions.' },
      ],
    },
  },
  {
    type: DisasterType.Fire,
    title: 'Fire Emergency',
    description: 'Know the escape routes, how to use a fire extinguisher, and what to do in case of a fire breakout.',
    icon: ICONS.fire,
    studyMaterial: {
      introduction: 'Fire safety is a critical component of school safety policies. This module covers essential prevention and response strategies.',
      keyPoints: [
        { title: 'Fire Alarms and Drills', detail: 'Recognize the sound of the fire alarm and participate seriously in all fire drills. Know at least two escape routes from every room.' },
        { title: 'Crawl Low Under Smoke', detail: 'If there is smoke, stay low to the ground where the air is cleaner and cooler. Cover your mouth and nose with a cloth.' },
        { title: 'Using a Fire Extinguisher (P.A.S.S.)', detail: 'For trained individuals: Pull the pin, Aim at the base of the fire, Squeeze the lever, and Sweep from side to side.' },
        { title: 'Assembly Point', detail: 'After evacuating, go directly to the designated assembly point so that a head count can be taken.' },
        { title: 'Feel Doors Before Opening', detail: 'Before opening a door in a fire, feel it with the back of your hand. If it\'s hot or if you see smoke coming from around it, use your second way out.' },
        { title: 'Stop, Drop, and Roll', detail: 'If your clothes catch fire, stop immediately, drop to the ground, cover your face with your hands, and roll over and over to extinguish the flames.' },
        { title: 'Fire Prevention Tips', detail: 'Never leave cooking unattended. Keep flammable materials away from heat sources. Avoid overloading electrical circuits and sockets.' },
        { title: 'Install and Test Smoke Alarms', detail: 'Ensure functional smoke alarms are installed on every level of the building and inside/outside sleeping areas. Test them at least once a month.' },
      ],
    },
  },
  {
    type: DisasterType.Cyclone,
    title: 'Cyclone Alert',
    description: 'Prepare for high-speed winds and heavy rain. Secure your home and know the evacuation zones.',
    icon: ICONS.cyclone,
    studyMaterial: {
      introduction: "India's extensive coastline is vulnerable to cyclones. Integrating disaster risk reduction in school policies, as recommended by the UNDRR, is vital for protecting students and staff.",
      keyPoints: [
        { title: 'Track Cyclone Warnings', detail: 'Monitor official weather broadcasts and warnings. Follow all instructions from local authorities.' },
        { title: 'Secure the Building', detail: 'Before the cyclone hits, help secure loose objects outside. Close windows and doors securely.' },
        { title: 'Stay Indoors', detail: 'During the cyclone, stay inside in the strongest part of the building, away from windows and doors.' },
        { title: 'Post-Cyclone Risks', detail: 'After the storm passes, be cautious of fallen power lines, weakened structures, and flooded areas. Do not go outside until it is declared safe.' },
        { title: 'Emergency Kit Essentials', detail: 'Prepare a kit with essentials like water, food, medicines, a flashlight, batteries, and important documents sealed in a waterproof bag.' },
        { title: 'Know Your Evacuation Zone', detail: 'Familiarize yourself with your area\'s evacuation routes and the location of the nearest official storm shelters.' },
        { title: 'During Power Outages', detail: 'Use flashlights for emergency lighting. Avoid using candles, as they can be a significant fire hazard, especially during strong winds.' },
        { title: 'Stay Informed Post-Cyclone', detail: 'Continue listening to a battery-powered radio or local news for official updates, as dangers like flooding can persist long after the winds have subsided.' },
      ],
    },
  },
];

export const INDIAN_STATES: string[] = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", 
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", 
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", 
  "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", 
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", 
  "Ladakh", "Lakshadweeep", "Puducherry"
];

export const DEFAULT_AVATARS = [
  { id: 'avatar1', Icon: Avatar1Icon },
  { id: 'avatar2', Icon: Avatar2Icon },
  { id: 'avatar3', Icon: Avatar3Icon },
  { id: 'avatar4', Icon: Avatar4Icon },
];

export const NIRF_COLLEGES: string[] = [
    "Indian Institute of Technology Madras",
    "Indian Institute of Technology Delhi",
    "Indian Institute of Technology Bombay",
    "Indian Institute of Technology Kanpur",
    "Indian Institute of Technology Kharagpur",
    "Jawaharlal Nehru University, New Delhi",
    "All India Institute of Medical Sciences, Delhi",
    "Vellore Institute of Technology",
    "University of Hyderabad",
    "Banaras Hindu University",
];

export const INDIAN_SCHOOLS: string[] = [
    "Delhi Public School, R.K. Puram",
    "The Doon School, Dehradun",
    "La Martiniere for Boys, Kolkata",
    "The Scindia School, Gwalior",
    "Mayo College, Ajmer",
    "Shree Swaminarayan Gurukul International School, Hyderabad",
    "St. Xavier's Collegiate School, Kolkata",
    "The Mother's International School, Delhi",
    "Bombay Scottish School, Mahim",
    "Kendriya Vidyalaya",
];

// This is a Base64 representation of a very short, silent, black MP4 video.
// In a real application, each video would have its own unique, much larger Base64 string.
// Using a placeholder keeps the source code manageable for this simulation.
const placeholderBase64Video = 'AAAAGGZ0eXBNU05WAAACAE1TTlYAAAAAAAAAAABtb292AAAAbG12aGQAAAAAAAAAAAAAAAAAAAPoAAAAAAABAAEAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAFEaW9kcwx1cmwgAAAAAQAAAFd0cmFrAAAAXHRraGQAAAADAAAAAAAAAAAAAAABAAAAAAAAAAAAAAABAAAAAAAoAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAABaWR0cwAAAAAAAAABAAAAwG1kaWEAAABhbWRoZAAAAAAAAAAAAAAAAAAAACRoZGxyAAAAAAAAAAB2aWRlAAAAAAAAAAAAAAAAVmlkZW9IYW5kbGVyAAAAAQhtaW5mAAAAFnZtaGQAAAABAAAAAAAAAAAAAAAkZGluZgAAABxkcmVmAAAAAAAAAAEAAAAMdXJsIAAAAAEAAABCc3RibAAAAH5zdHNkAAAAAAAAAAEAAABXQW5WMQAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAoAEgAAABIAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAY//8AAAAxYXZjQwH0AAr/4QAYZ/QAC1YCQaL8+kAAAAwAEAAAPpAADDAAn4AAAABAEH//4gAATEH//4gAAAAAAAAAAAYc3R0cwAAAAAAAAABAAAAAQAAA+gAAAAQc3RzcwAAAAAAAAABAAAAAQAAABRzdHNjAAAAAAAAAAEAAAABAAAAAQAAAAEAAAAQc3RzYwAAAAAAAAABAAAAMAAAABxzdHN6AAAAAAAAAAAAAAAEAAAACAAAABAAAAAgAAAAHHN0Y28AAAAAAAAAAQAAADAAAABidWR0YQAAAFptZXRhAAAAAAAAACNoZGxyAAAAAAAAAABtZGlyYXBwbAAAAAAAAAAAAAAAACtpbHN0AAAAJql0b28AAAAdZGF0YQAAAAEAAAAATGF2ZjU3LjQxLjEwMA==';

export const PRE_GENERATED_VIDEOS: Record<string, string> = {
    'Earthquake-cartoon': placeholderBase64Video,
    'Earthquake-realistic': placeholderBase64Video,
    'Flood-cartoon': placeholderBase64Video,
    'Flood-realistic': placeholderBase64Video,
    'Fire-cartoon': placeholderBase64Video,
    'Fire-realistic': placeholderBase64Video,
    'Cyclone-cartoon': placeholderBase64Video,
    'Cyclone-realistic': placeholderBase64Video,
};

export const ACHIEVEMENTS_LIST: Achievement[] = [
  { id: AchievementId.FirstDrill, name: 'First Steps', description: 'Complete your first virtual drill.', tier: AchievementTier.Bronze, icon: TrophyBronzeIcon },
  { id: AchievementId.FiveDrills, name: 'Drill Enthusiast', description: 'Complete 5 virtual drills.', tier: AchievementTier.Silver, icon: TrophySilverIcon },
  { id: AchievementId.TenDrills, name: 'Drill Sergeant', description: 'Complete 10 virtual drills.', tier: AchievementTier.Gold, icon: TrophyGoldIcon },
  { id: AchievementId.PerfectScore, name: 'Flawless Victory', description: 'Achieve a perfect score on any drill.', tier: AchievementTier.Silver, icon: TrophySilverIcon },
  { id: AchievementId.HighAchiever, name: 'High Achiever', description: 'Maintain an average score above 90%.', tier: AchievementTier.Gold, icon: TrophyGoldIcon },
  { id: AchievementId.EarthquakeMaster, name: 'Quake Proof', description: 'Get a perfect score on a Hard Earthquake drill.', tier: AchievementTier.Gold, icon: TrophyGoldIcon },
  { id: AchievementId.FloodMaster, name: 'High and Dry', description: 'Get a perfect score on a Hard Flood drill.', tier: AchievementTier.Gold, icon: TrophyGoldIcon },
  { id: AchievementId.FireMaster, name: 'Fire Marshal', description: 'Get a perfect score on a Hard Fire drill.', tier: AchievementTier.Gold, icon: TrophyGoldIcon },
  { id: AchievementId.CycloneMaster, name: 'Storm Rider', description: 'Get a perfect score on a Hard Cyclone drill.', tier: AchievementTier.Gold, icon: TrophyGoldIcon },
  { id: AchievementId.ThreeDayStreak, name: 'Warming Up', description: 'Maintain a 3-day activity streak.', tier: AchievementTier.Bronze, icon: TrophyBronzeIcon },
  { id: AchievementId.SevenDayStreak, name: 'On Fire', description: 'Maintain a 7-day activity streak.', tier: AchievementTier.Silver, icon: TrophySilverIcon },
];
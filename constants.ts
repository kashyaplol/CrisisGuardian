import { DisasterModule, DisasterType } from './types';
import { 
  EarthquakeIcon, FloodIcon, FireIcon, CycloneIcon,
  Avatar1Icon, Avatar2Icon, Avatar3Icon, Avatar4Icon 
} from './components/icons/Icons';

export const DISASTER_MODULES: DisasterModule[] = [
  {
    type: DisasterType.Earthquake,
    title: 'Earthquake Safety',
    description: 'Learn how to react before, during, and after an earthquake. Practice "Drop, Cover, and Hold On".',
    icon: EarthquakeIcon,
    studyMaterial: {
      introduction: "India's high disaster vulnerability index, as noted by the NDMA, makes earthquake preparedness in schools critical. This module follows UNDRR recommendations for integrating disaster risk reduction into education.",
      keyPoints: [
        { title: 'Drop, Cover, and Hold On', detail: 'During an earthquake, drop to the ground, take cover under a sturdy desk or table, and hold on until the shaking stops.' },
        { title: 'Identify Safe Spots', detail: 'Before a drill, identify safe spots in each room, away from windows, glass, or heavy objects that could fall.' },
        { title: 'Evacuation Routes', detail: 'Know your school\'s evacuation routes and assembly points. Practice evacuating in an orderly manner.' },
        { title: 'After the Shaking', detail: 'Once shaking stops, evacuate cautiously. Be aware of aftershocks and potential hazards like falling debris.' },
      ],
    },
  },
  {
    type: DisasterType.Flood,
    title: 'Flood Preparedness',
    description: 'Understand flood warnings, evacuation procedures, and how to stay safe from water-borne dangers.',
    icon: FloodIcon,
    studyMaterial: {
      introduction: 'Many regions in India are prone to flooding. Low awareness in schools can be dangerous. This material is designed to build resilience through education.',
      keyPoints: [
        { title: 'Understand Warnings', detail: 'Pay attention to flood warnings from the Indian Meteorological Department (IMD). Understand the difference between a flood watch and a flood warning.' },
        { title: 'Emergency Kit', detail: 'Prepare a waterproof emergency kit with first-aid supplies, drinking water, non-perishable food, and a flashlight.' },
        { title: 'Evacuate to Higher Ground', detail: 'If instructed to evacuate, move to a designated safe shelter or higher ground immediately. Never walk or drive through floodwaters.' },
        { title: 'Post-Flood Health Hazards', detail: 'Be cautious of contaminated water and the risk of waterborne diseases after a flood. Do not use tap water until authorities declare it safe.' },
      ],
    },
  },
  {
    type: DisasterType.Fire,
    title: 'Fire Emergency',
    description: 'Know the escape routes, how to use a fire extinguisher, and what to do in case of a fire breakout.',
    icon: FireIcon,
    studyMaterial: {
      introduction: 'Fire safety is a critical component of school safety policies. This module covers essential prevention and response strategies.',
      keyPoints: [
        { title: 'Fire Alarms and Drills', detail: 'Recognize the sound of the fire alarm and participate seriously in all fire drills. Know at least two escape routes from every room.' },
        { title: 'Crawl Low Under Smoke', detail: 'If there is smoke, stay low to the ground where the air is cleaner and cooler. Cover your mouth and nose with a cloth.' },
        { title: 'Using a Fire Extinguisher (P.A.S.S.)', detail: 'For trained individuals: Pull the pin, Aim at the base of the fire, Squeeze the lever, and Sweep from side to side.' },
        { title: 'Assembly Point', detail: 'After evacuating, go directly to the designated assembly point so that a head count can be taken.' },
      ],
    },
  },
  {
    type: DisasterType.Cyclone,
    title: 'Cyclone Alert',
    description: 'Prepare for high-speed winds and heavy rain. Secure your home and know the evacuation zones.',
    icon: CycloneIcon,
    studyMaterial: {
      introduction: "India's extensive coastline is vulnerable to cyclones. Integrating disaster risk reduction in school policies, as recommended by the UNDRR, is vital for protecting students and staff.",
      keyPoints: [
        { title: 'Track Cyclone Warnings', detail: 'Monitor official weather broadcasts and warnings. Follow all instructions from local authorities.' },
        { title: 'Secure the Building', detail: 'Before the cyclone hits, help secure loose objects outside. Close windows and doors securely.' },
        { title: 'Stay Indoors', detail: 'During the cyclone, stay inside in the strongest part of the building, away from windows and doors.' },
        { title: 'Post-Cyclone Risks', detail: 'After the storm passes, be cautious of fallen power lines, weakened structures, and flooded areas. Do not go outside until it is declared safe.' },
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
// ═══════════════════════════════════════════════════════════
//  LEO DISTRICT 306 D1 — INTEGRATED AUTH & STATE ENGINE
// ═══════════════════════════════════════════════════════════

const STORAGE_KEYS = {
  COUNCIL: 'leo_district_council_v4',
  PROJECTS: 'leo_district_projects_v4',
  PRESIDENTS: 'leo_club_presidents_v4',
  CLUBS: 'leo_clubs_directory_v4',
  LOGS: 'leo_admin_activity_log_v4',
  GOVERNORS: 'leo_governors_v8',
  BLOGS: 'leo_blogs_v1',
  USERS: 'leo_custom_users_v2'
};

// RBAC Configuration mapping permissions
const ADMIN_ROLES = {
  superadmin: { label: 'Super Admin', permissions: { all: true } },
  contentadmin: { label: 'Content Admin', permissions: { edit: true, view_logs: false, delete: false } },
  districtadmin: { label: 'District Admin', permissions: { edit_council: true, edit_projects: true, edit_clubs: true, edit_presidents: false, delete: false, view_logs: false } },
  vieweradmin: { label: 'Viewer Admin', permissions: { view_only: true } },
  blog_editor: { label: 'Blog Editor', permissions: { edit_projects: true, delete: true } }
};

const DEFAULT_USERS = {
  superadmin: 'admin123',
  contentadmin: 'admin123',
  districtadmin: 'admin123',
  vieweradmin: 'admin123'
};

let currentUser = null; // Session cache state

// ── DEFAULT SEED DATA ──────────────────────────────────────

const SEED_COUNCIL = [
  // Executives
  { id: 'c-e1', name: 'Leo Lion Vinuk Thismalpola', role: 'District President', type: 'exec', year: '2026/2027', status: 'Published', displayOrder: 1, tag: 'Executive', icon: 'fa-crown', photo: null, priority: true },
  { id: 'c-e2', name: 'Leo Lion Yashika Rodrigo', role: 'Immediate Past District President', type: 'exec', year: '2026/2027', status: 'Published', displayOrder: 2, tag: 'Executive', icon: 'fa-medal', photo: null },
  { id: 'c-e3', name: 'Leo Lion Manish Perera', role: 'District Vice President', type: 'exec', year: '2026/2027', status: 'Published', displayOrder: 3, tag: 'Executive', icon: 'fa-user-tie', photo: null },
  { id: 'c-e4', name: 'Lion Suranjani Wickramarathne', role: 'District Leo Chairperson', type: 'exec', year: '2026/2027', status: 'Published', displayOrder: 4, tag: 'Executive', icon: 'fa-shield-halved', photo: null },
  { id: 'c-e5', name: 'Leo Hashini Nethmika', role: 'District Secretary', type: 'exec', year: '2026/2027', status: 'Published', displayOrder: 5, tag: 'Executive', icon: 'fa-file-pen', photo: null },
  { id: 'c-e6', name: 'Leo Bathisha Kavinda', role: 'District Treasurer', type: 'exec', year: '2026/2027', status: 'Published', displayOrder: 6, tag: 'Executive', icon: 'fa-coins', photo: null },
  { id: 'c-e7', name: 'Leo Sanduni Theekshana', role: 'District Membership Chairperson', type: 'exec', year: '2026/2027', status: 'Published', displayOrder: 7, tag: 'Executive', icon: 'fa-users-gear', photo: null },
  { id: 'c-e8', name: 'Leo Lion Prabhavee Mayasha', role: 'District Assistant Secretary', type: 'exec', year: '2026/2027', status: 'Published', displayOrder: 8, tag: 'Executive', icon: 'fa-file-pen', photo: null },
  { id: 'c-e9', name: 'Leo Dulari Christopher', role: 'District Assistant Secretary', type: 'exec', year: '2026/2027', status: 'Published', displayOrder: 9, tag: 'Executive', icon: 'fa-file-pen', photo: null },
  { id: 'c-e10', name: 'Leo Lion Chamal Pramod', role: 'District Assistant Treasurer', type: 'exec', year: '2026/2027', status: 'Published', displayOrder: 10, tag: 'Executive', icon: 'fa-coins', photo: null },
  { id: 'c-e11', name: 'Leo Oshadha Tharusha', role: 'District Assistant Treasurer', type: 'exec', year: '2026/2027', status: 'Published', displayOrder: 11, tag: 'Executive', icon: 'fa-coins', photo: null },
  
  // Chiefs
  { id: 'c-c1', name: 'Leo Lion Randiv De Silva', role: 'Chief Council Coordinator', type: 'chief', year: '2026/2027', status: 'Published', displayOrder: 12, tag: 'Chief', icon: 'fa-sitemap', photo: null },
  { id: 'c-c2', name: 'Leo Lion Kasun Sapumohotti', role: 'Chief Regional Coordinator', type: 'chief', year: '2026/2027', status: 'Published', displayOrder: 13, tag: 'Chief', icon: 'fa-map-location-dot', photo: null },
  { id: 'c-c3', name: 'Leo Kulindu Thenuka Bopage', role: 'Chief Operational Coordinator', type: 'chief', year: '2026/2027', status: 'Published', displayOrder: 14, tag: 'Chief', icon: 'fa-gears', photo: null },
  { id: 'c-c4', name: 'Leo Savidya Ranawaka', role: 'Chief Performance Coordinator', type: 'chief', year: '2026/2027', status: 'Published', displayOrder: 15, tag: 'Chief', icon: 'fa-chart-line', photo: null },
  { id: 'c-c5', name: 'Leo Lion Senuth Dilnada Wanniarachchi', role: 'Chief IT & Strategic Coordinator', type: 'chief', year: '2026/2027', status: 'Published', displayOrder: 16, tag: 'Chief', icon: 'fa-microchip', photo: null },
  { id: 'c-c6', name: 'Leo Lion Dinath Wijesooriya', role: 'Chief PR & Branding Coordinator', type: 'chief', year: '2026/2027', status: 'Published', displayOrder: 17, tag: 'Chief', icon: 'fa-bullhorn', photo: null },
  { id: 'c-c7', name: 'Leo Lion Uvini Imalna', role: 'Chief Editor', type: 'chief', year: '2026/2027', status: 'Published', displayOrder: 18, tag: 'Chief', icon: 'fa-pen-nib', photo: null },

  // Directors
  { id: 'c-d1', name: 'Leo Dewmi Tharunya', role: 'Regional Director - Region A', type: 'directors', year: '2026/2027', status: 'Published', displayOrder: 19, tag: 'Region A', icon: 'fa-map', photo: null },
  { id: 'c-d2', name: 'Leo Hiruni Fernando', role: 'Regional Director - Region B', type: 'directors', year: '2026/2027', status: 'Published', displayOrder: 20, tag: 'Region B', icon: 'fa-map', photo: null },
  { id: 'c-d3', name: 'Leo Nadeesha Mayomi Ekanayaka', role: 'Zonal Director - Zone A1', type: 'directors', year: '2026/2027', status: 'Published', displayOrder: 21, tag: 'Zone A1', icon: 'fa-location-dot', photo: null },
  { id: 'c-d4', name: 'Leo Udara Nawarathna', role: 'Zonal Director - Zone A2', type: 'directors', year: '2026/2027', status: 'Published', displayOrder: 22, tag: 'Zone A2', icon: 'fa-location-dot', photo: null },
  { id: 'c-d5', name: 'Leo Vihanga Kothalawala', role: 'Zonal Director - Zone B1', type: 'directors', year: '2026/2027', status: 'Published', displayOrder: 23, tag: 'Zone B1', icon: 'fa-location-dot', photo: null },
  { id: 'c-d6', name: 'Leo Meuni Liyanage', role: 'Zonal Director - Zone B2', type: 'directors', year: '2026/2027', status: 'Published', displayOrder: 24, tag: 'Zone B2', icon: 'fa-location-dot', photo: null },
  { id: 'c-d7', name: 'Leo Sudam Jayawardana', role: 'Co-Head - District Service Committee', type: 'directors', year: '2026/2027', status: 'Published', displayOrder: 25, tag: 'Service', icon: 'fa-hands-helping', photo: null },
  { id: 'c-d8', name: 'Leo Treveen Rozairo', role: 'Co-Head - District Service Committee', type: 'directors', year: '2026/2027', status: 'Published', displayOrder: 26, tag: 'Service', icon: 'fa-hands-helping', photo: null },
  { id: 'c-d9', name: 'Leo Thenuji Jayakody', role: 'Head - District Talent Committee', type: 'directors', year: '2026/2027', status: 'Published', displayOrder: 27, tag: 'Talent', icon: 'fa-star', photo: null },
  { id: 'c-d10', name: 'Leo Lithira Kalubowila', role: 'Head - District Sports Committee', type: 'directors', year: '2026/2027', status: 'Published', displayOrder: 28, tag: 'Sports', icon: 'fa-trophy', photo: null },
  { id: 'c-d11', name: 'Leo Buddika Ashan', role: 'Head - IT and Infastructure Committee', type: 'directors', year: '2026/2027', status: 'Published', displayOrder: 29, tag: 'IT', icon: 'fa-server', photo: null },

  // Officers
  { id: 'c-o1', name: 'Leo Damthula Thennakoon', role: 'District Council Officer - Administration Committee', type: 'officers', year: '2026/2027', status: 'Published', displayOrder: 30, tag: 'Admin', icon: 'fa-clipboard-user', photo: null },
  { id: 'c-o2', name: 'Leo Sachithra Jalitha', role: 'District Council Officer - Administration Committee', type: 'officers', year: '2026/2027', status: 'Published', displayOrder: 31, tag: 'Admin', icon: 'fa-clipboard-user', photo: null },
  { id: 'c-o3', name: 'Leo Ravindu Rajapaksha', role: 'District Council Officer - Sports Committee', type: 'officers', year: '2026/2027', status: 'Published', displayOrder: 32, tag: 'Sports', icon: 'fa-trophy', photo: null },
  { id: 'c-o4', name: 'Leo Dasith Damsara', role: 'District Council Officer - Talent Committee', type: 'officers', year: '2026/2027', status: 'Published', displayOrder: 33, tag: 'Talent', icon: 'fa-star', photo: null },
  { id: 'c-o5', name: 'Leo Senuth Abeyrathne', role: 'District Council Officer - Talent Committee', type: 'officers', year: '2026/2027', status: 'Published', displayOrder: 34, tag: 'Talent', icon: 'fa-star', photo: null },
  { id: 'c-o6', name: 'Leo Saduni Kavindya Ra', role: 'District Council Officer - Editorial Committee', type: 'officers', year: '2026/2027', status: 'Published', displayOrder: 35, tag: 'Editorial', icon: 'fa-pen-nib', photo: null },
  { id: 'c-o7', name: 'Leo Chalusha Saveekshana', role: 'District Council Officer - Editorial Committee', type: 'officers', year: '2026/2027', status: 'Published', displayOrder: 36, tag: 'Editorial', icon: 'fa-pen-nib', photo: null },
  { id: 'c-o8', name: 'Leo Lion Nethul Trevor', role: 'District Council Officer - IT and Infastructure Committee', type: 'officers', year: '2026/2027', status: 'Published', displayOrder: 37, tag: 'IT', icon: 'fa-server', photo: null },
  { id: 'c-o9', name: 'Leo Lion Sanuja Dissanayake', role: 'District Council Officer - IT and Infastructure Committee', type: 'officers', year: '2026/2027', status: 'Published', displayOrder: 38, tag: 'IT', icon: 'fa-server', photo: null }
];

const SEED_PROJECTS = [
  { id: 'p-1', title: 'Alpha One Service Summit', category: 'youth', chairperson: 'Leo Lion Vinuk Thismalpola', organizingCommittee: 'District Executive Board', desc: 'Empowering next-generation leaders with advanced leadership skills, team challenges, and active community development workshops.', objectives: 'Develop leadership capability, train executive members, build network bridges.', date: '2026-07-15', time: '09:00 AM', venue: 'Colombo Royal College Hall', status: 'Ongoing', coverImage: null, registrationLink: '#', reportLink: '', partnerOrganizations: 'Lions District 306 D1', displayOrder: 1, publicationStatus: 'Published' },
  { id: 'p-2', title: 'Genesis One Eco-Initiative', category: 'environment', chairperson: 'Leo Lion Yashika Rodrigo', organizingCommittee: 'Green Service Taskforce', desc: 'Rejuvenating green urban areas, planting native trees, and implementing school gardens for biodiversity education.', objectives: 'Plant 2,500 native trees, educate kids on ecosystem values.', date: '2026-06-10', time: '08:00 AM', venue: 'Gampaha Botanical Zone', status: 'Completed', coverImage: null, registrationLink: '', reportLink: '#', partnerOrganizations: 'Ministry of Environment', displayOrder: 2, publicationStatus: 'Published' },
  { id: 'p-3', title: 'Connect One Digital Classrooms', category: 'vision', chairperson: 'Leo Lion Manish Perera', organizingCommittee: 'IT and Strategy Wing', desc: 'Connecting rural school students with state-of-the-art computers, interactive screens, and e-learning resources.', objectives: 'Equip 10 rural schools with computing resources.', date: '2026-08-20', time: '10:00 AM', venue: 'Rambukkana Public School', status: 'Upcoming', coverImage: null, registrationLink: '#', reportLink: '', partnerOrganizations: 'Intel Sri Lanka', displayOrder: 3, publicationStatus: 'Published' },
  { id: 'p-4', title: 'Pioneer One Mobile Eye Clinic', category: 'vision', chairperson: 'Lion Suranjani Wickramarathne', organizingCommittee: 'District Healthcare Unit', desc: 'Deploying medical testing equipment, diagnosing vision complications, and donating custom reading spectacles.', objectives: 'Screen 1,200 rural residents, distribute 500 spectacles.', date: '2026-05-12', time: '07:30 AM', venue: 'Galle Heritage Community Hall', status: 'Completed', coverImage: null, registrationLink: '', reportLink: '#', partnerOrganizations: 'Sight First Foundation', displayOrder: 4, publicationStatus: 'Published' }
];

const SEED_PRESIDENTS = [
  { id: 'pr-1', name: 'Leo Dilshan De Silva', clubName: 'Leo Club of University of Moratuwa', position: 'Club President', year: '2026/2027', region: 'Region A', phone: '+94 77 123 4567', email: 'dilshan@uomleos.org', facebook: '#', instagram: '#', linkedin: '#', bio: 'Focused on creating automated data tools for school literacy development.', status: 'Active', displayOrder: 1, photo: null },
  { id: 'pr-2', name: 'Leo Minushi Wijesinghe', clubName: 'Leo Club of Colombo Millennium', position: 'Club President', year: '2026/2027', region: 'Region B', phone: '+94 77 234 5678', email: 'minushi@millenniumleos.org', facebook: '#', instagram: '#', linkedin: '#', bio: 'Driving educational equity campaigns and organizing regional youth talent workshops.', status: 'Active', displayOrder: 2, photo: null },
  { id: 'pr-3', name: 'Leo Tharindu Perera', clubName: 'Leo Club of Galle Heritage', position: 'Club President', year: '2026/2027', region: 'Region A', phone: '+94 77 345 6789', email: 'tharindu@galleleos.org', facebook: '#', instagram: '#', linkedin: '#', bio: 'Fostering multi-generational heritage conservation and health camp drives.', status: 'Active', displayOrder: 3, photo: null }
];

const SEED_CLUBS = [
  { id: 'cl-1', name: 'Leo Club of University of Moratuwa', sponsor: 'Lions Club of Moratuwa', region: 'Region A', members: 85, president: 'Leo Dilshan De Silva', secretary: 'Leo Ravindu Perera', treasurer: 'Leo Sachini Perera', advisor: 'Lion Prof. K. Silva', charteredDate: '2010-05-12', email: 'uomleos@gmail.com', phone: '+94 11 234 5678', facebook: '#', instagram: '#', linkedin: '#', desc: 'A premier university-based club spearheading technology and engineering outreach projects in rural zones.', status: 'Active', displayOrder: 1, logo: null, banner: null },
  { id: 'cl-2', name: 'Leo Club of Colombo Millennium', sponsor: 'Lions Club of Colombo Host', region: 'Region B', members: 42, president: 'Leo Minushi Wijesinghe', secretary: 'Leo Kasun Jayawardana', treasurer: 'Leo Nadee Silva', advisor: 'Lion Dr. R. Perera', charteredDate: '2015-08-20', email: 'millenniumleos@gmail.com', phone: '+94 11 345 6789', facebook: '#', instagram: '#', linkedin: '#', desc: 'Pillared on community health, child safety campaigns, and professional youth summits.', status: 'Active', displayOrder: 2, logo: null, banner: null },
  { id: 'cl-3', name: 'Leo Club of Galle Heritage', sponsor: 'Lions Club of Galle', region: 'Region A', members: 35, president: 'Leo Tharindu Perera', secretary: 'Leo Vihanga Senanayake', treasurer: 'Leo Udara Liyanage', advisor: 'Lion S. Rajapaksha', charteredDate: '2018-02-14', email: 'galleleos@gmail.com', phone: '+94 91 123 4567', facebook: '#', instagram: '#', linkedin: '#', desc: 'Committed to rural community development, mobile medical units, and coastal ecology rejuvenation.', status: 'Active', displayOrder: 3, logo: null, banner: null }
];

const SEED_GOVERNORS = [
  { id: 'gov-1', name: "Leo Lion Yashika Rodrigo", year: "2025/2026", theme: "Leo Club of Mount Lavinia Orient Centennial", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 1, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-2', name: "Leo Lion Sajani Wijesuriya", year: "2024/2025", theme: "Leo Club of Colombo Host", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 2, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-3', name: "Leo Lion Akila Gunarathne", year: "2023/2024", theme: "Leo Club of Moratuwa", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 3, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-4', name: "Leo Lion Randhir Samarasinghe", year: "2022/2023", theme: "Leo Club of Colombo Millenium", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 4, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-5', name: "Leo Lion Gayanga Uththaravi Diaz", year: "2021/2022", theme: "Leo Club of Unawatuna Diamond Stars", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 5, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-6', name: "Leo Lion Malinda Ganewatta", year: "2020/2021", theme: "Leo Club of Colombo Millenium", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 6, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-7', name: "Leo Ochintha Nadeeshan", year: "2019/2020", theme: "Leo Club of Mount Lavinia Orient Centennial", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 7, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-8', name: "Leo Lion Dilshan Peiris", year: "2018/2019", theme: "Leo Club of Moratuwa", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 8, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-9', name: "Lion Navodhya Jayasinghe", year: "2017/2018", theme: "Leo Club of University of Colombo Faculty of Science", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 9, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-10', name: "Lion Supun Dahanayake", year: "2016/2017", theme: "Leo Club of Unawatuna Diamond Stars", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 10, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-11', name: "Mr. Darshana Ranasinghe", year: "2015/2016", theme: "Leo Club of Moratuwa", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 11, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-12', name: "Lion Sumudu Hewage", year: "2014/2015", theme: "Leo Club of Colombo Host", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 12, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-13', name: "Mr. Anju Supun Panditharathne", year: "2013/2014", theme: "Leo Club of Colombo Host", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 13, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-14', name: "Mrs. Vichalya Wijesuriya", year: "2012/2013", theme: "Leo Club of Moratuwa Orient", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 14, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-15', name: "Lion Fouzul Nilaufer", year: "2011/2012", theme: "Leo Club of Galle", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 15, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-16', name: "Mr. Dan De Silva", year: "2010/2011", theme: "Leo Club of Aluthgama Benthota", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 16, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-17', name: "Mrs. Shohana Wijesuriya", year: "2009/2010", theme: "Leo Club of Moratuwa", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 17, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-18', name: "Lion Asitha Pinnaduwa MJF", year: "2008/2009", theme: "Leo Club of Colombo Host", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 18, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-19', name: "Mr. Ricky Simms", year: "2007/2008", theme: "Leo Club of Colombo Host", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 19, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-20', name: "Mrs. Dhshanthie Gamalatge", year: "2006/2007", theme: "Leo Club of Colombo Host", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 20, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-21', name: "Mr. Late Nilanka Fernando", year: "2005/2006", theme: "Leo Club of Moratuwa-Rathmalana", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 21, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-22', name: "Mr. Kanishka Hewage", year: "2004/2005", theme: "Leo Club of Colombo Millenium", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 22, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-23', name: "Mr. Shehan Kumar", year: "2003/2004", theme: "Leo Club of Colombo Host", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 23, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-24', name: "Lion Shyana Jayalath MJF, PMAF, PFLM", year: "2002/2003", theme: "Leo Club of Colombo Host", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 24, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-25', name: "Mr. Charaka Perera", year: "2001/2002", theme: "Leo Club of Moratuwa-Rathmalana", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 25, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-26', name: "Lion Shavindra Diaz", year: "2000/2001", theme: "Leo Club of Moratuwa", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 26, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-27', name: "Mr. Niroshan Silva", year: "1999/2000", theme: "Leo Club of Galkissa", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 27, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-28', name: "Mrs. Kulani Wickramarathne", year: "1998/1999", theme: "Leo Club of Moratuwa", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 28, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-29', name: "Mr. Azeem Azwar", year: "1997/1998", theme: "Leo Club of Colombo Host", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 29, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-30', name: "Mr. Siraj Jabir", year: "1996/1997", theme: "Leo Club of Dehiwal North", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 30, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-31', name: "Mr. Sheron Fernando", year: "1995/1996", theme: "Leo Club of Moratuwa", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 31, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-32', name: "Mr. Late Kanchana Wijerathne", year: "1994/1995", theme: "Leo Club of Moratuwa-Rathmalana", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 32, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-33', name: "Mrs. Shashikala Sinnathurai", year: "1993/1994", theme: "Leo Club of Kolpitya", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 33, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-34', name: "Mr. Janin Mudannayake", year: "1992/1993", theme: "Leo Club of Milagiriya", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 34, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-35', name: "Mr. Manoj Wickramathunga", year: "1991/1992", theme: "Leo Club of Wellawatta", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 35, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-36', name: "Riza Aziz", year: "1990/1991", theme: "Leo Club of Dehiwal North", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 36, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-37', name: "Mr. Prabath Wellaboda", year: "1990/1991", theme: "Leo Club of Boralesgamuwa", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 37, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-38', name: "Mr. Harith Munasinghe", year: "1989/1990", theme: "Leo Club of Milagiriya", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 38, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-39', name: "Mr. Hemaka De Alwiz", year: "1988/1989", theme: "Leo Club of Mahanama College", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 39, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-40', name: "Mr. Aruna Kumarasinghe", year: "1988/1989", theme: "Leo Club of Boralesgamuwa", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 40, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-41', name: "Mr. Nimal Panditha Koralage", year: "1987/1988", theme: "Leo Club of Nugegoda Mid Town", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 41, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-42', name: "Mr. Hemaka Diaz", year: "1986/1987", theme: "Leo Club of Milagiriya", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 42, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-43', name: "Mr. Imithiaz Ismail", year: "1985/1986", theme: "Leo Club of Wellawatta", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 43, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-44', name: "Mr. Errol Abeyrathne", year: "1984/1985", theme: "Leo Club of Colombo West", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 44, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-45', name: "Mr. Harin Jayasekara", year: "1983/1984", theme: "Leo Club of Maharagama", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 45, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-46', name: "Mr. T.R.Jeganadan", year: "1982/1983", theme: "Leo Club of Maharagama", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 46, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-47', name: "Mr. Dilip Wazirani", year: "1981/1982", theme: "Leo Club of Colombo West", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 47, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-48', name: "Mr. Ruwan Rathnaweera", year: "1980/1981", theme: "Leo Club of Colombo North", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 48, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-49', name: "Mr. Mohan Burhan", year: "1979/1980", theme: "Leo Club of Colombo Host", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 49, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-50', name: "Mr. Ghazzeli Mohideen", year: "1978/1979", theme: "Leo Club of Colombo West", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 50, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-51', name: "Mr. Arjun Mendis", year: "1978/1979", theme: "Leo Club of Nugegoda", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 51, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-52', name: "PCC Lion Sunil Dharmarathne", year: "1977/1978", theme: "Leo Club of Mattakkuliya", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 52, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-53', name: "Mr. Lalith C.N. Grero", year: "1976/1977", theme: "Leo Club of Colombo South", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 53, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-54', name: "Mr. Trevor Reckerman", year: "1975/1976", theme: "Leo Club of Wattala", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 54, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-55', name: "Mr. Azad Mohideen", year: "1974/1975", theme: "Leo Club of Moratuwa-Rathmalana", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 55, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-56', name: "Mr. T.Skantharajah", year: "1973/1974", theme: "Leo Club of Moratuwa-Rathmalana", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 56, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-57', name: "Mr. Bryan Wijekoon", year: "1972/1973", theme: "Leo Club of Colombo South", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 57, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'gov-58', name: "Mr. Dinal Jayamanne", year: "1971/1972", theme: "Leo Club of Colombo Host", logo: "fa-shield-halved", achievement: "", status: 'Active', displayOrder: 58, photo: null, photoScale: 1, photoX: 50, photoY: 50 }
];

const SEED_BLOGS = [
  { id: 'blog-1', title: "Leo District 306 D1 Kicks Off 2026 Service Year", date: "2026-07-01", author: "District Editorial Panel", content: "Our new service year has officially begun with a series of community support projects launched across multiple regions. Over 25 clubs joined hands to coordinate regional health camps and distribute essential supplies to schools in rural zones.", status: 'Active', displayOrder: 1, photo: null, photoScale: 1, photoX: 50, photoY: 50 },
  { id: 'blog-2', title: "Empowering Rural Schools: RO Water Project Reaches Completion", date: "2026-06-18", author: "Public Relations Chair", content: "Through a collaborated district effort, the installation of water purification and reverse osmosis systems in rural schools has successfully crossed 20 operational units, providing clean drinking water to thousands of students.", status: 'Active', displayOrder: 2, photo: null, photoScale: 1, photoX: 50, photoY: 50 }
];

// ── SEEDING & DATABASE MANAGEMENT ──────────────────────────

function initDatabase() {
  if (!localStorage.getItem(STORAGE_KEYS.COUNCIL)) {
    localStorage.setItem(STORAGE_KEYS.COUNCIL, JSON.stringify(SEED_COUNCIL));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(SEED_PROJECTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PRESIDENTS)) {
    localStorage.setItem(STORAGE_KEYS.PRESIDENTS, JSON.stringify(SEED_PRESIDENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CLUBS)) {
    localStorage.setItem(STORAGE_KEYS.CLUBS, JSON.stringify(SEED_CLUBS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.GOVERNORS)) {
    localStorage.setItem(STORAGE_KEYS.GOVERNORS, JSON.stringify(SEED_GOVERNORS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BLOGS)) {
    localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(SEED_BLOGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LOGS)) {
    const welcomeLog = [{
      timestamp: new Date().toLocaleString(),
      userId: 'system',
      role: 'System',
      action: 'Dynamic LocalStorage Engine initialized with default seeds.'
    }];
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(welcomeLog));
  }
}

// ── GETTERS & STORAGE ACCESS ────────────────────────────────

function getCollection(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (e) {
    return [];
  }
}

function saveCollection(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ── LOG AUDIT ACTIONS ────────────────────────────────────────

function logActivity(actionDesc) {
  const logs = getCollection(STORAGE_KEYS.LOGS);
  logs.unshift({
    timestamp: new Date().toLocaleString(),
    userId: currentUser ? currentUser.username : 'visitor',
    role: currentUser ? currentUser.label : 'Visitor',
    action: actionDesc
  });
  saveCollection(STORAGE_KEYS.LOGS, logs);
}

// ── AUTHENTICATION & LOGIN ──────────────────────────────────

function checkActiveSession() {
  const cached = sessionStorage.getItem('active_admin_session');
  if (cached) {
    currentUser = JSON.parse(cached);
    updateHeaderLoginButton();
  }
}

function updateHeaderLoginButton() {
  const btn = document.getElementById('portal-header-btn');
  if (!btn) return;
  if (currentUser) {
    btn.innerHTML = `<i class="fa-solid fa-gauge-high"></i> Admin Panel`;
    btn.classList.add('admin-active');
  } else {
    btn.innerHTML = `Admin Log In`;
    btn.classList.remove('admin-active');
  }
}

function handlePortalHeaderClick() {
  if (currentUser) {
    navigateTo('admin');
  } else {
    navigateTo('login-page');
  }
}

function togglePortalModal() {
  const modal = document.getElementById('portal-modal');
  if (!modal) return;
  modal.classList.toggle('active');
  document.body.style.overflow = modal.classList.contains('active') ? 'hidden' : '';
}

function closePortalModal() {
  const modal = document.getElementById('portal-modal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

function handlePortalSubmit(e) {
  e.preventDefault();
  const user = document.getElementById('portal-user').value.trim();
  const pass = document.getElementById('portal-pass').value.trim();

  let matchedRole = null;
  if (DEFAULT_USERS[user] && DEFAULT_USERS[user] === pass) {
    matchedRole = {
      username: user,
      label: ADMIN_ROLES[user].label,
      role: user
    };
  } else {
    const customUsers = getCollection(STORAGE_KEYS.USERS);
    const matched = customUsers.find(u => u.username === user && u.password === pass);
    if (matched) {
      matchedRole = {
        username: matched.username,
        label: matched.label || 'Blog Editor',
        role: matched.role || 'blog_editor'
      };
    }
  }

  if (matchedRole) {
    currentUser = matchedRole;
    sessionStorage.setItem('active_admin_session', JSON.stringify(currentUser));
    updateHeaderLoginButton();
    closePortalModal();
    logActivity(`Admin login successful. Role: ${currentUser.label}`);
    
    // Update admin view details
    document.getElementById('admin-current-role').innerText = currentUser.label;
    document.getElementById('admin-current-user').innerText = currentUser.username;

    // Navigate to admin
    navigateTo('admin');
  } else {
    alert('Invalid administrative credentials. Access Denied.');
  }
}

function handleAdminLogout() {
  logActivity(`Admin logged out.`);
  currentUser = null;
  sessionStorage.removeItem('active_admin_session');
  updateHeaderLoginButton();
  navigateTo('home');
}

function handleNexusPortalSubmit(event) {
  event.preventDefault();
  const user = document.getElementById('nexus-user').value.trim();
  const btn = event.target.querySelector('button[type="submit"]');
  const oldText = btn.innerHTML;
  btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Authenticating...`;
  btn.disabled = true;
  
  logActivity(`Guest attempted portal login: ${user}`);
  
  setTimeout(() => {
    btn.innerHTML = oldText;
    btn.disabled = false;
    // Redirect to the actual Vercel URL
    window.open('https://leo-nexus-portal.vercel.app/#/login', '_blank');
  }, 1200);
}

// ── NAVIGATION & ROUTER SYSTEM ──────────────────────────────

function navigateTo(pageId) {
  // Check if admin tab navigation is requested but not logged in
  if (pageId === 'admin' && !currentUser) {
    alert('Access restricted. Please authenticate first.');
    navigateTo('login-page');
    return;
  }

  const sections = document.querySelectorAll('.page-view');
  const navLinks = document.querySelectorAll('.nav-link');
  
  // Close mobile nav menu if open
  const navMenu = document.getElementById('nav-menu');
  if (navMenu) navMenu.classList.remove('open');
  const mobToggle = document.getElementById('mobile-toggle');
  if (mobToggle && mobToggle.firstElementChild) {
    mobToggle.firstElementChild.className = 'fa-solid fa-bars';
  }

  // Toggle active pages
  sections.forEach(sec => {
    if (sec.id === pageId) {
      sec.classList.add('active');
    } else {
      sec.classList.remove('active');
    }
  });

  // Toggle active navigation labels
  navLinks.forEach(link => {
    const linkText = link.innerText.toLowerCase().replace(/\s+/g, '');
    let targetText = pageId;
    if (pageId === 'projects') targetText = 'districtprojects';
    if (pageId === 'presidents') targetText = 'pastdistrictpresidents';
    if (pageId === 'leos') targetText = 'leoclubs';
    if (pageId === 'nexus-portal') targetText = 'dp-dvpcalendar';
    if (pageId === 'blogs') targetText = 'districtblog';
    if (pageId === 'login-page') targetText = 'login';
    
    if (linkText === targetText) {
      link.classList.add('active');
      alignIndicator(link);
    } else {
      link.classList.remove('active');
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Init page-specific dynamic rendering
  if (pageId === 'home') {
    runCounters();
  } else if (pageId === 'council') {
    renderPublicCouncil();
  } else if (pageId === 'projects') {
    renderPublicProjects();
  } else if (pageId === 'leos') {
    renderPublicPresidents();
    renderPublicClubs();
  } else if (pageId === 'presidents') {
    renderPublicGovernors();
  } else if (pageId === 'nexus-portal') {
    logActivity(`User viewed DP - DVP Calendar Page.`);
  } else if (pageId === 'blogs') {
    renderPublicBlogs();
  } else if (pageId === 'login-page') {
    logActivity(`User viewed Login Page.`);
  } else if (pageId === 'admin') {
    // Populate admin tables
    renderAdminDashboard();
  }
}

// Morphing indicator alignment
function alignIndicator(activeLink) {
  const indicator = document.getElementById('nav-indicator');
  if (!indicator || window.innerWidth <= 768) return;
  const parentRect = activeLink.parentElement.getBoundingClientRect();
  const linkRect = activeLink.getBoundingClientRect();
  indicator.style.width = `${linkRect.width}px`;
  indicator.style.left = `${linkRect.left - parentRect.left}px`;
}

// ── COMPRESSION / IMAGE COMPACTOR ──────────────────────────

function compressImage(file, callback) {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (event) => {
    const img = new Image();
    img.src = event.target.result;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const max_width = 400; // max thumbnail size
      let width = img.width;
      let height = img.height;

      if (width > max_width) {
        height *= max_width / width;
        width = max_width;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      // compress to 0.7 quality jpeg
      callback(canvas.toDataURL('image/jpeg', 0.7));
    };
  };
}

// ── PUBLIC VIEWS RENDERING ──────────────────────────────────

function renderPublicCouncil() {
  const q = (document.getElementById('council-search').value || '').toLowerCase().trim();
  const council = getCollection(STORAGE_KEYS.COUNCIL).filter(m => m.status === 'Published');
  
  // Update public total counter
  const totalCountEl = document.getElementById('council-total-count');
  if (totalCountEl) totalCountEl.innerText = council.length;

  // Render standard sections
  const sections = {
    exec: document.getElementById('exec-grid'),
    chief: document.getElementById('chief-grid'),
    officers: document.getElementById('officers-grid')
  };

  Object.keys(sections).forEach(key => {
    const grid = sections[key];
    if (!grid) return;
    grid.innerHTML = '';

    let list = council.filter(m => m.type === key);
    if (q) {
      list = list.filter(m => m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q));
    }
    
    // Sort by display order
    list.sort((a,b) => a.displayOrder - b.displayOrder);

    if (list.length === 0) {
      grid.innerHTML = `<div class="no-results glass-panel"><i class="fa-solid fa-face-frown"></i> No matching cabinet members.</div>`;
      return;
    }

    if (key === 'exec') {
      grid.innerHTML = renderExecSection(list);
    } else if (key === 'chief') {
      grid.innerHTML = renderChiefSection(list);
    } else {
      grid.innerHTML = list.map(m => buildPublicCard(m)).join('');
    }
    setTimeout(() => setupCardTilt(grid.id), 60);
  });

  // Render split Directors sections
  const regionalGrid = document.getElementById('regional-zonal-grid');
  const committeeGrid = document.getElementById('committee-directors-grid');

  if (regionalGrid && committeeGrid) {
    regionalGrid.innerHTML = '';
    committeeGrid.innerHTML = '';

    let directorsList = council.filter(m => m.type === 'directors');
    if (q) {
      directorsList = directorsList.filter(m => m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q));
    }

    directorsList.sort((a,b) => a.displayOrder - b.displayOrder);

    // Split list
    const regionalZonalList = directorsList.filter(m => m.role.toLowerCase().includes('regional') || m.role.toLowerCase().includes('zonal'));
    const committeeList = directorsList.filter(m => !m.role.toLowerCase().includes('regional') && !m.role.toLowerCase().includes('zonal'));

    // Render Regional & Zonal Hierarchy tree
    if (regionalZonalList.length === 0) {
      regionalGrid.innerHTML = `<div class="no-results glass-panel" style="width:100%;"><i class="fa-solid fa-face-frown"></i> No matching regional or zonal directors.</div>`;
    } else {
      regionalGrid.innerHTML = renderRegionalZonalSection(regionalZonalList);
    }

    // Render Committee Directors in a row wrapping grid
    if (committeeList.length === 0) {
      committeeGrid.innerHTML = `<div class="no-results glass-panel" style="width:100%;"><i class="fa-solid fa-face-frown"></i> No matching committee directors.</div>`;
    } else {
      committeeGrid.innerHTML = committeeList.map(m => buildPublicCard(m)).join('');
    }

    setTimeout(() => {
      setupCardTilt('regional-zonal-grid');
      setupCardTilt('committee-directors-grid');
    }, 60);
  }
}

function renderRegionalZonalSection(members) {
  const regA = members.find(m => m.role.toLowerCase().includes('regional director - region a'));
  const zoneA1 = members.find(m => m.role.toLowerCase().includes('zonal director - zone a1'));
  const zoneA2 = members.find(m => m.role.toLowerCase().includes('zonal director - zone a2'));
  const regB = members.find(m => m.role.toLowerCase().includes('regional director - region b'));
  const zoneB1 = members.find(m => m.role.toLowerCase().includes('zonal director - zone b1'));
  const zoneB2 = members.find(m => m.role.toLowerCase().includes('zonal director - zone b2'));

  const matchedIds = new Set([
    regA?.id, zoneA1?.id, zoneA2?.id,
    regB?.id, zoneB1?.id, zoneB2?.id
  ]);
  const leftovers = members.filter(m => !matchedIds.has(m.id));

  let html = `<div class="regional-zonal-hierarchy">`;

  // Branch Region A
  html += `
    <div class="region-branch">
      <div class="region-title-badge">Region A</div>
      <div class="region-head-card">
        ${regA ? buildPublicCard(regA) : '<div class="empty-node">Vacant</div>'}
      </div>
      <div class="zones-row">
        <div class="zone-node">
          <div class="zone-title-badge">Zone A1</div>
          ${zoneA1 ? buildPublicCard(zoneA1) : '<div class="empty-node">Vacant</div>'}
        </div>
        <div class="zone-node">
          <div class="zone-title-badge">Zone A2</div>
          ${zoneA2 ? buildPublicCard(zoneA2) : '<div class="empty-node">Vacant</div>'}
        </div>
      </div>
    </div>
  `;

  // Branch Region B
  html += `
    <div class="region-branch">
      <div class="region-title-badge">Region B</div>
      <div class="region-head-card">
        ${regB ? buildPublicCard(regB) : '<div class="empty-node">Vacant</div>'}
      </div>
      <div class="zones-row">
        <div class="zone-node">
          <div class="zone-title-badge">Zone B1</div>
          ${zoneB1 ? buildPublicCard(zoneB1) : '<div class="empty-node">Vacant</div>'}
        </div>
        <div class="zone-node">
          <div class="zone-title-badge">Zone B2</div>
          ${zoneB2 ? buildPublicCard(zoneB2) : '<div class="empty-node">Vacant</div>'}
        </div>
      </div>
    </div>
  `;

  html += `</div>`;

  if (leftovers.length > 0) {
    html += `
      <div class="directors-leftovers" style="width:100%; margin-top:30px;">
        <h4 style="font-family:var(--font-heading); color:#e8d8c0; text-align:center; font-size:0.9rem; text-transform:uppercase; margin-bottom:15px;">Other Regional/Zonal Staff</h4>
        <div style="display:flex; flex-wrap:wrap; justify-content:center; gap:20px;">
          ${leftovers.map(m => buildPublicCard(m)).join('')}
        </div>
      </div>
    `;
  }

  return html;
}

function renderExecSection(members) {
  const president = members.find(m => m.role.toLowerCase().includes('president') && !m.role.toLowerCase().includes('vice') && !m.role.toLowerCase().includes('past') && !m.role.toLowerCase().includes('assistant'));
  const chairperson = members.find(m => m.role.toLowerCase().includes('chairperson'));
  const vp = members.find(m => m.role.toLowerCase().includes('vice president'));
  const ipdp = members.find(m => m.role.toLowerCase().includes('immediate past'));
  const secretary = members.find(m => m.role.toLowerCase() === 'district secretary');
  const treasurer = members.find(m => m.role.toLowerCase() === 'district treasurer');
  const membership = members.find(m => m.role.toLowerCase().includes('membership'));
  const assistantSecretaries = members.filter(m => m.role.toLowerCase().includes('assistant secretary'));
  const assistantTreasurers = members.filter(m => m.role.toLowerCase().includes('assistant treasurer'));

  const matchedIds = new Set([
    president?.id, chairperson?.id, vp?.id, ipdp?.id, secretary?.id, treasurer?.id, membership?.id,
    ...assistantSecretaries.map(m => m.id),
    ...assistantTreasurers.map(m => m.id)
  ]);
  const leftovers = members.filter(m => !matchedIds.has(m.id));

  let html = `<div class="org-tree">`;
  html += `<div class="org-row row-president">${president ? buildPublicCard(president) : ''}</div>`;
  html += `
    <div class="org-row row-t2">
      <div class="t2-left">${ipdp ? buildPublicCard(ipdp) : ''}</div>
      <div class="t2-center">${chairperson ? buildPublicCard(chairperson) : ''}</div>
      <div class="t2-right">${vp ? buildPublicCard(vp) : ''}</div>
    </div>
  `;
  html += `
    <div class="org-row row-t3">
      <div class="t3-left">${secretary ? buildPublicCard(secretary) : ''}</div>
      <div class="t3-center">${membership ? buildPublicCard(membership) : ''}</div>
      <div class="t3-right">${treasurer ? buildPublicCard(treasurer) : ''}</div>
    </div>
  `;
  html += `
    <div class="org-row row-t4">
      ${assistantSecretaries.map(m => `<div class="t4-item">${buildPublicCard(m)}</div>`).join('')}
      ${assistantTreasurers.map(m => `<div class="t4-item">${buildPublicCard(m)}</div>`).join('')}
    </div>
  `;
  if (leftovers.length > 0) {
    html += `
      <div class="org-row row-leftovers">
        <h4>Other Executive Committee Members</h4>
        <div class="leftovers-grid">
          ${leftovers.map(m => buildPublicCard(m)).join('')}
        </div>
      </div>
    `;
  }
  html += `</div>`;
  return html;
}

function renderChiefSection(members) {
  const pr = members.find(m => m.role.toLowerCase().includes('pr') || m.role.toLowerCase().includes('branding'));
  const it = members.find(m => m.role.toLowerCase().includes('it'));
  const editor = members.find(m => m.role.toLowerCase().includes('editor'));
  const council = members.find(m => m.role.toLowerCase().includes('council coordinator'));
  const regional = members.find(m => m.role.toLowerCase().includes('regional coordinator'));
  const operational = members.find(m => m.role.toLowerCase().includes('operational coordinator'));
  const performance = members.find(m => m.role.toLowerCase().includes('performance coordinator'));

  const matchedIds = new Set([
    pr?.id, it?.id, editor?.id, council?.id, regional?.id, operational?.id, performance?.id
  ]);
  const leftovers = members.filter(m => !matchedIds.has(m.id));
  const chiefs = [council, regional, operational, performance, it, pr, editor].filter(Boolean);

  let html = `<div class="chief-row">`;
  chiefs.forEach(c => {
    html += `<div class="chief-item">${buildPublicCard(c)}</div>`;
  });
  html += `</div>`;

  if (leftovers.length > 0) {
    html += `
      <div class="chief-leftovers">
        <h4>Other Chief Coordinators</h4>
        <div class="leftovers-grid">
          ${leftovers.map(m => buildPublicCard(m)).join('')}
        </div>
      </div>
    `;
  }
  return html;
}

function buildPublicCard(m) {
  const presClass = m.priority ? ' president-profile' : '';
  const crownHtml = m.priority ? '<div class="president-crown-badge"><i class="fa-solid fa-crown"></i></div>' : '';
  const tagHtml = m.tag ? `<span class="member-tag">${m.tag}</span>` : '';
  const photoStyle = `style="transform: scale(${m.photoScale || 1}); object-position: ${m.photoX || 50}% ${m.photoY || 50}%;"`;
  const photoHtml = m.photo
    ? `<img src="${m.photo}" alt="${m.name}" class="profile-img" ${photoStyle}>`
    : `<div class="profile-icon-fallback"><i class="fa-solid ${m.icon || 'fa-user'}"></i></div>`;

  return `
    <div class="profile-card-wrapper${presClass}" id="wrapper-${m.id}">
      <div class="profile-card-3d glass-panel" id="card-${m.id}">
        <div class="card-shine"></div>
        ${crownHtml}
        <div class="profile-photo-circle ${m.priority ? 'president-circle' : ''}">
          ${photoHtml}
        </div>
        ${tagHtml}
        <h4 class="profile-name">${m.name}</h4>
        <span class="profile-role">${m.role}</span>
      </div>
    </div>`;
}

function renderPublicProjects(activeCat = 'all') {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const projects = getCollection(STORAGE_KEYS.PROJECTS)
    .filter(p => p.publicationStatus === 'Published')
    .sort((a,b) => a.displayOrder - b.displayOrder);

  // Style active button category
  const buttons = document.querySelectorAll('.btn-project-filter');
  buttons.forEach(btn => {
    const fnAttr = btn.getAttribute('onclick');
    if (fnAttr && fnAttr.includes(activeCat)) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  let list = activeCat === 'all' ? projects : projects.filter(p => p.category === activeCat);

  if (list.length === 0) {
    grid.innerHTML = `<div class="no-results glass-panel"><i class="fa-solid fa-face-frown"></i> No district projects registered in this category.</div>`;
    return;
  }

  list.forEach(p => {
    const card = document.createElement('div');
    card.className = `project-card glass-panel reveal ${p.status.toLowerCase()}`;
    
    let catIcon = 'fa-circle-info';
    if (p.category === 'vision') catIcon = 'fa-eye';
    if (p.category === 'hunger') catIcon = 'fa-bowl-food';
    if (p.category === 'environment') catIcon = 'fa-tree';
    if (p.category === 'youth') catIcon = 'fa-child';

    const coverHtml = p.coverImage 
      ? `<div class="project-cover-banner" style="background-image: url('${p.coverImage}')"></div>` 
      : '';

    card.innerHTML = `
      ${coverHtml}
      <div class="project-header">
        <span class="project-tag"><i class="fa-solid ${catIcon}"></i> ${p.category.toUpperCase()}</span>
        <span class="project-status ${p.status.toLowerCase()}">${p.status}</span>
      </div>
      <h3>${p.title}</h3>
      <p class="project-desc">${p.desc}</p>
      
      <div class="project-stats-container">
        <div class="project-stats-row">
          <span>Venue / Timeline</span>
          <span class="highlight">${p.venue} &bull; ${p.date}</span>
        </div>
      </div>
      
      <div class="project-leader">
        <div class="leader-avatar"><i class="fa-solid fa-user-shield"></i></div>
        <div>
          <span>Campaign Lead</span>
          <strong>${p.chairperson}</strong>
        </div>
      </div>
      
      <button class="btn-project-detail" onclick="openPublicProjectDossier('${p.id}')">Learn More</button>
    `;
    grid.appendChild(card);
  });
  revealElements();
}

function openPublicProjectDossier(id) {
  const p = getCollection(STORAGE_KEYS.PROJECTS).find(item => item.id === id);
  if (!p) return;
  
  let registerBtn = p.registrationLink ? `<a href="${p.registrationLink}" target="_blank" class="btn-primary" style="text-decoration:none; text-align:center;">Register Now</a>` : '';
  let reportBtn = p.reportLink ? `<a href="${p.reportLink}" target="_blank" class="btn-secondary" style="text-decoration:none; text-align:center;">View Project Report</a>` : '';

  // Show detailed dynamic modal drawer
  const dialog = document.createElement('div');
  dialog.className = 'modal-overlay active';
  dialog.innerHTML = `
    <div class="modal-content glass-panel" onclick="event.stopPropagation()" style="max-width: 580px;">
      <button class="modal-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
      <h3 class="gradient-text"><i class="fa-solid fa-folder-open"></i> Project Dossier</h3>
      <h4 style="margin-top: 15px; font-size:1.3rem; color:#fff;">${p.title}</h4>
      <p style="color:#9e8070; font-size:0.8rem; margin-bottom: 20px;">Category: ${p.category.toUpperCase()} &bull; Status: ${p.status}</p>
      
      <div style="font-size:0.88rem; color:#e8d8c0; display:flex; flex-direction:column; gap:12px; margin-bottom: 25px;">
        <p><strong>Description:</strong><br>${p.desc}</p>
        <p><strong>Objectives:</strong><br>${p.objectives}</p>
        <p><strong>Schedule:</strong> ${p.date} &bull; ${p.time}</p>
        <p><strong>Location:</strong> ${p.venue}</p>
        <p><strong>Chairperson:</strong> ${p.chairperson} (${p.organizingCommittee})</p>
        <p><strong>Partnering Orgs:</strong> ${p.partnerOrganizations || 'None'}</p>
      </div>
      
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
        ${registerBtn}
        ${reportBtn}
      </div>
    </div>
  `;
  dialog.addEventListener('click', () => dialog.remove());
  document.body.appendChild(dialog);
}

function filterProjects(cat) {
  renderPublicProjects(cat);
}

function renderPublicPresidents() {
  const grid = document.getElementById('public-presidents-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const selectedYear = '2026/2027';
  const presidents = getCollection(STORAGE_KEYS.PRESIDENTS)
    .filter(p => p.year === selectedYear && p.status === 'Active')
    .sort((a,b) => a.displayOrder - b.displayOrder);

  if (presidents.length === 0) {
    grid.innerHTML = `<div class="no-results glass-panel" style="grid-column: 1/-1;"><i class="fa-solid fa-face-frown"></i> No active Club Presidents registered for Year ${selectedYear}.</div>`;
    return;
  }

  presidents.forEach(p => {
    const card = document.createElement('div');
    card.className = 'leo-member-card glass-panel';
    
    const photoStyle = `style="width:100%;height:100%;object-fit:cover;border-radius:inherit;transform: scale(${p.photoScale || 1}); object-position: ${p.photoX || 50}% ${p.photoY || 50}%;"`;
    const photoHtml = p.photo 
      ? `<img src="${p.photo}" ${photoStyle}>` 
      : `<i class="fa-solid fa-user-astronaut"></i>`;

    card.innerHTML = `
      <div class="leo-badge">${p.position}</div>
      <div class="leo-avatar">${photoHtml}</div>
      <h4>${p.name}</h4>
      <span class="leo-club">${p.clubName}</span>
      <p style="font-size:0.75rem; color:#9e8070; margin-top:8px;">Area: ${p.region}</p>
      <p style="margin-top:10px; font-size:0.8rem;">${p.bio || 'Serving the local youth movement.'}</p>
    `;
    grid.appendChild(card);
  });
}

function renderPublicClubs() {
  const grid = document.getElementById('public-clubs-grid');
  const countEl = document.getElementById('leo-count');
  if (!grid) return;
  grid.innerHTML = '';

  const query = document.getElementById('leo-search').value.toLowerCase().trim();
  const region = document.getElementById('public-clubs-region').value;

  let list = getCollection(STORAGE_KEYS.CLUBS).filter(c => c.status === 'Active');

  if (region !== 'all') {
    list = list.filter(c => c.region === region);
  }

  if (query) {
    list = list.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.sponsor.toLowerCase().includes(query) || 
      c.region.toLowerCase().includes(query) || 
      c.president.toLowerCase().includes(query) ||
      c.advisor.toLowerCase().includes(query)
    );
  }

  list.sort((a,b) => a.displayOrder - b.displayOrder);

  if (countEl) countEl.innerText = list.length;

  if (list.length === 0) {
    grid.innerHTML = `<div class="no-results glass-panel" style="grid-column: 1/-1;"><i class="fa-solid fa-face-frown"></i> No Leo Clubs matched your query.</div>`;
    return;
  }

  list.forEach(c => {
    const card = document.createElement('div');
    card.className = 'public-club-card glass-panel';

    const bannerHtml = c.banner 
      ? `<img src="${c.banner}" class="club-card-banner">`
      : `<div class="club-card-banner" style="background:linear-gradient(135deg, #150808, #2a1010); border-radius:12px;"></div>`;

    const logoHtml = c.logo 
      ? `<img src="${c.logo}" alt="Logo">`
      : `<i class="fa-solid fa-shield-halved text-gold"></i>`;

    card.innerHTML = `
      ${bannerHtml}
      <div class="club-card-header">
        <div class="club-logo-circle">${logoHtml}</div>
        <div class="club-title-info">
          <h4>${c.name}</h4>
          <span>Sponsor: ${c.sponsor}</span>
        </div>
      </div>
      <div class="club-details-list">
        <div class="detail-item"><span class="label">Chartered</span><span>${c.charteredDate}</span></div>
        <div class="detail-item"><span class="label">Region</span><span>${c.region}</span></div>
        <div class="detail-item"><span class="label">President</span><span>${c.president}</span></div>
        <div class="detail-item"><span class="label">Secretary</span><span>${c.secretary}</span></div>
        <div class="detail-item"><span class="label">Treasurer</span><span>${c.treasurer}</span></div>
        <div class="detail-item"><span class="label">Advisor</span><span>${c.advisor}</span></div>
      </div>
      <div class="club-card-footer">
        <span class="members-pill">${c.members} Members</span>
        <span class="status-badge">${c.status}</span>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderPublicGovernors() {
  const grid = document.getElementById('governors-container');
  if (!grid) return;
  grid.innerHTML = '';

  const q = document.getElementById('gov-search').value.toLowerCase().trim();
  let list = getCollection(STORAGE_KEYS.GOVERNORS).filter(g => g.status === 'Active');

  if (q) {
    list = list.filter(g => 
      g.name.toLowerCase().includes(q) || 
      g.year.toLowerCase().includes(q) || 
      g.theme.toLowerCase().includes(q) || 
      g.achievement.toLowerCase().includes(q)
    );
  }

  if (list.length === 0) {
    grid.innerHTML = `<div class="no-results glass-panel"><i class="fa-solid fa-face-frown"></i> No Past Presidents matched your search.</div>`;
    return;
  }

  list.forEach((g, idx) => {
    const card = document.createElement('div');
    const side = idx % 2 === 0 ? 'left' : 'right';
    card.className = `gov-timeline-item ${side} reveal`;
    
    const achievementHtml = g.achievement ? `<p class="gov-achievement"><strong>Key Achievement:</strong> ${g.achievement}</p>` : '';
    const themeLabel = (g.theme && g.theme.toLowerCase().includes('club')) ? 'Home Club' : 'Theme';
    const themeHtml = g.theme ? `<div class="gov-theme" style="font-size: 0.8rem; color: #9e8070; margin-top: 4px;"><i class="fa-solid ${g.logo || 'fa-scroll'}"></i> ${themeLabel}: <strong>${g.theme}</strong></div>` : '';

    card.innerHTML = `
      <div class="gov-timeline-badge"><i class="fa-solid fa-scroll"></i></div>
      <div class="gov-card glass-panel">
        <span class="gov-year">${g.year}</span>
        <div class="gov-header" style="display: flex; gap: 15px; align-items: center; margin-bottom: 12px;">
          <div class="profile-photo-circle" style="width: 64px; height: 64px; border-radius: 12px; border: 1.5px solid rgba(234,170,0,0.3); overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: rgba(0,0,0,0.4);">
            ${g.photo 
              ? `<img src="${g.photo}" style="width: 100%; height: 100%; object-fit: cover; transform: scale(${g.photoScale || 1}); object-position: ${g.photoX || 50}% ${g.photoY || 50}%;">`
              : `<div class="profile-icon-fallback" style="width: 100%; height: 100%; font-size: 1.2rem; color: rgba(234,170,0,0.7); display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-user-shield"></i></div>`
            }
          </div>
          <div>
            <h4 style="font-family: var(--font-heading); font-size: 1.1rem; color: #fff; margin: 0;">${g.name}</h4>
            ${themeHtml}
          </div>
        </div>
        ${achievementHtml}
      </div>
    `;
    grid.appendChild(card);
  });
  revealElements();
}

function filterGovernors() {
  renderPublicGovernors();
}

// Stubs for legacy pages
function filterAllCouncil() { renderPublicCouncil(); }
function filterCouncil() { renderPublicCouncil(); }
function filterLeoClubs() { renderPublicClubs(); }

// ── ADMIN CENTRE CONTROLLERS ────────────────────────────────

let activeAdminTab = 'dashboard';
let editorActiveSection = ''; // e.g. 'council', 'projects', 'presidents', 'clubs'
let editingRecordId = null; // null for add mode

// Files base64 uploads temp cache
let editorImageCache = {};

function renderAdminDashboard() {
  // Stats counters
  document.getElementById('stat-count-council').innerText = getCollection(STORAGE_KEYS.COUNCIL).length;
  document.getElementById('stat-count-projects').innerText = getCollection(STORAGE_KEYS.PROJECTS).length;
  document.getElementById('stat-count-presidents').innerText = getCollection(STORAGE_KEYS.PRESIDENTS).length;
  document.getElementById('stat-count-clubs').innerText = getCollection(STORAGE_KEYS.CLUBS).length;
  document.getElementById('stat-count-governors').innerText = getCollection(STORAGE_KEYS.GOVERNORS).length;
  document.getElementById('stat-count-blogs').innerText = getCollection(STORAGE_KEYS.BLOGS).length;

  // Render recent logs in Dashboard Tab
  const logs = getCollection(STORAGE_KEYS.LOGS).slice(0, 5);
  const logTbody = document.getElementById('admin-recent-logs-body');
  if (logTbody) {
    logTbody.innerHTML = logs.map(l => `
      <tr>
        <td style="color:#9e8070;">${l.timestamp}</td>
        <td><span class="badge-status active" style="font-size:0.65rem;">${l.role}</span></td>
        <td>${l.action}</td>
      </tr>
    `).join('') || '<tr><td colspan="3">No activities logged yet.</td></tr>';
  }

  const usersTab = document.getElementById('tab-nav-users');
  if (usersTab) {
    if (currentUser && currentUser.role === 'superadmin') {
      usersTab.style.display = 'block';
      renderAdminTable('users');
    } else {
      usersTab.style.display = 'none';
    }
  }

  // Populate tables
  renderAdminTable('council');
  renderAdminTable('projects');
  renderAdminTable('presidents');
  renderAdminTable('clubs');
  renderAdminTable('governors');
  renderAdminTable('blogs');
  renderAdminLogsTable();
}

function switchAdminTab(tabId) {
  if (tabId === 'users' && (!currentUser || currentUser.role !== 'superadmin')) {
    alert('Security Exception: User management is restricted to Super Admin.');
    switchAdminTab('dashboard');
    return;
  }

  activeAdminTab = tabId;
  document.querySelectorAll('.admin-nav-item').forEach(item => {
    item.classList.remove('active');
  });
  const navItem = document.getElementById(`tab-nav-${tabId}`);
  if (navItem) navItem.classList.add('active');

  document.querySelectorAll('.admin-tab-content').forEach(content => {
    content.classList.remove('active');
  });
  const contentPanel = document.getElementById(`admin-tab-${tabId}`);
  if (contentPanel) contentPanel.classList.add('active');
  
  if (tabId === 'dashboard') {
    renderAdminDashboard();
  }
}

// Render dynamic tables inside management panels
function renderAdminTable(section) {
  const tbody = document.getElementById(`admin-table-${section}`);
  if (!tbody) return;
  tbody.innerHTML = '';

  let list = [];
  let key = '';

  if (section === 'council') { key = STORAGE_KEYS.COUNCIL; }
  else if (section === 'projects') { key = STORAGE_KEYS.PROJECTS; }
  else if (section === 'presidents') { key = STORAGE_KEYS.PRESIDENTS; }
  else if (section === 'clubs') { key = STORAGE_KEYS.CLUBS; }
  else if (section === 'governors') { key = STORAGE_KEYS.GOVERNORS; }
  else if (section === 'blogs') { key = STORAGE_KEYS.BLOGS; }
  else if (section === 'users') { key = STORAGE_KEYS.USERS; }

  list = getCollection(key);

  // Apply filters
  const searchVal = document.getElementById(`admin-search-${section}`).value.toLowerCase().trim();
  if (searchVal) {
    if (section === 'council' || section === 'presidents') {
      list = list.filter(item => item.name.toLowerCase().includes(searchVal) || item.role.toLowerCase().includes(searchVal));
    } else if (section === 'projects') {
      list = list.filter(item => item.title.toLowerCase().includes(searchVal) || item.chairperson.toLowerCase().includes(searchVal));
    } else if (section === 'clubs') {
      list = list.filter(item => item.name.toLowerCase().includes(searchVal) || item.president.toLowerCase().includes(searchVal));
    } else if (section === 'governors') {
      list = list.filter(item => item.name.toLowerCase().includes(searchVal) || item.theme.toLowerCase().includes(searchVal) || item.year.toLowerCase().includes(searchVal));
    } else if (section === 'blogs') {
      list = list.filter(item => item.title.toLowerCase().includes(searchVal) || item.author.toLowerCase().includes(searchVal));
    } else if (section === 'users') {
      list = list.filter(item => item.username.toLowerCase().includes(searchVal) || (item.label || '').toLowerCase().includes(searchVal));
    }
  }

  // Year filter for council and presidents
  const yearFilter = document.getElementById(`admin-filter-year-${section}`);
  if (yearFilter && yearFilter.value !== 'all') {
    list = list.filter(item => item.year === yearFilter.value);
  }

  // Status filters
  const statusFilter = document.getElementById(`admin-filter-status-${section}`);
  if (statusFilter && statusFilter.value !== 'all') {
    if (section === 'projects') {
      list = list.filter(item => item.status === statusFilter.value);
    } else {
      list = list.filter(item => item.status === statusFilter.value);
    }
  }

  // Sort by displayOrder
  list.sort((a,b) => a.displayOrder - b.displayOrder);

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#9e8070; padding:30px;">No records matched standard filters.</td></tr>`;
    return;
  }

  list.forEach(item => {
    const tr = document.createElement('tr');
    
    if (section === 'council') {
      const photoStyle = `style="transform: scale(${item.photoScale || 1}); object-position: ${item.photoX || 50}% ${item.photoY || 50}%;"`;
      const img = item.photo ? `<img src="${item.photo}" class="thumbnail" ${photoStyle}>` : `<div class="profile-icon-fallback" style="width:36px;height:36px;font-size:0.8rem;margin:0;"><i class="fa-solid ${item.icon || 'fa-user'}"></i></div>`;
      tr.innerHTML = `
        <td>${img}</td>
        <td><strong>${item.name}</strong></td>
        <td>${item.role} <span style="font-size:0.7rem;color:#9e8070;">(${item.type})</span></td>
        <td>${item.year}</td>
        <td><span class="badge-status ${item.status === 'Published' ? 'published' : 'draft'}">${item.status}</span></td>
        <td>${item.displayOrder}</td>
        <td>
          <div class="action-btns">
            <button class="btn-action-icon" onclick="swapOrder('council', '${item.id}', -1)" title="Move Up"><i class="fa-solid fa-arrow-up"></i></button>
            <button class="btn-action-icon" onclick="swapOrder('council', '${item.id}', 1)" title="Move Down"><i class="fa-solid fa-arrow-down"></i></button>
            <button class="btn-action-icon" onclick="editRecord('council', '${item.id}')" title="Edit"><i class="fa-solid fa-pen"></i></button>
            <button class="btn-action-icon btn-delete" onclick="deleteRecord('council', '${item.id}')" title="Delete"><i class="fa-solid fa-trash-can"></i></button>
          </div>
        </td>
      `;
    } 
    else if (section === 'projects') {
      const img = item.coverImage ? `<img src="${item.coverImage}" class="logo-thumb">` : `<div class="profile-icon-fallback" style="width:36px;height:36px;font-size:0.8rem;margin:0;"><i class="fa-solid fa-diagram-project"></i></div>`;
      tr.innerHTML = `
        <td>${img}</td>
        <td><strong>${item.title}</strong></td>
        <td>${item.category.toUpperCase()}</td>
        <td>${item.chairperson}</td>
        <td><span class="badge-status ${item.publicationStatus === 'Published' ? 'published' : 'draft'}">${item.status} / ${item.publicationStatus}</span></td>
        <td>${item.displayOrder}</td>
        <td>
          <div class="action-btns">
            <button class="btn-action-icon" onclick="swapOrder('projects', '${item.id}', -1)" title="Move Up"><i class="fa-solid fa-arrow-up"></i></button>
            <button class="btn-action-icon" onclick="swapOrder('projects', '${item.id}', 1)" title="Move Down"><i class="fa-solid fa-arrow-down"></i></button>
            <button class="btn-action-icon" onclick="editRecord('projects', '${item.id}')" title="Edit"><i class="fa-solid fa-pen"></i></button>
            <button class="btn-action-icon btn-delete" onclick="deleteRecord('projects', '${item.id}')" title="Delete"><i class="fa-solid fa-trash-can"></i></button>
          </div>
        </td>
      `;
    } 
    else if (section === 'presidents') {
      const photoStyle = `style="transform: scale(${item.photoScale || 1}); object-position: ${item.photoX || 50}% ${item.photoY || 50}%;"`;
      const img = item.photo ? `<img src="${item.photo}" class="thumbnail" ${photoStyle}>` : `<div class="profile-icon-fallback" style="width:36px;height:36px;font-size:0.8rem;margin:0;"><i class="fa-solid fa-user-tie"></i></div>`;
      tr.innerHTML = `
        <td>${img}</td>
        <td><strong>${item.name}</strong></td>
        <td>${item.clubName}</td>
        <td>${item.year}</td>
        <td><span class="badge-status ${item.status === 'Active' ? 'published' : 'draft'}">${item.status}</span></td>
        <td>${item.displayOrder}</td>
        <td>
          <div class="action-btns">
            <button class="btn-action-icon" onclick="swapOrder('presidents', '${item.id}', -1)" title="Move Up"><i class="fa-solid fa-arrow-up"></i></button>
            <button class="btn-action-icon" onclick="swapOrder('presidents', '${item.id}', 1)" title="Move Down"><i class="fa-solid fa-arrow-down"></i></button>
            <button class="btn-action-icon" onclick="editRecord('presidents', '${item.id}')" title="Edit"><i class="fa-solid fa-pen"></i></button>
            <button class="btn-action-icon btn-delete" onclick="deleteRecord('presidents', '${item.id}')" title="Delete"><i class="fa-solid fa-trash-can"></i></button>
          </div>
        </td>
      `;
    } 
    else if (section === 'clubs') {
      const img = item.logo ? `<img src="${item.logo}" class="logo-thumb">` : `<div class="profile-icon-fallback" style="width:36px;height:36px;font-size:0.8rem;margin:0;"><i class="fa-solid fa-shield-halved"></i></div>`;
      tr.innerHTML = `
        <td>${img}</td>
        <td><strong>${item.name}</strong></td>
        <td>${item.sponsor}</td>
        <td>${item.members}</td>
        <td><span class="badge-status ${item.status === 'Active' ? 'published' : 'draft'}">${item.status}</span></td>
        <td>${item.displayOrder}</td>
        <td>
          <div class="action-btns">
            <button class="btn-action-icon" onclick="swapOrder('clubs', '${item.id}', -1)" title="Move Up"><i class="fa-solid fa-arrow-up"></i></button>
            <button class="btn-action-icon" onclick="swapOrder('clubs', '${item.id}', 1)" title="Move Down"><i class="fa-solid fa-arrow-down"></i></button>
            <button class="btn-action-icon" onclick="editRecord('clubs', '${item.id}')" title="Edit"><i class="fa-solid fa-pen"></i></button>
            <button class="btn-action-icon btn-delete" onclick="deleteRecord('clubs', '${item.id}')" title="Delete"><i class="fa-solid fa-trash-can"></i></button>
          </div>
        </td>
      `;
    }
    else if (section === 'governors') {
      const photoStyle = `style="transform: scale(${item.photoScale || 1}); object-position: ${item.photoX || 50}% ${item.photoY || 50}%;"`;
      const img = item.photo ? `<img src="${item.photo}" class="thumbnail" ${photoStyle}>` : `<div class="profile-icon-fallback" style="width:36px;height:36px;font-size:0.8rem;margin:0;"><i class="fa-solid fa-user-shield"></i></div>`;
      tr.innerHTML = `
        <td>${img}</td>
        <td><strong>${item.year}</strong></td>
        <td>${item.name}</td>
        <td>"${item.theme}"</td>
        <td><code>${item.logo}</code> <i class="fa-solid ${item.logo} text-gold" style="margin-left: 5px;"></i></td>
        <td><span class="badge-status ${item.status === 'Active' ? 'published' : 'draft'}">${item.status}</span></td>
        <td>${item.displayOrder}</td>
        <td>
          <div class="action-btns">
            <button class="btn-action-icon" onclick="swapOrder('governors', '${item.id}', -1)" title="Move Up"><i class="fa-solid fa-arrow-up"></i></button>
            <button class="btn-action-icon" onclick="swapOrder('governors', '${item.id}', 1)" title="Move Down"><i class="fa-solid fa-arrow-down"></i></button>
            <button class="btn-action-icon" onclick="editRecord('governors', '${item.id}')" title="Edit"><i class="fa-solid fa-pen"></i></button>
            <button class="btn-action-icon btn-delete" onclick="deleteRecord('governors', '${item.id}')" title="Delete"><i class="fa-solid fa-trash-can"></i></button>
          </div>
        </td>
      `;
    }
    else if (section === 'blogs') {
      const photoStyle = `style="transform: scale(${item.photoScale || 1}); object-position: ${item.photoX || 50}% ${item.photoY || 50}%;"`;
      const img = item.photo ? `<img src="${item.photo}" class="thumbnail" ${photoStyle}>` : `<div class="profile-icon-fallback" style="width:36px;height:36px;font-size:0.8rem;margin:0;"><i class="fa-solid fa-blog"></i></div>`;
      tr.innerHTML = `
        <td>${img}</td>
        <td><strong>${item.date}</strong></td>
        <td>${item.title}</td>
        <td>${item.author}</td>
        <td><span class="badge-status ${item.status === 'Active' ? 'published' : 'draft'}">${item.status}</span></td>
        <td>${item.displayOrder}</td>
        <td>
          <div class="action-btns">
            <button class="btn-action-icon" onclick="swapOrder('blogs', '${item.id}', -1)" title="Move Up"><i class="fa-solid fa-arrow-up"></i></button>
            <button class="btn-action-icon" onclick="swapOrder('blogs', '${item.id}', 1)" title="Move Down"><i class="fa-solid fa-arrow-down"></i></button>
            <button class="btn-action-icon" onclick="editRecord('blogs', '${item.id}')" title="Edit"><i class="fa-solid fa-pen"></i></button>
            <button class="btn-action-icon btn-delete" onclick="deleteRecord('blogs', '${item.id}')" title="Delete"><i class="fa-solid fa-trash-can"></i></button>
          </div>
        </td>
      `;
    }
    else if (section === 'users') {
      tr.innerHTML = `
        <td><strong>${item.username}</strong></td>
        <td>${item.label || 'Blog Editor'}</td>
        <td><span class="badge-status active">${item.role || 'blog_editor'}</span></td>
        <td><code>${item.password}</code></td>
        <td>
          <div class="action-btns">
            <button class="btn-action-icon" onclick="editRecord('users', '${item.id}')" title="Edit"><i class="fa-solid fa-pen"></i></button>
            <button class="btn-action-icon btn-delete" onclick="deleteRecord('users', '${item.id}')" title="Delete"><i class="fa-solid fa-trash-can"></i></button>
          </div>
        </td>
      `;
    }

    tbody.appendChild(tr);
  });
}

function renderAdminLogsTable() {
  const tbody = document.getElementById('admin-table-logs-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  const logs = getCollection(STORAGE_KEYS.LOGS);
  if (logs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px; color:#9e8070;">Audit activity list is blank.</td></tr>';
    return;
  }

  tbody.innerHTML = logs.map(l => `
    <tr>
      <td style="color:#9e8070;">${l.timestamp}</td>
      <td><strong>${l.userId}</strong></td>
      <td><span class="badge-status active">${l.role}</span></td>
      <td>${l.action}</td>
    </tr>
  `).join('');
}

function clearActivityLogs() {
  if (!checkPermission('view_logs')) {
    alert('Security Access Denied. Only Super Admins can clear activity logs.');
    return;
  }
  if (!confirm('Are you sure you want to permanently clear the audit logs?')) return;
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([]));
  logActivity('Admin activity logs cleared.');
  renderAdminLogsTable();
}

// ── ROLE-BASED ACCESS CONTROL (RBAC) CHECKS ─────────────────

function checkPermission(action) {
  if (!currentUser) return false;
  const roleCfg = ADMIN_ROLES[currentUser.role];
  if (!roleCfg) return false;
  if (roleCfg.permissions.all) return true;

  if (action === 'view_logs') {
    return roleCfg.permissions.view_logs || false;
  }
  if (action === 'delete') {
    return roleCfg.permissions.delete !== false; // contentadmin cannot delete
  }
  if (action === 'edit_all') {
    return roleCfg.permissions.edit === true;
  }
  if (action === 'edit_council') {
    return roleCfg.permissions.edit === true || roleCfg.permissions.edit_council === true;
  }
  if (action === 'edit_projects') {
    return roleCfg.permissions.edit === true || roleCfg.permissions.edit_projects === true;
  }
  if (action === 'edit_clubs') {
    return roleCfg.permissions.edit === true || roleCfg.permissions.edit_clubs === true;
  }
  if (action === 'edit_presidents') {
    return roleCfg.permissions.edit === true || roleCfg.permissions.edit_presidents === true;
  }

  return false;
}

// ── EDITOR DYNAMIC FORMS MARKUP ────────────────────────────

function openEditorModal(section, recordId = null) {
  // Validate RBAC permissions before opening forms
  if (currentUser.role === 'vieweradmin') {
    alert('Security Exception: Viewer Admin has read-only access. Form is disabled.');
    return;
  }

  // Specific section checks
  if (section === 'council' && !checkPermission('edit_council')) {
    alert('Access Denied: Your admin role does not permit modifying Council Officers.');
    return;
  }
  if (section === 'projects' && !checkPermission('edit_projects')) {
    alert('Access Denied: Your admin role does not permit modifying Projects.');
    return;
  }
  if (section === 'presidents' && !checkPermission('edit_presidents')) {
    alert('Access Denied: Your admin role does not permit modifying Presidents.');
    return;
  }
  if (section === 'clubs' && !checkPermission('edit_clubs')) {
    alert('Access Denied: Your admin role does not permit modifying Clubs.');
    return;
  }
  if (section === 'governors' && !checkPermission('edit_council')) {
    alert('Access Denied: Your admin role does not permit modifying Past District Presidents.');
    return;
  }
  if (section === 'blogs' && !checkPermission('edit_projects')) {
    alert('Access Denied: Your admin role does not permit modifying District Blogs.');
    return;
  }
  if (section !== 'blogs' && currentUser.role === 'blog_editor') {
    alert('Security Violation: Blog Editors are restricted to managing blog posts.');
    return;
  }
  if (section === 'users' && (!currentUser || currentUser.role !== 'superadmin')) {
    alert('Access Denied: Only Super Admin can register or modify user accounts.');
    return;
  }

  editorActiveSection = section;
  editingRecordId = recordId;
  editorImageCache = {};

  const modal = document.getElementById('editor-modal');
  const title = document.getElementById('editor-title');
  const form = document.getElementById('editor-form');
  if (!modal || !form) return;

  let displayLabel = section.toUpperCase();
  if (section === 'governors') displayLabel = 'PAST DISTRICT PRESIDENT';
  if (section === 'blogs') displayLabel = 'DISTRICT BLOG';
  if (section === 'users') displayLabel = 'USER ACCOUNT';
  title.innerText = recordId ? `Edit ${displayLabel} Record` : `Add New ${displayLabel} Record`;
  
  let key = '';
  if (section === 'council') key = STORAGE_KEYS.COUNCIL;
  if (section === 'projects') key = STORAGE_KEYS.PROJECTS;
  if (section === 'presidents') key = STORAGE_KEYS.PRESIDENTS;
  if (section === 'clubs') key = STORAGE_KEYS.CLUBS;
  if (section === 'governors') key = STORAGE_KEYS.GOVERNORS;
  if (section === 'blogs') key = STORAGE_KEYS.BLOGS;
  if (section === 'users') key = STORAGE_KEYS.USERS;

  const records = getCollection(key);
  const data = recordId ? records.find(r => r.id === recordId) : {};

  // Build inputs dynamically
  let html = '';

  if (section === 'council') {
    html = `
      <div class="form-row">
        <div class="input-group">
          <label>Full Name *</label>
          <input type="text" id="c-name" value="${data.name || ''}" required>
        </div>
        <div class="input-group">
          <label>Designation / Role *</label>
          <input type="text" id="c-role" placeholder="e.g. Zonal Director" value="${data.role || ''}" required>
        </div>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Committee / Department</label>
          <input type="text" id="c-tag" placeholder="e.g. Zone A1, IT, Sports" value="${data.tag || ''}">
        </div>
        <div class="input-group">
          <label>Role Class Type *</label>
          <select id="c-type">
            <option value="exec" ${data.type === 'exec' ? 'selected' : ''}>Executive Committee</option>
            <option value="chief" ${data.type === 'chief' ? 'selected' : ''}>Chief Coordinator</option>
            <option value="directors" ${data.type === 'directors' ? 'selected' : ''}>Director</option>
            <option value="officers" ${data.type === 'officers' ? 'selected' : ''}>Officer</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Profile Image File</label>
          <input type="file" accept="image/*" onchange="cacheFile(this, 'photo')">
        </div>
        <div class="input-group">
          <label>Status</label>
          <select id="c-status">
            <option value="Published" ${data.status === 'Published' ? 'selected' : ''}>Published</option>
            <option value="Draft" ${data.status === 'Draft' ? 'selected' : ''}>Draft</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Year Term *</label>
          <select id="c-year">
            <option value="2026/2027" ${data.year === '2026/2027' ? 'selected' : ''}>2026/2027</option>
            <option value="2025/2026" ${data.year === '2025/2026' ? 'selected' : ''}>2025/2026</option>
            <option value="2027/2028" ${data.year === '2027/2028' ? 'selected' : ''}>2027/2028</option>
          </select>
        </div>
        <div class="input-group">
          <label>Display Order Priority *</label>
          <input type="number" id="c-order" value="${data.displayOrder || records.length + 1}" required>
        </div>
      </div>
      
      <!-- Image Crop & Positioning Widget -->
      <div id="image-adjust-widget" class="glass-panel" style="display: ${data.photo ? 'flex' : 'none'}; padding: 15px; margin: 15px 0; border-radius: 12px; gap: 15px; align-items: center; border: 1px solid rgba(255,255,255,0.08);">
        <div style="width: 90px; height: 90px; border-radius: 16px; overflow: hidden; border: 2px solid var(--color-gold); display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: rgba(0,0,0,0.4);">
          <img id="crop-preview-img" src="${data.photo || ''}" style="width: 100%; height: 100%; object-fit: cover; transform: scale(${data.photoScale || 1}); object-position: ${data.photoX || 50}% ${data.photoY || 50}%;">
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px; flex-grow: 1;">
          <h5 style="font-family:var(--font-heading); color: #fff; font-size: 0.8rem; text-transform: uppercase; margin-bottom: 5px;">Position & Zoom adjustment</h5>
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="font-size: 0.7rem; color: #9e8070; width: 60px;">Zoom</label>
            <input type="range" id="crop-zoom" min="1" max="2.5" step="0.05" value="${data.photoScale || 1}" oninput="updateCropPreview()" style="flex-grow: 1; accent-color: var(--color-gold);">
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="font-size: 0.7rem; color: #9e8070; width: 60px;">Pan X</label>
            <input type="range" id="crop-x" min="0" max="100" step="1" value="${data.photoX || 50}" oninput="updateCropPreview()" style="flex-grow: 1; accent-color: var(--color-gold);">
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="font-size: 0.7rem; color: #9e8070; width: 60px;">Pan Y</label>
            <input type="range" id="crop-y" min="0" max="100" step="1" value="${data.photoY || 50}" oninput="updateCropPreview()" style="flex-grow: 1; accent-color: var(--color-gold);">
          </div>
        </div>
      </div>
    `;
  } 
  else if (section === 'projects') {
    html = `
      <div class="form-row">
        <div class="input-group">
          <label>Project Title *</label>
          <input type="text" id="p-title" value="${data.title || ''}" required>
        </div>
        <div class="input-group">
          <label>Category *</label>
          <select id="p-category">
            <option value="youth" ${data.category === 'youth' ? 'selected' : ''}>Youth</option>
            <option value="hunger" ${data.category === 'hunger' ? 'selected' : ''}>Hunger</option>
            <option value="environment" ${data.category === 'environment' ? 'selected' : ''}>Environment</option>
            <option value="vision" ${data.category === 'vision' ? 'selected' : ''}>Vision</option>
            <option value="other" ${data.category === 'other' ? 'selected' : ''}>Other</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Project Lead Chairperson *</label>
          <input type="text" id="p-chair" value="${data.chairperson || ''}" required>
        </div>
        <div class="input-group">
          <label>Organizing Committee</label>
          <input type="text" id="p-committee" value="${data.organizingCommittee || ''}">
        </div>
      </div>
      <div class="input-group">
        <label>Description *</label>
        <textarea id="p-desc" required>${data.desc || ''}</textarea>
      </div>
      <div class="input-group">
        <label>Objectives</label>
        <textarea id="p-objectives">${data.objectives || ''}</textarea>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Date *</label>
          <input type="date" id="p-date" value="${data.date || ''}" required>
        </div>
        <div class="input-group">
          <label>Time</label>
          <input type="text" placeholder="e.g. 09:00 AM" id="p-time" value="${data.time || ''}">
        </div>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Venue *</label>
          <input type="text" id="p-venue" value="${data.venue || ''}" required>
        </div>
        <div class="input-group">
          <label>Cover Banner Image</label>
          <input type="file" accept="image/*" onchange="cacheFile(this, 'cover')">
        </div>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Registration Link</label>
          <input type="text" placeholder="https://..." id="p-reglink" value="${data.registrationLink || ''}">
        </div>
        <div class="input-group">
          <label>Report Link</label>
          <input type="text" placeholder="https://..." id="p-replink" value="${data.reportLink || ''}">
        </div>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Partner Organizations</label>
          <input type="text" placeholder="Co-partners" id="p-partners" value="${data.partnerOrganizations || ''}">
        </div>
        <div class="input-group">
          <label>Display Order *</label>
          <input type="number" id="p-order" value="${data.displayOrder || records.length + 1}" required>
        </div>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Project Status</label>
          <select id="p-status">
            <option value="Upcoming" ${data.status === 'Upcoming' ? 'selected' : ''}>Upcoming</option>
            <option value="Ongoing" ${data.status === 'Ongoing' ? 'selected' : ''}>Ongoing</option>
            <option value="Completed" ${data.status === 'Completed' ? 'selected' : ''}>Completed</option>
          </select>
        </div>
        <div class="input-group">
          <label>Publication Status</label>
          <select id="p-pubstatus">
            <option value="Published" ${data.publicationStatus === 'Published' ? 'selected' : ''}>Published</option>
            <option value="Draft" ${data.publicationStatus === 'Draft' ? 'selected' : ''}>Draft</option>
          </select>
        </div>
      </div>
    `;
  }
  else if (section === 'presidents') {
    html = `
      <div class="form-row">
        <div class="input-group">
          <label>Full Name *</label>
          <input type="text" id="pr-name" value="${data.name || ''}" required>
        </div>
        <div class="input-group">
          <label>Leo Club Name *</label>
          <input type="text" id="pr-club" value="${data.clubName || ''}" required>
        </div>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Designation *</label>
          <input type="text" id="pr-pos" value="${data.position || 'Club President'}" required>
        </div>
        <div class="input-group">
          <label>Year Term *</label>
          <select id="pr-year">
            <option value="2026/2027" ${data.year === '2026/2027' ? 'selected' : ''}>2026/2027</option>
            <option value="2025/2026" ${data.year === '2025/2026' ? 'selected' : ''}>2025/2026</option>
            <option value="2027/2028" ${data.year === '2027/2028' ? 'selected' : ''}>2027/2028</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Region / Area</label>
          <input type="text" id="pr-region" value="${data.region || ''}">
        </div>
        <div class="input-group">
          <label>Profile Image File</label>
          <input type="file" accept="image/*" onchange="cacheFile(this, 'photo')">
        </div>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Contact Number</label>
          <input type="text" id="pr-phone" value="${data.phone || ''}">
        </div>
        <div class="input-group">
          <label>Email Address</label>
          <input type="email" id="pr-email" value="${data.email || ''}">
        </div>
      </div>
      <div class="input-group">
        <label>Short Bio Description</label>
        <textarea id="pr-bio">${data.bio || ''}</textarea>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Display Order *</label>
          <input type="number" id="pr-order" value="${data.displayOrder || records.length + 1}" required>
        </div>
        <div class="input-group">
          <label>Status</label>
          <select id="pr-status">
            <option value="Active" ${data.status === 'Active' ? 'selected' : ''}>Active</option>
            <option value="Inactive" ${data.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
          </select>
        </div>
      </div>

      <!-- Image Crop & Positioning Widget -->
      <div id="image-adjust-widget" class="glass-panel" style="display: ${data.photo ? 'flex' : 'none'}; padding: 15px; margin: 15px 0; border-radius: 12px; gap: 15px; align-items: center; border: 1px solid rgba(255,255,255,0.08);">
        <div style="width: 90px; height: 90px; border-radius: 16px; overflow: hidden; border: 2px solid var(--color-gold); display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: rgba(0,0,0,0.4);">
          <img id="crop-preview-img" src="${data.photo || ''}" style="width: 100%; height: 100%; object-fit: cover; transform: scale(${data.photoScale || 1}); object-position: ${data.photoX || 50}% ${data.photoY || 50}%;">
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px; flex-grow: 1;">
          <h5 style="font-family:var(--font-heading); color: #fff; font-size: 0.8rem; text-transform: uppercase; margin-bottom: 5px;">Position & Zoom adjustment</h5>
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="font-size: 0.7rem; color: #9e8070; width: 60px;">Zoom</label>
            <input type="range" id="crop-zoom" min="1" max="2.5" step="0.05" value="${data.photoScale || 1}" oninput="updateCropPreview()" style="flex-grow: 1; accent-color: var(--color-gold);">
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="font-size: 0.7rem; color: #9e8070; width: 60px;">Pan X</label>
            <input type="range" id="crop-x" min="0" max="100" step="1" value="${data.photoX || 50}" oninput="updateCropPreview()" style="flex-grow: 1; accent-color: var(--color-gold);">
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="font-size: 0.7rem; color: #9e8070; width: 60px;">Pan Y</label>
            <input type="range" id="crop-y" min="0" max="100" step="1" value="${data.photoY || 50}" oninput="updateCropPreview()" style="flex-grow: 1; accent-color: var(--color-gold);">
          </div>
        </div>
      </div>
    `;
  }
  else if (section === 'clubs') {
    html = `
      <div class="form-row">
        <div class="input-group">
          <label>Leo Club Name *</label>
          <input type="text" id="cl-name" value="${data.name || ''}" required>
        </div>
        <div class="input-group">
          <label>Sponsoring Lions Club *</label>
          <input type="text" id="cl-sponsor" value="${data.sponsor || ''}" required>
        </div>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Region / Area *</label>
          <input type="text" placeholder="e.g. Region 3" id="cl-region" value="${data.region || ''}" required>
        </div>
        <div class="input-group">
          <label>Chartered Date *</label>
          <input type="date" id="cl-charter" value="${data.charteredDate || ''}" required>
        </div>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>President Name *</label>
          <input type="text" id="cl-pres" value="${data.president || ''}" required>
        </div>
        <div class="input-group">
          <label>Secretary Name</label>
          <input type="text" id="cl-sec" value="${data.secretary || ''}">
        </div>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Treasurer Name</label>
          <input type="text" id="cl-treas" value="${data.treasurer || ''}">
        </div>
        <div class="input-group">
          <label>Lions Club Advisor Name</label>
          <input type="text" id="cl-advisor" value="${data.advisor || ''}">
        </div>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Club Contact Email</label>
          <input type="email" id="cl-email" value="${data.email || ''}">
        </div>
        <div class="input-group">
          <label>Contact Phone</label>
          <input type="text" id="cl-phone" value="${data.phone || ''}">
        </div>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Club Logo</label>
          <input type="file" accept="image/*" onchange="cacheFile(this, 'logo')">
        </div>
        <div class="input-group">
          <label>Club Banner</label>
          <input type="file" accept="image/*" onchange="cacheFile(this, 'banner')">
        </div>
      </div>
      <div class="input-group">
        <label>Club Description</label>
        <textarea id="cl-desc">${data.desc || ''}</textarea>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Active Members Count *</label>
          <input type="number" id="cl-members" value="${data.members || 20}" required>
        </div>
        <div class="input-group">
          <label>Display Order *</label>
          <input type="number" id="cl-order" value="${data.displayOrder || records.length + 1}" required>
        </div>
      </div>
      <div class="input-group">
        <label>Status</label>
        <select id="cl-status">
          <option value="Active" ${data.status === 'Active' ? 'selected' : ''}>Active</option>
          <option value="Inactive" ${data.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
        </select>
      </div>
    `;
  }
  else if (section === 'governors') {
    html = `
      <div class="form-row">
        <div class="input-group">
          <label>Full Name *</label>
          <input type="text" id="g-name" value="${data.name || ''}" required>
        </div>
        <div class="input-group">
          <label>Year Term *</label>
          <input type="text" placeholder="e.g. 2024/2025" id="g-year" value="${data.year || ''}" required>
        </div>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Theme / Home Club *</label>
          <input type="text" id="g-theme" value="${data.theme || ''}" required>
        </div>
        <div class="input-group">
          <label>Theme Icon (FontAwesome class name) *</label>
          <input type="text" placeholder="e.g. fa-sun, fa-heart" id="g-logo" value="${data.logo || 'fa-scroll'}" required>
        </div>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Profile Image File</label>
          <input type="file" accept="image/*" onchange="cacheFile(this, 'photo')">
        </div>
      </div>
      <div class="input-group">
        <label>Key Achievement (Optional)</label>
        <textarea id="g-achievement">${data.achievement || ''}</textarea>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Display Order *</label>
          <input type="number" id="g-order" value="${data.displayOrder || records.length + 1}" required>
        </div>
        <div class="input-group">
          <label>Status</label>
          <select id="g-status">
            <option value="Active" ${data.status === 'Active' ? 'selected' : ''}>Active</option>
            <option value="Inactive" ${data.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
          </select>
        </div>
      </div>

      <!-- Image Crop & Positioning Widget -->
      <div id="image-adjust-widget" class="glass-panel" style="display: ${data.photo ? 'flex' : 'none'}; padding: 15px; margin: 15px 0; border-radius: 12px; gap: 15px; align-items: center; border: 1px solid rgba(255,255,255,0.08);">
        <div style="width: 90px; height: 90px; border-radius: 16px; overflow: hidden; border: 2px solid var(--color-gold); display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: rgba(0,0,0,0.4);">
          <img id="crop-preview-img" src="${data.photo || ''}" style="width: 100%; height: 100%; object-fit: cover; transform: scale(${data.photoScale || 1}); object-position: ${data.photoX || 50}% ${data.photoY || 50}%;">
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px; flex-grow: 1;">
          <h5 style="font-family:var(--font-heading); color: #fff; font-size: 0.8rem; text-transform: uppercase; margin-bottom: 5px;">Position & Zoom adjustment</h5>
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="font-size: 0.7rem; color: #9e8070; width: 60px;">Zoom</label>
            <input type="range" id="crop-zoom" min="1" max="2.5" step="0.05" value="${data.photoScale || 1}" oninput="updateCropPreview()" style="flex-grow: 1; accent-color: var(--color-gold);">
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="font-size: 0.7rem; color: #9e8070; width: 60px;">Pan X</label>
            <input type="range" id="crop-x" min="0" max="100" step="1" value="${data.photoX || 50}" oninput="updateCropPreview()" style="flex-grow: 1; accent-color: var(--color-gold);">
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="font-size: 0.7rem; color: #9e8070; width: 60px;">Pan Y</label>
            <input type="range" id="crop-y" min="0" max="100" step="1" value="${data.photoY || 50}" oninput="updateCropPreview()" style="flex-grow: 1; accent-color: var(--color-gold);">
          </div>
        </div>
      </div>
    `;
  }
  else if (section === 'blogs') {
    html = `
      <div class="input-group">
        <label>Blog Title *</label>
        <input type="text" id="b-title" value="${data.title || ''}" required style="font-size:1.1rem; font-weight:600;">
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Author / Publisher *</label>
          <input type="text" id="b-author" value="${data.author || 'District Editorial Panel'}" required>
        </div>
        <div class="input-group">
          <label>Publish Date *</label>
          <input type="date" id="b-date" value="${data.date || new Date().toISOString().split('T')[0]}" required>
        </div>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Cover Photo File</label>
          <input type="file" accept="image/*" onchange="cacheFile(this, 'photo')">
        </div>
      </div>
      <div class="input-group">
        <label>Article Content *</label>
        <textarea id="b-content" required style="height: 180px;">${data.content || ''}</textarea>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Display Order *</label>
          <input type="number" id="b-order" value="${data.displayOrder || records.length + 1}" required>
        </div>
        <div class="input-group">
          <label>Status</label>
          <select id="b-status">
            <option value="Active" ${data.status === 'Active' ? 'selected' : ''}>Active</option>
            <option value="Inactive" ${data.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
          </select>
        </div>
      </div>

      <!-- Image Crop & Positioning Widget -->
      <div id="image-adjust-widget" class="glass-panel" style="display: ${data.photo ? 'flex' : 'none'}; padding: 15px; margin: 15px 0; border-radius: 12px; gap: 15px; align-items: center; border: 1px solid rgba(255,255,255,0.08);">
        <div style="width: 120px; height: 75px; border-radius: 12px; overflow: hidden; border: 2px solid var(--color-gold); display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: rgba(0,0,0,0.4);">
          <img id="crop-preview-img" src="${data.photo || ''}" style="width: 100%; height: 100%; object-fit: cover; transform: scale(${data.photoScale || 1}); object-position: ${data.photoX || 50}% ${data.photoY || 50}%;">
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px; flex-grow: 1;">
          <h5 style="font-family:var(--font-heading); color: #fff; font-size: 0.8rem; text-transform: uppercase; margin-bottom: 5px;">Position & Zoom adjustment</h5>
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="font-size: 0.7rem; color: #9e8070; width: 60px;">Zoom</label>
            <input type="range" id="crop-zoom" min="1" max="2.5" step="0.05" value="${data.photoScale || 1}" oninput="updateCropPreview()" style="flex-grow: 1; accent-color: var(--color-gold);">
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="font-size: 0.7rem; color: #9e8070; width: 60px;">Pan X</label>
            <input type="range" id="crop-x" min="0" max="100" step="1" value="${data.photoX || 50}" oninput="updateCropPreview()" style="flex-grow: 1; accent-color: var(--color-gold);">
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="font-size: 0.7rem; color: #9e8070; width: 60px;">Pan Y</label>
            <input type="range" id="crop-y" min="0" max="100" step="1" value="${data.photoY || 50}" oninput="updateCropPreview()" style="flex-grow: 1; accent-color: var(--color-gold);">
          </div>
        </div>
      </div>
    `;
  }
  else if (section === 'users') {
    html = `
      <div class="input-group">
        <label>Username *</label>
        <input type="text" id="u-username" value="${data.username || ''}" required placeholder="e.g. janesmith" style="font-size:1.1rem; font-weight:600;" ${recordId ? 'readonly' : ''}>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Password *</label>
          <input type="text" id="u-password" value="${data.password || ''}" required placeholder="e.g. pass123">
        </div>
        <div class="input-group">
          <label>Full Name / Publisher Label *</label>
          <input type="text" id="u-label" value="${data.label || ''}" required placeholder="e.g. Leo Jane Smith">
        </div>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>User Role *</label>
          <select id="u-role">
            <option value="blog_editor" ${data.role === 'blog_editor' ? 'selected' : ''}>Blog Publisher (blog_editor)</option>
          </select>
        </div>
      </div>
    `;
  }

  html += `
    <div class="modal-footer-btns">
      <button type="button" class="btn-secondary" onclick="closeEditorModal()" style="margin-right:10px;">Cancel</button>
      <button type="submit" class="btn-primary">Save Changes</button>
    </div>
  `;

  form.innerHTML = html;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeEditorModal() {
  const modal = document.getElementById('editor-modal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

function cacheFile(input, key) {
  if (input.files && input.files[0]) {
    compressImage(input.files[0], (base64) => {
      editorImageCache[key] = base64;
      
      const previewImg = document.getElementById('crop-preview-img');
      const widget = document.getElementById('image-adjust-widget');
      if (previewImg && widget) {
        previewImg.src = base64;
        widget.style.display = 'flex';
      }
    });
  }
}

function updateCropPreview() {
  const img = document.getElementById('crop-preview-img');
  const zoom = document.getElementById('crop-zoom').value;
  const x = document.getElementById('crop-x').value;
  const y = document.getElementById('crop-y').value;
  if (img) {
    img.style.transform = `scale(${zoom})`;
    img.style.objectPosition = `${x}% ${y}%`;
  }
}

// ── SAVE AND UPDATE LOGIC ──────────────────────────────────

function handleEditorSubmit(e) {
  e.preventDefault();
  
  const section = editorActiveSection;
  const recordId = editingRecordId;

  let key = '';
  if (section === 'council') key = STORAGE_KEYS.COUNCIL;
  if (section === 'projects') key = STORAGE_KEYS.PROJECTS;
  if (section === 'presidents') key = STORAGE_KEYS.PRESIDENTS;
  if (section === 'clubs') key = STORAGE_KEYS.CLUBS;
  if (section === 'governors') key = STORAGE_KEYS.GOVERNORS;
  if (section === 'blogs') key = STORAGE_KEYS.BLOGS;
  if (section === 'users') key = STORAGE_KEYS.USERS;

  const records = getCollection(key);

  if (section === 'council') {
    const cropZoom = document.getElementById('crop-zoom');
    const cropX = document.getElementById('crop-x');
    const cropY = document.getElementById('crop-y');
    const record = {
      id: recordId || `c-${Date.now()}`,
      name: document.getElementById('c-name').value.trim(),
      role: document.getElementById('c-role').value.trim(),
      tag: document.getElementById('c-tag').value.trim(),
      type: document.getElementById('c-type').value,
      status: document.getElementById('c-status').value,
      year: document.getElementById('c-year').value,
      displayOrder: parseInt(document.getElementById('c-order').value),
      icon: 'fa-user',
      photoScale: cropZoom ? parseFloat(cropZoom.value) : 1,
      photoX: cropX ? parseInt(cropX.value) : 50,
      photoY: cropY ? parseInt(cropY.value) : 50
    };
    
    // Manage image persistence
    if (editorImageCache['photo']) {
      record.photo = editorImageCache['photo'];
    } else if (recordId) {
      const old = records.find(r => r.id === recordId);
      record.photo = old ? old.photo : null;
    } else {
      record.photo = null;
    }

    if (recordId) {
      const idx = records.findIndex(r => r.id === recordId);
      records[idx] = record;
      logActivity(`Updated Council Officer: ${record.name}`);
    } else {
      records.push(record);
      logActivity(`Added Council Officer: ${record.name}`);
    }
  } 
  else if (section === 'projects') {
    const record = {
      id: recordId || `p-${Date.now()}`,
      title: document.getElementById('p-title').value.trim(),
      category: document.getElementById('p-category').value,
      chairperson: document.getElementById('p-chair').value.trim(),
      organizingCommittee: document.getElementById('p-committee').value.trim(),
      desc: document.getElementById('p-desc').value.trim(),
      objectives: document.getElementById('p-objectives').value.trim(),
      date: document.getElementById('p-date').value,
      time: document.getElementById('p-time').value.trim(),
      venue: document.getElementById('p-venue').value.trim(),
      status: document.getElementById('p-status').value,
      publicationStatus: document.getElementById('p-pubstatus').value,
      displayOrder: parseInt(document.getElementById('p-order').value),
      registrationLink: document.getElementById('p-reglink').value.trim(),
      reportLink: document.getElementById('p-replink').value.trim(),
      partnerOrganizations: document.getElementById('p-partners').value.trim()
    };

    if (editorImageCache['cover']) {
      record.coverImage = editorImageCache['cover'];
    } else if (recordId) {
      const old = records.find(r => r.id === recordId);
      record.coverImage = old ? old.coverImage : null;
    } else {
      record.coverImage = null;
    }

    if (recordId) {
      const idx = records.findIndex(r => r.id === recordId);
      records[idx] = record;
      logActivity(`Updated Project: ${record.title}`);
    } else {
      records.push(record);
      logActivity(`Added Project: ${record.title}`);
    }
  } 
  else if (section === 'presidents') {
    const cropZoom = document.getElementById('crop-zoom');
    const cropX = document.getElementById('crop-x');
    const cropY = document.getElementById('crop-y');
    const record = {
      id: recordId || `pr-${Date.now()}`,
      name: document.getElementById('pr-name').value.trim(),
      clubName: document.getElementById('pr-club').value.trim(),
      position: document.getElementById('pr-pos').value.trim(),
      year: document.getElementById('pr-year').value,
      region: document.getElementById('pr-region').value.trim(),
      phone: document.getElementById('pr-phone').value.trim(),
      email: document.getElementById('pr-email').value.trim(),
      bio: document.getElementById('pr-bio').value.trim(),
      status: document.getElementById('pr-status').value,
      displayOrder: parseInt(document.getElementById('pr-order').value),
      photoScale: cropZoom ? parseFloat(cropZoom.value) : 1,
      photoX: cropX ? parseInt(cropX.value) : 50,
      photoY: cropY ? parseInt(cropY.value) : 50
    };

    if (editorImageCache['photo']) {
      record.photo = editorImageCache['photo'];
    } else if (recordId) {
      const old = records.find(r => r.id === recordId);
      record.photo = old ? old.photo : null;
    } else {
      record.photo = null;
    }

    if (recordId) {
      const idx = records.findIndex(r => r.id === recordId);
      records[idx] = record;
      logActivity(`Updated President: ${record.name}`);
    } else {
      records.push(record);
      logActivity(`Added President: ${record.name}`);
    }
  } 
  else if (section === 'clubs') {
    const record = {
      id: recordId || `cl-${Date.now()}`,
      name: document.getElementById('cl-name').value.trim(),
      sponsor: document.getElementById('cl-sponsor').value.trim(),
      region: document.getElementById('cl-region').value.trim(),
      charteredDate: document.getElementById('cl-charter').value,
      president: document.getElementById('cl-pres').value.trim(),
      secretary: document.getElementById('cl-sec').value.trim(),
      treasurer: document.getElementById('cl-treas').value.trim(),
      advisor: document.getElementById('cl-advisor').value.trim(),
      email: document.getElementById('cl-email').value.trim(),
      phone: document.getElementById('cl-phone').value.trim(),
      desc: document.getElementById('cl-desc').value.trim(),
      members: parseInt(document.getElementById('cl-members').value),
      displayOrder: parseInt(document.getElementById('cl-order').value),
      status: document.getElementById('cl-status').value
    };

    // Handle logo base64 uploader cache
    if (editorImageCache['logo']) {
      record.logo = editorImageCache['logo'];
    } else if (recordId) {
      const old = records.find(r => r.id === recordId);
      record.logo = old ? old.logo : null;
    } else {
      record.logo = null;
    }

    // Handle banner base64 uploader cache
    if (editorImageCache['banner']) {
      record.banner = editorImageCache['banner'];
    } else if (recordId) {
      const old = records.find(r => r.id === recordId);
      record.banner = old ? old.banner : null;
    } else {
      record.banner = null;
    }

    if (recordId) {
      const idx = records.findIndex(r => r.id === recordId);
      records[idx] = record;
      logActivity(`Updated Club: ${record.name}`);
    } else {
      records.push(record);
      logActivity(`Added Club: ${record.name}`);
    }
  }
  else if (section === 'governors') {
    const cropZoom = document.getElementById('crop-zoom');
    const cropX = document.getElementById('crop-x');
    const cropY = document.getElementById('crop-y');
    const record = {
      id: recordId || `gov-${Date.now()}`,
      name: document.getElementById('g-name').value.trim(),
      year: document.getElementById('g-year').value.trim(),
      theme: document.getElementById('g-theme').value.trim(),
      logo: document.getElementById('g-logo').value.trim(),
      achievement: document.getElementById('g-achievement').value.trim(),
      displayOrder: parseInt(document.getElementById('g-order').value),
      status: document.getElementById('g-status').value,
      photoScale: cropZoom ? parseFloat(cropZoom.value) : 1,
      photoX: cropX ? parseInt(cropX.value) : 50,
      photoY: cropY ? parseInt(cropY.value) : 50
    };

    if (editorImageCache['photo']) {
      record.photo = editorImageCache['photo'];
    } else if (recordId) {
      const old = records.find(r => r.id === recordId);
      record.photo = old ? old.photo : null;
    } else {
      record.photo = null;
    }

    if (recordId) {
      const idx = records.findIndex(r => r.id === recordId);
      records[idx] = record;
      logActivity(`Updated Past President: ${record.name}`);
    } else {
      records.push(record);
      logActivity(`Added Past President: ${record.name}`);
    }
  }
  else if (section === 'blogs') {
    const cropZoom = document.getElementById('crop-zoom');
    const cropX = document.getElementById('crop-x');
    const cropY = document.getElementById('crop-y');
    const record = {
      id: recordId || `blog-${Date.now()}`,
      title: document.getElementById('b-title').value.trim(),
      author: document.getElementById('b-author').value.trim(),
      date: document.getElementById('b-date').value,
      content: document.getElementById('b-content').value.trim(),
      displayOrder: parseInt(document.getElementById('b-order').value),
      status: document.getElementById('b-status').value,
      photoScale: cropZoom ? parseFloat(cropZoom.value) : 1,
      photoX: cropX ? parseInt(cropX.value) : 50,
      photoY: cropY ? parseInt(cropY.value) : 50
    };

    if (editorImageCache['photo']) {
      record.photo = editorImageCache['photo'];
    } else if (recordId) {
      const old = records.find(r => r.id === recordId);
      record.photo = old ? old.photo : null;
    } else {
      record.photo = null;
    }

    if (recordId) {
      const idx = records.findIndex(r => r.id === recordId);
      records[idx] = record;
      logActivity(`Updated blog post: ${record.title}`);
    } else {
      records.push(record);
      logActivity(`Added blog post: ${record.title}`);
    }
  }
  else if (section === 'users') {
    const usernameInput = document.getElementById('u-username').value.trim();
    const passwordInput = document.getElementById('u-password').value.trim();
    const labelInput = document.getElementById('u-label').value.trim();
    const roleInput = document.getElementById('u-role').value;

    const record = {
      id: recordId || `user-${Date.now()}`,
      username: usernameInput,
      password: passwordInput,
      label: labelInput,
      role: roleInput
    };

    // If adding a new user, make sure username is unique (case-insensitive) and not in default admins
    if (!recordId) {
      const lower = usernameInput.toLowerCase();
      if (DEFAULT_USERS[lower]) {
        alert('Validation Error: This username matches a built-in admin account.');
        return;
      }
      const existing = records.find(u => u.username.toLowerCase() === lower);
      if (existing) {
        alert('Validation Error: This username is already registered.');
        return;
      }
    }

    if (recordId) {
      const idx = records.findIndex(r => r.id === recordId);
      records[idx] = record;
      logActivity(`Updated user account: ${record.username}`);
    } else {
      records.push(record);
      logActivity(`Registered new user account: ${record.username}`);
    }
  }

  saveCollection(key, records);
  closeEditorModal();
  renderAdminDashboard(); // Refresh panels
}

function editRecord(section, recordId) {
  openEditorModal(section, recordId);
}

function deleteRecord(section, recordId) {
  // Validate RBAC privileges
  if (currentUser.role === 'vieweradmin') {
    alert('Security Exception: Viewer Admin has read-only access. Actions blocked.');
    return;
  }
  if (section !== 'blogs' && currentUser.role === 'blog_editor') {
    alert('Security Violation: Blog Editors are restricted to managing blog posts.');
    return;
  }
  if (section === 'users' && (!currentUser || currentUser.role !== 'superadmin')) {
    alert('Access Denied: Only Super Admin can register or modify user accounts.');
    return;
  }
  if (!checkPermission('delete')) {
    alert('Security Exception: Content Admins and District Admins do not possess deletion privileges.');
    return;
  }

  if (!confirm(`Are you sure you want to permanently delete this record?`)) return;

  let key = '';
  if (section === 'council') key = STORAGE_KEYS.COUNCIL;
  if (section === 'projects') key = STORAGE_KEYS.PROJECTS;
  if (section === 'presidents') key = STORAGE_KEYS.PRESIDENTS;
  if (section === 'clubs') key = STORAGE_KEYS.CLUBS;
  if (section === 'governors') key = STORAGE_KEYS.GOVERNORS;
  if (section === 'blogs') key = STORAGE_KEYS.BLOGS;
  if (section === 'users') key = STORAGE_KEYS.USERS;

  let records = getCollection(key);
  const target = records.find(r => r.id === recordId);
  records = records.filter(r => r.id !== recordId);
  
  saveCollection(key, records);
  logActivity(`Deleted ${section} record: ${target ? (target.name || target.title) : recordId}`);
  renderAdminDashboard();
}

// ── REORDER / SORTING SWAP MECHANISM ───────────────────────

function swapOrder(section, recordId, direction) {
  if (currentUser.role === 'vieweradmin') {
    alert('Security Exception: Viewer Admin cannot reorder records.');
    return;
  }
  if (section !== 'blogs' && currentUser.role === 'blog_editor') {
    alert('Security Violation: Blog Editors are restricted to managing blog posts.');
    return;
  }
  if (section === 'users') {
    alert('Invalid Action: User accounts cannot be sorted.');
    return;
  }

  let key = '';
  if (section === 'council') key = STORAGE_KEYS.COUNCIL;
  if (section === 'projects') key = STORAGE_KEYS.PROJECTS;
  if (section === 'presidents') key = STORAGE_KEYS.PRESIDENTS;
  if (section === 'clubs') key = STORAGE_KEYS.CLUBS;
  if (section === 'governors') key = STORAGE_KEYS.GOVERNORS;
  if (section === 'blogs') key = STORAGE_KEYS.BLOGS;

  const records = getCollection(key);
  records.sort((a,b) => a.displayOrder - b.displayOrder);
  
  const idx = records.findIndex(r => r.id === recordId);
  if (idx === -1) return;

  const targetIdx = idx + direction;
  if (targetIdx < 0 || targetIdx >= records.length) return; // Out of bounds

  // Swap displayOrder values
  const temp = records[idx].displayOrder;
  records[idx].displayOrder = records[targetIdx].displayOrder;
  records[targetIdx].displayOrder = temp;

  saveCollection(key, records);
  logActivity(`Swapped display order priority of ${section} records.`);
  renderAdminDashboard();
}

// ── 3-D GLASS CARDS INTERACTIVE TILT ────────────────────────

function setupCardTilt(gridId) {
  document.querySelectorAll(`#${gridId} .profile-card-3d`).forEach(card => {
    if (card._tilt) return;
    card._tilt = true;
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
      const dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
      card.style.transform = `perspective(900px) rotateX(${-dy*9}deg) rotateY(${dx*9}deg) scale3d(1.04,1.04,1.04)`;
      const shine = card.querySelector('.card-shine');
      if (shine) {
        shine.style.opacity = '1';
        shine.style.background = `radial-gradient(circle at ${(dx+1)*50}% ${(dy+1)*50}%, rgba(255,255,255,0.18) 0%, transparent 65%)`;
      }
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
      const shine = card.querySelector('.card-shine');
      if (shine) shine.style.opacity = '0';
    });
  });
}

// ── METRIC COUNTERS ANIMATIONS ──────────────────────────────

function runCounters() {
  const elements = [
    { id: 'count-members', target: 1200 },
    { id: 'count-clubs', target: 42 },
    { id: 'count-projects', target: 68 }
  ];

  elements.forEach(item => {
    const el = document.getElementById(item.id);
    if (!el) return;
    let count = 0;
    const duration = 1200; // ms
    const stepTime = Math.max(Math.floor(duration / item.target), 15);
    const timer = setInterval(() => {
      count += Math.ceil(item.target / 60);
      if (count >= item.target) {
        el.innerText = item.target.toLocaleString() + '+';
        clearInterval(timer);
      } else {
        el.innerText = count.toLocaleString();
      }
    }, stepTime);
  });
}

// ── SCROLL REVEAL UTILITIES ─────────────────────────────────

const revealElements = () => {
  const elements = document.querySelectorAll('.reveal');
  const windowHeight = window.innerHeight;
  elements.forEach(el => {
    const elementTop = el.getBoundingClientRect().top;
    const revealPoint = 80;
    if (elementTop < windowHeight - revealPoint) {
      el.classList.add('active');
    }
  });
};

// ── NEWSLETTER SUBSCRIPTIONS ────────────────────────────────

function subscribeNewsletter() {
  const email = document.getElementById('hero-email').value;
  if (!email || !email.includes('@')) {
    alert("Please enter a valid email address.");
    return;
  }
  alert(`Thank you! ${email} has been registered to receive live District 306 updates.`);
  document.getElementById('hero-email').value = '';
}

function subscribeNewsletterFooter() {
  const email = document.getElementById('footer-newsletter-email').value;
  if (!email || !email.includes('@')) {
    alert("Please enter a valid email address.");
    return;
  }
  alert(`Thank you! ${email} has been registered to receive live District 306 updates.`);
  document.getElementById('footer-newsletter-email').value = '';
}

function createAmbientParticles() {
  const containers = document.querySelectorAll('.page-view');
  containers.forEach(container => {
    if (container.querySelector('.ambient-particles-container')) return;

    const particleWrapper = document.createElement('div');
    particleWrapper.className = 'ambient-particles-container';
    particleWrapper.style.position = 'absolute';
    particleWrapper.style.top = '0';
    particleWrapper.style.left = '0';
    particleWrapper.style.width = '100%';
    particleWrapper.style.height = '100%';
    particleWrapper.style.overflow = 'hidden';
    particleWrapper.style.pointerEvents = 'none';
    particleWrapper.style.zIndex = '0';
    container.appendChild(particleWrapper);

    const particleCount = 25;
    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement('div');
      p.className = 'ambient-particle';
      
      const size = 1 + Math.random() * 3;
      const drift = -80 + Math.random() * 160;
      const isGold = Math.random() > 0.4;
      const color = isGold ? 'rgba(234, 170, 0, 0.85)' : 'rgba(118, 35, 47, 0.9)';
      const shadow = isGold ? '0 0 8px rgba(234, 170, 0, 0.8)' : '0 0 8px rgba(118, 35, 47, 0.8)';
      
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.background = color;
      p.style.boxShadow = shadow;
      p.style.setProperty('--drift', `${drift}px`);
      p.style.left = `${Math.random() * 100}%`;
      p.style.bottom = `${Math.random() * 20}%`;
      p.style.animationDelay = `${Math.random() * 4}s`;
      p.style.animationDuration = `${3 + Math.random() * 5}s`;
      
      particleWrapper.appendChild(p);
    }
  });
}

// ── INITIALIZATION ──────────────────────────────────────────

window.addEventListener('DOMContentLoaded', () => {
  initDatabase();
  checkActiveSession();
  createAmbientParticles();

  // Mouse tilt tracking for 3D Mythical Crest
  const heroCrest = document.getElementById('hero-mythical-crest');
  if (heroCrest) {
    heroCrest.addEventListener('mousemove', (e) => {
      const rect = heroCrest.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const tiltX = -(y / (rect.height / 2)) * 25;
      const tiltY = (x / (rect.width / 2)) * 25;
      heroCrest.style.animation = 'none';
      heroCrest.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.05)`;
    });
    heroCrest.addEventListener('mouseleave', () => {
      heroCrest.style.animation = 'crest-float 6s infinite alternate ease-in-out';
      heroCrest.style.transform = '';
    });
  }

  // Load and render public dynamic blocks
  renderPublicCouncil();
  renderPublicProjects();
  renderPublicPresidents();
  renderPublicClubs();
  renderPublicGovernors();

  // Resize align listeners
  window.addEventListener('resize', () => {
    const activeLink = document.querySelector('.nav-link.active');
    if (activeLink) alignIndicator(activeLink);
  });

  window.addEventListener('scroll', () => {
    const header = document.getElementById('main-header');
    if (window.scrollY > 40) {
      header.classList.add('shrink');
    } else {
      header.classList.remove('shrink');
    }
    revealElements();
  });

  // Mobile menu listener
  const mobToggle = document.getElementById('mobile-toggle');
  if (mobToggle) {
    mobToggle.addEventListener('click', () => {
      const navMenu = document.getElementById('nav-menu');
      const icon = mobToggle.firstElementChild;
      if (navMenu && icon) {
        if (navMenu.classList.contains('open')) {
          navMenu.classList.remove('open');
          icon.className = 'fa-solid fa-bars';
        } else {
          navMenu.classList.add('open');
          icon.className = 'fa-solid fa-xmark';
        }
      }
    });
  }

  // Initial alignments
  const activeLink = document.querySelector('.nav-link.active');
  if (activeLink) {
    setTimeout(() => alignIndicator(activeLink), 150);
  }
  runCounters();
  setTimeout(revealElements, 200);
});

// ── PUBLIC BLOG & LOGIN PAGE FUNCTIONS ─────────────────────

function renderPublicBlogs() {
  const container = document.getElementById('blogs-container');
  if (!container) return;
  container.innerHTML = '';

  const q = document.getElementById('blog-search').value.toLowerCase().trim();
  let list = getCollection(STORAGE_KEYS.BLOGS).filter(b => b.status === 'Active');

  // Sort by order ascending
  list.sort((a,b) => a.displayOrder - b.displayOrder);

  if (q) {
    list = list.filter(b => 
      b.title.toLowerCase().includes(q) || 
      b.author.toLowerCase().includes(q) || 
      b.content.toLowerCase().includes(q)
    );
  }

  if (list.length === 0) {
    container.innerHTML = `<div class="no-results glass-panel" style="grid-column: 1/-1; padding: 40px; text-align: center;"><i class="fa-solid fa-face-frown" style="font-size: 2rem; color: var(--color-gold); margin-bottom: 10px; display: block;"></i> No blog posts matched your search.</div>`;
    return;
  }

  list.forEach(blog => {
    const card = document.createElement('article');
    card.className = 'blog-card glass-panel reveal';
    card.style.cssText = `
      display: flex;
      flex-direction: column;
      border-radius: 20px;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.06);
      background: rgba(255,255,255,0.01);
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    `;

    // Hover styles
    card.onmouseover = () => {
      card.style.transform = 'translateY(-5px)';
      card.style.borderColor = 'rgba(234,170,0,0.3)';
      card.style.background = 'rgba(255,255,255,0.02)';
    };
    card.onmouseout = () => {
      card.style.transform = 'translateY(0)';
      card.style.borderColor = 'rgba(255,255,255,0.06)';
      card.style.background = 'rgba(255,255,255,0.01)';
    };

    const photoStyle = `style="width: 100%; height: 100%; object-fit: cover; transform: scale(${blog.photoScale || 1}); object-position: ${blog.photoX || 50}% ${blog.photoY || 50}%;"`;
    const coverImg = blog.photo 
      ? `<img src="${blog.photo}" ${photoStyle}>`
      : `<div class="profile-icon-fallback" style="width:100%; height:100%; font-size:2.5rem; display:flex; align-items:center; justify-content:center; color:rgba(234,170,0,0.4);"><i class="fa-solid fa-blog"></i></div>`;

    const cleanPreview = blog.content.substring(0, 140) + (blog.content.length > 140 ? '...' : '');

    card.innerHTML = `
      <div class="blog-cover-wrapper" style="width: 100%; height: 200px; overflow: hidden; position: relative; background: rgba(0,0,0,0.3); border-bottom: 1px solid rgba(255,255,255,0.06);">
        ${coverImg}
      </div>
      <div class="blog-info-content" style="padding: 24px; display: flex; flex-direction: column; flex-grow: 1; gap: 12px;">
        <div class="blog-meta-row" style="display: flex; justify-content: space-between; font-size: 0.78rem; color: #9e8070;">
          <span><i class="fa-solid fa-calendar-day" style="margin-right: 5px;"></i> ${blog.date}</span>
          <span><i class="fa-solid fa-user-pen" style="margin-right: 5px;"></i> ${blog.author}</span>
        </div>
        <h3 style="font-family: var(--font-heading); color: #fff; font-size: 1.15rem; line-height: 1.4; margin: 0; font-weight: 600;">${blog.title}</h3>
        <p style="font-size: 0.86rem; color: #bcaaa4; line-height: 1.6; margin: 0; flex-grow: 1;">${cleanPreview}</p>
        <button class="btn-primary" onclick="openBlogDetail('${blog.id}')" style="align-self: flex-start; padding: 8px 16px; font-size: 0.8rem; border-radius: 8px; margin-top: 5px; border:none; cursor:pointer;">Read Article <i class="fa-solid fa-arrow-right" style="margin-left: 5px;"></i></button>
      </div>
    `;
    container.appendChild(card);
  });
  revealElements();
}

function openBlogDetail(blogId) {
  const blogs = getCollection(STORAGE_KEYS.BLOGS);
  const blog = blogs.find(b => b.id === blogId);
  if (!blog) return;

  const modal = document.getElementById('blog-detail-modal');
  const inner = document.getElementById('blog-detail-content');
  if (!modal || !inner) return;

  const photoStyle = `style="width: 100%; height: 100%; object-fit: cover; transform: scale(${blog.photoScale || 1}); object-position: ${blog.photoX || 50}% ${blog.photoY || 50}%;"`;
  const coverImg = blog.photo 
    ? `<div style="width: 100%; height: 320px; overflow: hidden; border-radius: 16px; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.08);"><img src="${blog.photo}" ${photoStyle}></div>`
    : '';

  inner.innerHTML = `
    ${coverImg}
    <div style="display: flex; gap: 15px; font-size: 0.82rem; color: #9e8070; margin-bottom: 12px;">
      <span><i class="fa-solid fa-calendar-day"></i> Published on <strong>${blog.date}</strong></span>
      <span>•</span>
      <span><i class="fa-solid fa-user-pen"></i> By <strong>${blog.author}</strong></span>
    </div>
    <h2 class="gradient-text" style="font-family: var(--font-heading); font-size: 1.8rem; margin: 0 0 20px 0; line-height: 1.3;">${blog.title}</h2>
    <div style="font-size: 0.95rem; color: #d7ccc8; line-height: 1.7; white-space: pre-wrap; margin-top: 15px;">${blog.content}</div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeBlogDetailModal() {
  const modal = document.getElementById('blog-detail-modal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

function handleLoginPageSubmit(e) {
  e.preventDefault();
  const user = document.getElementById('login-page-user').value.trim();
  const pass = document.getElementById('login-page-pass').value.trim();

  let matchedRole = null;
  if (user === 'superadmin' && pass === 'admin123') matchedRole = { username: 'superadmin', label: 'Super Admin', role: 'superadmin' };
  else if (user === 'contentadmin' && pass === 'admin123') matchedRole = { username: 'contentadmin', label: 'Content Admin', role: 'contentadmin' };
  else if (user === 'districtadmin' && pass === 'admin123') matchedRole = { username: 'districtadmin', label: 'District Admin', role: 'districtadmin' };
  else if (user === 'vieweradmin' && pass === 'admin123') matchedRole = { username: 'vieweradmin', label: 'Viewer Admin', role: 'vieweradmin' };
  else {
    const customUsers = getCollection(STORAGE_KEYS.USERS);
    const matched = customUsers.find(u => u.username === user && u.password === pass);
    if (matched) {
      matchedRole = {
        username: matched.username,
        label: matched.label || 'Blog Editor',
        role: matched.role || 'blog_editor'
      };
    }
  }

  if (matchedRole) {
    currentUser = matchedRole;
    sessionStorage.setItem('active_admin_session', JSON.stringify(currentUser));
    logActivity(`Administrator ${currentUser.username} logged in via Login Page.`);
    
    document.getElementById('login-page-user').value = '';
    document.getElementById('login-page-pass').value = '';

    // Update admin view details
    document.getElementById('admin-current-role').innerText = currentUser.label;
    document.getElementById('admin-current-user').innerText = currentUser.username;

    updateHeaderLoginButton();
    alert('Logged in successfully!');
    navigateTo('admin');
  } else {
    alert('Invalid administrative credentials. Access Denied.');
  }
}

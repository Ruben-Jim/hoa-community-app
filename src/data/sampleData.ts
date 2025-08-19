import { 
  BoardMember, 
  Covenant, 
  Fee, 
  Fine, 
  CommunityPost, 
  EmergencyNotification,
  HOAInfo 
} from '../types';

export const hoaInfo: HOAInfo = {
  name: "Sunset Hills HOA",
  address: "123 Community Drive, Anytown, CA 90210",
  phone: "(555) 123-4567",
  email: "info@sunsethillshoa.com",
  website: "www.sunsethillshoa.com",
  officeHours: "Monday-Friday 9:00 AM - 5:00 PM",
  emergencyContact: "(555) 911-0000"
};

export const boardMembers: BoardMember[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    position: 'President',
    email: 'president@sunsethillshoa.com',
    phone: '(555) 123-4568',
    termEnd: '2024-12-31'
  },
  {
    id: '2',
    name: 'Michael Chen',
    position: 'Vice President',
    email: 'vicepresident@sunsethillshoa.com',
    phone: '(555) 123-4569',
    termEnd: '2024-12-31'
  },
  {
    id: '3',
    name: 'Lisa Rodriguez',
    position: 'Treasurer',
    email: 'treasurer@sunsethillshoa.com',
    phone: '(555) 123-4570',
    termEnd: '2024-12-31'
  },
  {
    id: '4',
    name: 'David Thompson',
    position: 'Secretary',
    email: 'secretary@sunsethillshoa.com',
    phone: '(555) 123-4571',
    termEnd: '2024-12-31'
  },
  {
    id: '5',
    name: 'Jennifer Williams',
    position: 'Board Member',
    email: 'board@sunsethillshoa.com',
    phone: '(555) 123-4572',
    termEnd: '2024-12-31'
  }
];

export const covenants: Covenant[] = [
  {
    id: '1',
    title: 'Architectural Guidelines',
    description: 'All exterior modifications must be approved by the architectural committee before work begins.',
    category: 'Architecture',
    lastUpdated: '2024-01-15'
  },
  {
    id: '2',
    title: 'Landscaping Standards',
    description: 'Front yards must be maintained with approved plants and regular watering schedules.',
    category: 'Landscaping',
    lastUpdated: '2024-02-20'
  },
  {
    id: '3',
    title: 'Parking Regulations',
    description: 'No overnight parking on streets. All vehicles must be parked in garages or driveways.',
    category: 'Parking',
    lastUpdated: '2024-03-10'
  },
  {
    id: '4',
    title: 'Pet Policy',
    description: 'Maximum 2 pets per household. All pets must be leashed when outside.',
    category: 'Pets',
    lastUpdated: '2024-01-30'
  },
  {
    id: '5',
    title: 'Noise Ordinance',
    description: 'Quiet hours from 10:00 PM to 7:00 AM. No loud music or construction during these hours.',
    category: 'General',
    lastUpdated: '2024-02-15'
  }
];

export const fees: Fee[] = [
  {
    id: '1',
    name: 'Monthly HOA Dues',
    amount: 250,
    frequency: 'Monthly',
    dueDate: '2024-08-01',
    description: 'Standard monthly HOA assessment',
    isLate: false
  },
  {
    id: '2',
    name: 'Landscape Maintenance',
    amount: 75,
    frequency: 'Monthly',
    dueDate: '2024-08-01',
    description: 'Front yard maintenance service',
    isLate: false
  },
  {
    id: '3',
    name: 'Annual Assessment',
    amount: 500,
    frequency: 'Annually',
    dueDate: '2024-12-31',
    description: 'Annual capital improvement fund',
    isLate: false
  }
];

export const fines: Fine[] = [
  {
    id: '1',
    violation: 'Unauthorized Parking',
    amount: 50,
    dateIssued: '2024-07-15',
    dueDate: '2024-08-15',
    status: 'Pending',
    description: 'Vehicle parked on street overnight'
  },
  {
    id: '2',
    violation: 'Landscaping Violation',
    amount: 100,
    dateIssued: '2024-07-10',
    dueDate: '2024-08-10',
    status: 'Paid',
    description: 'Unapproved plants in front yard'
  }
];

export const communityPosts: CommunityPost[] = [
  {
    id: '1',
    author: 'John Smith',
    title: 'Community Garage Sale This Weekend',
    content: 'Don\'t forget about our annual community garage sale this Saturday from 8 AM to 2 PM. Great opportunity to meet neighbors and find some treasures!',
    timestamp: '2024-07-20T10:30:00Z',
    category: 'Event',
    likes: 15,
    comments: [
      {
        id: '1',
        author: 'Mary Johnson',
        content: 'I\'ll be participating! Looking forward to it.',
        timestamp: '2024-07-20T11:00:00Z'
      }
    ]
  },
  {
    id: '2',
    author: 'Lisa Davis',
    title: 'Lost Cat - Orange Tabby',
    content: 'Our cat Mittens went missing yesterday. She\'s an orange tabby with white paws. Please contact me if you see her.',
    timestamp: '2024-07-19T16:45:00Z',
    category: 'Lost & Found',
    likes: 8,
    comments: [
      {
        id: '2',
        author: 'Tom Wilson',
        content: 'I think I saw a cat matching that description near the park. I\'ll keep an eye out.',
        timestamp: '2024-07-19T17:30:00Z'
      }
    ]
  },
  {
    id: '3',
    author: 'Robert Brown',
    title: 'Pool Maintenance Schedule',
    content: 'The pool will be closed for maintenance next Tuesday and Wednesday. Sorry for the inconvenience.',
    timestamp: '2024-07-18T14:20:00Z',
    category: 'General',
    likes: 12,
    comments: []
  }
];

export const emergencyNotifications: EmergencyNotification[] = [
  {
    id: '1',
    title: 'Suspicious Activity Reported',
    content: 'A resident reported suspicious activity near the east entrance. Please be vigilant and report any unusual behavior to security.',
    type: 'Alert',
    priority: 'High',
    timestamp: '2024-07-20T22:15:00Z',
    isActive: true,
    category: 'Security'
  },
  {
    id: '2',
    title: 'Water Main Break',
    content: 'There is a water main break on Oak Street. Water service may be interrupted for the next 2-3 hours.',
    type: 'Emergency',
    priority: 'Medium',
    timestamp: '2024-07-20T15:30:00Z',
    isActive: true,
    category: 'Maintenance'
  },
  {
    id: '3',
    title: 'Lost Dog - Golden Retriever',
    content: 'A golden retriever named Max was last seen near the community center. Please help us find him.',
    type: 'Info',
    priority: 'Low',
    timestamp: '2024-07-20T12:00:00Z',
    isActive: true,
    category: 'Lost Pet'
  }
]; 
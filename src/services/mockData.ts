import { User } from '../types';

// Generate unique IDs
let idCounter = 1000;
export const generateId = () => `mock_${idCounter++}`;

// Sample data storage
export const mockData = {
  residents: [
    {
      _id: 'mock_1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@example.com',
      phone: '555-0101',
      address: '123 Main St',
      unitNumber: 'A1',
      isResident: true,
      isBoardMember: true,
      isRenter: false,
      isDev: false,
      isActive: true,
      isBlocked: false,
      password: 'demo123',
      profileImage: undefined,
      createdAt: Date.now() - 86400000 * 30,
      updatedAt: Date.now() - 86400000 * 5,
    },
    {
      _id: 'mock_2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.j@example.com',
      phone: '555-0102',
      address: '456 Oak Ave',
      unitNumber: 'B2',
      isResident: true,
      isBoardMember: false,
      isRenter: false,
      isDev: false,
      isActive: true,
      isBlocked: false,
      password: 'demo123',
      profileImage: undefined,
      createdAt: Date.now() - 86400000 * 20,
      updatedAt: Date.now() - 86400000 * 3,
    },
    {
      _id: 'mock_3',
      firstName: 'Mike',
      lastName: 'Davis',
      email: 'mike.davis@example.com',
      phone: '555-0103',
      address: '789 Pine Rd',
      unitNumber: undefined,
      isResident: true,
      isBoardMember: false,
      isRenter: true,
      isDev: false,
      isActive: true,
      isBlocked: false,
      password: 'demo123',
      profileImage: undefined,
      createdAt: Date.now() - 86400000 * 15,
      updatedAt: Date.now() - 86400000 * 1,
    },
  ] as User[],

  boardMembers: [
    {
      _id: 'mock_bm_1',
      name: 'John Smith',
      position: 'President',
      email: 'john.smith@example.com',
      phone: '555-0101',
      bio: 'Serving the community for over 5 years. Committed to transparency and resident engagement.',
      image: undefined,
      termEnd: '2025-12-31',
      createdAt: Date.now() - 86400000 * 180,
      updatedAt: Date.now() - 86400000 * 10,
    },
    {
      _id: 'mock_bm_2',
      name: 'Emily Chen',
      position: 'Vice President',
      email: 'emily.chen@example.com',
      phone: '555-0104',
      bio: 'Focused on community improvement and resident satisfaction.',
      image: undefined,
      termEnd: '2025-12-31',
      createdAt: Date.now() - 86400000 * 150,
      updatedAt: Date.now() - 86400000 * 8,
    },
    {
      _id: 'mock_bm_3',
      name: 'Robert Wilson',
      position: 'Treasurer',
      email: 'robert.w@example.com',
      phone: '555-0105',
      bio: 'Financial expert with 10+ years of experience in community management.',
      image: undefined,
      termEnd: '2025-12-31',
      createdAt: Date.now() - 86400000 * 120,
      updatedAt: Date.now() - 86400000 * 5,
    },
  ],

  communityPosts: [
    {
      _id: 'mock_post_1',
      author: 'Sarah Johnson',
      authorProfileImage: undefined,
      title: 'Community Garden Update',
      content: 'The community garden is looking great this season! We have fresh tomatoes and herbs ready for harvest.',
      category: 'General',
      likes: 12,
      comments: [
        {
          _id: 'mock_comment_1',
          author: 'John Smith',
          authorProfileImage: undefined,
          content: 'Great work everyone!',
          createdAt: Date.now() - 86400000 * 2,
          timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
      ],
      images: [],
      createdAt: Date.now() - 86400000 * 3,
      updatedAt: Date.now() - 86400000 * 3,
    },
    {
      _id: 'mock_post_2',
      author: 'Mike Davis',
      authorProfileImage: undefined,
      title: 'Lost Dog - Please Help!',
      content: 'My golden retriever Max went missing yesterday evening. He\'s friendly and wearing a blue collar. Please contact me if you see him!',
      category: 'Lost & Found',
      likes: 8,
      comments: [],
      images: [],
      createdAt: Date.now() - 86400000 * 1,
      updatedAt: Date.now() - 86400000 * 1,
    },
    {
      _id: 'mock_post_3',
      author: 'Emily Chen',
      authorProfileImage: undefined,
      title: 'Upcoming Community BBQ',
      content: 'Join us this Saturday at 2 PM for our annual community BBQ! Food, games, and fun for the whole family.',
      category: 'Event',
      likes: 25,
      comments: [
        {
          _id: 'mock_comment_2',
          author: 'Sarah Johnson',
          authorProfileImage: undefined,
          content: 'Can\'t wait!',
          createdAt: Date.now() - 86400000 * 0.5,
          timestamp: new Date(Date.now() - 86400000 * 0.5).toISOString(),
        },
      ],
      images: [],
      createdAt: Date.now() - 86400000 * 5,
      updatedAt: Date.now() - 86400000 * 5,
    },
  ],

  polls: [
    {
      _id: 'mock_poll_1',
      title: 'Community Pool Hours Extension',
      description: 'Should we extend pool hours during summer months?',
      options: ['Yes, extend to 10 PM', 'No, keep current hours', 'Extend only on weekends'],
      optionVotes: { 0: 15, 1: 5, 2: 8 },
      totalVotes: 28,
      allowMultipleVotes: false,
      isActive: true,
      winningOption: undefined,
      createdAt: Date.now() - 86400000 * 7,
      updatedAt: Date.now() - 86400000 * 7,
    },
    {
      _id: 'mock_poll_2',
      title: 'Playground Equipment Upgrade',
      description: 'Which equipment should we prioritize?',
      options: ['New swings', 'Climbing structure', 'Both'],
      optionVotes: { 0: 10, 1: 8, 2: 20 },
      totalVotes: 38,
      allowMultipleVotes: true,
      isActive: false,
      winningOption: { indices: [2], isTied: false },
      createdAt: Date.now() - 86400000 * 30,
      updatedAt: Date.now() - 86400000 * 25,
    },
  ],

  notifications: [
    {
      _id: 'mock_notif_1',
      residentId: 'mock_1',
      type: 'Selling',
      listingDate: '2024-12-15',
      closingDate: '2025-01-15',
      realtorInfo: 'Jane Realty - (555) 123-4567',
      newResidentName: 'Tom Anderson',
      isRental: false,
      additionalInfo: 'Moving out of state',
      houseImage: undefined,
      createdBy: 'john.smith@example.com',
      createdAt: Date.now() - 86400000 * 10,
      updatedAt: Date.now() - 86400000 * 10,
    },
  ],

  pets: [
    {
      _id: 'mock_pet_1',
      residentId: 'mock_1',
      residentName: 'John Smith',
      residentAddress: '123 Main St #A1',
      name: 'Buddy',
      image: undefined,
      createdAt: Date.now() - 86400000 * 60,
      updatedAt: Date.now() - 86400000 * 60,
    },
    {
      _id: 'mock_pet_2',
      residentId: 'mock_2',
      residentName: 'Sarah Johnson',
      residentAddress: '456 Oak Ave #B2',
      name: 'Luna',
      image: undefined,
      createdAt: Date.now() - 86400000 * 45,
      updatedAt: Date.now() - 86400000 * 45,
    },
  ],

  covenants: [
    {
      _id: 'mock_cov_1',
      title: 'Architectural Guidelines',
      description: 'All exterior modifications must be approved by the architectural committee before work begins.',
      category: 'Architecture',
      lastUpdated: '2024-01-15',
      pdfUrl: undefined,
      createdAt: Date.now() - 86400000 * 365,
      updatedAt: Date.now() - 86400000 * 30,
    },
    {
      _id: 'mock_cov_2',
      title: 'Pet Policy',
      description: 'All pets must be registered with the HOA. Maximum 2 pets per unit. Dogs must be leashed in common areas.',
      category: 'Pets',
      lastUpdated: '2024-03-20',
      pdfUrl: undefined,
      createdAt: Date.now() - 86400000 * 300,
      updatedAt: Date.now() - 86400000 * 20,
    },
    {
      _id: 'mock_cov_3',
      title: 'Parking Regulations',
      description: 'Residents must park in assigned spaces. Guest parking is available in designated areas only.',
      category: 'Parking',
      lastUpdated: '2024-02-10',
      pdfUrl: undefined,
      createdAt: Date.now() - 86400000 * 250,
      updatedAt: Date.now() - 86400000 * 15,
    },
  ],

  fees: [
    {
      _id: 'mock_fee_1',
      name: 'Monthly HOA Fee',
      amount: 250,
      frequency: 'Monthly' as const,
      dueDate: '2024-12-01',
      description: 'Standard monthly HOA maintenance fee',
      isLate: false,
      createdAt: Date.now() - 86400000 * 60,
      updatedAt: Date.now() - 86400000 * 5,
    },
    {
      _id: 'mock_fee_2',
      name: 'Annual Reserve Fund',
      amount: 500,
      frequency: 'Annually' as const,
      dueDate: '2025-01-15',
      description: 'Annual contribution to reserve fund',
      isLate: false,
      createdAt: Date.now() - 86400000 * 90,
      updatedAt: Date.now() - 86400000 * 10,
    },
  ],

  fines: [
    {
      _id: 'mock_fine_1',
      violation: 'Unapproved Exterior Modification',
      amount: 100,
      dateIssued: '2024-11-15',
      dueDate: '2024-12-15',
      status: 'Pending' as const,
      description: 'Installed satellite dish without approval',
      residentId: 'mock_3',
      createdAt: Date.now() - 86400000 * 15,
      updatedAt: Date.now() - 86400000 * 15,
    },
  ],

  hoaInfo: {
    _id: 'mock_hoa_1',
    name: 'Shelton Springs HOA',
    address: '123 Community Center Dr, Shelton Springs, ST 12345',
    phone: '(555) 987-6543',
    email: 'info@sheltonsprings.homes',
    website: 'https://sheltonsprings.homes',
    officeHours: 'Monday - Friday: 9:00 AM - 5:00 PM',
    emergencyContact: '(555) 911-0000',
    eventText: 'Annual Community BBQ - December 20th, 2:00 PM\nHoliday Decorating Contest - December 15th\nBoard Meeting - Second Tuesday of each month at 7:00 PM',
    createdAt: Date.now() - 86400000 * 365,
    updatedAt: Date.now() - 86400000 * 5,
  },

  emergencyNotifications: [
    {
      _id: 'mock_emergency_1',
      title: 'Water Main Repair',
      content: 'Scheduled water main repair on Main Street tomorrow from 9 AM to 3 PM. Water will be temporarily shut off.',
      type: 'Alert' as const,
      priority: 'Medium' as const,
      isActive: true,
      category: 'Maintenance' as const,
      createdAt: Date.now() - 86400000 * 1,
      updatedAt: Date.now() - 86400000 * 1,
    },
    {
      _id: 'mock_emergency_2',
      title: 'Community Safety Reminder',
      content: 'Please remember to lock your vehicles and report any suspicious activity to security.',
      type: 'Info' as const,
      priority: 'Low' as const,
      isActive: true,
      category: 'Security' as const,
      createdAt: Date.now() - 86400000 * 5,
      updatedAt: Date.now() - 86400000 * 5,
    },
  ],

  documents: [
    {
      _id: 'mock_doc_1',
      title: 'Board Meeting Minutes - November 2024',
      description: 'Minutes from the November board meeting',
      type: 'Minutes' as const,
      fileStorageId: undefined,
      uploadedBy: 'John Smith',
      createdAt: Date.now() - 86400000 * 10,
      updatedAt: Date.now() - 86400000 * 10,
    },
    {
      _id: 'mock_doc_2',
      title: 'Annual Budget 2025',
      description: 'Proposed budget for fiscal year 2025',
      type: 'Financial' as const,
      fileStorageId: undefined,
      uploadedBy: 'Robert Wilson',
      createdAt: Date.now() - 86400000 * 20,
      updatedAt: Date.now() - 86400000 * 20,
    },
  ],
};

// State management for mutations
let state = { ...mockData };

// Reset function to restore initial state
export const resetMockData = () => {
  state = { ...mockData };
};

// Get current state
export const getMockState = () => state;

// Update state
export const updateMockState = (updates: Partial<typeof state>) => {
  state = { ...state, ...updates };
};

// Export state getters
export const getResidents = () => [...state.residents];
export const getBoardMembers = () => [...state.boardMembers];
export const getCommunityPosts = () => [...state.communityPosts];
export const getPolls = () => [...state.polls];
export const getNotifications = () => [...state.notifications];
export const getPets = () => [...state.pets];
export const getCovenants = () => [...state.covenants];
export const getFees = () => [...state.fees];
export const getFines = () => [...state.fines];
export const getHOAInfo = () => state.hoaInfo;
export const getEmergencyNotifications = () => [...state.emergencyNotifications];
export const getDocuments = () => [...state.documents];


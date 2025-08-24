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
    name: "Shelton Spring HOA",
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
  ];
  
  export const covenants: Covenant[] = [
    {
      id: '1',
      title: 'Architectural Guidelines',
      description: 'All exterior modifications must be approved by the architectural committee before work begins.',
      category: 'Architecture',
      lastUpdated: '2024-01-15'
    },
    
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
  ]; 
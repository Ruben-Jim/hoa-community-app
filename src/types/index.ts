export interface BoardMember {
  id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  image?: string;
  termEnd: string;
}

export interface Covenant {
  id: string;
  title: string;
  description: string;
  category: 'Architecture' | 'Landscaping' | 'Parking' | 'Pets' | 'General';
  lastUpdated: string;
  pdfUrl?: string;
}

export interface Fee {
  id: string;
  name: string;
  amount: number;
  frequency: 'Monthly' | 'Quarterly' | 'Annually' | 'One-time';
  dueDate: string;
  description: string;
  isLate: boolean;
}

export interface Fine {
  id: string;
  violation: string;
  amount: number;
  dateIssued: string;
  dueDate: string;
  status: 'Pending' | 'Paid' | 'Overdue';
  description: string;
}

export interface CommunityPost {
  id: string;
  author: string;
  title: string;
  content: string;
  timestamp: string;
  category: 'General' | 'Event' | 'Complaint' | 'Suggestion' | 'Lost & Found';
  likes: number;
  comments: Comment[];
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

export interface EmergencyNotification {
  id: string;
  title: string;
  content: string;
  type: 'Emergency' | 'Alert' | 'Info';
  priority: 'High' | 'Medium' | 'Low';
  timestamp: string;
  isActive: boolean;
  category: 'Security' | 'Maintenance' | 'Event' | 'Lost Pet' | 'Other';
}

export interface HOAInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  officeHours: string;
  emergencyContact: string;
} 
export interface Ticket {
  _id: string;
  requester: string;
  requesterEmail: string;
  requesterPhone: string;
  requesterDepartment: string;
  subject: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  message: string;
  createdAt: string;
  location: string;
  assignedTo?: string;
  lastUpdated?: string;
  comments?: {
    author: string;
    message: string;
    timestamp: string;
  }[];
}
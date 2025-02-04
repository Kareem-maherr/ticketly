export type TicketSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface TicketFormData {
  title: string;
  sender: string;
  location: string;
  date: string;
  time: string;
  quantity: string;
  notes: string;
  severity: TicketSeverity;
  status: string;
  createdAt: any;
  ownerEmail: string;  // Add owner's email
  ownerId: string;     // Add owner's ID
}

export type TicketSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface TicketFormData {
  details: string | number | readonly string[] | undefined;
  title: string;
  sender: string;
  company: string;
  location: string;
  date: string;
  time: string;
  quantity: string;
  notes: string;
  ticketDetails: string;
  severity: TicketSeverity;
  status: string;
  createdAt: any;
  ownerEmail: string;  // Add owner's email
  ownerId: string;     // Add owner's ID
}

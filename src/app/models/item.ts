export interface Item {
  _id: any;
  itemName: string;
  category: string;
  description: string;
  lastSeenLocation: string;
  dateLost: string;
  contactInfo: string;
  image: string | null; // <-- allow null as well
  created_at: string | null;
  username: string;
}

export interface FoundItem {
    _id: any;
    id: number;
    item_name: string;
    category: string;
    description: string;
    found_location: string;
    date_found: string;
    contact_info: string;
    image: string | null; // <-- allow null as well
  }
  
  
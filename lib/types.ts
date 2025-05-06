export type ClientDetails = {
    id: string;
    name: string | null;
    email: string | null;
    status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
    contact: string | null;
    position: string | null;
    phone: string | null;
    address: string | null;
    joinedDate: string;
    businessType: string | null;
    taxId: string | null;
    notes?: string | null;
  };
  export enum SpaceStatus {
    AVAILABLE = "AVAILABLE",
    OCCUPIED = "OCCUPIED",
    MAINTENANCE = "MAINTENANCE",
    RESERVED = "RESERVED",
  }
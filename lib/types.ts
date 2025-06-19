export type ClientDetails = {
    id: string;
    name: string | null;
    email: string | null;
    status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
    contact: string | null;
    position: string | null;
    companyName: string | null;
    phone: string | null;
    address: string | null;
    joinedDate: string;
    businessType: string | null;
    taxId: string | null;
    requirements?: string | null;
    openingBalance: number | null;
    billedAmount: number | null;
    receivedAmount: number | null;
    balanceAmount: number | null;
  };
  export enum SpaceStatus {
    AVAILABLE = "AVAILABLE",
    OCCUPIED = "OCCUPIED",
    MAINTENANCE = "MAINTENANCE",
    RESERVED = "RESERVED",
  }
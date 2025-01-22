export interface ResendContact {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  unsubscribed: boolean;
  created_at: string;
  updated_at: string;
}

export interface GetContactResponse extends ResendContact {}

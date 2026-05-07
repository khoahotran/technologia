export interface ContactRequest {
  name: string;
  email: string;
  phoneNumber?: string;
  company: string;
  message?: string;
}

export interface ContactResponse {
  id: string;
  name: string;
  email: string;
  company: string;
  createdAt: string;
}

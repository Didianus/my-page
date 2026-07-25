export type Project = {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  deployUrl: string;
  tags: string[];
  featured?: boolean;
  order?: number;
  createdAt?: string;
};

export const ADMIN_PIN_STORAGE = "didi_admin_pin";

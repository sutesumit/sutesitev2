export type Blip = {
  id: string;
  blip_serial: string;
  term: string;
  meaning: string;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type BlipInput = {
  term: string;
  meaning: string;
  tags?: string[];
};

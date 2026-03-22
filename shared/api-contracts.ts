export type ByteRecord = {
  id: string;
  content: string;
  created_at: string;
  byte_serial: string;
};

export type BlipRecord = {
  id: string;
  blip_serial: string;
  term: string;
  meaning: string;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type ApiErrorResponse = {
  error: string;
};

export type ApiSuccessResponse<T> = T;

export type ByteListResponse = {
  bytes: ByteRecord[];
};

export type ByteDetailResponse = {
  byte: ByteRecord;
};

export type BlipListResponse = {
  blips: BlipRecord[];
};

export type BlipDetailResponse = {
  blip: BlipRecord;
};

export type DeleteResponse = {
  success: boolean;
};

export interface Meet {
  id: string;
  creator_id: string;
  name: string;
  description: string | null;
  location_name: string | null;
  location_lat: number | null;
  location_lng: number | null;
  date: string;
  time: string | null;
  meet_type: string | null;
  cover_image_url: string | null;
  max_attendees: number | null;
  created_at: string;
}

export interface MeetRsvp {
  id: string;
  meet_id: string;
  user_id: string;
  created_at: string;
}

export interface CreateMeetInput {
  name: string;
  description?: string;
  location_name?: string;
  location_lat?: number;
  location_lng?: number;
  date: string;
  time?: string;
  meet_type?: string;
  cover_image_url?: string;
  max_attendees?: number;
}

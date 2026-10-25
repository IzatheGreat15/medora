
export type Branch = {
  id: string;
  name: string;
  address: string;
  hours: string;
  amenities: string[];
};

export type Service = {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  category: string;
};

export type Doctor = {
  id: string;
  name: string;
  title: string;
  branchIds: string[];
  serviceIds: string[];
  availability: string;
  initials: string;
};

export type PatientDetails = {
  fullName: string;
  email: string;
  phone: string;
  notes: string;
};

export type BookingState = {
  branchId: string;
  serviceId: string;
  doctorId: string;
  date: string;
  time: string;
  patient: PatientDetails;
};


import type { Branch, Doctor, Service } from './types';

export const branches: Branch[] = [
  {
    id: 'cebu',
    name: 'Cebu Branch',
    address: '123 Mango Avenue, Cebu City, Cebu 6000',
    hours: 'Mon–Sat · 8:00 AM–6:00 PM',
    amenities: ['Parking', 'Accessible entrance'],
  },
  {
    id: 'mandaue',
    name: 'Mandaue Branch',
    address: 'A.S. Fortuna Street, Mandaue City, Cebu 6014',
    hours: 'Mon–Sat · 8:00 AM–6:00 PM',
    amenities: ['Parking', 'Public transport nearby'],
  },
  {
    id: 'lapu-lapu',
    name: 'Lapu-Lapu Branch',
    address: 'Mactan Town Center, Lapu-Lapu City, Cebu 6015',
    hours: 'Daily · 9:00 AM–5:00 PM',
    amenities: ['Accessible entrance'],
  },
];

export const services: Service[] = [
  {
    id: 'general',
    name: 'General Consultation',
    description: 'Discuss symptoms, concerns, and general health.',
    durationMinutes: 30,
    price: 800,
    category: 'Consultation',
  },
  {
    id: 'follow-up',
    name: 'Follow-up Consultation',
    description:
      'Review progress, results, or an existing treatment plan.',
    durationMinutes: 20,
    price: 500,
    category: 'Consultation',
  },
  {
    id: 'wellness',
    name: 'Preventive Health Check',
    description:
      'A general wellness review and preventive care guidance.',
    durationMinutes: 45,
    price: 1200,
    category: 'Wellness',
  },
  {
    id: 'skin',
    name: 'Skin Consultation',
    description:
      'Discuss common skin concerns with a doctor.',
    durationMinutes: 30,
    price: 900,
    category: 'Specialist',
  },
];

export const doctors: Doctor[] = [
  {
    id: 'santos',
    name: 'Dr. Maria Santos',
    title: 'General Practitioner',
    branchIds: ['cebu', 'mandaue'],
    serviceIds: ['general', 'follow-up', 'wellness'],
    availability: 'Usually available weekdays',
    initials: 'MS',
  },
  {
    id: 'reyes',
    name: 'Dr. Angela Reyes',
    title: 'Family Medicine',
    branchIds: ['cebu', 'lapu-lapu'],
    serviceIds: ['general', 'follow-up', 'wellness'],
    availability: 'Usually available Mon–Sat',
    initials: 'AR',
  },
  {
    id: 'lim',
    name: 'Dr. Daniel Lim',
    title: 'Dermatology',
    branchIds: ['mandaue', 'lapu-lapu'],
    serviceIds: ['skin', 'follow-up'],
    availability: 'Usually available Tue–Sat',
    initials: 'DL',
  },
];

export const appointmentTimes = [
  '8:30 AM',
  '9:00 AM',
  '9:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '1:00 PM',
  '1:30 PM',
  '2:00 PM',
  '2:30 PM',
  '3:00 PM',
  '3:30 PM',
];

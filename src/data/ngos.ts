// List of Pet NGOs in India
export interface PetNGO {
  id: string;
  name: string;
  description: string;
  location: string;
  state: string;
  contact: string;
  email?: string;
  website?: string;
  services: string[];
  image: string;
}

export const petNGOs: PetNGO[] = [
  {
    id: 'ngo-1',
    name: 'People For Animals (PFA)',
    description: 'India\'s largest animal welfare organization working for animal rights and protection.',
    location: 'New Delhi',
    state: 'Delhi',
    contact: '+91 11 2337 8251',
    email: 'info@peopleforanimalsindia.org',
    website: 'https://peopleforanimalsindia.org',
    services: ['Rescue', 'Shelter', 'Adoption', 'Medical Care', 'Sterilization'],
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400',
  },
  {
    id: 'ngo-2',
    name: 'Blue Cross of India',
    description: 'Pioneer animal welfare organization providing rescue, shelter and adoption services.',
    location: 'Chennai',
    state: 'Tamil Nadu',
    contact: '+91 44 2235 4959',
    email: 'info@bluecrossofindia.org',
    website: 'https://www.bluecrossofindia.org',
    services: ['Rescue', 'Shelter', 'Adoption', 'Veterinary Care', 'Ambulance'],
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
  },
  {
    id: 'ngo-3',
    name: 'Wildlife SOS',
    description: 'Rescuing and rehabilitating wildlife including stray dogs and cats in distress.',
    location: 'Agra',
    state: 'Uttar Pradesh',
    contact: '+91 9917109666',
    email: 'info@wildlifesos.org',
    website: 'https://wildlifesos.org',
    services: ['Wildlife Rescue', 'Rehabilitation', 'Conservation'],
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400',
  },
  {
    id: 'ngo-4',
    name: 'CUPA (Compassion Unlimited Plus Action)',
    description: 'Bangalore-based organization dedicated to protecting and caring for animals.',
    location: 'Bangalore',
    state: 'Karnataka',
    contact: '+91 80 2535 5136',
    email: 'cupabangalore@gmail.com',
    website: 'https://www.cupabangalore.org',
    services: ['Rescue', 'Shelter', 'Adoption', 'Sterilization', 'Rehabilitation'],
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400',
  },
  {
    id: 'ngo-5',
    name: 'Sanjay Gandhi Animal Care Centre',
    description: 'One of Asia\'s largest animal shelters providing comprehensive care.',
    location: 'New Delhi',
    state: 'Delhi',
    contact: '+91 11 2693 4060',
    email: 'info@sgacc.org.in',
    website: 'https://sgacc.org.in',
    services: ['Shelter', 'Medical Care', 'Adoption', 'Emergency Services'],
    image: 'https://images.unsplash.com/photo-1601758124096-1fd661873b95?w=400',
  },
  {
    id: 'ngo-6',
    name: 'In Defence of Animals India',
    description: 'Working to protect animals through education, legislation and investigation.',
    location: 'Mumbai',
    state: 'Maharashtra',
    contact: '+91 22 2288 6071',
    email: 'ida.india@vsnl.net',
    services: ['Rescue', 'Advocacy', 'Education', 'Veterinary Camps'],
    image: 'https://images.unsplash.com/photo-1544568100-847a948585b9?w=400',
  },
  {
    id: 'ngo-7',
    name: 'Animal Aid Unlimited',
    description: 'Rescue center for street animals offering treatment and rehabilitation.',
    location: 'Udaipur',
    state: 'Rajasthan',
    contact: '+91 294 2460265',
    email: 'info@animalaidunlimited.org',
    website: 'https://www.animalaidunlimited.org',
    services: ['Rescue', 'Treatment', 'Rehabilitation', 'Sanctuary'],
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
  },
  {
    id: 'ngo-8',
    name: 'Red Paws Rescue',
    description: 'Volunteer-run rescue organization for abandoned and injured pets.',
    location: 'Hyderabad',
    state: 'Telangana',
    contact: '+91 9100099890',
    email: 'redpawsrescue@gmail.com',
    services: ['Rescue', 'Foster Care', 'Adoption', 'Vaccination'],
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400',
  },
  {
    id: 'ngo-9',
    name: 'Thane SPCA',
    description: 'Society for Prevention of Cruelty to Animals, serving Thane district.',
    location: 'Thane',
    state: 'Maharashtra',
    contact: '+91 22 2534 2725',
    email: 'thanespca@gmail.com',
    services: ['Rescue', 'Shelter', 'Sterilization', 'Adoption'],
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400',
  },
  {
    id: 'ngo-10',
    name: 'Charlie\'s Animal Rescue Centre (CARE)',
    description: 'Dedicated to rescuing and rehabilitating abandoned and injured animals.',
    location: 'Bangalore',
    state: 'Karnataka',
    contact: '+91 9900025370',
    email: 'info@carecharlie.com',
    website: 'https://www.carecharlie.com',
    services: ['Rescue', 'Rehabilitation', 'Adoption', 'Medical Care'],
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400',
  },
  {
    id: 'ngo-11',
    name: 'Friendicoes SECA',
    description: 'Delhi-based animal welfare organization providing rescue and care.',
    location: 'New Delhi',
    state: 'Delhi',
    contact: '+91 11 2435 4372',
    email: 'friendicoesseca@gmail.com',
    website: 'https://friendicoes.org',
    services: ['Rescue', 'Shelter', 'Medical Care', 'Adoption', 'Sterilization'],
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
  },
  {
    id: 'ngo-12',
    name: 'Welfare of Stray Dogs (WSD)',
    description: 'Mumbai-based organization working for stray dog welfare.',
    location: 'Mumbai',
    state: 'Maharashtra',
    contact: '+91 22 6451 5152',
    email: 'info@wsdindia.org',
    website: 'https://www.wsdindia.org',
    services: ['Sterilization', 'Vaccination', 'Rescue', 'Adoption'],
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400',
  },
  {
    id: 'ngo-13',
    name: 'PAWS Mumbai',
    description: 'Plant and Animal Welfare Society working for animal protection.',
    location: 'Mumbai',
    state: 'Maharashtra',
    contact: '+91 9820332222',
    email: 'pawsmumbai@gmail.com',
    services: ['Rescue', 'Foster', 'Adoption', 'Awareness'],
    image: 'https://images.unsplash.com/photo-1544568100-847a948585b9?w=400',
  },
  {
    id: 'ngo-14',
    name: 'Pet Fed Foundation',
    description: 'Working to create a humane world for pets through events and adoption drives.',
    location: 'New Delhi',
    state: 'Delhi',
    contact: '+91 9999888777',
    email: 'info@petfed.org',
    website: 'https://petfed.org',
    services: ['Adoption Drives', 'Pet Events', 'Awareness', 'Community Building'],
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400',
  },
  {
    id: 'ngo-15',
    name: 'Animal Welfare Trust Pune',
    description: 'Pune-based trust dedicated to animal welfare and rescue.',
    location: 'Pune',
    state: 'Maharashtra',
    contact: '+91 20 2566 2345',
    email: 'awtpune@gmail.com',
    services: ['Rescue', 'Shelter', 'Medical Treatment', 'Adoption'],
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
  },
];

export const getStateWiseNGOs = () => {
  const stateMap: Record<string, PetNGO[]> = {};
  petNGOs.forEach(ngo => {
    if (!stateMap[ngo.state]) {
      stateMap[ngo.state] = [];
    }
    stateMap[ngo.state].push(ngo);
  });
  return stateMap;
};

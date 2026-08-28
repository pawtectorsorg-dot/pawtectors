// Pet celebration days with offers
export interface PetDay {
  date: string; // MM-DD format
  name: string;
  description: string;
  discount: number; // percentage
  petType: 'dog' | 'cat' | 'both' | 'all';
}

// Format date for display (e.g., "14 January")
export const formatPetDayDate = (dateStr: string): string => {
  const [month, day] = dateStr.split('-').map(Number);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${day} ${monthNames[month - 1]}`;
};

export const petDays: PetDay[] = [
  // January
  { date: '01-14', name: 'Dress Up Your Pet Day', description: 'Celebrate with stylish pet clothing!', discount: 5, petType: 'both' },
  { date: '01-24', name: 'Change a Pet\'s Life Day', description: 'Adoption focused - special discounts on pet essentials', discount: 5, petType: 'all' },
  
  // February
  { date: '02-14', name: 'Pet Theft Awareness Day', description: 'Safety first for your pets', discount: 5, petType: 'both' },
  { date: '02-20', name: 'Love Your Pet Day', description: 'Show your love with special treats!', discount: 5, petType: 'both' },
  { date: '02-22', name: 'Walking the Dog Day', description: 'Get walking accessories at special prices', discount: 5, petType: 'dog' },
  
  // March
  { date: '03-23', name: 'National Puppy Day', description: 'Celebrate puppies with special offers!', discount: 5, petType: 'dog' },
  
  // April
  { date: '04-04', name: 'World Stray Animals Day', description: 'Help strays with discounted supplies', discount: 5, petType: 'both' },
  { date: '04-27', name: 'World Veterinary Day', description: 'Pet health products at special prices', discount: 5, petType: 'both' },
  { date: '04-30', name: 'Adopt a Shelter Pet Day', description: 'Special offers for new pet parents', discount: 5, petType: 'both' },
  
  // May
  { date: '05-03', name: 'World Pet Press Day', description: 'Celebrating pets worldwide!', discount: 5, petType: 'all' },
  
  // June
  { date: '06-04', name: 'Hug Your Cat Day', description: 'Cat lovers rejoice with special discounts!', discount: 5, petType: 'cat' },
  { date: '06-21', name: 'Dog Party Day', description: 'Party supplies for your pup at special prices!', discount: 5, petType: 'dog' },
  
  // July
  { date: '07-10', name: 'National Kitten Day', description: 'Kitten essentials at discounted prices!', discount: 5, petType: 'cat' },
  { date: '07-15', name: 'Pet Fire Safety Day', description: 'Safety products for your pets', discount: 5, petType: 'both' },
  { date: '07-31', name: 'Mutt Day', description: 'Celebrating mixed-breed dogs!', discount: 5, petType: 'dog' },
  
  // August
  { date: '08-08', name: 'International Cat Day', description: 'Everything for cats at special prices!', discount: 5, petType: 'cat' },
  { date: '08-17', name: 'Black Cat Appreciation Day', description: 'Celebrate black cats with great deals!', discount: 5, petType: 'cat' },
  { date: '08-26', name: 'International Dog Day', description: 'Dog lovers unite with amazing offers!', discount: 5, petType: 'dog' },
  
  // September
  { date: '09-13', name: 'National Pet Memorial Day', description: 'Honor our beloved pets', discount: 5, petType: 'both' },
  { date: '09-28', name: 'World Rabies Day', description: 'Health products for pets at special prices', discount: 5, petType: 'both' },
  
  // October
  { date: '10-01', name: 'International Black Dog Day', description: 'Celebrate black dogs with special offers!', discount: 5, petType: 'dog' },
  { date: '10-04', name: 'World Animal Day', description: 'Major celebration with great discounts!', discount: 5, petType: 'all' },
  
  // November
  { date: '11-01', name: 'National Cook for Your Pets Day', description: 'Pet food and treats at special prices!', discount: 5, petType: 'both' },
  { date: '11-23', name: 'Humane Society Anniversary Day', description: 'Pet welfare discounts!', discount: 5, petType: 'both' },
  
  // December
  { date: '12-02', name: 'International Day of Animal Rights', description: 'Supporting animal rights with special offers', discount: 5, petType: 'both' },
  { date: '12-15', name: 'Cat Herders Day', description: 'Cat community celebration!', discount: 5, petType: 'cat' },
  { date: '12-22', name: 'National Take Your Dog to Work Day', description: 'Dog accessories at special prices!', discount: 5, petType: 'dog' },
];

// Get today's pet day if any (also check within 3 days range)
export const getTodaysPetDay = (): PetDay | null => {
  const today = new Date();
  const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
  const currentDay = String(today.getDate()).padStart(2, '0');
  const todayString = `${currentMonth}-${currentDay}`;
  
  // Check for exact match
  const exactMatch = petDays.find(day => day.date === todayString);
  if (exactMatch) return exactMatch;
  
  // Check within 3 days range
  for (const petDay of petDays) {
    const [month, day] = petDay.date.split('-').map(Number);
    const petDayDate = new Date(today.getFullYear(), month - 1, day);
    const diffTime = petDayDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 0 && diffDays <= 3) {
      return petDay;
    }
  }
  
  return null;
};

// Get upcoming pet days (next 30 days)
export const getUpcomingPetDays = (): PetDay[] => {
  const today = new Date();
  const upcoming: PetDay[] = [];
  
  for (const petDay of petDays) {
    const [month, day] = petDay.date.split('-').map(Number);
    const petDayDate = new Date(today.getFullYear(), month - 1, day);
    
    // If the date has passed this year, check next year
    if (petDayDate < today) {
      petDayDate.setFullYear(petDayDate.getFullYear() + 1);
    }
    
    const diffTime = petDayDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 0 && diffDays <= 30) {
      upcoming.push(petDay);
    }
  }
  
  return upcoming.slice(0, 3);
};

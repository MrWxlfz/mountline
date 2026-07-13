export const knownChains = [
  { name: "PetSmart Pet Grooming Locations", url: "https://www.petsmart.com/grooming/" },
  { name: "Petco Grooming", url: "https://www.petco.com/shop/en/petcostore/s/dog-grooming" },
  { name: "Great Clips Southlake", url: "https://salons.greatclips.com/us/tx/southlake" },
  { name: "Sport Clips Haircuts", url: "https://sportclips.com/" },
  { name: "Supercuts", url: "https://www.supercuts.com/" },
  { name: "Starbucks", url: "https://www.starbucks.com/store-locator" },
  { name: "McDonald's", url: "https://www.mcdonalds.com/" },
  { name: "Subway", url: "https://www.subway.com/" },
  { name: "Jiffy Lube", url: "https://www.jiffylube.com/locations" },
  { name: "Massage Envy", url: "https://www.massageenvy.com/locations" },
]

export const genericEntities = [
  "Mobile Pet Grooming Services in Southlake, TX",
  "Southlake, TX Mobile Auto Detailing",
  "Best Barbers in Keller",
  "Pet Grooming Locations Near Me",
  "Commercial Cleaning Services Dallas",
  "Top 10 Local Businesses in Southlake",
  "Find a Groomer Near Me",
]

export const independentEntities = [
  { name: "Oak & Ember Grooming", url: "https://oakandembergrooming.example", city: "Southlake, TX", industry: "pet grooming" },
  { name: "Paws & Pine Mobile Grooming", url: "https://facebook.com/pawsandpine", city: "Southlake, TX", industry: "pet grooming" },
  { name: "Blacktop & Brass Detailing", url: "https://blacktopbrass.example", city: "Southlake, TX", industry: "auto detailing" },
  { name: "Cedar Line Barber Co.", url: "https://cedarlinebarber.example", city: "Keller, TX", industry: "barber" },
  { name: "North Gate Home Services", url: "https://northgatehomeservices.example", city: "Southlake, TX", industry: "home services" },
]

export const southlakeRegression = {
  location: "Southlake, TX",
  requested: 5,
  badBefore: [
    "PetSmart Pet Grooming Locations",
    "Mobile Pet Grooming Services in Southlake, TX",
    "Southlake, TX Mobile Auto Detailing",
  ],
}

export const mapFirstOpportunities = {
  independentGroomer: {
    name: "Pine & Paws Grooming",
    city: "Keller, TX",
    phone: "(817) 555-0142",
    rating: 4.8,
    reviewCount: 86,
    onlinePresence: "social_only" as const,
    social: "https://facebook.com/pineandpawsgrooming",
    appointmentBased: true,
  },
  independentBarber: {
    name: "Cedar Chair Barber Co.",
    city: "Southlake, TX",
    phone: "(817) 555-0188",
    rating: 4.7,
    reviewCount: 41,
    onlinePresence: "social_only" as const,
    social: "https://instagram.com/cedarchairbarber",
    appointmentBased: true,
  },
  independentCleaner: {
    name: "Clearline Home Cleaning",
    city: "Santa Barbara, CA",
    phone: "(805) 555-0131",
    rating: 4.6,
    reviewCount: 33,
    onlinePresence: "website_weak" as const,
    hasContactForm: false,
    serviceAreaVerified: true,
  },
  independentDetailer: {
    name: "Blacktop & Brass Detailing",
    city: "Southlake, TX",
    phone: "(817) 555-0164",
    rating: 4.9,
    reviewCount: 58,
    onlinePresence: "website_weak" as const,
    verifiedService: "Mobile interior detailing packages",
    hasContactForm: false,
  },
  independentContractor: {
    name: "North Gate Home Services",
    city: "Keller, TX",
    phone: "(817) 555-0176",
    rating: 4.7,
    reviewCount: 47,
    onlinePresence: "directory_only" as const,
    verifiedService: "Residential repair estimates",
    serviceAreaVerified: true,
  },
}

export const mapFirstNegativeFixtures = {
  permanentlyClosed: { name: "Closed Grooming Fixture", businessStatus: "CLOSED_PERMANENTLY" },
  outsideRadius: { name: "Far Away Barber", distanceMiles: 31, requestedRadiusMiles: 10 },
  duplicatePlaceId: "google-place-fixture-123",
  noIdentity: { name: "Pet Grooming Services Near Me" },
}

export const leadQualityFixtures = {
  strongSiteNoOpportunity: { name: "Polished Fixture Studio", onlinePresence: "website_strong" as const, opportunityScore: 34 },
  inactiveBusiness: { name: "Inactive Fixture Shop", businessStatus: "CLOSED_PERMANENTLY" },
  ambiguousIdentity: { name: "Local Services", city: "Keller, TX" },
  lowReviewBusiness: { name: "New Leaf Grooming", rating: 5, reviewCount: 2, onlinePresence: "social_only" as const },
  appointmentSalon: { name: "Juniper Salon", hasBooking: true, onlinePresence: "website_weak" as const },
  cashOnlyObservation: { name: "Fixture Barber", observation: "A cash or check only sign was visible at the counter." },
  facebookFirst: { name: "Pine & Paws Grooming", onlinePresence: "social_only" as const, officialSocialVerified: true },
}

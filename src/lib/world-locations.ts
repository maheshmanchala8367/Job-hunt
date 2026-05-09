/**
 * Comprehensive worldwide city/location list for job search autocomplete.
 * Format: "City, Country" (or "City, State" for US) for clarity.
 * Ordered: Remote/special → US → Canada → Europe → Middle East/Africa
 *         → India → Asia-Pacific → Latin America → Oceania
 */
export const WORLD_LOCATIONS: string[] = [
  // ── Special ───────────────────────────────────────────────────────────────
  'Remote',
  'Remote (Worldwide)',
  'Hybrid',

  // ── United States ─────────────────────────────────────────────────────────
  'United States',
  'New York, NY',
  'San Francisco, CA',
  'Seattle, WA',
  'Austin, TX',
  'Boston, MA',
  'Chicago, IL',
  'Los Angeles, CA',
  'Denver, CO',
  'Atlanta, GA',
  'Miami, FL',
  'Washington, DC',
  'San Jose, CA',
  'Dallas, TX',
  'Houston, TX',
  'Phoenix, AZ',
  'Portland, OR',
  'San Diego, CA',
  'Minneapolis, MN',
  'Detroit, MI',
  'Nashville, TN',
  'Charlotte, NC',
  'Raleigh, NC',
  'Pittsburgh, PA',
  'Philadelphia, PA',
  'Columbus, OH',
  'Cincinnati, OH',
  'Cleveland, OH',
  'Salt Lake City, UT',
  'Las Vegas, NV',
  'Baltimore, MD',
  'Richmond, VA',
  'St. Louis, MO',
  'Kansas City, MO',
  'Indianapolis, IN',
  'Milwaukee, WI',
  'Sacramento, CA',
  'Oakland, CA',
  'Palo Alto, CA',
  'Mountain View, CA',
  'Sunnyvale, CA',
  'Santa Clara, CA',
  'Redmond, WA',
  'Bellevue, WA',
  'Menlo Park, CA',
  'Cupertino, CA',
  'San Mateo, CA',
  'Irvine, CA',
  'Tampa, FL',
  'Orlando, FL',
  'Jacksonville, FL',
  'Boise, ID',
  'Tucson, AZ',
  'Albuquerque, NM',
  'Omaha, NE',
  'Louisville, KY',
  'Birmingham, AL',
  'New Orleans, LA',
  'Providence, RI',
  'Hartford, CT',
  'Buffalo, NY',
  'Rochester, NY',
  'Albany, NY',
  'Honolulu, HI',
  'Anchorage, AK',

  // ── Canada ────────────────────────────────────────────────────────────────
  'Canada',
  'Toronto, Canada',
  'Vancouver, Canada',
  'Montreal, Canada',
  'Calgary, Canada',
  'Ottawa, Canada',
  'Edmonton, Canada',
  'Winnipeg, Canada',
  'Quebec City, Canada',
  'Halifax, Canada',
  'Victoria, Canada',
  'Waterloo, Canada',
  'Kitchener, Canada',
  'Hamilton, Canada',
  'London, Canada',
  'Mississauga, Canada',
  'Brampton, Canada',

  // ── United Kingdom ────────────────────────────────────────────────────────
  'United Kingdom',
  'London, UK',
  'Manchester, UK',
  'Birmingham, UK',
  'Glasgow, UK',
  'Edinburgh, UK',
  'Leeds, UK',
  'Bristol, UK',
  'Liverpool, UK',
  'Sheffield, UK',
  'Cambridge, UK',
  'Oxford, UK',
  'Nottingham, UK',
  'Cardiff, UK',
  'Belfast, UK',
  'Reading, UK',
  'Brighton, UK',
  'Coventry, UK',
  'Newcastle, UK',

  // ── Germany ───────────────────────────────────────────────────────────────
  'Germany',
  'Berlin, Germany',
  'Munich, Germany',
  'Hamburg, Germany',
  'Frankfurt, Germany',
  'Cologne, Germany',
  'Stuttgart, Germany',
  'Düsseldorf, Germany',
  'Leipzig, Germany',
  'Dortmund, Germany',
  'Nuremberg, Germany',
  'Dresden, Germany',
  'Hanover, Germany',
  'Bonn, Germany',
  'Bremen, Germany',
  'Mannheim, Germany',

  // ── France ────────────────────────────────────────────────────────────────
  'France',
  'Paris, France',
  'Lyon, France',
  'Marseille, France',
  'Toulouse, France',
  'Nice, France',
  'Bordeaux, France',
  'Strasbourg, France',
  'Lille, France',
  'Nantes, France',
  'Montpellier, France',
  'Grenoble, France',
  'Sophia Antipolis, France',

  // ── Netherlands ───────────────────────────────────────────────────────────
  'Netherlands',
  'Amsterdam, Netherlands',
  'Rotterdam, Netherlands',
  'The Hague, Netherlands',
  'Utrecht, Netherlands',
  'Eindhoven, Netherlands',
  'Delft, Netherlands',

  // ── Spain ─────────────────────────────────────────────────────────────────
  'Spain',
  'Madrid, Spain',
  'Barcelona, Spain',
  'Valencia, Spain',
  'Seville, Spain',
  'Bilbao, Spain',
  'Zaragoza, Spain',
  'Malaga, Spain',

  // ── Italy ─────────────────────────────────────────────────────────────────
  'Italy',
  'Milan, Italy',
  'Rome, Italy',
  'Turin, Italy',
  'Bologna, Italy',
  'Florence, Italy',
  'Naples, Italy',
  'Venice, Italy',

  // ── Other Western Europe ──────────────────────────────────────────────────
  'Ireland',
  'Dublin, Ireland',
  'Cork, Ireland',
  'Galway, Ireland',

  'Switzerland',
  'Zurich, Switzerland',
  'Geneva, Switzerland',
  'Bern, Switzerland',
  'Basel, Switzerland',

  'Sweden',
  'Stockholm, Sweden',
  'Gothenburg, Sweden',
  'Malmö, Sweden',

  'Norway',
  'Oslo, Norway',
  'Bergen, Norway',
  'Trondheim, Norway',

  'Denmark',
  'Copenhagen, Denmark',
  'Aarhus, Denmark',

  'Finland',
  'Helsinki, Finland',
  'Espoo, Finland',
  'Tampere, Finland',

  'Belgium',
  'Brussels, Belgium',
  'Antwerp, Belgium',
  'Ghent, Belgium',

  'Portugal',
  'Lisbon, Portugal',
  'Porto, Portugal',
  'Braga, Portugal',

  'Austria',
  'Vienna, Austria',
  'Graz, Austria',
  'Salzburg, Austria',

  'Luxembourg',
  'Luxembourg City, Luxembourg',

  'Malta',
  'Valletta, Malta',

  'Iceland',
  'Reykjavik, Iceland',

  // ── Central & Eastern Europe ──────────────────────────────────────────────
  'Poland',
  'Warsaw, Poland',
  'Kraków, Poland',
  'Wrocław, Poland',
  'Gdańsk, Poland',
  'Poznań, Poland',
  'Łódź, Poland',

  'Czech Republic',
  'Prague, Czech Republic',
  'Brno, Czech Republic',

  'Hungary',
  'Budapest, Hungary',

  'Romania',
  'Bucharest, Romania',
  'Cluj-Napoca, Romania',
  'Timișoara, Romania',

  'Bulgaria',
  'Sofia, Bulgaria',
  'Plovdiv, Bulgaria',
  'Varna, Bulgaria',

  'Greece',
  'Athens, Greece',
  'Thessaloniki, Greece',

  'Croatia',
  'Zagreb, Croatia',
  'Split, Croatia',

  'Slovakia',
  'Bratislava, Slovakia',

  'Slovenia',
  'Ljubljana, Slovenia',

  'Serbia',
  'Belgrade, Serbia',
  'Novi Sad, Serbia',

  'Estonia',
  'Tallinn, Estonia',

  'Latvia',
  'Riga, Latvia',

  'Lithuania',
  'Vilnius, Lithuania',

  'Ukraine',
  'Kyiv, Ukraine',
  'Lviv, Ukraine',
  'Kharkiv, Ukraine',

  'Russia',
  'Moscow, Russia',
  'St. Petersburg, Russia',
  'Novosibirsk, Russia',
  'Yekaterinburg, Russia',
  'Kazan, Russia',

  'Turkey',
  'Istanbul, Turkey',
  'Ankara, Turkey',
  'Izmir, Turkey',

  'Cyprus',
  'Nicosia, Cyprus',
  'Limassol, Cyprus',

  // ── Middle East ───────────────────────────────────────────────────────────
  'United Arab Emirates',
  'Dubai, UAE',
  'Abu Dhabi, UAE',
  'Sharjah, UAE',

  'Saudi Arabia',
  'Riyadh, Saudi Arabia',
  'Jeddah, Saudi Arabia',
  'Dammam, Saudi Arabia',

  'Qatar',
  'Doha, Qatar',

  'Kuwait',
  'Kuwait City, Kuwait',

  'Bahrain',
  'Manama, Bahrain',

  'Oman',
  'Muscat, Oman',

  'Israel',
  'Tel Aviv, Israel',
  'Jerusalem, Israel',
  'Haifa, Israel',
  'Be\'er Sheva, Israel',

  'Jordan',
  'Amman, Jordan',

  'Lebanon',
  'Beirut, Lebanon',

  // ── Africa ────────────────────────────────────────────────────────────────
  'Egypt',
  'Cairo, Egypt',
  'Alexandria, Egypt',

  'Morocco',
  'Casablanca, Morocco',
  'Rabat, Morocco',
  'Marrakech, Morocco',

  'Tunisia',
  'Tunis, Tunisia',

  'Algeria',
  'Algiers, Algeria',

  'Nigeria',
  'Lagos, Nigeria',
  'Abuja, Nigeria',

  'South Africa',
  'Johannesburg, South Africa',
  'Cape Town, South Africa',
  'Durban, South Africa',
  'Pretoria, South Africa',

  'Kenya',
  'Nairobi, Kenya',

  'Ethiopia',
  'Addis Ababa, Ethiopia',

  'Ghana',
  'Accra, Ghana',

  'Rwanda',
  'Kigali, Rwanda',

  'Tanzania',
  'Dar es Salaam, Tanzania',

  'Uganda',
  'Kampala, Uganda',

  'Senegal',
  'Dakar, Senegal',

  "Ivory Coast",
  'Abidjan, Ivory Coast',

  'Zambia',
  'Lusaka, Zambia',

  'Zimbabwe',
  'Harare, Zimbabwe',

  'Mozambique',
  'Maputo, Mozambique',

  'Angola',
  'Luanda, Angola',

  'Cameroon',
  'Douala, Cameroon',

  'Madagascar',
  'Antananarivo, Madagascar',

  // ── India ─────────────────────────────────────────────────────────────────
  'India',
  'Bengaluru, India',
  'Mumbai, India',
  'Delhi, India',
  'Hyderabad, India',
  'Chennai, India',
  'Pune, India',
  'Kolkata, India',
  'Ahmedabad, India',
  'Jaipur, India',
  'Surat, India',
  'Lucknow, India',
  'Kanpur, India',
  'Nagpur, India',
  'Indore, India',
  'Bhopal, India',
  'Visakhapatnam, India',
  'Patna, India',
  'Vadodara, India',
  'Coimbatore, India',
  'Kochi, India',
  'Noida, India',
  'Gurgaon, India',
  'Chandigarh, India',
  'Bhubaneswar, India',
  'Thiruvananthapuram, India',
  'Mysuru, India',
  'Mangaluru, India',
  'Tiruchirappalli, India',
  'Madurai, India',
  'Rajkot, India',
  'Goa, India',
  'Dehradun, India',
  'Mohali, India',
  'Navi Mumbai, India',
  'Thane, India',

  // ── Pakistan ──────────────────────────────────────────────────────────────
  'Pakistan',
  'Karachi, Pakistan',
  'Lahore, Pakistan',
  'Islamabad, Pakistan',
  'Rawalpindi, Pakistan',
  'Faisalabad, Pakistan',

  // ── Bangladesh ────────────────────────────────────────────────────────────
  'Bangladesh',
  'Dhaka, Bangladesh',
  'Chittagong, Bangladesh',

  // ── Sri Lanka ─────────────────────────────────────────────────────────────
  'Sri Lanka',
  'Colombo, Sri Lanka',

  // ── Nepal ─────────────────────────────────────────────────────────────────
  'Nepal',
  'Kathmandu, Nepal',

  // ── East Asia ─────────────────────────────────────────────────────────────
  'China',
  'Beijing, China',
  'Shanghai, China',
  'Shenzhen, China',
  'Guangzhou, China',
  'Chengdu, China',
  'Hangzhou, China',
  'Wuhan, China',
  'Nanjing, China',
  "Xi'an, China",
  'Suzhou, China',
  'Tianjin, China',
  'Chongqing, China',
  'Qingdao, China',

  'Hong Kong',

  'Macau',

  'Taiwan',
  'Taipei, Taiwan',
  'Kaohsiung, Taiwan',
  'Hsinchu, Taiwan',
  'Taichung, Taiwan',

  'Japan',
  'Tokyo, Japan',
  'Osaka, Japan',
  'Yokohama, Japan',
  'Nagoya, Japan',
  'Kyoto, Japan',
  'Fukuoka, Japan',
  'Sapporo, Japan',
  'Kobe, Japan',
  'Hiroshima, Japan',
  'Sendai, Japan',

  'South Korea',
  'Seoul, South Korea',
  'Busan, South Korea',
  'Incheon, South Korea',
  'Daegu, South Korea',
  'Daejeon, South Korea',

  // ── Southeast Asia ────────────────────────────────────────────────────────
  'Singapore',

  'Malaysia',
  'Kuala Lumpur, Malaysia',
  'Penang, Malaysia',
  'Johor Bahru, Malaysia',
  'Cyberjaya, Malaysia',

  'Indonesia',
  'Jakarta, Indonesia',
  'Surabaya, Indonesia',
  'Bandung, Indonesia',
  'Bali, Indonesia',

  'Philippines',
  'Manila, Philippines',
  'Cebu, Philippines',
  'Davao, Philippines',
  'Quezon City, Philippines',

  'Thailand',
  'Bangkok, Thailand',
  'Chiang Mai, Thailand',

  'Vietnam',
  'Ho Chi Minh City, Vietnam',
  'Hanoi, Vietnam',
  'Da Nang, Vietnam',

  'Myanmar',
  'Yangon, Myanmar',

  'Cambodia',
  'Phnom Penh, Cambodia',

  'Laos',
  'Vientiane, Laos',

  // ── Central Asia ──────────────────────────────────────────────────────────
  'Kazakhstan',
  'Almaty, Kazakhstan',
  'Nur-Sultan, Kazakhstan',

  'Uzbekistan',
  'Tashkent, Uzbekistan',

  'Azerbaijan',
  'Baku, Azerbaijan',

  'Georgia',
  'Tbilisi, Georgia',

  'Armenia',
  'Yerevan, Armenia',

  // ── Oceania ───────────────────────────────────────────────────────────────
  'Australia',
  'Sydney, Australia',
  'Melbourne, Australia',
  'Brisbane, Australia',
  'Perth, Australia',
  'Adelaide, Australia',
  'Canberra, Australia',
  'Gold Coast, Australia',
  'Hobart, Australia',
  'Darwin, Australia',
  'Newcastle, Australia',
  'Wollongong, Australia',

  'New Zealand',
  'Auckland, New Zealand',
  'Wellington, New Zealand',
  'Christchurch, New Zealand',
  'Hamilton, New Zealand',
  'Dunedin, New Zealand',

  // ── Latin America ─────────────────────────────────────────────────────────
  'Brazil',
  'São Paulo, Brazil',
  'Rio de Janeiro, Brazil',
  'Belo Horizonte, Brazil',
  'Brasília, Brazil',
  'Curitiba, Brazil',
  'Porto Alegre, Brazil',
  'Fortaleza, Brazil',
  'Recife, Brazil',
  'Campinas, Brazil',
  'Florianópolis, Brazil',

  'Mexico',
  'Mexico City, Mexico',
  'Guadalajara, Mexico',
  'Monterrey, Mexico',
  'Tijuana, Mexico',
  'Puebla, Mexico',
  'Querétaro, Mexico',
  'León, Mexico',

  'Argentina',
  'Buenos Aires, Argentina',
  'Córdoba, Argentina',
  'Rosario, Argentina',
  'Mendoza, Argentina',

  'Colombia',
  'Bogotá, Colombia',
  'Medellín, Colombia',
  'Cali, Colombia',
  'Barranquilla, Colombia',

  'Chile',
  'Santiago, Chile',
  'Valparaíso, Chile',

  'Peru',
  'Lima, Peru',
  'Arequipa, Peru',

  'Ecuador',
  'Quito, Ecuador',
  'Guayaquil, Ecuador',

  'Venezuela',
  'Caracas, Venezuela',

  'Uruguay',
  'Montevideo, Uruguay',

  'Paraguay',
  'Asunción, Paraguay',

  'Bolivia',
  'La Paz, Bolivia',
  'Santa Cruz, Bolivia',

  'Costa Rica',
  'San José, Costa Rica',

  'Panama',
  'Panama City, Panama',

  'Guatemala',
  'Guatemala City, Guatemala',

  'Honduras',
  'Tegucigalpa, Honduras',

  'El Salvador',
  'San Salvador, El Salvador',

  'Nicaragua',
  'Managua, Nicaragua',

  'Dominican Republic',
  'Santo Domingo, Dominican Republic',

  'Cuba',
  'Havana, Cuba',

  'Puerto Rico',
  'San Juan, Puerto Rico',

  'Jamaica',
  'Kingston, Jamaica',

  'Trinidad and Tobago',
  'Port of Spain, Trinidad and Tobago',
];

// Bangalore location and pincode mapping data
export interface LocationData {
  location: string;
  pincode: string;
  state: string;
  district: string;
}

// Pincode to Location mapping for quick lookup
export const pincodeToLocation: Record<string, string[]> = {
  '560001': ['Bangalore Bazaar', 'Bangalore.', 'Brigade Road', 'Cubban Road', 'Dr. ambedkar veedhi', 'Highcourt', 'Legislators Home', 'Mahatma Gandhi road', 'Narayan Pillai street', 'Rajbhavan', 'Vidhana Soudha'],
  '560002': ['Avenue Road', 'Bangalore City', 'Bangalore Corporation building', 'Bangalore Fort', 'Basavaraja Market', 'Cahmrajendrapet', 'Narasimjharaja Road', 'New Tharaggupet', 'Sri Jayachamarajendra road'],
  '560003': ['Aranya Bhavan', 'Malleswaram', 'Palace Guttahalli', 'Swimming Pool extn', 'Venkatarangapura', 'Vyalikaval Extn'],
  '560004': ['Basavanagudi', 'Lalbagh West', 'Mavalli', 'Pasmpamahakavi Road', 'Shankarpura', 'Visveswarapuram'],
  '560005': ['Fraser Town', 'Jeevanahalli'],
  '560006': ['J.C.nagar', 'Training Command IAF'],
  '560007': ['Agram', 'Air Force hospital'],
  '560008': ['H.A.l ii stage', 'Hulsur Bazaar', 'Someswarapura'],
  '560009': ['Bangalore Dist offices bldg', 'K. g. road', 'Subhashnagar'],
  '560010': ['Bhashyam Circle', 'Industrial Estate', 'Rajajinagar', 'Rajajinagar I block', 'Rajajinagar Ivth block'],
  '560011': ['Jayangar Iii block', 'Madhavan Park'],
  '560012': ['Science Institute'],
  '560013': ['Govindapalya', 'H M T', 'Jalahalli', 'Jalahalli Village'],
  '560014': ['Jalahalli East'],
  '560015': ['Jalahalli West', 'Kamagondanahalli'],
  '560016': ['Doorvaninagar', 'Krishnarajapuram R s', 'Ramamurthy Nagar'],
  '560017': ['Bangalore Air port', 'Nal', 'Vimapura'],
  '560018': ['Chamrajpet', 'Chamrajpet Bazar', 'Vittalnagar'],
  '560019': ['Gaviopuram Extension', 'Gaviopuram Guttanahalli', 'Narasimharaja Colony'],
  '560020': ['K.P.west', 'Seshadripuram'],
  '560021': ['Gayathrinagar', 'Okalipuram', 'Ramachandrapuram', 'Srirampuram'],
  '560022': ['Goraguntepalya', 'Yeshwanthpur Bazar', 'Yeswanthpura'],
  '560023': ['Magadi Road'],
  '560024': ['Anandnagar', 'H.A. Farm', 'Hebbal Kempapura'],
  '560025': ['Bangalore Sub fgn post', 'CMP Centre and school', 'Museum Road', 'Richmond Town'],
  '560026': ['Avalahalli', 'Bapujinagar', 'Byatarayanapura', 'Deepanjalinagar', 'Goripalya', 'Governmemnt Electric factory'],
  '560027': ['Sampangiramnagar', 'Shanthinagar', 'Wilson Garden'],
  '560028': ['Tyagrajnagar'],
  '560029': ['Dharmaram College', 'Taverekere'],
  '560030': ['Adugodi', 'Hosur Road'],
  '560032': ['P&t Col kavalbyrasandra', 'R T nagar'],
  '560033': ['Malkand Lines', 'Mandalay Lines', 'Maruthi Sevanagar'],
  '560034': ['Agara', 'Kendriya Sadan', 'Koramangala', 'Koramangala I block', 'St. john\'s medical college'],
  '560036': ['Devasandra', 'Krishnarajapuram'],
  '560037': ['Doddanekkundi', 'Kundalahalli', 'Marathahalli Colony', 'Rameshnagar', 'Yemalur'],
  '560038': ['Indiranagar', 'Indiranagar Com. complex'],
  '560039': ['Nayandahalli'],
  '560040': ['Chandra Lay out', 'Vijayanagar', 'Vijayanagar East'],
  '560041': ['Jayanagar', 'Tilaknagar'],
  '560042': ['Sivan Chetty gardens'],
  '560043': ['Banaswadi', 'Horamavu', 'Jalavayuvihar', 'Kalyanagar'],
  '560045': ['Arabic College', 'Devarjeevanahalli', 'Nagavara', 'Ramakrishna Hegde nagar', 'Venkateshapura'],
  '560046': ['Benson Town'],
  '560047': ['Austin Town', 'Viveknagar'],
  '560048': ['Hoodi', 'Mahadevapura'],
  '560049': ['Bhattarahalli', 'Bidrahalli', 'Medihalli', 'Mundur', 'Thambuchetty Palya', 'Virgonagar'],
  '560050': ['Ashoknagar', 'Banashankari', 'Dasarahalli', 'State Bank of mysore colony'],
  '560051': ['H.K.p. road'],
  '560052': ['Vasanthnagar'],
  '560053': ['Balepete', 'Chickpet'],
  '560054': ['M S R road', 'Mathikere', 'Msrit'],
  '560055': ['Malleswaram West', 'Milk Colony'],
  '560056': ['Bangalore Viswavidalaya', 'Mallathahalli', 'Ullalu Upanagara'],
  '560058': ['Peenya I stage', 'Peenya Ii stage', 'Peenya Small industries'],
  '560059': ['Rv Niketan'],
  '560061': ['Chikkalasandra', 'Subramanyapura'],
  '560062': ['Doddakallasandra', 'Konanakunte'],
  '560063': ['A F station yelahanka'],
  '560064': ['Attur', 'Bsf Campus yelahanka', 'Crpf Campus yelahanka', 'Jakkur', 'Kendriya Vihar', 'Rajanakunte', 'Singanayakanahalli', 'Wheel And axle plant', 'Yelahanka', 'Yelahanka Satellite town'],
  '560065': ['G.K.v.k.'],
  '560066': ['Immedihalli', 'Jeevanbhimanagar', 'Ramagondanahalli', 'Whitefield'],
  '560067': ['Devanagundi', 'Kadugodi', 'Kalkunte', 'Kannamangala', 'Medimallasandra', 'Naduvathi', 'Samethanahalli'],
  '560068': ['Bommanahalli', 'Hongasandra', 'Madivala'],
  '560069': ['Jayangar East'],
  '560070': ['B Sk ii stage', 'Jayanagar West', 'Padmanabhnagar', 'Yediyur'],
  '560071': ['Domlur'],
  '560072': ['Nagarbhavi'],
  '560073': ['Bagalgunte', 'Nagasandra'],
  '560074': ['Kumbalgodu'],
  '560075': ['New Thippasandra'],
  '560076': ['Bannerghatta Road', 'Hulimavu', 'Mico Layout', 'Mount St joseph'],
  '560077': ['Kothanur'],
  '560078': ['J P nagar', 'Jp Nagar iii phase', 'Kumaraswam Layout', 'Vikramnagar', 'Yelachenahalli'],
  '560079': ['Basaveshwaranagar', 'K H b colony', 'Kamakshipalya'],
  '560080': ['Sadashivanagar'],
  '560083': ['Bannerghatta'],
  '560084': ['Kacharakanahalli', 'Lingarajapuram', 'St. thomas town'],
  '560085': ['Banashankari Iii stage', 'Girinagar', 'Hosakerehalli', 'Ittamadu Layout', 'Kathriguppe'],
  '560086': ['Avani Sringeri mutt', 'Basaveswaranagar Ii stage', 'Mahalakshmipuram Layout'],
  '560087': ['Gunjur', 'Muthusandra', 'Panathur', 'Vartur'],
  '560091': ['Viswaneedam'],
  '560092': ['Amruthahalli', 'Kodigehalli', 'Sahakaranagar P.o'],
  '560093': ['C.V.raman nagar'],
  '560094': ['Isro Anthariksh bhavan', 'R.M.v. extension ii stage'],
  '560095': ['Koramangala Vi bk'],
  '560096': ['Kanteeravanagar', 'Nandinilayout'],
  '560097': ['Chikkabettahalli', 'Vidyaranyapura'],
  '560098': ['Kenchanahalli', 'Rajarajeshwarinagar'],
  '560099': ['Muthanallur'],
  '560100': ['Electronics City'],
  '560102': ['Hsr Layout'],
  '560103': ['Bellandur'],
  '560104': ['Hampinagar'],
  '562106': ['Anekal', 'Anekalbazar', 'Bestamaranahalli', 'Harogadde', 'Hennagara', 'Hulimangala', 'Indalavadi', 'Jigani', 'Marsur', 'Samandur', 'Sidihoskote', 'Thammanayakanahalli', 'Vanakanahalli'],
  '562107': ['Attibele', 'Bidaraguppe', 'Mayasandra', 'Neralur', 'Yadavanahalli'],
  '562125': ['Dommasandra', 'Handenahalli', 'Kugur', 'Sarjapura'],
  '562130': ['Chikkanahalli', 'Chunchanakuppe', 'Kadabagere', 'Tavarekere'],
  '562149': ['Bagalur', 'Bandikodigehalli', 'Doddagubbi', 'Kannur'],
  '562157': ['Bettahalsur', 'Chikkajala', 'Doddajala', 'Hunasamaranahalli', 'Tarahunise', 'Vidyanagara']
};

// Get location name from pincode
export const getLocationFromPincode = (pincode: string): string => {
  const locations = pincodeToLocation[pincode];
  if (locations && locations.length > 0) {
    return locations[0]; // Return the first location for the pincode
  }
  return 'Unknown Location';
};

// Get all locations for a pincode
export const getAllLocationsForPincode = (pincode: string): string[] => {
  return pincodeToLocation[pincode] || [];
};

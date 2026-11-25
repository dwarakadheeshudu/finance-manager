export const STANDARD_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:30 PM", "05:00 PM"
];

export interface DoctorRecord {
  id: number;
  name: string;
  specialty: string;
  qualifications: string;
  registration_number: string;
  hospital: string;
  experience_years: number;
  consultation_fee: number;
  rating: number;
  available_days: string;
  room_number: string;
  teleconsult_available: boolean;
  verified: boolean;
}

export const VERIFIED_DOCTORS_SEED: DoctorRecord[] = [
  {
    id: 1,
    name: "Dr. Vikramaditya Rao",
    specialty: "Cardiology",
    qualifications: "MD, DM (Cardiology), FACC",
    registration_number: "MCI-29481-DEL",
    hospital: "Apex Heart & Vascular Institute, Wing 4B",
    experience_years: 18,
    consultation_fee: 120.0,
    rating: 4.95,
    available_days: "Mon - Sat",
    room_number: "Room 210, 2nd Floor",
    teleconsult_available: true,
    verified: true
  },
  {
    id: 2,
    name: "Dr. R. K. Sharma",
    specialty: "Oncology",
    qualifications: "MD, DNB (Medical Oncology), ESMO Certified",
    registration_number: "MCI-48192-MUM",
    hospital: "Tata Comprehensive Cancer Center, Block C",
    experience_years: 22,
    consultation_fee: 150.0,
    rating: 4.88,
    available_days: "Mon - Fri",
    room_number: "Room 105, Cancer Care Pavilion",
    teleconsult_available: true,
    verified: true
  },
  {
    id: 3,
    name: "Dr. Ananya Patel",
    specialty: "Neurology & Movement Disorders",
    qualifications: "MD, DM (Neurology), Fellow Movement Disorders",
    registration_number: "MCI-38291-BLR",
    hospital: "National Neurosciences Institute, Main Wing",
    experience_years: 15,
    consultation_fee: 130.0,
    rating: 4.92,
    available_days: "Mon, Wed, Fri, Sat",
    room_number: "Room 304, Neuro Clinic",
    teleconsult_available: true,
    verified: true
  },
  {
    id: 4,
    name: "Dr. Meera Nambiar",
    specialty: "Medical Genetics & Rare Disorders",
    qualifications: "MD, PhD (Genomics), FACMG Affiliate",
    registration_number: "MCI-51920-CHN",
    hospital: "Center for Genomic Medicine & Orphan Diseases",
    experience_years: 16,
    consultation_fee: 160.0,
    rating: 4.96,
    available_days: "Tue - Sat",
    room_number: "Room 412, Genomics Tower",
    teleconsult_available: true,
    verified: true
  },
  {
    id: 5,
    name: "Dr. Arvind Swaminathan",
    specialty: "Endocrinology & Diabetology",
    qualifications: "MD, DM (Endocrinology), FACE (USA)",
    registration_number: "MCI-41902-HYD",
    hospital: "Apex Diabetes & Metabolic Health Center",
    experience_years: 19,
    consultation_fee: 110.0,
    rating: 4.89,
    available_days: "Mon - Sat",
    room_number: "Room 118, Metabolic Suite",
    teleconsult_available: true,
    verified: true
  },
  {
    id: 6,
    name: "Dr. Preeti Deshmukh",
    specialty: "Nephrology & Renal Transplant",
    qualifications: "MD, DM (Nephrology), FISN Member",
    registration_number: "MCI-63821-PUN",
    hospital: "Institute of Kidney Diseases & Dialysis Care",
    experience_years: 17,
    consultation_fee: 135.0,
    rating: 4.91,
    available_days: "Mon - Sat",
    room_number: "Room 222, Renal Block",
    teleconsult_available: true,
    verified: true
  },
  {
    id: 7,
    name: "Dr. Siddharth Mukherjee",
    specialty: "Pulmonology & Critical Care",
    qualifications: "MD, FCCP (USA), DNB (Respiratory Medicine)",
    registration_number: "MCI-37190-KOL",
    hospital: "Pulmonary & Thoracic Specialty Hospital",
    experience_years: 20,
    consultation_fee: 125.0,
    rating: 4.94,
    available_days: "Mon - Sat",
    room_number: "Room 108, Chest Care Center",
    teleconsult_available: true,
    verified: true
  }
];

export const TOTAL_ORPHANET_INDEXED = 11456;

export const ORPHANET_KNOWLEDGE_BASE = [
  {
    OrphaCode: "166024",
    Name: "Alexander disease (Type I / Type II)",
    AgeOfOnset: "Infancy / Childhood (1-24 mo)",
    TypeOfInheritance: "Autosomal dominant (GFAP mutation)",
    "ICD-10": "E75.2",
    OMIM: "203450",
    Prevalence: "1-9 / 1,000,000",
    Keywords: ["leukodystrophy", "macrocephaly", "seizures", "rosenthal fibers", "gfap", "neurological", "motor regression"]
  },
  {
    OrphaCode: "558",
    Name: "Marfan syndrome",
    AgeOfOnset: "Childhood / Adolescent",
    TypeOfInheritance: "Autosomal dominant (FBN1 mutation)",
    "ICD-10": "Q87.4",
    OMIM: "154700",
    Prevalence: "1-5 / 10,000",
    Keywords: ["aortic root aneurysm", "ectopia lentis", "arachnodactyly", "skeletal", "tall stature", "fbn1", "joint"]
  },
  {
    OrphaCode: "166035",
    Name: "Niemann-Pick disease type C (NPC)",
    AgeOfOnset: "Childhood / Adolescent (2-12 yr)",
    TypeOfInheritance: "Autosomal recessive (NPC1, NPC2)",
    "ICD-10": "E75.2",
    OMIM: "257220",
    Prevalence: "1 / 120,000",
    Keywords: ["vertical supranuclear gaze palsy", "splenomegaly", "ataxia", "dystonia", "cholesterol trafficking", "hepatosplenomegaly"]
  },
  {
    OrphaCode: "791",
    Name: "Huntington disease (Juvenile / Adult)",
    AgeOfOnset: "Adult / Adolescent",
    TypeOfInheritance: "Autosomal dominant (CAG trinucleotide repeat)",
    "ICD-10": "G10",
    OMIM: "143100",
    Prevalence: "1-9 / 100,000",
    Keywords: ["chorea", "cognitive decline", "psychiatric", "htt gene", "motor regression", "neurological"]
  },
  {
    OrphaCode: "586",
    Name: "Mitochondrial encephalomyopathy (MELAS syndrome)",
    AgeOfOnset: "Childhood / Adolescent (2-15 yr)",
    TypeOfInheritance: "Mitochondrial (MT-TL1 m.3243A>G)",
    "ICD-10": "G71.3",
    OMIM: "540000",
    Prevalence: "1-9 / 100,000",
    Keywords: ["stroke-like episodes", "lactic acidosis", "ragged-red fibers", "sensorineural hearing loss", "seizures", "mitochondrial"]
  },
  {
    OrphaCode: "284",
    Name: "Gaucher disease type 1 & 2",
    AgeOfOnset: "Infancy / Adult",
    TypeOfInheritance: "Autosomal recessive (GBA gene)",
    "ICD-10": "E75.2",
    OMIM: "230800",
    Prevalence: "1 / 50,000",
    Keywords: ["hepatosplenomegaly", "anemia", "thrombocytopenia", "bone crisis", "glucocerebrosidase", "skeletal", "splenomegaly"]
  },
  {
    OrphaCode: "193",
    Name: "Cystic fibrosis (CFTR-related)",
    AgeOfOnset: "Neonatal / Infancy",
    TypeOfInheritance: "Autosomal recessive (CFTR deltaF508)",
    "ICD-10": "E84.0",
    OMIM: "219700",
    Prevalence: "1 / 3,000",
    Keywords: ["sweat chloride", "bronchiectasis", "pancreatic insufficiency", "pseudomonas colonization", "cftr", "respiratory"]
  },
  {
    OrphaCode: "79457",
    Name: "Fabry disease (Alpha-galactosidase A deficiency)",
    AgeOfOnset: "Childhood / Adult",
    TypeOfInheritance: "X-linked recessive (GLA gene)",
    "ICD-10": "E75.2",
    OMIM: "301500",
    Prevalence: "1 / 40,000",
    Keywords: ["acroparesthesia", "angiokeratoma", "hypohidrosis", "hypertrophic cardiomyopathy", "renal proteinuria", "x-linked"]
  },
  {
    OrphaCode: "90",
    Name: "Amyotrophic lateral sclerosis (Familial ALS / FALS)",
    AgeOfOnset: "Adult (40-65 yr)",
    TypeOfInheritance: "Autosomal dominant (SOD1, C9orf72)",
    "ICD-10": "G12.2",
    OMIM: "105400",
    Prevalence: "4-8 / 100,000",
    Keywords: ["motor neuron degeneration", "fasciculations", "muscle wasting", "bulbar palsy", "respiratory compromise"]
  },
  {
    OrphaCode: "26106",
    Name: "Krabbe disease (Globoid cell leukodystrophy)",
    AgeOfOnset: "Infancy (3-6 mo)",
    TypeOfInheritance: "Autosomal recessive (GALC gene)",
    "ICD-10": "E75.2",
    OMIM: "245200",
    Prevalence: "1 / 100,000",
    Keywords: ["irritability", "optic atrophy", "spasticity", "galactosylceramidase", "hyperpyrexia", "seizures", "leukodystrophy"]
  },
  {
    OrphaCode: "15",
    Name: "Achondroplasia & Thanatophoric dysplasia",
    AgeOfOnset: "Neonatal / Antenatal",
    TypeOfInheritance: "Autosomal dominant / De novo (FGFR3)",
    "ICD-10": "Q77.4",
    OMIM: "100800",
    Prevalence: "1 / 25,000",
    Keywords: ["rhizomelic limb shortening", "macrocephaly", "frontal bossing", "midface hypoplasia", "fgfr3", "dysplasia", "skeletal"]
  },
  {
    OrphaCode: "98896",
    Name: "Alkaptonuria (Black urine disease)",
    AgeOfOnset: "Infancy / Adult",
    TypeOfInheritance: "Autosomal recessive (HGD gene)",
    "ICD-10": "E70.2",
    OMIM: "203500",
    Prevalence: "1 / 250,000",
    Keywords: ["homogentisic acid", "ochronosis", "dark urine on standing", "osteoarthritis", "valvular calcification", "metabolic"]
  },
  {
    OrphaCode: "98895",
    Name: "Duchenne muscular dystrophy (DMD)",
    AgeOfOnset: "Childhood (2-5 yr)",
    TypeOfInheritance: "X-linked recessive (DMD dystrophin)",
    "ICD-10": "G71.0",
    OMIM: "310200",
    Prevalence: "1 / 3,500 males",
    Keywords: ["gowers sign", "calf pseudohypertrophy", "elevated creatine kinase", "dystrophin", "muscle weakness", "x-linked"]
  },
  {
    OrphaCode: "778",
    Name: "Rett syndrome",
    AgeOfOnset: "Infancy (6-18 mo)",
    TypeOfInheritance: "X-linked dominant / De novo (MECP2)",
    "ICD-10": "F84.2",
    OMIM: "312750",
    Prevalence: "1 / 10,000 females",
    Keywords: ["hand wringing", "developmental regression", "mecp2", "microcephaly", "seizures", "autism"]
  },
  {
    OrphaCode: "365",
    Name: "Pompe disease (Glycogen storage disease type II)",
    AgeOfOnset: "Infancy / Adult",
    TypeOfInheritance: "Autosomal recessive (GAA gene)",
    "ICD-10": "E74.0",
    OMIM: "232300",
    Prevalence: "1 / 40,000",
    Keywords: ["cardiomegaly", "hypotonia", "acid alpha-glucosidase", "diaphragmatic weakness", "glycogen", "lysosomal"]
  },
  {
    OrphaCode: "905",
    Name: "Wilson disease (Hepatolenticular degeneration)",
    AgeOfOnset: "Childhood / Young Adult",
    TypeOfInheritance: "Autosomal recessive (ATP7B gene)",
    "ICD-10": "E83.0",
    OMIM: "277900",
    Prevalence: "1 / 30,000",
    Keywords: ["kayser-fleischer ring", "ceruloplasmin", "copper overload", "cirrhosis", "dystonia", "hepatic"]
  },
  {
    OrphaCode: "666",
    Name: "Osteogenesis imperfecta (Brittle bone disease)",
    AgeOfOnset: "Neonatal / Childhood",
    TypeOfInheritance: "Autosomal dominant / recessive (COL1A1, COL1A2)",
    "ICD-10": "Q78.0",
    OMIM: "166200",
    Prevalence: "1 / 15,000",
    Keywords: ["recurrent fractures", "blue sclerae", "dentinogenesis imperfecta", "hearing loss", "skeletal", "dysplasia"]
  },
  {
    OrphaCode: "716",
    Name: "Phenylketonuria (PKU)",
    AgeOfOnset: "Neonatal / Infancy",
    TypeOfInheritance: "Autosomal recessive (PAH gene)",
    "ICD-10": "E70.0",
    OMIM: "261600",
    Prevalence: "1 / 10,000",
    Keywords: ["hyperphenylalaninemia", "intellectual disability", "musty odor", "pah", "metabolic", "newborn screening"]
  }
];

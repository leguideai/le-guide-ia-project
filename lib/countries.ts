export type Country = {
  name: string
  code: string // ISO 3166-1 alpha-2
  dial: string
}

// Liste complète des pays avec indicatifs téléphoniques internationaux
export const countries: Country[] = [
  { name: "Afghanistan", code: "AF", dial: "+93" },
  { name: "Afrique du Sud", code: "ZA", dial: "+27" },
  { name: "Albanie", code: "AL", dial: "+355" },
  { name: "Algérie", code: "DZ", dial: "+213" },
  { name: "Allemagne", code: "DE", dial: "+49" },
  { name: "Andorre", code: "AD", dial: "+376" },
  { name: "Angola", code: "AO", dial: "+244" },
  { name: "Anguilla", code: "AI", dial: "+1264" },
  { name: "Antigua-et-Barbuda", code: "AG", dial: "+1268" },
  { name: "Arabie saoudite", code: "SA", dial: "+966" },
  { name: "Argentine", code: "AR", dial: "+54" },
  { name: "Arménie", code: "AM", dial: "+374" },
  { name: "Aruba", code: "AW", dial: "+297" },
  { name: "Australie", code: "AU", dial: "+61" },
  { name: "Autriche", code: "AT", dial: "+43" },
  { name: "Azerbaïdjan", code: "AZ", dial: "+994" },
  { name: "Bahamas", code: "BS", dial: "+1242" },
  { name: "Bahreïn", code: "BH", dial: "+973" },
  { name: "Bangladesh", code: "BD", dial: "+880" },
  { name: "Barbade", code: "BB", dial: "+1246" },
  { name: "Belgique", code: "BE", dial: "+32" },
  { name: "Belize", code: "BZ", dial: "+501" },
  { name: "Bénin", code: "BJ", dial: "+229" },
  { name: "Bermudes", code: "BM", dial: "+1441" },
  { name: "Bhoutan", code: "BT", dial: "+975" },
  { name: "Biélorussie", code: "BY", dial: "+375" },
  { name: "Birmanie (Myanmar)", code: "MM", dial: "+95" },
  { name: "Bolivie", code: "BO", dial: "+591" },
  { name: "Bosnie-Herzégovine", code: "BA", dial: "+387" },
  { name: "Botswana", code: "BW", dial: "+267" },
  { name: "Brésil", code: "BR", dial: "+55" },
  { name: "Brunei", code: "BN", dial: "+673" },
  { name: "Bulgarie", code: "BG", dial: "+359" },
  { name: "Burkina Faso", code: "BF", dial: "+226" },
  { name: "Burundi", code: "BI", dial: "+257" },
  { name: "Cambodge", code: "KH", dial: "+855" },
  { name: "Cameroun", code: "CM", dial: "+237" },
  { name: "Canada", code: "CA", dial: "+1" },
  { name: "Cap-Vert", code: "CV", dial: "+238" },
  { name: "Chili", code: "CL", dial: "+56" },
  { name: "Chine", code: "CN", dial: "+86" },
  { name: "Chypre", code: "CY", dial: "+357" },
  { name: "Colombie", code: "CO", dial: "+57" },
  { name: "Comores", code: "KM", dial: "+269" },
  { name: "Congo (Brazzaville)", code: "CG", dial: "+242" },
  { name: "Congo (RDC)", code: "CD", dial: "+243" },
  { name: "Corée du Nord", code: "KP", dial: "+850" },
  { name: "Corée du Sud", code: "KR", dial: "+82" },
  { name: "Costa Rica", code: "CR", dial: "+506" },
  { name: "Côte d'Ivoire", code: "CI", dial: "+225" },
  { name: "Croatie", code: "HR", dial: "+385" },
  { name: "Cuba", code: "CU", dial: "+53" },
  { name: "Danemark", code: "DK", dial: "+45" },
  { name: "Djibouti", code: "DJ", dial: "+253" },
  { name: "Dominique", code: "DM", dial: "+1767" },
  { name: "Égypte", code: "EG", dial: "+20" },
  { name: "Émirats arabes unis", code: "AE", dial: "+971" },
  { name: "Équateur", code: "EC", dial: "+593" },
  { name: "Érythrée", code: "ER", dial: "+291" },
  { name: "Espagne", code: "ES", dial: "+34" },
  { name: "Estonie", code: "EE", dial: "+372" },
  { name: "Eswatini", code: "SZ", dial: "+268" },
  { name: "États-Unis", code: "US", dial: "+1" },
  { name: "Éthiopie", code: "ET", dial: "+251" },
  { name: "Fidji", code: "FJ", dial: "+679" },
  { name: "Finlande", code: "FI", dial: "+358" },
  { name: "France", code: "FR", dial: "+33" },
  { name: "Gabon", code: "GA", dial: "+241" },
  { name: "Gambie", code: "GM", dial: "+220" },
  { name: "Géorgie", code: "GE", dial: "+995" },
  { name: "Ghana", code: "GH", dial: "+233" },
  { name: "Gibraltar", code: "GI", dial: "+350" },
  { name: "Grèce", code: "GR", dial: "+30" },
  { name: "Grenade", code: "GD", dial: "+1473" },
  { name: "Groenland", code: "GL", dial: "+299" },
  { name: "Guadeloupe", code: "GP", dial: "+590" },
  { name: "Guatemala", code: "GT", dial: "+502" },
  { name: "Guinée", code: "GN", dial: "+224" },
  { name: "Guinée équatoriale", code: "GQ", dial: "+240" },
  { name: "Guinée-Bissau", code: "GW", dial: "+245" },
  { name: "Guyana", code: "GY", dial: "+592" },
  { name: "Guyane française", code: "GF", dial: "+594" },
  { name: "Haïti", code: "HT", dial: "+509" },
  { name: "Honduras", code: "HN", dial: "+504" },
  { name: "Hong Kong", code: "HK", dial: "+852" },
  { name: "Hongrie", code: "HU", dial: "+36" },
  { name: "Île Maurice", code: "MU", dial: "+230" },
  { name: "Îles Caïmans", code: "KY", dial: "+1345" },
  { name: "Îles Cook", code: "CK", dial: "+682" },
  { name: "Îles Féroé", code: "FO", dial: "+298" },
  { name: "Îles Marshall", code: "MH", dial: "+692" },
  { name: "Îles Salomon", code: "SB", dial: "+677" },
  { name: "Îles Vierges britanniques", code: "VG", dial: "+1284" },
  { name: "Inde", code: "IN", dial: "+91" },
  { name: "Indonésie", code: "ID", dial: "+62" },
  { name: "Irak", code: "IQ", dial: "+964" },
  { name: "Iran", code: "IR", dial: "+98" },
  { name: "Irlande", code: "IE", dial: "+353" },
  { name: "Islande", code: "IS", dial: "+354" },
  { name: "Israël", code: "IL", dial: "+972" },
  { name: "Italie", code: "IT", dial: "+39" },
  { name: "Jamaïque", code: "JM", dial: "+1876" },
  { name: "Japon", code: "JP", dial: "+81" },
  { name: "Jordanie", code: "JO", dial: "+962" },
  { name: "Kazakhstan", code: "KZ", dial: "+7" },
  { name: "Kenya", code: "KE", dial: "+254" },
  { name: "Kirghizistan", code: "KG", dial: "+996" },
  { name: "Kiribati", code: "KI", dial: "+686" },
  { name: "Koweït", code: "KW", dial: "+965" },
  { name: "Laos", code: "LA", dial: "+856" },
  { name: "Lesotho", code: "LS", dial: "+266" },
  { name: "Lettonie", code: "LV", dial: "+371" },
  { name: "Liban", code: "LB", dial: "+961" },
  { name: "Liberia", code: "LR", dial: "+231" },
  { name: "Libye", code: "LY", dial: "+218" },
  { name: "Liechtenstein", code: "LI", dial: "+423" },
  { name: "Lituanie", code: "LT", dial: "+370" },
  { name: "Luxembourg", code: "LU", dial: "+352" },
  { name: "Macao", code: "MO", dial: "+853" },
  { name: "Macédoine du Nord", code: "MK", dial: "+389" },
  { name: "Madagascar", code: "MG", dial: "+261" },
  { name: "Malaisie", code: "MY", dial: "+60" },
  { name: "Malawi", code: "MW", dial: "+265" },
  { name: "Maldives", code: "MV", dial: "+960" },
  { name: "Mali", code: "ML", dial: "+223" },
  { name: "Malte", code: "MT", dial: "+356" },
  { name: "Maroc", code: "MA", dial: "+212" },
  { name: "Martinique", code: "MQ", dial: "+596" },
  { name: "Mauritanie", code: "MR", dial: "+222" },
  { name: "Mayotte", code: "YT", dial: "+262" },
  { name: "Mexique", code: "MX", dial: "+52" },
  { name: "Micronésie", code: "FM", dial: "+691" },
  { name: "Moldavie", code: "MD", dial: "+373" },
  { name: "Monaco", code: "MC", dial: "+377" },
  { name: "Mongolie", code: "MN", dial: "+976" },
  { name: "Monténégro", code: "ME", dial: "+382" },
  { name: "Mozambique", code: "MZ", dial: "+258" },
  { name: "Namibie", code: "NA", dial: "+264" },
  { name: "Nauru", code: "NR", dial: "+674" },
  { name: "Népal", code: "NP", dial: "+977" },
  { name: "Nicaragua", code: "NI", dial: "+505" },
  { name: "Niger", code: "NE", dial: "+227" },
  { name: "Nigeria", code: "NG", dial: "+234" },
  { name: "Norvège", code: "NO", dial: "+47" },
  { name: "Nouvelle-Calédonie", code: "NC", dial: "+687" },
  { name: "Nouvelle-Zélande", code: "NZ", dial: "+64" },
  { name: "Oman", code: "OM", dial: "+968" },
  { name: "Ouganda", code: "UG", dial: "+256" },
  { name: "Ouzbékistan", code: "UZ", dial: "+998" },
  { name: "Pakistan", code: "PK", dial: "+92" },
  { name: "Palaos", code: "PW", dial: "+680" },
  { name: "Palestine", code: "PS", dial: "+970" },
  { name: "Panama", code: "PA", dial: "+507" },
  { name: "Papouasie-Nouvelle-Guinée", code: "PG", dial: "+675" },
  { name: "Paraguay", code: "PY", dial: "+595" },
  { name: "Pays-Bas", code: "NL", dial: "+31" },
  { name: "Pérou", code: "PE", dial: "+51" },
  { name: "Philippines", code: "PH", dial: "+63" },
  { name: "Pologne", code: "PL", dial: "+48" },
  { name: "Polynésie française", code: "PF", dial: "+689" },
  { name: "Porto Rico", code: "PR", dial: "+1787" },
  { name: "Portugal", code: "PT", dial: "+351" },
  { name: "Qatar", code: "QA", dial: "+974" },
  { name: "République centrafricaine", code: "CF", dial: "+236" },
  { name: "République dominicaine", code: "DO", dial: "+1809" },
  { name: "République tchèque", code: "CZ", dial: "+420" },
  { name: "Réunion", code: "RE", dial: "+262" },
  { name: "Roumanie", code: "RO", dial: "+40" },
  { name: "Royaume-Uni", code: "GB", dial: "+44" },
  { name: "Russie", code: "RU", dial: "+7" },
  { name: "Rwanda", code: "RW", dial: "+250" },
  { name: "Saint-Christophe-et-Niévès", code: "KN", dial: "+1869" },
  { name: "Saint-Marin", code: "SM", dial: "+378" },
  { name: "Saint-Vincent-et-les-Grenadines", code: "VC", dial: "+1784" },
  { name: "Sainte-Lucie", code: "LC", dial: "+1758" },
  { name: "Salvador", code: "SV", dial: "+503" },
  { name: "Samoa", code: "WS", dial: "+685" },
  { name: "Sao Tomé-et-Principe", code: "ST", dial: "+239" },
  { name: "Sénégal", code: "SN", dial: "+221" },
  { name: "Serbie", code: "RS", dial: "+381" },
  { name: "Seychelles", code: "SC", dial: "+248" },
  { name: "Sierra Leone", code: "SL", dial: "+232" },
  { name: "Singapour", code: "SG", dial: "+65" },
  { name: "Slovaquie", code: "SK", dial: "+421" },
  { name: "Slovénie", code: "SI", dial: "+386" },
  { name: "Somalie", code: "SO", dial: "+252" },
  { name: "Soudan", code: "SD", dial: "+249" },
  { name: "Soudan du Sud", code: "SS", dial: "+211" },
  { name: "Sri Lanka", code: "LK", dial: "+94" },
  { name: "Suède", code: "SE", dial: "+46" },
  { name: "Suisse", code: "CH", dial: "+41" },
  { name: "Suriname", code: "SR", dial: "+597" },
  { name: "Syrie", code: "SY", dial: "+963" },
  { name: "Tadjikistan", code: "TJ", dial: "+992" },
  { name: "Taïwan", code: "TW", dial: "+886" },
  { name: "Tanzanie", code: "TZ", dial: "+255" },
  { name: "Tchad", code: "TD", dial: "+235" },
  { name: "Thaïlande", code: "TH", dial: "+66" },
  { name: "Timor oriental", code: "TL", dial: "+670" },
  { name: "Togo", code: "TG", dial: "+228" },
  { name: "Tonga", code: "TO", dial: "+676" },
  { name: "Trinité-et-Tobago", code: "TT", dial: "+1868" },
  { name: "Tunisie", code: "TN", dial: "+216" },
  { name: "Turkménistan", code: "TM", dial: "+993" },
  { name: "Turquie", code: "TR", dial: "+90" },
  { name: "Tuvalu", code: "TV", dial: "+688" },
  { name: "Ukraine", code: "UA", dial: "+380" },
  { name: "Uruguay", code: "UY", dial: "+598" },
  { name: "Vanuatu", code: "VU", dial: "+678" },
  { name: "Vatican", code: "VA", dial: "+379" },
  { name: "Venezuela", code: "VE", dial: "+58" },
  { name: "Viêt Nam", code: "VN", dial: "+84" },
  { name: "Yémen", code: "YE", dial: "+967" },
  { name: "Zambie", code: "ZM", dial: "+260" },
  { name: "Zimbabwe", code: "ZW", dial: "+263" },
]

// Emoji flag generator from 2-letter ISO code or country name
export function getCountryFlag(countryCodeOrName: string): string {
  if (!countryCodeOrName) return "🌐"
  const clean = countryCodeOrName.trim()
  if (clean.length === 2) {
    const codePoints = clean
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
  }
  const found = countries.find(c => c.name.toLowerCase() === clean.toLowerCase())
  if (found) {
    const codePoints = found.code
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
  }
  return "🌐"
}

export function getCountryName(countryCodeOrName: string): string {
  if (!countryCodeOrName) return "—"
  const clean = countryCodeOrName.trim()
  const found = countries.find(c => c.code.toLowerCase() === clean.toLowerCase() || c.name.toLowerCase() === clean.toLowerCase())
  return found ? found.name : clean
}

export interface CountryPhoneRule {
  expectedLength: number | number[]
  placeholder: string
  formatExample: string
}

export const PHONE_RULES: Record<string, CountryPhoneRule> = {
  BF: { expectedLength: 8, placeholder: "70 12 34 56", formatExample: "8 chiffres" },
  CI: { expectedLength: 10, placeholder: "07 12 34 56 78", formatExample: "10 chiffres" },
  SN: { expectedLength: 9, placeholder: "77 123 45 67", formatExample: "9 chiffres" },
  ML: { expectedLength: 8, placeholder: "70 12 34 56", formatExample: "8 chiffres" },
  GN: { expectedLength: 9, placeholder: "620 12 34 56", formatExample: "9 chiffres" },
  TG: { expectedLength: 8, placeholder: "90 12 34 56", formatExample: "8 chiffres" },
  BJ: { expectedLength: 8, placeholder: "97 12 34 56", formatExample: "8 chiffres" },
  NE: { expectedLength: 8, placeholder: "90 12 34 56", formatExample: "8 chiffres" },
  CM: { expectedLength: 9, placeholder: "6 70 12 34 56", formatExample: "9 chiffres" },
  GA: { expectedLength: 8, placeholder: "77 12 34 56", formatExample: "8 chiffres" },
  CD: { expectedLength: 9, placeholder: "81 234 5678", formatExample: "9 chiffres" },
  CG: { expectedLength: 9, placeholder: "06 123 4567", formatExample: "9 chiffres" },
  FR: { expectedLength: [9, 10], placeholder: "6 12 34 56 78", formatExample: "9 ou 10 chiffres" },
  BE: { expectedLength: 9, placeholder: "470 12 34 56", formatExample: "9 chiffres" },
  CH: { expectedLength: 9, placeholder: "79 123 45 67", formatExample: "9 chiffres" },
  CA: { expectedLength: 10, placeholder: "514 123 4567", formatExample: "10 chiffres" },
  US: { expectedLength: 10, placeholder: "415 555 2671", formatExample: "10 chiffres" },
  MA: { expectedLength: 9, placeholder: "6 12 34 56 78", formatExample: "9 chiffres" },
  DZ: { expectedLength: 9, placeholder: "5 50 12 34 56", formatExample: "9 chiffres" },
  TN: { expectedLength: 8, placeholder: "20 12 34 56", formatExample: "8 chiffres" },
}

export const PRIORITY_COUNTRY_CODES = [
  "BF", "CI", "SN", "ML", "GN", "TG", "BJ", "NE", 
  "CM", "GA", "CD", "FR", "BE", "CA", "US", "MA"
]

export function formatPhoneNumber(value: string, countryCode: string): string {
  const digits = value.replace(/\D/g, "")
  if (!digits) return ""

  // Burkina Faso: XX XX XX XX
  if (countryCode === "BF" || countryCode === "ML" || countryCode === "TG" || countryCode === "BJ" || countryCode === "NE" || countryCode === "GA" || countryCode === "TN") {
    const parts = []
    for (let i = 0; i < Math.min(digits.length, 8); i += 2) {
      parts.push(digits.slice(i, i + 2))
    }
    return parts.join(" ")
  }

  // Côte d'Ivoire: XX XX XX XX XX (10 chiffres)
  if (countryCode === "CI") {
    const parts = []
    for (let i = 0; i < Math.min(digits.length, 10); i += 2) {
      parts.push(digits.slice(i, i + 2))
    }
    return parts.join(" ")
  }

  // Sénégal: XX XXX XX XX (9 chiffres)
  if (countryCode === "SN") {
    if (digits.length <= 2) return digits
    if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`
    if (digits.length <= 7) return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`
  }

  // France / Maroc / Algérie: X XX XX XX XX (9 ou 10)
  if (countryCode === "FR" || countryCode === "MA" || countryCode === "DZ") {
    if (digits.startsWith("0")) {
      const parts = []
      for (let i = 0; i < Math.min(digits.length, 10); i += 2) {
        parts.push(digits.slice(i, i + 2))
      }
      return parts.join(" ")
    }
    const first = digits.slice(0, 1)
    const rest = digits.slice(1, 9)
    const parts = [first]
    for (let i = 0; i < rest.length; i += 2) {
      parts.push(rest.slice(i, i + 2))
    }
    return parts.join(" ")
  }

  // Default grouping by 2 or 3
  const parts = []
  for (let i = 0; i < Math.min(digits.length, 12); i += 3) {
    parts.push(digits.slice(i, i + 3))
  }
  return parts.join(" ")
}

export function parsePhoneNumber(rawPhone: string): { country: Country; localNumber: string } | null {
  if (!rawPhone) return null
  const cleaned = rawPhone.trim().replace(/\s+/g, "")
  if (!cleaned.startsWith("+")) return null
  
  // Sort by dial code length descending
  const sorted = [...countries].sort((a, b) => b.dial.length - a.dial.length)
  for (const c of sorted) {
    if (cleaned.startsWith(c.dial)) {
      const localDigits = cleaned.slice(c.dial.length).replace(/\D/g, "")
      return { country: c, localNumber: formatPhoneNumber(localDigits, c.code) }
    }
  }
  return null
}

export interface SectorCategory {
  category: string
  options: string[]
}

export const SECTOR_CATEGORIES: SectorCategory[] = [
  {
    category: "Technologies, Informatique & IA",
    options: [
      "Développeur / Ingénieur Logiciel",
      "Data Scientist / Ingénieur IA / Machine Learning",
      "Data Analyst / Business Intelligence",
      "DevOps / Administrateur Systèmes & Cloud",
      "Expert Cybersécurité & Audit Informatique",
      "Chef de Projet Digital / Product Manager / Scrum Master",
      "UI/UX Designer / Web Designer / Graphiste",
      "Spécialiste Automatisation (Make, Zapier, n8n, Python)",
    ],
  },
  {
    category: "Direction, Stratégie & Entrepreneuriat",
    options: [
      "Chef d'Entreprise / Fondateur / CEO",
      "Directeur Général / Cadre Dirigeant",
      "Entrepreneur / Auto-entrepreneur",
      "Freelance / Consultant Indépendant",
      "Responsable Stratégie & Transformation Digitale",
      "Directeur des Opérations (COO)",
    ],
  },
  {
    category: "Marketing, Communication & Vente",
    options: [
      "Responsable / Directeur Marketing",
      "Spécialiste Marketing Digital & Acquisition (Growth / Ads)",
      "Community Manager / Responsable Réseaux Sociaux",
      "Créateur de Contenu / Rédacteur Web / Copywriter",
      "Directeur Commercial / Responsable des Ventes",
      "Business Developer / Ingénieur Commercial",
      "Chargé de Relations Publiques & Communication",
    ],
  },
  {
    category: "Banque, Finance, Audit & Comptabilité",
    options: [
      "Analyste Financier / Banquier d'Affaires",
      "Responsable Administratif et Financier (RAF)",
      "Comptable / Chef Comptable",
      "Expert-Comptable / Commissaire aux Comptes",
      "Auditeur Interne / Auditeur Financier",
      "Gestionnaire de Patrimoine / Courtier / Actuaire",
    ],
  },
  {
    category: "Ressources Humaines & Recrutement",
    options: [
      "Directeur / Responsable des Ressources Humaines (DRH)",
      "Chargé de Recrutement / Talent Acquisition",
      "Responsable Formation & Développement des Compétences",
      "Consultant RH / Coach Professionnel",
    ],
  },
  {
    category: "Éducation, Enseignement & Recherche",
    options: [
      "Enseignant / Professeur (Lycée, Collège, Primaire)",
      "Enseignant-Chercheur / Professeur d'Université",
      "Formateur Professionnel / Consultant Pédagogique",
      "Étudiant (Licence, Master, Doctorat)",
      "Élève Ingénieur / Élève en École de Commerce",
      "En reconversion professionnelle / En recherche d'emploi",
    ],
  },
  {
    category: "Santé, Médical & Sciences",
    options: [
      "Médecin / Chirurgien / Dentiste",
      "Pharmacien / Industrie Pharmaceutique",
      "Infirmier / Cadre de Santé / Profession Paramédicale",
      "Biologiste / Chercheur en Sciences Médicales",
    ],
  },
  {
    category: "Juridique, Droit & Administration Publique",
    options: [
      "Avocat / Notaire / Juriste d'Entreprise",
      "Magistrat / Juge / Greffier",
      "Fonctionnaire / Cadre de l'Administration Publique",
      "Consultant / Expert en ONG & Organisations Internationales",
      "Diplomate / Relations Internationales",
    ],
  },
  {
    category: "BTP, Ingénierie, Logistique & Énergie",
    options: [
      "Ingénieur Génie Civil / BTP / Construction",
      "Architecte / Urbaniste / Géomètre",
      "Responsable Logistique / Supply Chain Manager",
      "Ingénieur Énergie / Mines / Pétrole / Environnement",
      "Ingénieur Agronome / Agroalimentaire",
    ],
  },
  {
    category: "Médias, Journalisme & Création",
    options: [
      "Journaliste / Rédacteur en Chef",
      "Réalisateur / Monteur Vidéo / Motion Designer",
      "Photographe / Vidéaste",
      "Artiste / Producteur / Événementiel",
    ],
  },
  {
    category: "Autre Secteur",
    options: [
      "Autre secteur d'activité",
    ],
  },
]

export const ALL_KNOWN_SECTORS = SECTOR_CATEGORIES.flatMap((c) => c.options)




export interface ResourceItem {
  id: string
  type: 'prompt' | 'business-plan'
  title: { fr: string; en: string }
  desc: { fr: string; en: string }
  sector?: { fr: string; en: string }
  content: { fr: string; en: string } // The prompt text or business plan breakdown summary
  downloadUrl?: string
}

export const resourcesData: ResourceItem[] = [
  {
    id: "prompt-linkedin",
    type: "prompt",
    title: {
      fr: "Optimisation de profil LinkedIn Pro",
      en: "Pro LinkedIn Profile Optimization"
    },
    desc: {
      fr: "Un prompt pour réécrire votre titre professionnel, votre résumé (Infos) et valoriser vos compétences pour attirer des recruteurs et clients.",
      en: "A prompt to rewrite your professional headline, about section, and highlight your skills to attract recruiters and clients."
    },
    content: {
      fr: `Agis en tant qu'expert en personal branding et rédacteur LinkedIn professionnel. Je vais te donner mon CV et mes objectifs de carrière. Ton rôle est de rédiger :
1. Trois options de titres professionnels (headlines) percutants (max 220 caractères chacun), incluant des mots-clés ATS et ma proposition de valeur.
2. Une section "Infos" (About) rédigée à la première personne, captivante dès les 3 premières lignes, structurée avec des puces pour mes compétences clés, et se terminant par un appel à l'action clair (CTA).
3. Une liste de 5 compétences stratégiques à ajouter à mon profil.

Voici mon profil et mes objectifs :
[INSERER VOTRE CV OU DESCRIPTION DE CARRIERE ET VOS OBJECTIFS ICI]`,
      en: `Act as a personal branding expert and professional LinkedIn copywriter. I will provide you with my CV and career goals. Your role is to write:
1. Three options for impactful professional headlines (max 220 characters each), including ATS keywords and my value proposition.
2. An "About" section written in the first person, engaging from the first 3 lines, structured with bullet points for my key skills, and ending with a clear Call to Action (CTA).
3. A list of 5 strategic skills to add to my profile.

Here is my profile and goals:
[INSERT YOUR CV OR CAREER DESCRIPTION AND GOALS HERE]`
    }
  },
  {
    id: "prompt-marketing-b2b",
    type: "prompt",
    title: {
      fr: "Email de prospection commerciale B2B",
      en: "B2B Sales Outbound Email"
    },
    desc: {
      fr: "Générez des e-mails de prospection froide ultra-personnalisés, concis et axés sur la valeur pour maximiser vos taux d'ouverture et de réponse.",
      en: "Generate ultra-personalized, concise, and value-focused cold outbound emails to maximize your open and response rates."
    },
    content: {
      fr: `Rédige un email de prospection froide B2B concis (moins de 150 mots) destiné à [TITRE DE LA CIBLE, ex: Directeur Marketing] chez [NOM DE L'ENTREPRISE].
L'objectif est de lui proposer notre service de [VOTRE SERVICE, ex: automatisation IA] pour résoudre son problème de [PROBLEME CIBLE, ex: perte de temps sur la saisie de données].

Respecte cette structure :
1. Objet de l'email : Intriguant, court (max 6 mots), sans consonance commerciale.
2. Accroche : Personnalisée liée à un défi commun dans leur secteur.
3. Proposition de valeur : Une phrase simple montrant comment on résout ce problème avec une preuve ou un bénéfice chiffré.
4. Appel à l'action (CTA) : Souple et sans pression (ex: "Êtes-vous disponible pour un échange rapide de 10 minutes mardi prochain ?").
5. Pas de jargon, ton professionnel mais direct.`,
      en: `Write a concise B2B cold outbound email (under 150 words) targeted at [TARGET JOB TITLE, e.g. Marketing Director] at [COMPANY NAME].
The goal is to pitch our [YOUR SERVICE, e.g. AI automation service] to solve their problem of [TARGET PROBLEM, e.g. time lost on manual data entry].

Follow this structure:
1. Subject line: Intriguing, short (max 6 words), non-spammy.
2. Hook: Personalized, referencing a common challenge in their industry.
3. Value proposition: A single sentence showing how we solve that problem with social proof or a quantifiable benefit.
4. Call to Action (CTA): Low friction (e.g. "Are you open to a quick 10-minute chat next Tuesday?").
5. No jargon, professional but direct tone.`
    }
  },
  {
    id: "bp-aviculture",
    type: "business-plan",
    title: {
      fr: "Modèle de Business Plan - Aviculture Moderne",
      en: "Business Plan Template - Modern Poultry Farming"
    },
    sector: {
      fr: "Élevage & Agri-business",
      en: "Poultry & Agri-business"
    },
    desc: {
      fr: "Structure complète d'un projet d'élevage de poulets de chair et pondeuses au Burkina Faso. Inclut l'étude de marché locale et la modélisation financière type.",
      en: "Complete business plan structure for a broiler and layer poultry farm in Burkina Faso. Includes local market study and standard financial modeling."
    },
    content: {
      fr: `STRUCTURE DU BUSINESS PLAN - AVICULTURE AU BURKINA FASO

1. RÉSUMÉ EXÉCUTIF (Executive Summary)
   - Présentation du promoteur et vision du projet.
   - Objectifs de production (ex: 5 000 poulets de chair par cycle).
   - Besoins de financement et rentabilité estimée.

2. ÉTUDE DE MARCHÉ ET STRATÉGIE MARKETING
   - Demande locale en protéines et opportunités (marché de Ouagadougou / Bobo-Dioulasso).
   - Analyse de la concurrence (importations vs production locale fraîche).
   - Canaux de distribution (grossistes, rôtisseries, supermarchés, vente directe).
   - Stratégie de prix au kilogramme.

3. PLAN TECHNIQUE ET OPÉRATIONNEL
   - Localisation du site (accès eau, électricité, sécurité).
   - Infrastructure : Plan de construction du bâtiment d'élevage (poulailler semi-ouvert).
   - Équipements : Mangeoires, abreuvoirs, radiants de chauffage, système d'aération.
   - Intrants : Approvisionnement en poussins d'un jour de qualité et en aliments (démarrage, croissance, finition).
   - Suivi vétérinaire : Plan de prophylaxie médicale (vaccins, vitamines).

4. PLAN FINANCIER TYPE (Estimations en FCFA)
   - Investissements initiaux : Terrain, bâtiment, puits/forage, matériel (approx. 4 000 000 FCFA).
   - Charges d'exploitation par cycle (45 jours) : Poussins, aliments, produits vétérinaires, main d'œuvre (approx. 2 500 000 FCFA pour 2 000 sujets).
   - Recettes prévisionnelles : Vente des sujets à 45 jours (taux de perte estimé à 5%).
   - Point mort (seuil de rentabilité) et retour sur investissement (estimé sous 18 mois).`,
      en: `BUSINESS PLAN STRUCTURE - POULTRY FARMING IN BURKINA FASO

1. EXECUTIVE SUMMARY
   - Presenter's background and project vision.
   - Production targets (e.g., 5,000 broilers per cycle).
   - Funding requirements and estimated ROI.

2. MARKET RESEARCH & MARKETING STRATEGY
   - Local demand for protein and opportunities in Ouagadougou / Bobo-Dioulasso.
   - Competitor analysis (imported frozen chicken vs fresh local production).
   - Distribution channels (wholesalers, restaurants, supermarkets, direct sales).
   - Pricing strategy per kilogram.

3. TECHNICAL & OPERATIONAL PLAN
   - Site location (access to water, electricity, security).
   - Infrastructure: Design of the poultry house (semi-open ventilation).
   - Equipment: Feeders, drinkers, brooder heaters, ventilation systems.
   - Raw materials: sourcing day-old chicks and feed (starter, grower, finisher).
   - Veterinary care: Vaccination program and prophylaxis.

4. FINANCIAL MODELING (Estimates in FCFA)
   - Capital Expenditures (CapEx): Land, housing, borehole, equipment (approx. 4,000,000 FCFA).
   - Operational Expenditures (OpEx) per 45-day cycle: Chicks, feed, vaccines, labor (approx. 2,500,000 FCFA for 2,000 birds).
   - Projected revenue: sales of birds at 45 days (estimated mortality rate of 5%).
   - Break-even point and payback period (estimated under 18 months).`
    },
    downloadUrl: "/templates/Business_Plan_Aviculture_Burkina_Faso_Template.docx"
  },
  {
    id: "bp-marichage",
    type: "business-plan",
    title: {
      fr: "Modèle de Business Plan - Agri-business (Maraîchage)",
      en: "Business Plan Template - Agri-business (Market Gardening)"
    },
    sector: {
      fr: "Agriculture irriguée",
      en: "Irrigated Agriculture"
    },
    desc: {
      fr: "Modèle complet de projet agricole axé sur la production maraîchère (tomates, oignons, piments) avec système d'irrigation goutte-à-goutte solaire au Burkina Faso.",
      en: "Complete business plan template for an agricultural project focused on vegetable production (tomatoes, onions, chili) using solar drip irrigation in Burkina Faso."
    },
    content: {
      fr: `STRUCTURE DU BUSINESS PLAN - MARAÎCHAGE IRRIGATION SOLAIRE

1. RÉSUMÉ EXÉCUTIF
   - Description du projet d'exploitation agricole de contre-saison sur [Superficie, ex: 1 Hectare].
   - Objectifs de rendement annuel par culture.
   - Investissement nécessaire pour l'installation du système solaire et retour sur investissement.

2. ÉTUDE DE MARCHÉ ET POSITIONNEMENT
   - Analyse de la saisonnalité des prix des légumes au Burkina Faso (forte hausse en saison sèche).
   - Segmentation client : Vente sur les marchés locaux, contrats avec les grossistes de Ouagadougou.
   - Stratégie de prix et calendrier cultural pour récolter au moment des prix les plus élevés.

3. EXPLOITATION TECHNIQUE
   - Aménagement du sol, clôture de sécurité.
   - Forage et installation d'un système de pompage solaire photovoltaïque.
   - Réseau d'irrigation goutte-à-goutte (économie d'eau et de main d'œuvre).
   - Calendrier des cultures et rotation pour préserver la fertilité du sol.
   - Choix des semences améliorées résistantes au climat chaud.

4. BUDGET ET FINANCES (Estimations en FCFA)
   - Investissements (CapEx) : Clôture, forage, système solaire de pompage, réseau goutte-à-goutte (approx. 5 500 000 FCFA pour 1 Hectare).
   - Charges annuelles (OpEx) : Semences, engrais organiques/NPK, traitements phytosanitaires, carburant/entretien, salaires des ouvriers agricoles (approx. 1 800 000 FCFA / an).
   - Chiffre d'affaires prévisionnel : Rendement estimé à l'hectare (ex: 20 tonnes d'oignons, 15 tonnes de tomates).
   - Seuil de rentabilité atteint dès la 2ème année d'exploitation.`,
      en: `BUSINESS PLAN STRUCTURE - SOLAR DRIP IRRIGATION GARDENING

1. EXECUTIVE SUMMARY
   - Description of the off-season farming project on [Size, e.g., 1 Hectare].
   - Annual yield targets per crop.
   - Capital required for solar pump installation and projected profitability.

2. MARKET RESEARCH & POSITIONING
   - Seasonal price fluctuations of vegetables in Burkina Faso (prices surge in dry season).
   - Customer segments: Local markets, supply contracts with wholesalers in major cities.
   - Crop calendar scheduling to harvest during peak price periods.

3. TECHNICAL OPERATIONS
   - Land preparation and perimeter fencing.
   - Borehole drilling and installation of a solar-powered water pumping system.
   - Drip irrigation network setup (water conservation and labor reduction).
   - Rotation schedule to maintain soil nutrients.
   - Selection of climate-resilient improved seed varieties.

4. BUDGET & FINANCIALS (Estimates in FCFA)
   - Capital Expenditures (CapEx): Fencing, borehole, solar pump, drip system (approx. 5,500,000 FCFA for 1 Hectare).
   - Annual Operating Expenditures (OpEx): Seeds, organic/NPK fertilizers, crop protection, maintenance, labor (approx. 1,800,000 FCFA / year).
   - Projected Revenue: Estimated crop yields (e.g., 20 tons of onions, 15 tons of tomatoes).
   - Break-even point reached in the 2nd year of operations.`
    },
    downloadUrl: "/templates/Business_Plan_Maraichage_Solaire_Burkina_Faso_Template.docx"
  }
]

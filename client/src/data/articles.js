// ── Nirman Setu — Blog / SEO Articles ────────────────────────────────────────
// Each article targets a real Google search query from Jharkhand users.
// Sections: para | h2 | h3 | table | list | tip | warning | faq | cta

export const CATEGORIES = [
  { id: 'all',    label: 'Sab',             labelEn: 'All' },
  { id: 'rates',  label: 'Rates & Prices',  labelEn: 'Rates & Prices' },
  { id: 'rental', label: 'Rental / Kiraya', labelEn: 'Rental' },
  { id: 'guide',  label: 'Guide',           labelEn: 'Guide' },
  { id: 'tips',   label: 'Tips & Tricks',   labelEn: 'Tips' },
];

export const ARTICLES = [

  // ── 1 ────────────────────────────────────────────────────────────────────────
  {
    slug: 'cement-price-ranchi-2025',
    category: 'rates',
    featured: true,
    title: 'Cement Price in Ranchi Today 2025 — OPC, PPC, White Cement Rate',
    titleShort: 'Cement Rate Ranchi 2025',
    description: 'Ranchi mein aaj cement ka bhav — Ultratech, JK, ACC, Ambuja ka 50kg bag rate. OPC 43, OPC 53, PPC sab ka updated price list.',
    tags: ['cement', 'ranchi', 'price', 'ultratech', 'jharkhand', 'opc', 'ppc'],
    date: '2025-05-07',
    readMin: 5,
    sections: [
      {
        type: 'para',
        text: 'Ghar banane mein cement sabse important material hai. Ranchi aur Jharkhand mein cement ka bhav hafte-hafte badalta rehta hai — raw material cost, transport, aur demand ke hisab se. Is article mein hum aaj ke updated cement rates, brands ka comparison, aur kaunsa cement kab use karein — sab batayenge.',
      },
      {
        type: 'h2',
        text: 'Ranchi Mein Cement Ka Aaj Ka Bhav (May 2025)',
      },
      {
        type: 'table',
        headers: ['Brand', 'Type', '50kg Bag Rate', 'Per Ton (Approx)'],
        rows: [
          ['Ultratech', 'OPC 43 Grade', '₹400–420', '₹7,800–8,200'],
          ['Ultratech', 'PPC',          '₹380–400', '₹7,400–7,800'],
          ['JK Cement', 'OPC 43 Grade', '₹390–415', '₹7,600–8,100'],
          ['JK Cement', 'PPC',          '₹370–395', '₹7,200–7,700'],
          ['ACC',        'OPC 53 Grade', '₹405–425', '₹7,900–8,300'],
          ['Ambuja',     'PPC',          '₹375–400', '₹7,300–7,800'],
          ['Shree Cement','PPC',         '₹365–390', '₹7,100–7,600'],
          ['Wonder Cement','OPC 43',     '₹385–410', '₹7,500–8,000'],
          ['White Cement','(any brand)', '₹700–900', '₹14,000–18,000'],
        ],
        note: 'Ye rates approximate hain — actual rate dealer ke hisab se 2–5% upar-neeche ho sakta hai. Bulk order (10+ ton) mein discount milta hai.',
      },
      {
        type: 'h2',
        text: 'OPC vs PPC — Kaunsa Cement Kab Use Karein?',
      },
      {
        type: 'table',
        headers: ['Parameter', 'OPC (Ordinary Portland)', 'PPC (Portland Pozzolana)'],
        rows: [
          ['Strength',        'Jaldi set hota hai',           'Dheere set hota hai lekin long-term mein strong'],
          ['Best for',        'Slab, column, beam',           'Plaster, brickwork, flooring'],
          ['Heat generation', 'Zyada heat',                   'Kam heat — cracks kam'],
          ['Cost',            'Thoda mehenga',                'Thoda sasta'],
          ['Waterproofing',   'Average',                      'Better waterproofing'],
          ['Recommendation',  'Structural work mein',         'Non-structural work mein'],
        ],
      },
      {
        type: 'tip',
        text: 'Pro Tip: Slab aur pillar ke liye OPC 53 grade use karo. Wall plastering aur flooring ke liye PPC better hai — paisa bhi bachega, cracks bhi kam honge.',
      },
      {
        type: 'h2',
        text: 'Cement Kharidne Se Pehle Yeh Zaroor Check Karein',
      },
      {
        type: 'list',
        items: [
          'Manufacturing date check karo — 3 mahine se purana cement mat kharido',
          'Bag mein koi chhid ya geelapan nahi hona chahiye',
          'ISI mark (IS 269 OPC ya IS 1489 PPC) hona chahiye',
          'Bulk mein kharidne se pehle ek batch test karwao',
          'Ek site ke liye ek hi brand use karo — mix mat karo',
          'Nami se bachao — raised platform pe rakho',
        ],
      },
      {
        type: 'h2',
        text: '1000 Sqft Slab Mein Kitne Cement Bags Lagte Hain?',
      },
      {
        type: 'table',
        headers: ['Kaam', 'Cement (Bags)', 'Sand (CFT)', 'Gitti (CFT)'],
        rows: [
          ['1000 sqft Slab (4" thick)',   '90–110 bags', '300–350', '400–450'],
          ['1000 sqft Plaster (12mm)',    '60–75 bags',  '200–250', '—'],
          ['1000 sqft Brickwork',         '80–100 bags', '250–300', '—'],
          ['1000 sqft Flooring (3" base)','30–40 bags',  '150–180', '200–250'],
        ],
        note: 'Yeh standard estimates hain (M20 concrete ke liye). Actual quantity soil type, mix ratio, aur wastage pe depend karta hai.',
      },
      {
        type: 'faq',
        items: [
          { q: 'Kya bulk mein cement sasta milta hai?', a: '10 ton se zyada order karne pe generally 3–8% discount milta hai. Dealer se negotiate karo aur ek saath order karo.' },
          { q: 'Cement store karne ka sahi tarika kya hai?', a: 'Wooden pallet ya raised platform pe rakho. Neeche seedha mat rakho. Plastic sheet se cover karo. 3 mahine se zyada store mat karo.' },
          { q: 'OPC 43 aur OPC 53 mein kya farak hai?', a: 'Numbers 28-day compressive strength ko indicate karte hain (N/mm²). 53 grade zyada strong hai, structural work ke liye better. 43 grade general purpose ke liye theek hai.' },
          { q: 'Kya online cement mangwana safe hai?', a: 'Verified platform se, haan. Nirman Setu pe order karo — verified suppliers se best price mein delivery possible hai.' },
        ],
      },
    ],
    ctaText: 'Cement Best Price Mein Mangwao',
    ctaCategory: 'basic_materials',
  },

  // ── 2 ────────────────────────────────────────────────────────────────────────
  {
    slug: 'jcb-rent-jharkhand-2025',
    category: 'rental',
    featured: true,
    title: 'JCB Rent in Jharkhand 2025 — Per Hour & Per Day Rate',
    titleShort: 'JCB Rent Jharkhand 2025',
    description: 'Jharkhand mein JCB, excavator aur crane ka kiraya kitna hai? Per hour, per day aur weekly rate — sabhi types ke liye updated rate list.',
    tags: ['jcb', 'jharkhand', 'rent', 'excavator', 'ranchi', 'machinery'],
    date: '2025-05-07',
    readMin: 4,
    sections: [
      {
        type: 'para',
        text: 'Foundation khodna ho, foundation backfill karni ho, ya site ka debris hatana ho — JCB aur excavator ke bina construction kaam nahi karta. Jharkhand mein machinery ka kiraya sheher, soil type aur availability pe depend karta hai. Yahan sab kuch detail mein bataya gaya hai.',
      },
      {
        type: 'h2',
        text: 'Jharkhand Mein JCB / Excavator Ka Kiraya 2025',
      },
      {
        type: 'table',
        headers: ['Machine Type', 'Per Hour', 'Per Day (8–10 hrs)', 'Per Week'],
        rows: [
          ['JCB 3DX (Standard Backhoe)',  '₹1,200–1,500', '₹9,000–12,000',  '₹55,000–70,000'],
          ['Mini Excavator (1–2 ton)',     '₹900–1,200',   '₹7,000–9,500',   '₹40,000–55,000'],
          ['Standard Excavator (5–6 ton)','₹1,500–2,000', '₹12,000–16,000', '₹70,000–90,000'],
          ['Large Excavator (10+ ton)',    '₹2,500–3,500', '₹18,000–25,000', '₹1,00,000+'],
          ['Crane (Mobile, 10 ton)',       '₹2,000–3,000', '₹15,000–22,000', '₹80,000–1,20,000'],
          ['Road Roller',                  '₹1,000–1,400', '₹8,000–11,000',  '₹45,000–60,000'],
          ['Concrete Mixer (Electric)',    '₹300–500',     '₹1,500–2,500',   '₹8,000–12,000'],
          ['Concrete Mixer (Tractor)',     '₹800–1,200',   '₹5,000–8,000',   '₹25,000–40,000'],
        ],
        note: 'Operator ka kharcha alag hoga — generally ₹600–1,000/day. Fuel bhi alag lagta hai jab tak "with fuel" na likha ho.',
      },
      {
        type: 'h2',
        text: 'JCB Hire Karne Se Pehle Yeh Zaroor Puchho',
      },
      {
        type: 'list',
        items: [
          'Operator included hai ya nahi? (generally alag charge hota hai)',
          'Fuel konsa lagega — diesel ya petrol? Kaun dega?',
          'Mobilization charge kitna hai? (JCB site tak lane ka charge)',
          'Minimum hours kitne hain? (usually 4–6 hours minimum)',
          'Overtime rate kya hoga? (raat ko ya 8 hours ke baad)',
          'Machine ki condition theek hai? On-site check karo pehle',
          'Papers valid hain? Registration, insurance check karo',
        ],
      },
      {
        type: 'tip',
        text: 'Smart Tip: JCB ka kiraya weekday mein thoda kam hota hai. Weekend pe rush hota hai to rates badh jaate hain. Agar kaam 2-3 din ka hai to weekly deal negotiate karo — 15–25% bachta hai.',
      },
      {
        type: 'h2',
        text: 'Kaunsa JCB / Machine Kab Chahiye?',
      },
      {
        type: 'table',
        headers: ['Kaam', 'Best Machine', 'Reason'],
        rows: [
          ['Foundation khodna (residential)', 'JCB 3DX ya Mini Excavator', 'Tight space mein fit hota hai'],
          ['Large commercial excavation',      'Standard Excavator 5–6 ton', 'Zyada capacity, tez kaam'],
          ['Material lifting (heavy)',          'Mobile Crane',              'Safe lifting, adjustable arm'],
          ['Road / driveway leveling',          'Road Roller',               'Compaction ke liye zaroor'],
          ['Concrete work (large slab)',        'Transit Mixer + Pump',      'Ready mix concrete ke liye'],
          ['Debris hataana / loading',          'JCB 3DX',                   'Loading arm se truck mein daalo'],
        ],
      },
      {
        type: 'faq',
        items: [
          { q: 'Kya Ranchi mein JCB same-day mil sakta hai?', a: 'Haan, agar advance booking ho to same-day possible hai. Urgent ke liye Nirman Setu pe request karo — 2 ghante mein response milta hai.' },
          { q: 'Rain season mein JCB rate badh jaata hai?', a: 'Haan, monsoon (July–September) mein demand aur rate dono badhte hain — roughly 15–20%. Monsoon se pehle book karo.' },
          { q: 'Kya half-day JCB lena possible hai?', a: 'Haan, most operators 4-hour minimum mein dete hain. Full day se thoda zyada per hour rate lagta hai half-day mein.' },
        ],
      },
    ],
    ctaText: 'JCB / Machinery Book Karo',
    ctaCategory: 'machinery',
  },

  // ── 3 ────────────────────────────────────────────────────────────────────────
  {
    slug: 'ghar-banane-mein-kitna-kharcha-2025',
    category: 'guide',
    featured: true,
    title: 'Ghar Banane Mein Kitna Kharcha Aata Hai 2025 — Jharkhand',
    titleShort: 'Ghar Banane Ka Total Kharcha',
    description: 'Jharkhand mein 1000 sqft, 1500 sqft aur 2000 sqft ghar banane mein kitna kharcha aata hai? Material + labour + finishing — poora budget breakdown.',
    tags: ['ghar', 'construction', 'cost', 'jharkhand', 'ranchi', 'budget'],
    date: '2025-05-07',
    readMin: 7,
    sections: [
      {
        type: 'para',
        text: 'Ghar banana life ka sabse bada investment hai. Sahi budget planning se paisa bachta hai aur kaam bhi achha hota hai. Jharkhand mein construction cost dilli ya mumbai se kam hai — lekin sahi estimate ke bina log paise kam padne ki problem face karte hain. Yahan per sqft cost, material + labour breakdown, aur common mistakes ka poora guide hai.',
      },
      {
        type: 'h2',
        text: 'Jharkhand Mein Per Sqft Construction Cost 2025',
      },
      {
        type: 'table',
        headers: ['Quality', 'Per Sqft (Structure only)', 'Per Sqft (Structure + Finishing)', 'Notes'],
        rows: [
          ['Basic (Sasta)',    '₹1,200–1,500', '₹1,600–2,000', 'Simple material, minimum finishing'],
          ['Standard',        '₹1,500–1,900', '₹2,000–2,600', 'Mid-range material, normal finishing'],
          ['Semi-Premium',    '₹1,900–2,400', '₹2,600–3,400', 'Good material, tiles, paint, wood work'],
          ['Premium',         '₹2,400–3,200', '₹3,400–5,000', 'Best material, designer interior, full fit-out'],
        ],
        note: '"Structure only" = foundation, walls, slab, roof. "Finishing" = plaster, tiles, paint, doors, windows, electrical, plumbing.',
      },
      {
        type: 'h2',
        text: '1000 / 1500 / 2000 Sqft Ghar Ka Total Budget',
      },
      {
        type: 'table',
        headers: ['Size', 'Basic Budget', 'Standard Budget', 'Semi-Premium'],
        rows: [
          ['1,000 sqft', '₹16–20 Lakh', '₹20–26 Lakh', '₹26–34 Lakh'],
          ['1,200 sqft', '₹19–24 Lakh', '₹24–31 Lakh', '₹31–41 Lakh'],
          ['1,500 sqft', '₹24–30 Lakh', '₹30–39 Lakh', '₹39–51 Lakh'],
          ['2,000 sqft', '₹32–40 Lakh', '₹40–52 Lakh', '₹52–68 Lakh'],
        ],
        note: 'Yeh estimates hain. Actual cost foundation depth, floors (G+1 vs G+2), location aur design pe depend karta hai. Basement ho to 20–30% cost badh jaata hai.',
      },
      {
        type: 'h2',
        text: 'Kharche Ka Breakdown — Kahan Kitna Jaata Hai?',
      },
      {
        type: 'table',
        headers: ['Category', 'Standard Budget Ka %', '1500 Sqft Standard Mein Roughly'],
        rows: [
          ['Material (Cement, Sand, Steel, Brick)', '45–50%', '₹13–15 Lakh'],
          ['Labour (Mason, Helper, Skilled)',        '25–30%', '₹8–10 Lakh'],
          ['Electrical Work (Complete)',             '5–7%',   '₹1.5–2.5 Lakh'],
          ['Plumbing & Sanitary',                    '4–6%',   '₹1.2–2 Lakh'],
          ['Paint & Finishing',                      '5–7%',   '₹1.5–2.5 Lakh'],
          ['Doors & Windows',                        '6–8%',   '₹1.8–3 Lakh'],
          ['Design + Miscellaneous',                 '3–5%',   '₹1–1.5 Lakh'],
        ],
      },
      {
        type: 'tip',
        text: 'Smart Planning: Pehle poora design finalize karo, phir material kharido. Design bich mein change karne se 15–25% extra kharcha hota hai — wiring, plumbing, tiling sab dubara karna pad sakta hai.',
      },
      {
        type: 'h2',
        text: 'Paisa Bachane Ke 5 Practical Tips',
      },
      {
        type: 'list',
        items: [
          'Steel aur cement bulk mein kharido — 5–10 ton ek saath order karne pe discount milta hai',
          'Simple rectangular design rakho — curves aur complex shapes mein material aur labour dono zyada lagte hain',
          'Plastering aur tiles ke liye PPC cement use karo — OPC se sasta, kaam bhi achha',
          'Monsoon se pehle slab carpet karo — monsoon mein labour rate badh jaata hai',
          'Verified suppliers se direct lena — beech mein dalali nahi, market rate milta hai',
        ],
      },
      {
        type: 'warning',
        text: 'Common Mistake: Bahut log "sasta" material khareed ke 1–2 saal mein cracks, seepage, aur peeling face karte hain — repair mein original saving se zyada kharcha hota hai. Quality material = long-term savings.',
      },
      {
        type: 'faq',
        items: [
          { q: 'Kya bank loan milta hai ghar banane ke liye?', a: 'Haan, SBI, HDFC, PNB sab construction loan deti hain — generally property value ka 75–80%. Documentation mein map approval + land papers chahiye.' },
          { q: 'Ghar G+1 banana chahiye ya G+0?', a: 'Agar budget hai to G+1 better hai — land cost per sqft half ho jaata hai. Construction cost bhi per sqft kam hota hai top floor mein. Long term mein zyada value.' },
          { q: 'Contractor ko kaise rakhe — theka ya rate?', a: 'Chhote kaam ke liye daily rate (rate basis) better. Bade projects ke liye full theka lo aur materials khud kharido — quality control tumhare haath mein rahega.' },
        ],
      },
    ],
    ctaText: 'Free Material Quote Lo',
    ctaCategory: 'basic_materials',
  },

  // ── 4 ────────────────────────────────────────────────────────────────────────
  {
    slug: 'sariya-tmt-steel-price-jharkhand-2025',
    category: 'rates',
    featured: false,
    title: 'Sariya (TMT Steel) Price in Jharkhand 2025 — Fe500, Fe550 Rate',
    titleShort: 'Sariya Rate Jharkhand 2025',
    description: 'Jharkhand mein TMT steel (sariya) ka aaj ka bhav — Fe500 aur Fe550 grade, 8mm se 32mm tak per kg aur per ton rate. Tata, SAIL, Hiscon comparison.',
    tags: ['sariya', 'steel', 'tmt', 'jharkhand', 'price', 'fe500', 'fe550'],
    date: '2025-05-07',
    readMin: 4,
    sections: [
      {
        type: 'para',
        text: 'RCC construction mein cement ke baad sabse important material sariya hai. Jharkhand mein SAIL ka bada plant hone ki wajah se steel thoda sasta milta hai compared to other states. Phir bhi market mein quality ke naam pe substandard material bhi bik raha hai — pehle rates jaano, phir quality check karo.',
      },
      {
        type: 'h2',
        text: 'TMT Steel Rate Jharkhand May 2025',
      },
      {
        type: 'table',
        headers: ['Brand', 'Grade', 'Per Kg Rate', 'Per Ton (MT)'],
        rows: [
          ['SAIL (Govt)',    'Fe500D', '₹56–60',  '₹56,000–60,000'],
          ['Tata Tiscon',   'Fe500D', '₹58–63',  '₹58,000–63,000'],
          ['Hiscon',        'Fe500',  '₹54–58',  '₹54,000–58,000'],
          ['Mecon / Local', 'Fe500',  '₹50–55',  '₹50,000–55,000'],
          ['SAIL',          'Fe550D', '₹60–65',  '₹60,000–65,000'],
          ['Tata Tiscon',   'Fe550D', '₹62–67',  '₹62,000–67,000'],
        ],
        note: 'Prices fluctuate with global steel market. Bulk (5+ ton) pe 2–4% discount negotiate kar sakte hain.',
      },
      {
        type: 'h2',
        text: 'Kaunsa Diameter Kahan Use Hota Hai?',
      },
      {
        type: 'table',
        headers: ['Diameter', 'Use'],
        rows: [
          ['8mm',  'Stirrups, ring, slab distribution bars'],
          ['10mm', 'Slab main bars, beam stirrups'],
          ['12mm', 'Slab main, column ties'],
          ['16mm', 'Beam main bars, column reinforcement'],
          ['20mm', 'Main column bars, heavy beams'],
          ['25mm', 'Heavy structural column, large spans'],
          ['32mm', 'Industrial/commercial heavy structure'],
        ],
      },
      {
        type: 'tip',
        text: 'Always Fe500D ya Fe550D kharido — "D" matlab Ductile, earthquake force absorb karta hai. Normal Fe500 se thoda mehenga hai lekin safety ke liye zaroori hai.',
      },
      {
        type: 'h2',
        text: 'Nakli / Substandard Sariya Kaise Pehchane?',
      },
      {
        type: 'list',
        items: [
          'Bar pe "Fe500D" ya brand name clearly embossed hona chahiye',
          'ISI mark check karo — IS 1786 standard',
          'Weight check: 8mm bar ka per meter weight 0.395 kg hona chahiye — agar kam ho to cheat hai',
          'Ribs (ridges) proper honi chahiye — smooth bars avoid karo',
          'Test certificate maango — reputable dealers dete hain',
          'Color ya shine se quality mat judge karo — ye sirf outer coating hai',
        ],
      },
      {
        type: 'faq',
        items: [
          { q: '1000 sqft slab mein kitna sariya lagta hai?', a: 'Standard 4-inch thick RCC slab mein approximately 600–800 kg steel lagta hai (Fe500D). Column reinforcement alag se aata hai.' },
          { q: 'Fe500 aur Fe550 mein kya farak hai?', a: 'Fe550 zyada strong hai (higher yield strength). Agar structural engineer specify kare tabhi use karo — otherwise Fe500D kaafi hai aur sasta bhi.' },
          { q: 'Kya online sariya mangwana safe hai?', a: 'Verified platform se haan. Make sure test certificate mile aur ISI mark ho. Nirman Setu pe order karne pe verified supplier se material milta hai.' },
        ],
      },
    ],
    ctaText: 'Sariya Best Rate Mein Mangwao',
    ctaCategory: 'basic_materials',
  },

  // ── 5 ────────────────────────────────────────────────────────────────────────
  {
    slug: 'balu-gitti-rate-ranchi-2025',
    category: 'rates',
    featured: false,
    title: 'Balu (Sand) aur Gitti (Aggregate) Rate in Ranchi 2025',
    titleShort: 'Balu Gitti Rate Ranchi',
    description: 'Ranchi mein river sand (balu), M-Sand aur gitti (aggregate) ka aaj ka rate — per CFT, per brass aur per ton price. Seasonal variation bhi samjhein.',
    tags: ['balu', 'sand', 'gitti', 'aggregate', 'ranchi', 'rate', 'jharkhand'],
    date: '2025-05-07',
    readMin: 4,
    sections: [
      {
        type: 'para',
        text: 'Sand aur aggregate (gitti) construction ka volume-wise sabse zyada use hone wala material hai. Inki quality aur rate bahut vary karta hai — legitimate sources se kharidne pe quality bhi achhi milti hai aur koi legal problem bhi nahi hoti. Jharkhand mein river sand limited hai, isliye M-Sand ka use badhta ja raha hai.',
      },
      {
        type: 'h2',
        text: 'Ranchi Mein Sand Aur Aggregate Rate May 2025',
      },
      {
        type: 'table',
        headers: ['Material', 'Unit', 'Rate', 'Equivalent'],
        rows: [
          ['River Sand (Balu)', 'Per CFT',          '₹55–75',         '1 Brass = 100 CFT'],
          ['River Sand (Balu)', 'Per Brass',         '₹5,500–7,500',   '~18 ton per brass'],
          ['M-Sand',            'Per CFT',           '₹40–55',         'Better availability'],
          ['M-Sand',            'Per Ton',           '₹1,200–1,600',   '—'],
          ['10mm Gitti',        'Per CFT',           '₹50–65',         '—'],
          ['20mm Gitti',        'Per CFT',           '₹45–60',         'Most common'],
          ['40mm Gitti',        'Per CFT',           '₹42–55',         'Foundation work'],
          ['Aggregate (20mm)',  'Per Ton',           '₹1,400–1,800',   '—'],
          ['Stone Dust',        'Per CFT',           '₹20–30',         'Backfill mein use'],
        ],
        note: 'Monsoon mein (July–Sept) river sand ki supply bahut kam hoti hai — rate 40–60% badh sakta hai. M-Sand ka rate zyada stable rehta hai.',
      },
      {
        type: 'h2',
        text: 'River Sand vs M-Sand — Kaunsa Better Hai?',
      },
      {
        type: 'table',
        headers: ['Parameter', 'River Sand', 'M-Sand (Manufactured)'],
        rows: [
          ['Quality for concrete', 'Excellent (rounded particles)', 'Good (angular particles, slightly higher strength)'],
          ['Quality for plaster',  'Excellent',                     'Good, needs adjustment'],
          ['Availability',         'Seasonal — limited',            'Year-round available'],
          ['Price',                'Zyada (especially monsoon)',     'Kam, stable'],
          ['Legal status',         'Mining permit required',        'Legal, no issues'],
          ['Organic matter',       'Sometimes present',             'None'],
        ],
      },
      {
        type: 'warning',
        text: 'Caution: Illegal mining se nikla balu (bina permit ke) use karne pe project mein legal issues aa sakte hain. Sirf verified dealers se kharido jo proper invoice dete hain.',
      },
      {
        type: 'tip',
        text: 'Paisa Bachao: Monsoon se 2 mahine pehle sand stock karo jab rate lowest hota hai. Ek chhat pe ya covered area mein store karo — baarish mein sand kharab nahi hota lekin usability ke liye dry chahiye.',
      },
      {
        type: 'faq',
        items: [
          { q: '1000 sqft slab mein kitna sand aur gitti chahiye?', a: 'Roughly: 350–400 CFT sand aur 450–500 CFT gitti (20mm). Exact quantity mix design pe depend karta hai.' },
          { q: 'Sand ki quality kaise check karein?', a: 'Haath mein lo — bilkul saaf hona chahiye, clay ya silt nahi. Ek glass paani mein dalo — agar 5 min mein kuch settle ho, silt content zyada hai. 3% se kam silt acceptable hai.' },
          { q: 'M-Sand use karna chahiye ya nahi?', a: 'Bilkul karna chahiye — quality achhi hai, cost kam hai, aur legal bhi hai. Plastering ke liye thoda adjustment chahiye (water ratio) lekin concrete ke liye seedha use kar sakte ho.' },
        ],
      },
    ],
    ctaText: 'Sand / Gitti Order Karo',
    ctaCategory: 'basic_materials',
  },

  // ── 6 ────────────────────────────────────────────────────────────────────────
  {
    slug: 'construction-material-rate-list-jharkhand-2025',
    category: 'rates',
    featured: false,
    title: 'Construction Material Rate List Jharkhand 2025 — Complete Price Guide',
    titleShort: 'Material Rate List Jharkhand',
    description: 'Jharkhand mein sab construction material ka updated rate — cement, steel, sand, gitti, tile, paint, pipe, electrical wire — ek jagah complete list.',
    tags: ['material', 'rate', 'jharkhand', 'ranchi', 'price', 'list', '2025'],
    date: '2025-05-07',
    readMin: 6,
    sections: [
      {
        type: 'para',
        text: 'Construction ka budget banane ke liye sabse pehle market rate pata hona chahiye. Yahan Jharkhand ke liye May 2025 ka updated construction material rate list diya gaya hai. Yeh rates Ranchi aur surrounding districts ke liye applicable hain — chhote sheher mein transport charge extra ho sakta hai.',
      },
      {
        type: 'h2', text: 'Basic Materials Rate',
      },
      {
        type: 'table',
        headers: ['Material', 'Unit', 'Rate Range'],
        rows: [
          ['Cement OPC 43 Grade',   '50kg bag', '₹390–420'],
          ['Cement PPC',            '50kg bag', '₹370–400'],
          ['TMT Steel Fe500D',      'Per kg',   '₹56–63'],
          ['River Sand (Balu)',     'Per CFT',  '₹55–75'],
          ['M-Sand',                'Per CFT',  '₹40–55'],
          ['Aggregate 20mm (Gitti)','Per CFT',  '₹45–60'],
          ['Fly Ash Brick',         'Per piece','₹6–8'],
          ['Red Brick (Lal Eent)',  'Per piece','₹8–12'],
          ['AAC Block',             'Per piece','₹35–55'],
          ['Binding Wire',          'Per kg',   '₹55–70'],
        ],
      },
      {
        type: 'h2', text: 'Finishing Material Rate',
      },
      {
        type: 'table',
        headers: ['Material', 'Unit', 'Rate Range'],
        rows: [
          ['Ceramic Floor Tile',    'Per sqft', '₹18–45'],
          ['Vitrified Tile',        'Per sqft', '₹35–120'],
          ['Wall Tile',             'Per sqft', '₹20–60'],
          ['Tile Adhesive',         '25kg bag', '₹350–450'],
          ['Wall Putty',            '20kg bag', '₹280–380'],
          ['Interior Paint',        'Per litre','₹180–400'],
          ['Exterior Paint',        'Per litre','₹220–450'],
          ['Primer',                'Per litre','₹120–200'],
          ['Plywood 18mm (4×8)',    'Per sheet','₹1,200–2,500'],
          ['Waterproofing Chemical','Per litre','₹250–500'],
        ],
      },
      {
        type: 'h2', text: 'Electrical & Plumbing Rate',
      },
      {
        type: 'table',
        headers: ['Material', 'Unit', 'Rate Range'],
        rows: [
          ['Electrical Wire 1.5mm (Polycab/Havells)', 'Per meter', '₹22–35'],
          ['Electrical Wire 2.5mm',                   'Per meter', '₹35–55'],
          ['Conduit Pipe (25mm)',                      'Per meter', '₹18–30'],
          ['Switch & Socket (Havells/Anchor)',         'Per set',   '₹200–800'],
          ['MCB (16A)',                                'Per piece', '₹150–400'],
          ['PVC Pipe (4 inch)',                        'Per RFT',  '₹90–140'],
          ['CPVC Pipe (1 inch)',                       'Per RFT',  '₹80–130'],
          ['Bathroom Fittings (Jaquar/Cera)',          'Per set',   '₹2,500–8,000'],
          ['Indian WC Toilet',                         'Per set',   '₹1,800–5,000'],
          ['Wash Basin',                               'Per piece', '₹1,500–6,000'],
        ],
      },
      {
        type: 'tip',
        text: 'Yeh rates approximate hain — actual rate dealer, brand, aur quantity pe depend karta hai. Bulk order mein always 5–15% negotiate karo. Nirman Setu pe request karne pe verified supplier se competitive quote milta hai.',
      },
      {
        type: 'faq',
        items: [
          { q: 'Yeh rates kitne time tak valid hain?', a: 'Cement aur steel ki rate monthly badlti hai. Sand seasonal hoti hai. Finishing materials quarterly update hote hain. Actual order ke time confirm karo.' },
          { q: 'Ranchi se door (Hazaribagh, Dhanbad) mein rate kaisa hoga?', a: 'Transport charge lagega — generally ₹50–150/km truck se. Material rate same rahega lekin delivery charge add hoga.' },
        ],
      },
    ],
    ctaText: 'Latest Rate Pe Quote Lo',
    ctaCategory: 'basic_materials',
  },

  // ── 7 ────────────────────────────────────────────────────────────────────────
  {
    slug: '1000-sqft-ghar-material-list',
    category: 'guide',
    featured: false,
    title: '1000 Sqft Ghar Banane Ke Liye Material List — Quantity Guide',
    titleShort: '1000 Sqft Material List',
    description: '1000 sqft (2 BHK) ghar banane mein kitna cement, sariya, balu, gitti, brick chahiye? Complete material quantity list with estimates.',
    tags: ['1000 sqft', 'material', 'list', 'cement', 'steel', 'ghar', 'jharkhand'],
    date: '2025-05-07',
    readMin: 5,
    sections: [
      {
        type: 'para',
        text: '1000 sqft ka simple G+0 (single floor) makaan — jo Jharkhand mein sabse common size hai — banane ke liye roughly kitna material chahiye? Neeche standard estimates diye gaye hain "Standard" quality construction ke liye. Actual quantity soil type, slab thickness, wall height aur design pe depend karta hai.',
      },
      {
        type: 'h2',
        text: '1000 Sqft House — Structure Ka Material (G+0)',
      },
      {
        type: 'table',
        headers: ['Material', 'Quantity', 'Approx Cost (May 2025)'],
        rows: [
          ['Cement OPC 43/53',          '350–400 bags (50kg)', '₹1,40,000–1,65,000'],
          ['TMT Steel Fe500D',          '4.5–5.5 ton',         '₹2,60,000–3,40,000'],
          ['River Sand / M-Sand',       '2,500–3,000 CFT',     '₹1,25,000–2,10,000'],
          ['Aggregate 20mm',            '3,000–3,500 CFT',     '₹1,35,000–2,10,000'],
          ['Fly Ash / Red Brick',       '18,000–22,000 pieces','₹1,10,000–1,80,000'],
          ['Binding Wire',              '80–100 kg',           '₹4,500–7,000'],
        ],
        note: 'Structure total material cost: ₹7.5–10.5 lakh (approximate)',
      },
      {
        type: 'h2',
        text: 'Finishing Ka Material',
      },
      {
        type: 'table',
        headers: ['Material', 'Quantity', 'Approx Cost'],
        rows: [
          ['Floor Tile (Vitrified)',   '1,100–1,200 sqft',   '₹40,000–1,20,000'],
          ['Wall Tile (Bathroom)',     '400–500 sqft',        '₹10,000–30,000'],
          ['Interior Paint',           '20–25 litre',         '₹4,000–10,000'],
          ['Exterior Paint',           '15–20 litre',         '₹3,500–9,000'],
          ['Wall Putty',               '10–12 bags (20kg)',   '₹3,000–4,500'],
          ['Plywood / Doors',          '4–5 doors',           '₹30,000–80,000'],
          ['Aluminum Windows',         '8–12 windows',        '₹25,000–60,000'],
          ['Electrical Material',      'Complete set',        '₹50,000–1,20,000'],
          ['Plumbing Material',        'Complete set',        '₹40,000–90,000'],
        ],
        note: 'Finishing total: ₹2–5 lakh depending on quality chosen.',
      },
      {
        type: 'tip',
        text: 'Total 1000 sqft (Standard quality): Structure + Finishing = ₹9.5–15.5 lakh material cost. Labour + contractor additional: ₹5–8 lakh. Grand total: ₹15–24 lakh.',
      },
      {
        type: 'warning',
        text: 'Important: Yeh sirf estimates hain. Site-specific conditions jaise soft soil (extra foundation depth), rocky land (blasting cost), hilly terrain — sab cost badha sakte hain. Site survey zaroor karwao.',
      },
      {
        type: 'faq',
        items: [
          { q: 'G+1 banane mein kitna extra cost aayega?', a: 'Ground floor cost ka roughly 70–80% — isliye first floor thoda sasta hota hai per sqft mein. Foundation extra strong banani padti hai.' },
          { q: 'Kya hum material khud khareed ke contractor ko dein?', a: 'Haan, yahi best approach hai — quality control aapke haath mein rehta hai aur contractor ke margin se paisa bachta hai (10–15% savings).' },
        ],
      },
    ],
    ctaText: 'Material Ka Quote Lo',
    ctaCategory: 'basic_materials',
  },

  // ── 8 ────────────────────────────────────────────────────────────────────────
  {
    slug: 'ghar-ka-naksha-kitne-mein-banta-hai',
    category: 'guide',
    featured: false,
    title: 'Ghar Ka Naksha (House Map) Kitne Mein Banta Hai 2025?',
    titleShort: 'House Map Kitne Ka Hota Hai',
    description: 'Jharkhand mein house map (2D blueprint), 3D elevation design aur structural drawing ka rate kya hai? Architect fees, kahan se banwayein — poori jankari.',
    tags: ['naksha', 'house map', 'architect', 'design', 'jharkhand', 'ranchi', '3d'],
    date: '2025-05-07',
    readMin: 4,
    sections: [
      {
        type: 'para',
        text: 'Ghar banane se pehle naksha banana zaroori hai — sirf nagar nigam approval ke liye nahi, balki proper planning ke liye bhi. Sahi naksha banane pe material waste kam hota hai aur construction tez hota hai. Lekin architect fees kitni hoti hai? Ranchi mein kya rate hai?',
      },
      {
        type: 'h2',
        text: 'Architect / Designer Fees Ranchi 2025',
      },
      {
        type: 'table',
        headers: ['Service', 'Rate Range', 'Notes'],
        rows: [
          ['2D House Map (Floor Plan only)',    '₹3,000–8,000',   'Basic blueprint only'],
          ['2D Map + Section + Elevation',      '₹8,000–20,000',  'Complete drawing set'],
          ['3D Elevation Design (2–3 views)',   '₹5,000–15,000',  'Photorealistic render'],
          ['Full 3D Design (interior + ext)',   '₹15,000–40,000', 'Walkthrough video extra'],
          ['Structural Drawing (columns, beam)','₹10,000–25,000', 'Engineer certified'],
          ['Interior Design Plan',              '₹300–700/sqft',  'Or flat fee per room'],
          ['Vastu Consultation',                '₹2,000–10,000',  'Separate from design'],
          ['Full Service (Design + Supervision)','₹50–150/sqft',  'Per sqft of built area'],
        ],
        note: 'Online/freelance designers from Ranchi charge 30–50% less than studio architects. Quality depends heavily on experience.',
      },
      {
        type: 'h2',
        text: 'Nagar Nigam Approval Ke Liye Kya Kya Chahiye?',
      },
      {
        type: 'list',
        items: [
          'Land ownership document (Registry / Patta)',
          'Site plan (plot boundaries, road setback)',
          '2D building plan (floor plan, elevation, section)',
          'Structural certificate (engineer signed)',
          'RCC design (column/beam schedule)',
          'Application form + fees (Nagar Nigam ya Gram Panchayat)',
          'Identity proof (Aadhaar/PAN)',
        ],
      },
      {
        type: 'tip',
        text: 'Time-Saving Tip: Nagar Nigam approval process mein 30–90 din lagte hain. Pehle se architect se draft approval drawing banwao, phir parallel mein contractor search karo — time bachega.',
      },
      {
        type: 'faq',
        items: [
          { q: 'Kya bina naksha ke ghar bana sakte hain?', a: 'Rural area mein technically possible hai lekin risky — loan nahi milega, property sell karne mein problem, aur future mein regularization mushkil.' },
          { q: 'Freelancer vs Architect studio — kaun better?', a: 'Simple residential ke liye experienced freelancer theek hai aur kaafi sasta. Complex design ya commercial ke liye registered architect better.' },
          { q: 'Online naksha banana safe hai?', a: '99acres, Urban Company ya local architects se online le sakte hain — sirf document pe engineer ka seal aur signature zaroor check karo.' },
        ],
      },
    ],
    ctaText: 'Design / Naksha Quote Lo',
    ctaCategory: 'design_planning',
  },

  // ── 9 ────────────────────────────────────────────────────────────────────────
  {
    slug: 'labour-rate-jharkhand-2025',
    category: 'rates',
    featured: false,
    title: 'Construction Labour Rate in Jharkhand 2025 — Mason, Helper, Electrician',
    titleShort: 'Labour Rate Jharkhand 2025',
    description: 'Jharkhand mein mason, helper, painter, electrician, plumber ka daily wage rate 2025. Skilled vs unskilled labour rates — complete guide.',
    tags: ['labour', 'mason', 'helper', 'rate', 'jharkhand', 'wage', 'ranchi'],
    date: '2025-05-07',
    readMin: 4,
    sections: [
      {
        type: 'para',
        text: 'Construction mein material ke saath-saath sahi karigar ka rate jaanna zaroori hai. Jharkhand mein labour rate national average se thoda kam hai — lekin skilled labour (electrical, plumbing, tile work) ka rate badhta ja raha hai. Yahan current market rates diye gaye hain.',
      },
      {
        type: 'h2',
        text: 'Jharkhand Labour Rate — May 2025',
      },
      {
        type: 'table',
        headers: ['Labour Type', 'Per Day Rate', 'Notes'],
        rows: [
          ['Mason / Mistri (Skilled)',       '₹700–1,000', 'Brickwork, plastering, RCC'],
          ['Helper / Unskilled Labour',      '₹400–550',   'Loading, mixing, cleaning'],
          ['Carpenter (Skilled)',            '₹700–1,000', 'Shuttering, door/window fitting'],
          ['Bar Bender / Rod Worker',        '₹700–900',   'Steel binding'],
          ['Tile Worker',                    '₹700–1,000', 'Floor + wall tiling'],
          ['Painter (Interior)',             '₹600–850',   'Distemper, putty, paint'],
          ['Painter (Texture/Special)',      '₹800–1,200', 'Texture, PU, epoxy'],
          ['Electrician (Wiring)',           '₹700–1,100', 'Rough wiring, DB fitting'],
          ['Plumber',                        '₹700–1,000', 'Pipe laying, fitting'],
          ['Welder',                         '₹800–1,200', 'Gate, grill, MS work'],
          ['Civil Contractor (Supervision)', '₹1,200–2,500','Project management'],
        ],
        note: 'Monsoon mein (July–Sept) aur Diwali/festivals ke time rate 15–30% badh jaata hai. Advance mein book karo.',
      },
      {
        type: 'h2',
        text: 'Karigar Rakhne Ke Tips',
      },
      {
        type: 'list',
        items: [
          'Pehla din probation rakho — kaam dekho phir confirm karo',
          'Weekly payment better hai daily se — kaam zyada serious hote hain',
          'Experienced local mistri lete hain — unhe local conditions pata hoti hain',
          'Ek responsible karigar leader rakho jo team manage kare',
          'Working hours clearly define karo — 8 AM to 5 PM with lunch break',
          'Overtime pehle se agree karo — unexpected overtime disputes',
          'Safety equipment dena zaroori hai — helmet, gloves, safety boots',
        ],
      },
      {
        type: 'tip',
        text: 'Cost Saving: Contractor ko full theka dene se better hai ki material aap kharido aur labour cost alag karo. This way quality control aapke haath mein rehta hai aur overall 15–20% bachta hai.',
      },
      {
        type: 'faq',
        items: [
          { q: 'Labour contractor se kaise rakhen?', a: 'Nirman Setu pe labour request karo — local verified karigars ki list milegi. Interview karo, reference check karo, aur small test work deke dekho.' },
          { q: 'Advance payment deni chahiye?', a: 'Maximum 1 hafta ka advance do. Zyada advance pe kaam chhodne ka risk rehta hai. Weekly clearing best practice hai.' },
        ],
      },
    ],
    ctaText: 'Labour / Karigar Request Karo',
    ctaCategory: 'labour',
  },

  // ── 10 ────────────────────────────────────────────────────────────────────────
  {
    slug: 'construction-mein-paisa-bachane-ke-tarike',
    category: 'tips',
    featured: false,
    title: 'Construction Mein Paisa Bachane Ke 10 Proven Tarike — 2025',
    titleShort: 'Construction Mein Paisa Bachao',
    description: 'Ghar banane mein paisa bachane ke 10 practical tips — material kab kharidein, contractor se kaise deal karein, kaunsa kaam khud karein.',
    tags: ['tips', 'savings', 'construction', 'ghar', 'jharkhand', 'budget'],
    date: '2025-05-07',
    readMin: 5,
    sections: [
      {
        type: 'para',
        text: 'Sahi planning aur thodi samajhdaari se construction mein 15–25% cost bachana possible hai — bina quality compromise kiye. Yeh tricks experienced contractors use karte hain. Aam logon ko pata nahi hoti.',
      },
      {
        type: 'h2',
        text: '10 Proven Ways to Save Money on Construction',
      },
      {
        type: 'list',
        items: [
          '**Monsoon se 2 mahine pehle material stock karo** — cement aur steel ka rate pre-monsoon lowest hota hai. Sand bhi stock karo kyunki monsoon mein supply ruk jaati hai.',
          '**Bulk mein kharido** — cement 100+ bags, steel 5+ ton ek saath lene pe 5–10% discount milta hai. Dealer se seedha negotiate karo.',
          '**Material khud kharido, contractor ko mat do** — contractor 15–20% markup rakhta hai material pe. Aap khud verified platform se kharido.',
          '**Simple rectangular design rakho** — complex shape, curves, bay windows mein 20–30% extra material lagta hai aur labour bhi zyada.',
          '**PPC cement use karo plaster mein** — OPC se 10–15% sasta hai aur plaster/flooring ke liye equally good.',
          '**Fly Ash Brick use karo** — Red brick se 20–30% sasta, zyada strong, insulation better, aur environment friendly bhi.',
          '**Electrical aur plumbing rough kaam baad mein mat chordo** — structure ke saath hi karo. Baad mein karne pe double labor aur drilling ka kharcha.',
          '**Local karigar hire karo** — bahar se bulane wale karigaron mein transport, food, accommodation add hota hai — 30–40% extra.',
          '**Quality check karo delivery pe** — kharabi material return karo tabhi, baad mein nahi. Site pe ek responsible person raho delivery ke time.',
          '**Waste management karo** — construction waste (broken bricks, cement bags) properly use karo. Broken bricks backfill mein, cement bags kabhi nahi jayen — ek bag bhi ₹400 ka hai.',
        ],
      },
      {
        type: 'tip',
        text: 'Biggest Saving: Material ki quality mat ghatao — sasta material mein future repair 3–5x zyada cost karta hai. Sirf planning aur procurement mein smart bano.',
      },
      {
        type: 'h2',
        text: 'Kahan Mat Bachao — Quality Critical Points',
      },
      {
        type: 'table',
        headers: ['Item', 'Why Not to Compromise'],
        rows: [
          ['TMT Steel grade (Fe500D)',    'Earthquake safety — life ka sawaal hai'],
          ['Foundation depth',           'Settlement aur cracking — expensive to fix later'],
          ['Waterproofing (terrace)',     'Seepage fix karna bahut mehnga aur disruptive hota hai'],
          ['Electrical wire quality',    'Fire hazard — Polycab/Havells standard wire hi use karo'],
          ['Cement brand',               'ISI certified brand hi use karo — unbranded cement risky hai'],
        ],
      },
      {
        type: 'faq',
        items: [
          { q: 'Kya online se material kharidna sahi hai?', a: 'Verified platforms se bilkul — better price, proper invoice, aur no middleman. Nirman Setu pe Jharkhand ke verified suppliers se direct order kar sakte ho.' },
          { q: 'Contractor ko advance kitna dein?', a: 'Total project ka 10–15% advance kaafi hai. Milestone-based payment karo — foundation complete, slab complete, finishing complete. Kabhi ek saath poora mat do.' },
        ],
      },
    ],
    ctaText: 'Best Price Mein Material Lo',
    ctaCategory: 'basic_materials',
  },

];

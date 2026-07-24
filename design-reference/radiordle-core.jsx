/* =========================================================
   Radiordle — core: data, game logic, icons, primitives
   ========================================================= */
const { useState, useEffect, useRef, useMemo, useCallback } = React;

const MAX_GUESSES = 5;

/* ---- Semantic colors (from source globals.css) ---- */
const C = {
  surface: '#3d4d68',
  surfaceHover: '#4a5b7a',
  success: '#407763',
  warning: '#f6d656',
  error: '#9e4a4a',
  hintDefault: '#6b89b8',
  accent: '#f59e0b',
  accentLight: '#fbbf24',
  // image border (softer)
  ringSuccess: '#5a9d86',
  ringWarning: '#e6c84f',
  ringError: '#c4736b',
};

const GLASS = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(22px) saturate(160%)',
  WebkitBackdropFilter: 'blur(22px) saturate(160%)',
  border: '1px solid rgba(255,255,255,0.14)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.20)',
};

/* ---- Day number (real algorithm, EST epoch Dec 29 2025) ---- */
function getDayNumber() {
  const now = new Date();
  const f = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit',
  });
  const [y, m, d] = f.format(now).split('-').map(Number);
  const msPerDay = 86400000;
  const today = Math.floor(Date.UTC(y, m - 1, d) / msPerDay);
  const epoch = Math.floor(Date.UTC(2025, 11, 29) / msPerDay);
  return today - epoch;
}
function dayNumberToDate(n) {
  const epoch = new Date('2025-12-29T00:00:00-05:00');
  return new Date(epoch.getTime() + n * 86400000);
}

/* ---- Example puzzle ---- */
const PUZZLE = {
  puzzleNumber: 145,
  answer: 'Pulmonary alveolar microlithiasis',
  image: 'assets/xray.png',
  citation: 'Case courtesy of Radiopaedia.org. Used for educational purposes.',
  description: "Pulmonary alveolar microlithiasis (PAM) is a rare, chronic lung disease in which tiny calcium-phosphate stones (microliths) accumulate within the alveoli. It stems from mutations in the SLC34A2 gene that impair phosphate clearance from the air spaces. Despite its striking “sandstorm” appearance on imaging, many patients stay asymptomatic for years before developing progressive restrictive lung disease.",
  learnLink: 'https://radiopaedia.org/articles/pulmonary-alveolar-microlithiasis',
  hints: [
    'Chest radiograph demonstrates bilateral, diffuse, fine sandstorm-like micronodular calcifications throughout both lung fields',
    'High-resolution CT demonstrates dense, bilateral ground-glass opacities with subpleural and peribronchovascular calcifications, and the "black pleura" sign',
    'The underlying defect involves mutations in the SLC34A2 gene, leading to impaired alveolar clearance of phosphate and progressive microlith deposition',
    'Despite the dramatic radiographic appearance, patients are often relatively asymptomatic early in the disease course',
  ],
};

/* ---- Diagnosis list (real list lives in Supabase) ---- */
const CONDITIONS = [
  'Abdominal aortic aneurysm','Achalasia','Achilles tendon rupture','Achondroplasia',
  'Acoustic neuroma (vestibular schwannoma)','Acromegaly','Acute appendicitis',
  'Acute cholecystitis','Acute pancreatitis','Adenomyosis','Adrenal adenoma',
  'Amyloidosis','Aneurysmal bone cyst','Angiomyolipoma',
  'Ankylosing spondylitis','Aortic dissection','Appendicolith','Arachnoid cyst',
  'Arteriovenous malformation','Asbestosis','Ascites','Atelectasis','Avascular necrosis',
  'Bowel obstruction','Brain abscess','Breast carcinoma','Bronchiectasis',
  'Bronchogenic carcinoma','Cardiac tamponade','Caroli disease','Cavernous hemangioma',
  'Cerebral infarction','Charcot joint','Cholangiocarcinoma','Cholelithiasis',
  'Chondrosarcoma','Chronic obstructive pulmonary disease','Coarctation of the aorta',
  'Colorectal carcinoma','Congenital diaphragmatic hernia','Cor pulmonale',
  'Craniopharyngioma','Crohn disease','Cystic fibrosis','Dermoid cyst',
  'Diaphragmatic hernia','Diffuse axonal injury','Diverticulitis','Ductal carcinoma in situ',
  'Ectopic pregnancy','Emphysema','Empyema','Endometrioma','Ependymoma','Epidural hematoma',
  'Esophageal carcinoma','Ewing sarcoma','Fibrous dysplasia','Focal nodular hyperplasia',
  'Ganglion cyst','Gardner syndrome','Gastric carcinoma','Germinoma','Giant cell tumor',
  'Glioblastoma multiforme','Goiter','Hemochromatosis','Hepatocellular carcinoma',
  'Hiatal hernia','Hodgkin lymphoma','Horseshoe kidney','Hydatid cyst','Hydrocephalus',
  'Hydronephrosis','Hypertrophic cardiomyopathy','Idiopathic pulmonary fibrosis',
  'Insulinoma','Intussusception','Ischemic colitis','Juvenile angiofibroma',
  'Kaposi sarcoma','Klatskin tumor','Langerhans cell histiocytosis','Leiomyoma',
  'Lipoma','Lisfranc injury','Liver hemangioma','Lung abscess','Lymphangioleiomyomatosis',
  'Mallory-Weiss tear','Meckel diverticulum','Medulloblastoma','Meningioma','Mesothelioma',
  'Metastatic disease','Multiple myeloma','Multiple sclerosis','Nasopharyngeal carcinoma',
  'Neuroblastoma','Non-Hodgkin lymphoma','Osteochondroma','Osteoid osteoma','Osteomyelitis',
  'Osteosarcoma','Ovarian teratoma','Paget disease of bone','Pancreatic adenocarcinoma',
  'Pancreatic pseudocyst','Patent ductus arteriosus','Pericardial effusion','Pheochromocytoma',
  'Pleural effusion','Pneumoconiosis','Pneumonia','Pneumothorax','Polycystic kidney disease',
  'Portal vein thrombosis','Primary sclerosing cholangitis','Prostate carcinoma',
  'Pulmonary alveolar microlithiasis','Pulmonary edema','Pulmonary embolism',
  'Pulmonary hypertension','Pyelonephritis','Renal cell carcinoma','Retroperitoneal fibrosis',
  'Rheumatoid arthritis','Sarcoidosis','Schwannoma','Sigmoid volvulus','Silicosis',
  'Situs inversus','Slipped capital femoral epiphysis','Spinal stenosis','Splenic infarct',
  'Subarachnoid hemorrhage','Subdural hematoma','Superior vena cava syndrome',
  'Tension pneumothorax','Teratoma','Testicular torsion','Thymoma','Thyroid carcinoma',
  'Transient ischemic attack','Tuberculosis','Tuberous sclerosis','Ulcerative colitis',
  'Ureteral calculus','Uterine fibroid','Vesicoureteral reflux','Volvulus',
  'Von Hippel-Lindau disease','Wilms tumor','Zenker diverticulum',
];

/* ====================== checkAnswer (ported) ====================== */
function normalizeDiagnosis(s) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
}
const COMMON_TERMS = new Set([
  'of','the','a','an','with','without','and','or','disease','syndrome','disorder',
  'condition','injury','acute','chronic','left','right','bilateral','type','stage',
  'grade','primary','secondary','benign','malignant','congenital','acquired','early',
  'late','advanced','mild','moderate','severe','upper','lower','small','large',
]);
function significantWords(s) {
  return normalizeDiagnosis(s).split(/\s+/).filter((w) => w.length > 0 && !COMMON_TERMS.has(w));
}
const ANATOMICAL = [
  ['liver','hepatic','hepato'],['kidney','renal','nephro'],['lung','pulmonary','pneumo'],
  ['heart','cardiac','coronary','myocardial'],['brain','cerebral','intracranial','neuro'],
  ['bone','osseous','skeletal','osteo'],['stomach','gastric','gastro'],
  ['intestine','bowel','enteric','intestinal'],['colon','colonic','colorectal'],
  ['spine','spinal','vertebral'],['blood','hematologic','vascular','hemorrhagic'],
  ['chest','thoracic','thorax'],['abdomen','abdominal'],['pelvis','pelvic'],
  ['neck','cervical'],['head','cranial','cephalic'],['skin','dermal','cutaneous'],
  ['muscle','muscular','myopathy'],['nerve','neural','neurologic'],
  ['vessel','vascular','arterial','venous'],['pancreas','pancreatic'],['spleen','splenic'],
  ['gallbladder','biliary','cholecyst'],['thyroid','thyroidal'],['esophagus','esophageal'],
  ['trachea','tracheal'],['bladder','vesical','cystic'],['uterus','uterine','endometrial'],
  ['ovary','ovarian'],['prostate','prostatic'],['breast','mammary'],
  ['lymph','lymphatic','lymphoid'],['joint','articular','arthro'],['tendon','tendinous'],
  ['cartilage','chondral'],['eye','ocular','optic','ophthalmic'],['ear','otic','aural'],
];
const SYN_MAP = new Map();
ANATOMICAL.forEach((g, i) => g.forEach((t) => SYN_MAP.set(t, i)));
const MIN_PREFIX = 5;
function checkAnswer(guess, answer) {
  const ng = normalizeDiagnosis(guess), na = normalizeDiagnosis(answer);
  if (ng === na) return 'correct';
  const gw = significantWords(guess), aw = significantWords(answer);
  if (gw.some((w) => aw.includes(w))) return 'partial';
  for (const a of gw) for (const b of aw) {
    if (a.length >= MIN_PREFIX && b.length >= MIN_PREFIX && a.slice(0, MIN_PREFIX) === b.slice(0, MIN_PREFIX)) return 'partial';
  }
  for (const a of gw) for (const b of aw) {
    const x = SYN_MAP.get(a), y = SYN_MAP.get(b);
    if (x !== undefined && x === y) return 'partial';
  }
  return 'incorrect';
}

/* ====================== Icons ====================== */
const Svg = (p) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...p} />;
const AboutIcon = ({ size = 22 }) => (
  <Svg width={size} height={size} fill="currentColor"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" /></Svg>
);
const FeedbackIcon = ({ size = 21 }) => (
  <Svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 0 1-.9-3.8 8.38 8.38 0 0 1 8.5-8.5 8.5 8.5 0 0 1 8.5 8.5z" /></Svg>
);
const StatsIcon = ({ size = 21 }) => (
  <Svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="20" x2="6" y2="13" /><line x1="12" y1="20" x2="12" y2="7" /><line x1="18" y1="20" x2="18" y2="10" /></Svg>
);
const ArchiveIcon = ({ size = 19 }) => (
  <Svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="4" rx="1" /><path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" /><line x1="10" y1="12" x2="14" y2="12" /></Svg>
);
const HamburgerIcon = ({ size = 22 }) => (
  <Svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></Svg>
);
const InstallIcon = ({ size = 20 }) => (
  <Svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></Svg>
);
const SendIcon = ({ size = 18 }) => (
  <Svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4 20-7z" /></Svg>
);
const ZoomIcon = ({ size = 20 }) => (
  <Svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></Svg>
);
const CloseIcon = ({ size = 22 }) => (
  <Svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></Svg>
);
const BackIcon = ({ size = 22 }) => (
  <Svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></Svg>
);
const GithubIcon = ({ size = 22 }) => (
  <Svg width={size} height={size} fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" /></Svg>
);

/* ====================== Background ====================== */
// Soft, heavily-blurred color blob for ambient light fields
function Blob({ color, size, top, left, blur = 80, opacity = 1, anim }) {
  return (
    <div className="absolute" style={{
      width: size, height: size, top, left, opacity,
      borderRadius: '50%', background: color,
      filter: `blur(${blur}px)`,
      animation: anim,
      willChange: 'transform',
    }} />
  );
}

// Fine film grain — the detail that separates premium dark UIs from flat ones.
function Grain({ opacity = 0.05, blend = 'overlay' }) {
  const n = encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  return <div className="absolute inset-0" style={{ backgroundImage: `url("data:image/svg+xml,${n}")`, backgroundSize: '180px 180px', opacity, mixBlendMode: blend }} />;
}

// Center-focusing vignette so content stays legible over any texture.
function Vignette({ strength = 0.6 }) {
  return <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 115% 90% at 50% 42%, transparent 46%, rgba(3,6,15,${strength}) 100%)` }} />;
}

function PageBackground({ bg = 'aurora', variant }) {
  const base = '#0a1430';
  const RADBG = 'radial-gradient(120% 100% at 50% 34%, #0a1428 0%, #060b1a 62%, #03060f 100%)';
  const LINE = 'rgba(150,185,255,0.10)';
  const LINE_SOFT = 'rgba(150,185,255,0.06)';
  const EDGE_MASK = 'radial-gradient(ellipse 100% 92% at 50% 42%, #000 52%, transparent 100%)';
  const mono = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

  // ============ CLASSIC — DICOM corner overlay + status rule + hotkey help ============
  if (bg === 'annotated') {
    const metaFS = variant === 'mobile' ? 8.5 : 11;
    const meta = { fontFamily: mono, fontSize: metaFS, lineHeight: 1.7, letterSpacing: '0.04em', color: 'rgba(170,200,255,0.17)', whiteSpace: 'pre' };
    const orient = { fontFamily: mono, fontSize: 15, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(170,200,255,0.22)' };
    const tickC = 'rgba(160,195,255,0.20)';
    const ruler = Array.from({ length: 31 });
    const rulerBottom = variant === 'mobile' ? '15%' : '8%';
    const curveBottom = variant === 'mobile' ? '18%' : '11%';
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ background: RADBG }}>
        <Blob color="rgba(56,130,230,0.17)" size="52%" top="4%" left="30%" blur={150} anim="bgDriftA 34s ease-in-out infinite alternate" />
        <Blob color="rgba(45,212,191,0.08)" size="38%" top="54%" left="66%" blur={150} anim="bgDriftB 42s ease-in-out infinite alternate" />
        <div className="absolute" style={{ inset: '5%', border: '1px solid rgba(150,185,255,0.10)', borderRadius: 3 }} />
        {/* corner metadata — authentic PACS/DICOM fields */}
        <div className="absolute" style={{ top: '7%', left: '6%', ...meta }}>{'Im: 24/512\nSe: 3\nJPEG Lossy 20:1'}</div>
        <div className="absolute" style={{ top: '7%', right: '6%', textAlign: 'right', ...meta }}>{'Study ID: 100482\nCT ABDOMEN W/CONTRAST\nAXIAL 2.0MM SOFT TISSUE\nFlip H'}</div>
        <div className="absolute" style={{ bottom: '24%', left: '6%', ...meta }}>{'X: 256  Y: 198   HU: 42\nWL: 40  WW: 400   [Soft Tissue]\nThk: 2.0mm   Loc: -84.5mm'}</div>
        <div className="absolute" style={{ bottom: '24%', right: '6%', textAlign: 'right', ...meta }}>{'1.5T\nTR: 500  TE: 14\n2024-03-12  14:22:05'}</div>
        {/* R / L orientation markers */}
        <div className="absolute" style={{ top: '49%', left: '6.5%', ...orient }}>R</div>
        <div className="absolute" style={{ top: '49%', right: '6.5%', ...orient }}>L</div>
        {/* curved couch line, like a real CT table edge */}
        <svg className="absolute" style={{ left: '20%', width: '60%', bottom: curveBottom, height: '5%', overflow: 'visible' }} viewBox="0 0 800 60" preserveAspectRatio="none">
          <path d="M0 44 Q400 6 800 44" fill="none" stroke="rgba(160,195,255,0.22)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
        </svg>
        {/* scale ruler with hash ticks */}
        <div className="absolute" style={{ left: '20%', width: '60%', bottom: rulerBottom, height: 1, background: tickC }} />
        {ruler.map((_, i) => (
          <div key={i} className="absolute" style={{ left: (20 + i * 2) + '%', bottom: rulerBottom, width: 1, height: i % 5 === 0 ? 11 : 6, background: tickC }} />
        ))}
        <Grain opacity={0.05} />
        <Vignette strength={0.66} />
      </div>
    );
  }

  // ============ DENSE — loaded technical overlay, tight leading ============
  if (bg === 'anno_dense') {
    const meta = { fontFamily: mono, fontSize: 10, lineHeight: 1.45, letterSpacing: '0.03em', color: 'rgba(170,200,255,0.16)', textTransform: 'uppercase', whiteSpace: 'pre' };
    const orient = { fontFamily: mono, fontSize: 14, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(170,200,255,0.18)' };
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ background: RADBG }}>
        <Blob color="rgba(56,130,230,0.17)" size="52%" top="4%" left="30%" blur={150} anim="bgDriftA 34s ease-in-out infinite alternate" />
        <Blob color="rgba(45,212,191,0.08)" size="38%" top="54%" left="66%" blur={150} anim="bgDriftB 42s ease-in-out infinite alternate" />
        <div className="absolute" style={{ top: '6%', left: '5%', ...meta }}>{'RADIORDLE GENERAL HOSP\nMRN 00•••213   M 054Y\nACC 2026-0648\nSE 4 / IM 128 / 512x512\nTHK 1.0   0.7 x 0.7'}</div>
        <div className="absolute" style={{ top: '6%', right: '5%', textAlign: 'right', ...meta }}>{'CR · PORTABLE · AP\nkVp 120   mAs 4.0\nDAP 0.42   SID 180\nW 1500    L -600\nZOOM 100%'}</div>
        <div className="absolute" style={{ bottom: '6%', left: '5%', ...meta }}>{'06 JUN 2026 14:32:07\nEXP · GRID · ERECT\nMAG 1.00   ANGLE 0°'}</div>
        <div className="absolute" style={{ bottom: '6%', right: '5%', textAlign: 'right', ...meta }}>{'ID 2A9F-04C1\nENH OFF · INV OFF\nFOR TEACHING ONLY'}</div>
        <div className="absolute" style={{ top: '49%', left: '5.5%', ...orient }}>R</div>
        <div className="absolute" style={{ top: '49%', right: '5.5%', ...orient }}>L</div>
        <Grain opacity={0.05} />
        <Vignette strength={0.66} />
      </div>
    );
  }

  // ============ AIRY — minimal, wide tracking, generous leading ============
  if (bg === 'anno_airy') {
    const meta = { fontFamily: mono, fontSize: 12, lineHeight: 2.3, letterSpacing: '0.24em', color: 'rgba(175,205,255,0.19)', textTransform: 'uppercase', whiteSpace: 'pre' };
    const orient = { fontFamily: mono, fontSize: 17, fontWeight: 700, letterSpacing: '0.16em', color: 'rgba(175,205,255,0.20)' };
    const help = { fontFamily: mono, fontSize: 11, letterSpacing: '0.34em', color: 'rgba(155,190,255,0.17)', textTransform: 'uppercase', whiteSpace: 'nowrap' };
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ background: RADBG }}>
        <Blob color="rgba(56,130,230,0.17)" size="52%" top="4%" left="30%" blur={150} anim="bgDriftA 34s ease-in-out infinite alternate" />
        <Blob color="rgba(45,212,191,0.08)" size="38%" top="54%" left="66%" blur={150} anim="bgDriftB 42s ease-in-out infinite alternate" />
        <div className="absolute" style={{ top: '9%', left: '8%', ...meta }}>{'RADIORDLE\nSE 4 · IM 128'}</div>
        <div className="absolute" style={{ bottom: '16%', right: '8%', textAlign: 'right', ...meta }}>{'W 1500  L -600\nZOOM 100%'}</div>
        <div className="absolute" style={{ top: '49%', left: '7.5%', ...orient }}>R</div>
        <div className="absolute" style={{ top: '49%', right: '7.5%', ...orient }}>L</div>
        <div className="absolute" style={{ top: '86%', left: '10%', right: '10%', height: 1, background: LINE_SOFT }} />
        <div className="absolute" style={{ bottom: '6%', left: 0, right: 0, textAlign: 'center', ...help }}>{'SCROLL   ·   W / L   ·   ZOOM   ·   MEASURE'}</div>
        <Grain opacity={0.05} />
        <Vignette strength={0.66} />
      </div>
    );
  }

  // ============ HEADER — study header + footer strips, twin rules ============
  if (bg === 'anno_header') {
    const meta = { fontFamily: mono, fontSize: 11.5, lineHeight: 1.6, letterSpacing: '0.12em', color: 'rgba(170,200,255,0.18)', textTransform: 'uppercase', whiteSpace: 'nowrap' };
    const orient = { fontFamily: mono, fontSize: 15, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(170,200,255,0.18)' };
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ background: RADBG }}>
        <Blob color="rgba(56,130,230,0.17)" size="52%" top="4%" left="30%" blur={150} anim="bgDriftA 34s ease-in-out infinite alternate" />
        <Blob color="rgba(45,212,191,0.08)" size="38%" top="54%" left="66%" blur={150} anim="bgDriftB 42s ease-in-out infinite alternate" />
        <div className="absolute" style={{ top: '5.5%', left: '6%', ...meta }}>{'RADIORDLE IMAGING CENTER   ·   ACC 2026-0648'}</div>
        <div className="absolute" style={{ top: '5.5%', right: '6%', textAlign: 'right', ...meta }}>{'06 JUN 2026   14:32 EST'}</div>
        <div className="absolute" style={{ top: '10.5%', left: '4%', right: '4%', height: 1, background: LINE_SOFT }} />
        <div className="absolute" style={{ top: '89.5%', left: '4%', right: '4%', height: 1, background: LINE_SOFT }} />
        <div className="absolute" style={{ bottom: '5.5%', left: '6%', ...meta }}>{'CR · AP UPRIGHT · PORTABLE'}</div>
        <div className="absolute" style={{ bottom: '5.5%', right: '6%', textAlign: 'right', ...meta }}>{'W 1500  L -600   ·   ZOOM 100%'}</div>
        <div className="absolute" style={{ top: '49%', left: '6%', ...orient }}>R</div>
        <div className="absolute" style={{ top: '49%', right: '6%', ...orient }}>L</div>
        <Grain opacity={0.05} />
        <Vignette strength={0.66} />
      </div>
    );
  }

  // ============ SIDE RAIL — vertical tool labels + scale ruler ============
  if (bg === 'anno_rail') {
    const rail = { fontFamily: mono, fontSize: 10.5, lineHeight: 1.9, letterSpacing: '0.06em', color: 'rgba(170,200,255,0.17)', textTransform: 'uppercase', whiteSpace: 'pre' };
    const small = { fontFamily: mono, fontSize: 10, lineHeight: 1.6, letterSpacing: '0.1em', color: 'rgba(160,195,255,0.16)', textTransform: 'uppercase', whiteSpace: 'pre' };
    const help = { fontFamily: mono, fontSize: 10.5, letterSpacing: '0.16em', color: 'rgba(150,185,255,0.16)', textTransform: 'uppercase', whiteSpace: 'nowrap' };
    const ticks = [0,1,2,3,4,5,6,7,8];
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ background: RADBG }}>
        <Blob color="rgba(56,130,230,0.17)" size="52%" top="4%" left="30%" blur={150} anim="bgDriftA 34s ease-in-out infinite alternate" />
        <Blob color="rgba(45,212,191,0.08)" size="38%" top="54%" left="66%" blur={150} anim="bgDriftB 42s ease-in-out infinite alternate" />
        <div className="absolute" style={{ left: '11%', top: '9%', bottom: '9%', width: 1, background: LINE_SOFT }} />
        <div className="absolute" style={{ left: '3.5%', top: '14%', ...rail }}>{'SE   4\nIM   128\n\nW  1500\nL  -600\n\nTHK 1.0\nMAG 1.0'}</div>
        <div className="absolute" style={{ top: '7%', right: '6%', textAlign: 'right', ...small }}>{'RADIORDLE PACS\nACC 2026-0648'}</div>
        {/* scale ruler */}
        <div className="absolute" style={{ right: '5%', top: '30%', height: '40%', width: 1, background: 'rgba(160,195,255,0.18)' }} />
        {ticks.map((i) => (
          <div key={i} className="absolute" style={{ right: '5%', top: (30 + i * 5) + '%', width: i % 2 === 0 ? 9 : 5, height: 1, background: 'rgba(160,195,255,0.18)' }} />
        ))}
        <div className="absolute" style={{ right: '4%', top: '71%', ...small }}>CM</div>
        <div className="absolute" style={{ bottom: '5%', left: 0, right: 0, textAlign: 'center', ...help }}>{'SCROLL: SERIES   ·   W/L DRAG   ·   M: MEASURE'}</div>
        <Grain opacity={0.05} />
        <Vignette strength={0.66} />
      </div>
    );
  }

  // ============ READOUT — measurement tool: crosshair, HU probe, caliper ============
  if (bg === 'anno_readout') {
    const meta = { fontFamily: mono, fontSize: 11, lineHeight: 1.7, letterSpacing: '0.08em', color: 'rgba(170,200,255,0.17)', textTransform: 'uppercase', whiteSpace: 'pre' };
    const orient = { fontFamily: mono, fontSize: 15, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(170,200,255,0.20)' };
    const read = { fontFamily: mono, fontSize: 11.5, letterSpacing: '0.06em', color: 'rgba(120,215,240,0.32)', textTransform: 'uppercase', whiteSpace: 'nowrap' };
    const cyan = 'rgba(90,205,235,0.34)';
    const cal = 'repeating-linear-gradient(to right, ' + cyan + ' 0 5px, transparent 5px 11px)';
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ background: RADBG }}>
        <Blob color="rgba(56,130,230,0.17)" size="52%" top="4%" left="30%" blur={150} anim="bgDriftA 34s ease-in-out infinite alternate" />
        <Blob color="rgba(45,212,191,0.08)" size="38%" top="54%" left="66%" blur={150} anim="bgDriftB 42s ease-in-out infinite alternate" />
        <div className="absolute" style={{ top: '7%', left: '6%', ...meta }}>{'RADIORDLE PACS\nSE 4 · IM 128'}</div>
        <div className="absolute" style={{ bottom: '7%', right: '6%', textAlign: 'right', ...meta }}>{'W 1500  L -600\nZOOM 100%'}</div>
        <div className="absolute" style={{ top: '49%', left: '6.5%', ...orient }}>R</div>
        <div className="absolute" style={{ top: '49%', right: '6.5%', ...orient }}>L</div>
        {/* probe crosshair */}
        <div className="absolute" style={{ left: '40%', top: '40%', width: 1, height: '12%', background: cyan }} />
        <div className="absolute" style={{ top: '46%', left: '34%', width: '12%', height: 1, background: cyan }} />
        <div className="absolute" style={{ left: '40%', top: '46%', width: 9, height: 9, transform: 'translate(-50%,-50%)', border: '1px solid ' + cyan, borderRadius: '50%' }} />
        <div className="absolute" style={{ top: '34%', left: '42%', ...read }}>{'HU -712   ·   3.4 mm'}</div>
        {/* caliper */}
        <div className="absolute" style={{ left: '57%', top: '66%', width: '15%', height: 1, backgroundImage: cal }} />
        <div className="absolute" style={{ left: '57%', top: '64.5%', width: 1, height: 9, background: cyan }} />
        <div className="absolute" style={{ left: '72%', top: '64.5%', width: 1, height: 9, background: cyan }} />
        <div className="absolute" style={{ top: '61%', left: '57%', ...read }}>24.3 MM</div>
        <Grain opacity={0.05} />
        <Vignette strength={0.66} />
      </div>
    );
  }

  // ---- Navy: the original flat treatment ----
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ background: base }}>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0c1733 0%, #122145 50%, #0c1733 100%)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(0,0,0,0.28) 75%, rgba(0,0,0,0.6) 92%, rgba(0,0,0,0.75) 100%)' }} />
    </div>
  );
}

/* ====================== Glass primitives ====================== */
function GlassIconButton({ children, label, size = 44, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      title={label} aria-label={label}
      className="flex items-center justify-center rounded-xl transition-all"
      style={{ width: size, height: size, color: h ? '#fff' : 'rgba(255,255,255,0.78)', background: h ? 'rgba(255,255,255,0.12)' : 'transparent' }}>
      {children}
    </button>
  );
}
function AccentButton({ icon, label, mobile, onClick }) {
  return (
    <button onClick={onClick}
      className={`flex items-center font-baloo font-bold text-black rounded-xl transition-transform active:scale-95 ${mobile ? 'gap-1.5 px-3.5 h-9 text-sm' : 'gap-2 px-4 h-11 text-base'}`}
      style={{ background: 'linear-gradient(to bottom, #fbbf24, #f59e0b)', boxShadow: '0 4px 14px rgba(245,158,11,0.45), inset 0 1px 0 rgba(255,255,255,0.4)' }}>
      {icon}{label && <span>{label}</span>}
    </button>
  );
}

/* ====================== Toast ====================== */
const TOAST = {
  correct: { msg: 'Correct!', bg: C.success, color: '#fff', icon: '✓' },
  partial: { msg: "Close! You're on the right track", bg: C.warning, color: '#000', icon: '◐' },
  incorrect: { msg: 'Not quite - try again', bg: C.error, color: '#fff', icon: '✗' },
  copied: { msg: 'Results copied to clipboard!', bg: '#2563eb', color: '#fff', icon: '📋' },
};
function Toast({ type }) {
  if (!type) return null;
  const t = TOAST[type];
  return (
    <div className="absolute top-20 left-1/2 z-[200] px-6 py-3 rounded-lg shadow-lg font-baloo font-semibold text-lg flex items-center gap-2"
      style={{ transform: 'translateX(-50%)', background: t.bg, color: t.color, animation: 'toastIn 0.25s ease-out' }}>
      <span className="text-xl">{t.icon}</span>{t.msg}
    </div>
  );
}

Object.assign(window, {
  useState, useEffect, useRef, useMemo, useCallback,
  MAX_GUESSES, C, GLASS, getDayNumber, dayNumberToDate, PUZZLE, CONDITIONS,
  checkAnswer, AboutIcon, FeedbackIcon, StatsIcon, ArchiveIcon, HamburgerIcon,
  SendIcon, ZoomIcon, CloseIcon, BackIcon, GithubIcon, InstallIcon, PageBackground,
  GlassIconButton, AccentButton, Toast, TOAST,
});

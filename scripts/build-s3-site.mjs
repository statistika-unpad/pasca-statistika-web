import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const sourceDirName = "@Dokumen S3";
const sourceDir = path.join(rootDir, sourceDirName);
const rpsDirName = "RPS_S3_Statistika";
const rpsDir = path.join(sourceDir, rpsDirName);
const outputPath = path.join(rootDir, "data", "s3_statistika.json");
const chunksPath = path.join(rootDir, "data", "knowledge_chunks.json");

function encodeHref(filePath) {
  return filePath.split(path.sep).map(encodeURIComponent).join("/");
}

function fileVersion(stat) {
  const date = stat.mtime;
  const pad = (value) => String(value).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds())
  ].join("");
}

function versionedHref(filePath, stat) {
  return `${encodeHref(filePath)}?v=${fileVersion(stat)}`;
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value) {
  return normalize(value).replace(/\s+/g, "-").replace(/^-|-$/g, "");
}

function formatTitle(fileName) {
  return String(fileName || "")
    .replace(/\.(docx|pdf)$/i, "")
    .replace(/^RPS\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function docEntry(fileName, title, description) {
  const fullPath = path.join(sourceDir, fileName);
  const stat = fs.statSync(fullPath);
  const relativePath = path.relative(rootDir, fullPath);
  return {
    id: slugify(title),
    title,
    description,
    file: fileName,
    href: versionedHref(relativePath, stat),
    sizeKb: Math.round(stat.size / 1024),
    format: "PDF"
  };
}

function surveyEntry(fileName, title, titleEn, description, descriptionEn, shortUrl) {
  const fullPath = path.join(sourceDir, fileName);
  const stat = fs.statSync(fullPath);
  const relativePath = path.relative(rootDir, fullPath);
  return {
    id: slugify(title),
    title,
    titleEn,
    description,
    descriptionEn,
    file: fileName,
    href: versionedHref(relativePath, stat),
    shortUrl,
    sizeKb: Math.round(stat.size / 1024),
    format: "HTML"
  };
}

const courseMeta = new Map([
  ["etika dan filsafat keilmuan statistika", {
    credits: 3,
    group: "Fondasi & Metodologi",
    groupEn: "Foundations & Methodology",
    titleEn: "Ethics and Philosophy of Statistical Science",
    description: "Penguatan etika akademik, filsafat ilmu, integritas riset, dan tata kelola data pada jenjang doktoral."
  }],
  ["penguatan riset dasar", {
    credits: 6,
    group: "Fondasi & Metodologi",
    groupEn: "Foundations & Methodology",
    titleEn: "Doctoral Research Foundation",
    description: "Penguatan fondasi teori, perumusan novelty, dan kesiapan riset statistik tingkat doktoral."
  }],
  ["metodologi riset dan penulisan ilmiah", {
    credits: 3,
    group: "Fondasi & Metodologi",
    groupEn: "Foundations & Methodology",
    titleEn: "Research Methodology and Scientific Writing",
    description: "Metodologi riset, rancangan penelitian, dan penulisan ilmiah untuk publikasi bereputasi."
  }],
  ["penulisan studi literatur review", {
    credits: 3,
    group: "Fondasi & Metodologi",
    groupEn: "Foundations & Methodology",
    titleEn: "Literature Review Writing",
    description: "Penyusunan kajian pustaka sistematis sebagai dasar posisi riset dan kebaruan disertasi."
  }],
  ["personal development skills", {
    credits: 2,
    group: "Fondasi & Metodologi",
    groupEn: "Foundations & Methodology",
    titleEn: "Personal Development Skills",
    description: "Penguatan kemandirian, kepemimpinan, komunikasi ilmiah, dan kesiapan karier doktoral."
  }],
  ["proposal riset", {
    credits: 3,
    group: "Riset & Disertasi",
    groupEn: "Research & Dissertation",
    titleEn: "Research Proposal",
    description: "Penyusunan proposal riset doktoral yang orisinal, terukur, dan selaras dengan CPL."
  }],
  ["seminar usulan riset sur", {
    credits: 6,
    group: "Riset & Disertasi",
    groupEn: "Research & Dissertation",
    titleEn: "Research Proposal Seminar",
    description: "Seminar usulan riset untuk menguji kelayakan masalah, metode, dan kontribusi disertasi."
  }],
  ["penelaahan naskah disertasi 1 pnd 1", {
    credits: 3,
    group: "Riset & Disertasi",
    groupEn: "Research & Dissertation",
    titleEn: "Dissertation Manuscript Review 1",
    description: "Penelaahan naskah disertasi tahap pertama untuk memastikan kemajuan riset dan kualitas argumen ilmiah."
  }],
  ["penelaahan naskah disertasi 2 pnd 2", {
    credits: 3,
    group: "Riset & Disertasi",
    groupEn: "Research & Dissertation",
    titleEn: "Dissertation Manuscript Review 2",
    description: "Penelaahan naskah disertasi tahap kedua untuk mematangkan kontribusi, validasi, dan kesiapan ujian."
  }],
  ["ujian naskah disertasi und", {
    credits: 6,
    group: "Riset & Disertasi",
    groupEn: "Research & Dissertation",
    titleEn: "Dissertation Manuscript Examination",
    description: "Ujian naskah disertasi untuk menilai kelayakan substansi, metodologi, dan kontribusi doktoral."
  }],
  ["sidang promosi doktor spd", {
    credits: 6,
    group: "Riset & Disertasi",
    groupEn: "Research & Dissertation",
    titleEn: "Doctoral Promotion Defense",
    description: "Sidang promosi doktor sebagai tahap akhir pertanggungjawaban ilmiah disertasi."
  }],
  ["keterampilan diseminasi dan pengembangan pengetahuan", {
    credits: 4,
    group: "Diseminasi & Rekognisi",
    groupEn: "Dissemination & Recognition",
    titleEn: "Dissemination Skills and Knowledge Development",
    description: "Penguatan kemampuan diseminasi, knowledge translation, publikasi, dan pengembangan dampak riset."
  }],
  ["diseminasi nasional dn", {
    credits: 2,
    group: "Diseminasi & Rekognisi",
    groupEn: "Dissemination & Recognition",
    titleEn: "National Dissemination",
    description: "Diseminasi hasil riset pada forum nasional, komunitas akademik, atau pemangku kepentingan strategis."
  }],
  ["diseminasi internasional di", {
    credits: 4,
    group: "Diseminasi & Rekognisi",
    groupEn: "Dissemination & Recognition",
    titleEn: "International Dissemination",
    description: "Diseminasi hasil riset pada forum internasional atau publikasi bereputasi."
  }]
]);

function courseMetaFor(title) {
  const key = normalize(title);
  return courseMeta.get(key)
    || [...courseMeta.entries()].find(([candidate]) => key.includes(candidate) || candidate.includes(key))?.[1]
    || {
      credits: "",
      group: "RPS S3",
      groupEn: "Doctoral RPS",
      titleEn: title,
      description: `Dokumen RPS untuk ${title} pada Program Doktor Statistika.`
    };
}

function buildRpsDocuments() {
  if (!fs.existsSync(rpsDir)) return [];
  return fs.readdirSync(rpsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".pdf"))
    .map((entry) => {
      const fullPath = path.join(rpsDir, entry.name);
      const stat = fs.statSync(fullPath);
      const relativePath = path.relative(rootDir, fullPath);
      const courseTitle = formatTitle(entry.name);
      const meta = courseMetaFor(courseTitle);
      return {
        id: `s3-rps-${slugify(courseTitle)}`,
        title: `RPS ${courseTitle}`,
        titleId: `RPS ${courseTitle}`,
        titleEn: `Course Plan ${meta.titleEn}`,
        courseTitle,
        courseTitleEn: meta.titleEn,
        credits: meta.credits,
        group: meta.group,
        groupEn: meta.groupEn,
        description: meta.description,
        file: entry.name,
        href: versionedHref(relativePath, stat),
        sizeKb: Math.round(stat.size / 1024),
        format: "PDF",
        source: `${sourceDirName}/${rpsDirName}`
      };
    })
    .sort((a, b) => {
      const order = ["Fondasi & Metodologi", "Riset & Disertasi", "Diseminasi & Rekognisi"];
      const groupDiff = order.indexOf(a.group) - order.indexOf(b.group);
      if (groupDiff) return groupDiff;
      return a.courseTitle.localeCompare(b.courseTitle, "id");
    });
}

if (!fs.existsSync(sourceDir)) {
  throw new Error(`Folder dokumen S3 tidak ditemukan: ${sourceDir}`);
}

const rpsDocuments = buildRpsDocuments();
const groups = ["Fondasi & Metodologi", "Riset & Disertasi", "Diseminasi & Rekognisi"]
  .map((label) => {
    const documents = rpsDocuments.filter((doc) => doc.group === label);
    const credits = documents.reduce((sum, doc) => sum + Number(doc.credits || 0), 0);
    return {
      id: slugify(label),
      label,
      labelEn: documents[0]?.groupEn || label,
      total: documents.length,
      credits
    };
  });

const program = {
  title: "S3 Statistika",
  titleEn: "Doctoral Program in Statistics",
  subtitle: "FMIPA Universitas Padjadjaran",
  lead: "Program Doktor Statistika dirancang berbasis riset untuk menghasilkan kontribusi orisinal dalam teori, metodologi, komputasi, dan sistem inferensi statistik.",
  leadEn: "The Doctoral Program in Statistics is research-based and designed to produce original contributions in statistical theory, methodology, computation, and statistical inference systems.",
  studyLoad: "54 SKS",
  fullTime: "6 semester",
  partTime: "8 semester",
  maxStudy: "12 semester",
  structure: [
    { label: "Kompetensi Kualifikasi Doktor", labelEn: "Doctoral Qualification Competence", credits: 12 },
    { label: "Riset dan Disertasi", labelEn: "Research and Dissertation", credits: 42 }
  ],
  highlights: [
    "Riset doktoral berbasis novelty dan integritas ilmiah.",
    "Komputasi statistik, reproducible research, dan responsible AI.",
    "Publikasi, diseminasi, dashboard, software, dan policy brief sebagai luaran riset.",
    "Ekosistem riset S2-S3 melalui research group, co-publication, dan doctoral colloquium."
  ]
};

// Acuan: Naskah Akademik Bab 7 dan Naskah Kurikulum Bab 2–3 (berkas Submitted, 15 Oktober 2026).
const vision = "Menjadi Program Studi Doktor Statistika yang unggul dan bereputasi internasional dalam pengembangan teori, metodologi, komputasi, dan sistem inferensi statistika modern yang diperkuat oleh sains data dan artificial intelligence, serta berdampak pada penyelesaian persoalan kompleks terutama di bidang kesehatan dan transisi energi.";

const missions = [
  "Menyelenggarakan pendidikan doktor statistika berbasis riset yang menekankan orisinalitas, integritas, kedalaman teori, dan kekuatan metodologi.",
  "Mengembangkan riset statistik yang menghasilkan teori, metode, model, estimator, algoritma, dan sistem inferensi baru yang teruji.",
  "Memperkuat komputasi statistik, reproducible research, dan responsible AI sebagai bagian dari pengembangan statistik modern.",
  "Menghasilkan publikasi internasional bereputasi dan luaran inovatif berupa software, dashboard, policy brief, atau model keputusan.",
  "Membangun ekosistem riset S2-S3 melalui research group, shared analytics laboratory, co-publication, dan doctoral colloquium.",
  "Mengembangkan kerja sama nasional dan internasional untuk joint supervision, visiting professor, external examiner, dan riset kolaboratif."
];

const objectives = [
  "Menghasilkan lulusan doktor yang mampu mengembangkan teori, metodologi, algoritma, model, dan sistem inferensi statistik yang orisinal, teruji, dan memperoleh rekognisi ilmiah.",
  "Menghasilkan riset doktoral pada bidang metodologi statistika lanjut, komputasi statistik, Bayesian statistics, spatial-spatiotemporal statistics, biostatistics, epidemiological statistics, responsible AI, official statistics, causal-policy analytics, dan risk analytics.",
  "Memperkuat kapasitas nasional dalam pengambilan keputusan berbasis bukti melalui pengembangan metode statistik untuk kebijakan publik, kesehatan, lingkungan, ekonomi, industri, dan keuangan.",
  "Membangun ekosistem riset S2-S3 yang terintegrasi melalui research pipeline, joint research group, shared analytics laboratory, co-publication pathway, dan doctoral colloquium.",
  "Meningkatkan reputasi akademik Universitas Padjadjaran melalui publikasi internasional bereputasi, kolaborasi riset global, visiting professor, external examiner, dan joint supervision.",
  "Menghasilkan inovasi berbasis statistik berupa perangkat lunak, repository kode, decision dashboard, policy brief, prototipe sistem informasi, atau model analitik yang dapat digunakan oleh pemerintah, industri, dan masyarakat."
];

const graduateProfiles = [
  {
    "code": "P1",
    "title": "Akademisi Doktoral",
    "titleEn": "Doctoral Academic",
    "description": "Dosen, pendidik, dan pemimpin akademik yang mampu mengembangkan pendidikan, keilmuan, dan riset statistika tingkat lanjut serta membangun ekosistem akademik yang mendukung penciptaan pengetahuan baru.",
    "competencies": "Pengembangan kurikulum dan pembelajaran statistika tingkat lanjut, pengembangan bahan ajar berbasis riset, pembimbingan tesis dan disertasi, publikasi ilmiah bereputasi, mentoring, pengembangan kelompok keilmuan dan laboratorium riset, kolaborasi akademik, serta kepemimpinan akademik."
  },
  {
    "code": "P2",
    "title": "Peneliti Utama, Pemimpin Riset, dan Pengembang Metodologi Statistika",
    "titleEn": "Principal Researcher, Research Leader, and Statistical Methodology Developer",
    "description": "Peneliti yang mampu merancang, memimpin, dan mengembangkan riset statistika maupun riset interdisipliner serta menciptakan, mengembangkan, dan memvalidasi teori, metode, model, estimator, algoritma, dan sistem inferensi statistika yang orisinal untuk menyelesaikan persoalan data kompleks.",
    "competencies": "Advanced statistical inference, Bayesian and frequentist inference, causal inference, statistical decision theory, statistical learning, computational statistics, simulation, model validation, uncertainty quantification, algorithm development, reproducible research, pengembangan perangkat lunak statistik, desain riset tingkat lanjut, manajemen riset dan hibah, publikasi internasional, serta kepemimpinan dan jejaring kolaborasi ilmiah."
  },
  {
    "code": "P3",
    "title": "Statistical Scientist Bidang Kesehatan",
    "titleEn": "Statistical Scientist in Health",
    "description": "Ahli statistika yang mampu menciptakan, mengembangkan, dan memvalidasi metodologi, model, algoritma, dan sistem inferensi untuk permasalahan biostatistika, epidemiologi, kesehatan publik, serta evaluasi intervensi kesehatan.",
    "competencies": "Biostatistics, epidemiological modelling, survival and longitudinal analysis, Bayesian hierarchical modelling, spatial-spatiotemporal statistics, disease mapping, causal inference, health analytics, statistical learning, model validation, dan uncertainty quantification."
  },
  {
    "code": "P4",
    "title": "Statistical Scientist Bidang Transisi Energi",
    "titleEn": "Statistical Scientist in Energy Transition",
    "description": "Ahli statistika yang mampu menciptakan dan mengembangkan metodologi, model, algoritma, dan sistem inferensi untuk perencanaan, pemantauan, evaluasi, prediksi, serta pengambilan keputusan pada energi baru terbarukan dan transisi energi.",
    "competencies": "Spatial-spatiotemporal modelling, Bayesian hierarchical modelling, probabilistic forecasting, time-series modelling, uncertainty quantification, reliability and risk analytics, causal-policy evaluation, statistical learning, optimization, climate-energy analytics, dan energy decision analytics."
  }
];

const cpl = [
  { code: "CPL-1", domain: "Sikap dan etika akademik", text: "Lulusan mampu menginternalisasi nilai religius, Pancasila, kemanusiaan, integritas akademik, etika riset, tanggung jawab sosial, dan tata kelola data yang bertanggung jawab." },
  { code: "CPL-2", domain: "Pengetahuan dan filosofi keilmuan", text: "Lulusan mampu mensintesis teori statistika, probabilitas, inferensi, pemodelan, komputasi, dan filosofi sains untuk merumuskan masalah ilmiah tingkat doktoral." },
  { code: "CPL-3", domain: "Kreasi metodologi statistika", text: "Lulusan mampu menciptakan, mengembangkan, dan memvalidasi metode, model, estimator, algoritma, atau sistem inferensi statistik yang orisinal dan teruji." },
  { code: "CPL-4", domain: "Komputasi dan reproducible research", text: "Lulusan mampu merancang komputasi statistik yang efisien, transparan, skalabel, dapat direproduksi, dan sesuai dengan prinsip responsible AI serta tata kelola data." },
  { code: "CPL-5", domain: "Riset interdisipliner berbasis statistika", text: "Lulusan mampu memimpin riset statistik pada masalah kompleks lintas bidang dengan tetap menjaga kontribusi metodologis statistika sebagai inti disertasi." },
  { code: "CPL-6", domain: "Diseminasi dan rekognisi ilmiah", text: "Lulusan mampu mendiseminasikan kontribusi riset melalui publikasi internasional bereputasi, konferensi, repository, dashboard, dan komunikasi ilmiah yang efektif." },
  { code: "CPL-7", domain: "Kepemimpinan riset", text: "Lulusan mampu memimpin kelompok riset, membangun kolaborasi nasional-internasional, mengelola proyek penelitian, dan membina komunitas ilmiah." },
  { code: "CPL-8", domain: "Dampak kebijakan dan inovasi", text: "Lulusan mampu menerjemahkan kontribusi statistik menjadi rekomendasi kebijakan, inovasi sistem keputusan, atau solusi berbasis data yang bermanfaat bagi masyarakat." }
];

const documents = [
  docEntry("(No. 4)-Naskah Kurikulum.pdf", "Naskah Kurikulum", "Kurikulum Program Studi Doktor Statistika: visi, misi, tujuan, profil lulusan, CPL, dan rancangan pembelajaran."),
  docEntry("(No. 3)-Naskah Akademik Program Studi.pdf", "Naskah Akademik Program Studi", "Landasan akademik pendirian dan pengembangan Program Studi Doktor Statistika."),
  docEntry("(No. 8)-Daftar Dosen dan CV.pdf", "Daftar Dosen dan CV", "Daftar dosen dan curriculum vitae pendukung Program Studi Doktor Statistika."),
  docEntry("(No. 9)-Daftar Sarana Prasarana.pdf", "Daftar Sarana Prasarana", "Dokumen sarana dan prasarana pendukung pendidikan dan riset doktoral."),
  docEntry("Naskah Syarat Akreditasi Minimal.pdf", "Naskah Syarat Akreditasi Minimal", "Dokumen pendukung pemenuhan syarat akreditasi minimal.")
];

const surveys = [
  surveyEntry(
    "Survey Penentuan Visi Misi dan Profil Lulusan.html",
    "Survei Penentuan Visi Misi dan Profil Lulusan",
    "Survey for Determining Vision, Mission, and Graduate Profile",
    "Formulir masukan pemangku kepentingan untuk penyusunan visi, misi, dan profil lulusan Program Doktor Statistika.",
    "Stakeholder input form for shaping the doctoral program vision, mission, and graduate profile.",
    "https://bit.ly/S3_Stat_Unpad"
  ),
  surveyEntry(
    "Survei Minat Mendaftar S3 dan Bidang Minat Yang Dituju.html",
    "Survei Minat Mendaftar S3 dan Bidang Minat yang Dituju",
    "Doctoral Application Interest and Intended Research Field Survey",
    "Formulir minat calon pendaftar S3 Statistika dan pemetaan bidang riset yang dituju.",
    "Prospective applicant interest form for the doctoral statistics program and intended research-field mapping.",
    "https://tinyurl.com/SurveyS3Statistika"
  )
];

const manifest = {
  source: sourceDirName,
  generatedAt: new Date().toISOString(),
  program,
  vision,
  missions,
  objectives,
  graduateProfiles,
  cpl,
  documents,
  surveys,
  rps: {
    total: rpsDocuments.length,
    totalCredits: rpsDocuments.reduce((sum, doc) => sum + Number(doc.credits || 0), 0),
    groups,
    documents: rpsDocuments
  }
};

fs.writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);

if (fs.existsSync(chunksPath)) {
  const chunks = JSON.parse(fs.readFileSync(chunksPath, "utf8"));
  const retained = chunks.filter((chunk) => !String(chunk.id || "").startsWith("s3-"));
  const chunksToAdd = [
    {
      id: "s3-overview",
      title: "Web S3 Statistika",
      sourceTitle: "Naskah Kurikulum",
      sourceUrl: documents[0].href,
      text: `${program.title} ${program.subtitle}. ${program.lead} Beban studi ${program.studyLoad}; penuh waktu ${program.fullTime}; paruh waktu ${program.partTime}; batas studi maksimum ${program.maxStudy}. Struktur: Kompetensi Kualifikasi Doktor 12 SKS dan Riset dan Disertasi 42 SKS.`
    },
    {
      id: "s3-visi",
      title: "Visi S3 Statistika",
      sourceTitle: "Naskah Kurikulum",
      sourceUrl: documents[0].href,
      text: `Visi Program Studi Doktor Statistika: ${vision}`
    },
    {
      id: "s3-misi",
      title: "Misi S3 Statistika",
      sourceTitle: "Naskah Kurikulum",
      sourceUrl: documents[0].href,
      text: `Misi Program Studi Doktor Statistika: ${missions.join(" ")}`
    },
    {
      id: "s3-tujuan",
      title: "Tujuan S3 Statistika",
      sourceTitle: "Naskah Kurikulum",
      sourceUrl: documents[0].href,
      text: `Tujuan Program Studi Doktor Statistika: ${objectives.join(" ")}`
    },
    {
      id: "s3-profil-lulusan",
      title: "Profil Lulusan S3 Statistika",
      sourceTitle: "Naskah Kurikulum",
      sourceUrl: documents[0].href,
      text: `Profil lulusan Program Studi Doktor Statistika: ${graduateProfiles.map((profile) => `${profile.code} ${profile.title}: ${profile.description} Kompetensi utama: ${profile.competencies}`).join(" ")}`
    },
    {
      id: "s3-cpl",
      title: "Capaian Pembelajaran Lulusan S3 Statistika",
      sourceTitle: "Naskah Kurikulum",
      sourceUrl: documents[0].href,
      text: `Capaian Pembelajaran Lulusan Program Studi Doktor Statistika: ${cpl.map((item) => `${item.code} ${item.domain}: ${item.text}`).join(" ")}`
    },
    {
      id: "s3-rps-catalog",
      title: "Katalog RPS S3 Statistika",
      sourceTitle: "RPS S3 Statistika",
      text: `Katalog RPS S3 Statistika memuat ${rpsDocuments.length} dokumen PDF dengan total ${manifest.rps.totalCredits} SKS. Kelompok RPS: ${groups.map((group) => `${group.label} ${group.total} dokumen ${group.credits} SKS`).join("; ")}.`
    },
    {
      id: "s3-survey-catalog",
      title: "Survei S3 Statistika",
      sourceTitle: "Survei S3 Statistika",
      text: `Survei S3 Statistika memuat formulir masukan untuk visi, misi, profil lulusan, minat mendaftar, dan bidang minat calon pendaftar. Link survei: ${surveys.map((survey) => `${survey.title} ${survey.shortUrl}`).join("; ")}.`
    },
    ...documents.map((doc) => ({
      id: `s3-document-${doc.id}`,
      title: doc.title,
      sourceTitle: doc.title,
      sourceUrl: doc.href,
      text: `${doc.title} tersedia sebagai dokumen Program Doktor Statistika. ${doc.description} Link dokumen: ${doc.href}. Format ${doc.format}, ukuran ${doc.sizeKb} KB.`
    })),
    ...surveys.map((survey) => ({
      id: `s3-survey-${survey.id}`,
      title: survey.title,
      sourceTitle: survey.title,
      sourceUrl: survey.shortUrl,
      text: `${survey.title} tersedia untuk Program Doktor Statistika. ${survey.description} Link pengisian survei: ${survey.shortUrl}. Arsip HTML lokal: ${survey.href}. Format ${survey.format}, ukuran ${survey.sizeKb} KB.`
    })),
    ...rpsDocuments.map((doc) => ({
      id: `s3-rps-doc-${doc.id}`,
      title: doc.title,
      sourceTitle: doc.title,
      sourceUrl: doc.href,
      text: `${doc.title} tersedia untuk Program Doktor Statistika. Mata kuliah/kegiatan ${doc.courseTitle}, ${doc.credits} SKS, kelompok ${doc.group}. ${doc.description} Link dokumen RPS S3: ${doc.href}.`
    }))
  ];
  fs.writeFileSync(chunksPath, `${JSON.stringify([...retained, ...chunksToAdd], null, 2)}\n`);
}

console.log(`Berhasil membuat Web S3 dengan ${rpsDocuments.length} RPS S3.`);

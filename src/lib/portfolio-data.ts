import {
  Code2,
  Layout,
  Server,
  Rocket,
  MessageCircle,
  Instagram,
  Mail,
  Facebook,
  Github,
  type LucideIcon,
} from "lucide-react";

// ============================================================
//  PENTING: Ganti kontak & tautan di bawah ini dengan akun Anda sendiri.
//  - Ubah nilai `href` pada `contactMethods` dan `socials`.
//  - Ubah nilai `value` (teks yang ditampilkan) sesuai data Anda.
// ============================================================

export type NavLink = {
  label: string;
  href: string;
};

export const navLinks: NavLink[] = [
  { label: "Beranda", href: "#beranda" },
  { label: "Proyek", href: "#proyek" },
  { label: "Tentang", href: "#tentang" },
  { label: "Keahlian", href: "#keahlian" },
  { label: "Proses", href: "#proses" },
  { label: "Kontak", href: "#kontak" },
];

export type Expertise = {
  index: string;
  title: string;
  description: string;
  icon: LucideIcon;
  skills: string[];
};

export const expertise: Expertise[] = [
  {
    index: "01",
    title: "Full Stack Development",
    description:
      "Membangun aplikasi web menyeluruh — dari antarmuka pengguna hingga logika server dan database — dengan PHP, JavaScript, dan MySQL yang bersih, rapi, dan dapat dipelihara.",
    icon: Code2,
    skills: ["PHP", "JavaScript", "MySQL", "HTML5", "CSS3"],
  },
  {
    index: "02",
    title: "Frontend Modern",
    description:
      "Menciptakan antarmuka yang responsif dan interaktif menggunakan React, Next.js, dan Tailwind CSS — cepat, mudah diakses, dan nyaman digunakan di semua perangkat.",
    icon: Layout,
    skills: ["React", "Next.js", "Tailwind CSS", "TypeScript", "Bootstrap"],
  },
  {
    index: "03",
    title: "Backend & Database",
    description:
      "Merancang logika server, REST API, dan struktur database yang andal dan aman — mulai dari PHP native hingga Laravel untuk proyek yang lebih kompleks.",
    icon: Server,
    skills: ["PHP Native", "Laravel", "REST API", "MySQL", "Auth"],
  },
  {
    index: "04",
    title: "Deployment & Hosting",
    description:
      "Melakukan deploy website ke berbagai platform — Vercel untuk aplikasi modern, InfinityFree untuk hosting PHP — serta mengelola repository kode di GitHub dengan rapi.",
    icon: Rocket,
    skills: ["Vercel", "InfinityFree", "GitHub", "cPanel", "Git"],
  },
];

export type Stat = {
  value: string;
  label: string;
};

export const stats: Stat[] = [
  { value: "3+", label: "Tahun belajar & membangun" },
  { value: "15+", label: "Proyek web selesai" },
  { value: "10+", label: "Teknologi dikuasai" },
  { value: "20+", label: "Repositori GitHub" },
];

export type ProcessStep = {
  index: string;
  title: string;
  description: string;
};

export const processSteps: ProcessStep[] = [
  {
    index: "01",
    title: "Analisis Kebutuhan",
    description:
      "Memahami kebutuhan, tujuan, dan target audiens proyek — lalu menentukan teknologi yang paling tepat untuk digunakan.",
  },
  {
    index: "02",
    title: "Desain & Wireframe",
    description:
      "Merancang struktur halaman, alur pengguna, dan tampilan UI/UX yang bersih sebelum satu baris kode pun ditulis.",
  },
  {
    index: "03",
    title: "Pengembangan",
    description:
      "Membangun frontend dan backend dengan kode yang rapi — PHP, JavaScript, dan database MySQL yang terstruktur.",
  },
  {
    index: "04",
    title: "Deploy & Peluncuran",
    description:
      "Mengunggah kode ke GitHub, melakukan deploy ke Vercel atau InfinityFree, menguji, dan memastikan semuanya berjalan lancar.",
  },
];

export type ContactMethod = {
  label: string;
  value: string;
  href: string;
  icon: LucideIcon;
};

// Ganti href & value di bawah dengan akun Anda yang sebenarnya.
export const contactMethods: ContactMethod[] = [
  {
    label: "WhatsApp",
    value: "+62 812-3456-7890",
    href: "https://wa.me/6281234567890",
    icon: MessageCircle,
  },
  {
    label: "Instagram",
    value: "@didi.dev",
    href: "https://instagram.com/didi.dev",
    icon: Instagram,
  },
  {
    label: "Email",
    value: "dididev@gmail.com",
    href: "mailto:dididev@gmail.com",
    icon: Mail,
  },
  {
    label: "Facebook",
    value: "Didi Dev",
    href: "https://facebook.com/didi.dev",
    icon: Facebook,
  },
];

export type SocialLink = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const socials: SocialLink[] = [
  {
    label: "WhatsApp",
    href: "https://wa.me/62815773617907",
    icon: MessageCircle,
  },
  {
    label: "Instagram",
    href: "https://instagram.com/didi.",
    icon: Instagram,
  },
  { label: "Email", href: "mailto:paskalisdjeharus@gmail.com", icon: Mail },
  {
    label: "Facebook",
    href: "https://facebook.com/didi.putra",
    icon: Facebook,
  },
  { label: "GitHub", href: "https://github.com/Didianus", icon: Github },
];

// Teknologi yang ditampilkan di marquee ticker.
export const techStack: string[] = [
  "PHP",
  "LARAVEL",
  "REACT",
  "NEXT.JS",
  "MYSQL",
  "JAVASCRIPT",
  "TAILWIND",
  "GITHUB",
  "VERCEL",
  "INFINITYFREE",
];

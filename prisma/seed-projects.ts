import { db } from "@/lib/db";

// Proyek demo untuk web developer (PHP, Laravel, React, Next.js, dll).
// Hanya berjalan jika database kosong (proyek pertama kali).
// Anda dapat menambah, edit, dan hapus proyek kapan saja lewat panel Admin.
async function main() {
  const count = await db.project.count();
  if (count > 0) {
    console.log(`Sudah ada ${count} proyek, skip seed.`);
    return;
  }

  await db.project.createMany({
    data: [
      {
        title: "Sistem Informasi Akademik",
        category: "Web App · PHP Native",
        description:
          "Aplikasi manajemen akademik kampus dengan modul mahasiswa, mata kuliah, KRS, dan KHS. Dibangun dengan PHP native, MySQL, dan Bootstrap.",
        image: "/portfolio/work-1.png",
        deployUrl: "https://example.com",
        tags: "PHP,MySQL,Bootstrap,Full Stack",
        featured: true,
        order: 1,
      },
      {
        title: "Toko Online Laravel",
        category: "E-commerce · Laravel",
        description:
          "Platform e-commerce dengan keranjang belanja, pembayaran, dan dashboard admin. Dibangun dengan Laravel, MySQL, dan Tailwind CSS.",
        image: "/portfolio/work-2.png",
        deployUrl: "https://example.com",
        tags: "Laravel,MySQL,Tailwind CSS,REST API",
        featured: true,
        order: 2,
      },
      {
        title: "Portfolio React",
        category: "Frontend · React",
        description:
          "Website portfolio interaktif dengan animasi halus dan desain modern. Dibangun dengan React, Framer Motion, dan Tailwind CSS.",
        image: "/portfolio/work-3.png",
        deployUrl: "https://example.com",
        tags: "React,Tailwind CSS,Framer Motion",
        featured: false,
        order: 3,
      },
      {
        title: "Blog Next.js",
        category: "Website · Next.js",
        description:
          "Blog modern dengan SSR, MDX, dan SEO optimal. Di-deploy ke Vercel dengan repository rapi di GitHub.",
        image: "/portfolio/work-4.png",
        deployUrl: "https://example.com",
        tags: "Next.js,TypeScript,Vercel,GitHub",
        featured: false,
        order: 4,
      },
    ],
  });

  console.log("Seed proyek selesai: 4 proyek dibuat.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

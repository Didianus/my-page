import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function seedProjects() {
  const count = await prisma.project.count();

  if (count > 0) {
    console.log("✔ Data project sudah ada.");
    return;
  }

  await prisma.project.createMany({
    data: [
      {
        title: "Website Real Coffee",
        category: "Web App · PHP Native",
        description:
          "Real Coffee menghadirkan pengalaman menikmati kopi premium dengan cita rasa autentik, suasana hangat, dan pelayanan terbaik. Setiap cangkir diseduh dari biji kopi pilihan Indonesia untuk menemani setiap momen berharga Anda.",
        image: "/portfolio/realcoffee.png",
        deployUrl: "https://realcoffee.vercel.app/",
        tags: "Next.js,pstgresql,Github,Tailwind",
        featured: true,
        order: 1,
      },
      {
        title: "Sistem Kasir Modern",
        category: "Web App · Kasirku",
        description:
          "Sistem Kasirku merupakan solusi Point of Sale (POS) yang dirancang untuk mempermudah proses transaksi dan manajemen usaha. Dengan fitur pencatatan penjualan, pengelolaan stok, laporan keuangan, serta dashboard interaktif, Sistem Kasirku membantu pelaku usaha meningkatkan efisiensi operasional dan kualitas pelayanan kepada pelanggan.",
        image: "/portfolio/kasir.png",
        deployUrl: "https://kasirku-gold.vercel.app/",
        tags: "Next.js,pstgresql,Github,Tailwind",
        featured: true,
        order: 2,
      },
      {
        title: "Smart Absensi Karyawan",
        category: "Frontend · React",
        description:
          "Smart Absen menghadirkan solusi absensi yang cerdas dan terpercaya untuk mendukung transformasi digital. Dengan antarmuka yang modern, proses pencatatan kehadiran menjadi lebih cepat, transparan, dan terdokumentasi dengan baik sehingga memudahkan pemantauan serta penyusunan laporan.",
        image: "/portfolio/absen.png",
        deployUrl: "https://smartabsen.vercel.app/",
        tags: "React,Tailwind,Framer Motion",
        featured: false,
        order: 3,
      },
      {
        title: "Websita FixTeks-Layanan Service Elektronik",
        category: "Website · Next.js",
        description: "Blog modern menggunakan Next.js.",
        image: "/portfolio/fix.png",
        deployUrl: "https://fixteks1.vercel.app/",
        tags: "Next.js,TypeScript",
        featured: false,
        order: 4,
      },
    ],
  });

  console.log("✔ Data Project berhasil dibuat");
}

async function main() {
  console.log("🌱 Seeding database...");

  // Hapus data lama
  await prisma.notification.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.income.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.eWallet.deleteMany();
  await prisma.member.deleteMany();
  await prisma.incomeCategory.deleteMany();
  await prisma.expenseCategory.deleteMany();
  await prisma.user.deleteMany();

  // Jika ingin menghapus project juga
  await prisma.project.deleteMany();

  // ==========================
  // Income Categories
  // ==========================

  await prisma.incomeCategory.createMany({
    data: [
      {
        name: "Iuran Bulanan",
        description: "Iuran bulanan anggota",
      },
      {
        name: "Donasi",
        description: "Donasi",
      },
      {
        name: "Sponsor",
        description: "Dana sponsor",
      },
      {
        name: "Bantuan",
        description: "Dana bantuan",
      },
      {
        name: "Dana Kegiatan",
        description: "Dana kegiatan",
      },
      {
        name: "Lainnya",
        description: "Lainnya",
      },
    ],
  });

  // ==========================
  // Expense Categories
  // ==========================

  await prisma.expenseCategory.createMany({
    data: [
      {
        name: "Konsumsi",
        description: "Biaya konsumsi",
      },
      {
        name: "Operasional",
        description: "Biaya operasional",
      },
      {
        name: "Kegiatan",
        description: "Biaya kegiatan",
      },
      {
        name: "Peralatan",
        description: "Pembelian alat",
      },
      {
        name: "Transportasi",
        description: "Transportasi",
      },
      {
        name: "Listrik",
        description: "Tagihan listrik",
      },
      {
        name: "Internet",
        description: "Tagihan internet",
      },
      {
        name: "Lainnya",
        description: "Pengeluaran lain",
      },
    ],
  });

  // ==========================
  // Admin Dummy
  // ==========================

  const password = await hash("admin123", 10);

  await prisma.user.create({
    data: {
      name: "Administrator",
      email: "admin@gmail.com",
      password,
      role: "ADMIN",
    },
  });

  // ==========================
  // Project
  // ==========================

  await seedProjects();

  console.log("=================================");
  console.log("Database berhasil di-seed.");
  console.log("=================================");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

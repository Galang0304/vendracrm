-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 20, 2025 at 08:06 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `vendra_crm`
--

-- --------------------------------------------------------

--
-- Table structure for table `ai_chat_quota`
--

CREATE TABLE `ai_chat_quota` (
  `id` varchar(191) NOT NULL,
  `companyId` varchar(191) NOT NULL,
  `tokensUsed` int(11) NOT NULL DEFAULT 0,
  `requestsUsed` int(11) NOT NULL DEFAULT 0,
  `weeklyResetDate` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ai_chat_quota`
--

INSERT INTO `ai_chat_quota` (`id`, `companyId`, `tokensUsed`, `requestsUsed`, `weeklyResetDate`, `createdAt`, `updatedAt`) VALUES
('cmiporavk0001vs9w7p53en5s', 'cmimu52s4000rvsyortko8ctd', 0, 0, '2025-12-21 16:00:00.000', '2025-12-03 07:28:51.141', '2025-12-20 03:04:06.160');

-- --------------------------------------------------------

--
-- Table structure for table `chat_messages`
--

CREATE TABLE `chat_messages` (
  `id` varchar(191) NOT NULL,
  `sessionId` varchar(191) NOT NULL,
  `adminId` varchar(191) NOT NULL,
  `message` text NOT NULL,
  `isUser` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chat_messages`
--

INSERT INTO `chat_messages` (`id`, `sessionId`, `adminId`, `message`, `isUser`, `createdAt`) VALUES
('cmiporxdx0003vs9w4buybsdh', 'session_cmimu52n3000pvsyoxnk3rtjv_1764746934534', 'cmimu52n3000pvsyoxnk3rtjv', 'Buatkan laporan performa bisnis untuk minggu ini', 1, '2025-12-03 07:29:20.325'),
('cmipos1tk0005vs9w212e2p1f', 'session_cmimu52n3000pvsyoxnk3rtjv_1764746934534', 'cmimu52n3000pvsyoxnk3rtjv', 'Baik, Galang dari Nichoa Makassar, berikut adalah laporan performa bisnis Anda untuk minggu ini berdasarkan data yang tersedia:\n\n**Ringkasan Performa Bisnis (Minggu Ini):**\n\n*   **Total Transaksi:** 0\n*   **Total Revenue:** Rp 0\n*   **Average Order Value:** Rp 0\n\n**Analisis:**\n\nBerdasarkan data minggu ini, Nichoa Makassar belum mencatatkan transaksi atau revenue. Ini adalah indikasi yang perlu segera ditindaklanjuti.\n\n**Rekomendasi Strategis (Fokus Growth & Profitability):**\n\n1.  **Identifikasi Penyebab Rendahnya Transaksi:**\n    *   **Evaluasi Aktivitas Pemasaran:** Apakah ada kampanye pemasaran yang sedang berjalan? Jika ya, evaluasi efektivitasnya. Jika tidak, pertimbangkan untuk meluncurkan kampanye pemasaran yang menargetkan pelanggan baru dan pelanggan lama.\n    *   **Tinjau Ketersediaan Produk:** Meskipun Anda belum memiliki data produk, pastikan produk yang ingin Anda jual sudah siap dan tersedia.\n\n2.  **Optimasi Penjualan:**\n    *   **Buat Promo Menarik:** Dengan data yang ada, sulit untuk memberikan rekomendasi spesifik, tetapi pertimbangkan untuk membuat promo yang menarik bagi target pasar Anda. Misalnya, diskon untuk pembelian pertama, bundling produk, atau program loyalitas.\n    *   **Manfaatkan Media Sosial:** Promosikan bisnis Anda di media sosial dan gunakan fitur-fitur seperti Instagram Shopping atau Facebook Marketplace.\n\n3.  **Fokus pada Akuisisi Pelanggan:**\n    *   **Tawarkan Insentif Referal:** Berikan insentif kepada pelanggan yang mereferensikan teman atau keluarga mereka.\n    *   **Jalin Kemitraan:** Cari bisnis lain yang memiliki target pasar yang sama dengan Anda dan jalin kemitraan untuk saling mempromosikan.\n\n**Tindakan Lanjutan:**\n\n*   **Perbarui Data Inventaris:** Setelah Anda mulai menjual produk, pastikan untuk memperbarui data inventaris Anda di Vendra CRM. Ini akan membantu Anda melacak stok, mengelola pesanan, dan menganalisis kinerja produk.\n*   **Pantau KPI Secara Teratur:** Pantau KPI (Key Performance Indicators) seperti total transaksi, total revenue, dan average order value secara teratur. Ini akan membantu Anda mengidentifikasi tren dan membuat keputusan yang lebih baik.\n*   **Lacak Efektivitas Kampanye Pemasaran:** Lacak efektivitas setiap kampanye pemasaran yang Anda jalankan. Ini akan membantu Anda mengidentifikasi kampanye mana yang paling efektif dan mengalokasikan sumber daya Anda dengan lebih efisien.\n\n**Catatan:**\n\nLaporan ini didasarkan pada data yang tersedia saat ini. Semakin lengkap dan akurat data yang Anda masukkan ke Vendra CRM, semakin akurat dan relevan pula laporan dan rekomendasi yang dapat saya berikan.\n\nSemoga laporan ini bermanfaat, Galang! Jika ada pertanyaan lebih lanjut atau Anda ingin membahas strategi tertentu lebih detail, jangan ragu untuk bertanya.\n', 0, '2025-12-03 07:29:26.072'),
('cmipos1ui0007vs9w7yj5svex', 'session_cmimu52n3000pvsyoxnk3rtjv_1764746934534', 'cmimu52n3000pvsyoxnk3rtjv', 'Baik, Galang dari Nichoa Makassar, berikut adalah laporan performa bisnis Anda untuk minggu ini berdasarkan data yang tersedia:\n\n**Ringkasan Performa Bisnis (Minggu Ini):**\n\n*   **Total Transaksi:** 0\n*   **Total Revenue:** Rp 0\n*   **Average Order Value:** Rp 0\n\n**Analisis:**\n\nBerdasarkan data minggu ini, Nichoa Makassar belum mencatatkan transaksi atau revenue. Ini adalah indikasi yang perlu segera ditindaklanjuti.\n\n**Rekomendasi Strategis (Fokus Growth & Profitability):**\n\n1.  **Identifikasi Penyebab Rendahnya Transaksi:**\n    *   **Evaluasi Aktivitas Pemasaran:** Apakah ada kampanye pemasaran yang sedang berjalan? Jika ya, evaluasi efektivitasnya. Jika tidak, pertimbangkan untuk meluncurkan kampanye pemasaran yang menargetkan pelanggan baru dan pelanggan lama.\n    *   **Tinjau Ketersediaan Produk:** Meskipun Anda belum memiliki data produk, pastikan produk yang ingin Anda jual sudah siap dan tersedia.\n\n2.  **Optimasi Penjualan:**\n    *   **Buat Promo Menarik:** Dengan data yang ada, sulit untuk memberikan rekomendasi spesifik, tetapi pertimbangkan untuk membuat promo yang menarik bagi target pasar Anda. Misalnya, diskon untuk pembelian pertama, bundling produk, atau program loyalitas.\n    *   **Manfaatkan Media Sosial:** Promosikan bisnis Anda di media sosial dan gunakan fitur-fitur seperti Instagram Shopping atau Facebook Marketplace.\n\n3.  **Fokus pada Akuisisi Pelanggan:**\n    *   **Tawarkan Insentif Referal:** Berikan insentif kepada pelanggan yang mereferensikan teman atau keluarga mereka.\n    *   **Jalin Kemitraan:** Cari bisnis lain yang memiliki target pasar yang sama dengan Anda dan jalin kemitraan untuk saling mempromosikan.\n\n**Tindakan Lanjutan:**\n\n*   **Perbarui Data Inventaris:** Setelah Anda mulai menjual produk, pastikan untuk memperbarui data inventaris Anda di Vendra CRM. Ini akan membantu Anda melacak stok, mengelola pesanan, dan menganalisis kinerja produk.\n*   **Pantau KPI Secara Teratur:** Pantau KPI (Key Performance Indicators) seperti total transaksi, total revenue, dan average order value secara teratur. Ini akan membantu Anda mengidentifikasi tren dan membuat keputusan yang lebih baik.\n*   **Lacak Efektivitas Kampanye Pemasaran:** Lacak efektivitas setiap kampanye pemasaran yang Anda jalankan. Ini akan membantu Anda mengidentifikasi kampanye mana yang paling efektif dan mengalokasikan sumber daya Anda dengan lebih efisien.\n\n**Catatan:**\n\nLaporan ini didasarkan pada data yang tersedia saat ini. Semakin lengkap dan akurat data yang Anda masukkan ke Vendra CRM, semakin akurat dan relevan pula laporan dan rekomendasi yang dapat saya berikan.\n\nSemoga laporan ini bermanfaat, Galang! Jika ada pertanyaan lebih lanjut atau Anda ingin membahas strategi tertentu lebih detail, jangan ragu untuk bertanya.\n', 0, '2025-12-03 07:29:26.107'),
('cmiptweqi0001vsooh2i8g11w', 'session_cmimu52n3000pvsyoxnk3rtjv_1764746934534', 'cmimu52n3000pvsyoxnk3rtjv', 'Buatkan laporan performa bisnis untuk minggu ini', 1, '2025-12-03 09:52:47.511'),
('cmiptwjsc0003vsoo2a2l8rhj', 'session_cmimu52n3000pvsyoxnk3rtjv_1764746934534', 'cmimu52n3000pvsyoxnk3rtjv', 'Baik, Galang dari Nichoa Makassar, berikut laporan performa bisnis mingguan Anda berdasarkan data yang tersedia:\n\n**Ringkasan Performa:**\n\n*   **Total Transaksi:** 0\n*   **Total Revenue:** Rp 0\n*   **Average Order Value (AOV):** Rp 0\n*   **Total Customers:** 0\n\n**Analisis:**\n\nBerdasarkan data yang ada, Nichoa Makassar belum mencatatkan transaksi atau pendapatan dalam periode ini. Ini menunjukkan adanya potensi masalah yang perlu segera diidentifikasi dan diatasi.\n\n**Rekomendasi Strategis:**\n\n1.  **Identifikasi Akar Masalah:**\n\n    *   **Penyebab Penjualan Nol:** Cari tahu mengapa tidak ada transaksi. Apakah ada masalah dengan operasional toko, ketersediaan produk, promosi, atau faktor eksternal seperti penurunan daya beli pelanggan?\n    *   **Evaluasi Marketing:** Tinjau kembali strategi pemasaran Anda. Apakah promosi yang ada sudah cukup menarik? Apakah Anda menjangkau target pasar yang tepat?\n\n2.  **Optimasi Inventory Management:**\n\n    *   **Kategori Produk:** Meskipun belum ada data produk, identifikasi kategori produk yang potensial untuk Nichoa Makassar berdasarkan riset pasar dan tren lokal.\n    *   **Manajemen Stok:** Setelah produk tersedia, implementasikan sistem manajemen stok yang efektif untuk menghindari kehabisan barang (out-of-stock) dan penumpukan barang (overstock).\n\n3.  **Tingkatkan Customer Engagement:**\n\n    *   **Database Pelanggan:** Mulai kumpulkan data pelanggan (nama, kontak, preferensi) untuk personalisasi komunikasi dan promosi.\n    *   **Program Loyalitas:** Pertimbangkan program loyalitas untuk mendorong repeat order dan meningkatkan retensi pelanggan.\n\n4.  **Fokus pada Revenue Generation:**\n\n    *   **Pricing Strategy:** Evaluasi harga produk Anda. Apakah harga sudah kompetitif dan sesuai dengan value yang ditawarkan?\n    *   **Diversifikasi Produk:** Pertimbangkan untuk menawarkan produk atau layanan tambahan yang relevan dengan target pasar Anda.\n\n5.  **Pantau KPI secara Aktif:**\n\n    *   **KPI Utama:** Awasi terus KPI seperti total transaksi, total revenue, AOV, dan jumlah pelanggan baru.\n    *   **Trend Harian:** Analisis tren harian untuk mengidentifikasi pola dan peluang peningkatan.\n\n**Tindakan Selanjutnya:**\n\n1.  **Prioritaskan pengisian data inventory** ke dalam sistem Vendra CRM.\n2.  **Lakukan evaluasi menyeluruh** terhadap operasional bisnis Nichoa Makassar.\n3.  **Implementasikan strategi pemasaran** yang lebih efektif.\n\nDengan data yang lebih lengkap dan tindakan yang tepat, Nichoa Makassar dapat meningkatkan performa bisnis dan mencapai pertumbuhan yang berkelanjutan.\n', 0, '2025-12-03 09:52:54.060'),
('cmiptwjsz0005vsoo4lj6musz', 'session_cmimu52n3000pvsyoxnk3rtjv_1764746934534', 'cmimu52n3000pvsyoxnk3rtjv', 'Baik, Galang dari Nichoa Makassar, berikut laporan performa bisnis mingguan Anda berdasarkan data yang tersedia:\n\n**Ringkasan Performa:**\n\n*   **Total Transaksi:** 0\n*   **Total Revenue:** Rp 0\n*   **Average Order Value (AOV):** Rp 0\n*   **Total Customers:** 0\n\n**Analisis:**\n\nBerdasarkan data yang ada, Nichoa Makassar belum mencatatkan transaksi atau pendapatan dalam periode ini. Ini menunjukkan adanya potensi masalah yang perlu segera diidentifikasi dan diatasi.\n\n**Rekomendasi Strategis:**\n\n1.  **Identifikasi Akar Masalah:**\n\n    *   **Penyebab Penjualan Nol:** Cari tahu mengapa tidak ada transaksi. Apakah ada masalah dengan operasional toko, ketersediaan produk, promosi, atau faktor eksternal seperti penurunan daya beli pelanggan?\n    *   **Evaluasi Marketing:** Tinjau kembali strategi pemasaran Anda. Apakah promosi yang ada sudah cukup menarik? Apakah Anda menjangkau target pasar yang tepat?\n\n2.  **Optimasi Inventory Management:**\n\n    *   **Kategori Produk:** Meskipun belum ada data produk, identifikasi kategori produk yang potensial untuk Nichoa Makassar berdasarkan riset pasar dan tren lokal.\n    *   **Manajemen Stok:** Setelah produk tersedia, implementasikan sistem manajemen stok yang efektif untuk menghindari kehabisan barang (out-of-stock) dan penumpukan barang (overstock).\n\n3.  **Tingkatkan Customer Engagement:**\n\n    *   **Database Pelanggan:** Mulai kumpulkan data pelanggan (nama, kontak, preferensi) untuk personalisasi komunikasi dan promosi.\n    *   **Program Loyalitas:** Pertimbangkan program loyalitas untuk mendorong repeat order dan meningkatkan retensi pelanggan.\n\n4.  **Fokus pada Revenue Generation:**\n\n    *   **Pricing Strategy:** Evaluasi harga produk Anda. Apakah harga sudah kompetitif dan sesuai dengan value yang ditawarkan?\n    *   **Diversifikasi Produk:** Pertimbangkan untuk menawarkan produk atau layanan tambahan yang relevan dengan target pasar Anda.\n\n5.  **Pantau KPI secara Aktif:**\n\n    *   **KPI Utama:** Awasi terus KPI seperti total transaksi, total revenue, AOV, dan jumlah pelanggan baru.\n    *   **Trend Harian:** Analisis tren harian untuk mengidentifikasi pola dan peluang peningkatan.\n\n**Tindakan Selanjutnya:**\n\n1.  **Prioritaskan pengisian data inventory** ke dalam sistem Vendra CRM.\n2.  **Lakukan evaluasi menyeluruh** terhadap operasional bisnis Nichoa Makassar.\n3.  **Implementasikan strategi pemasaran** yang lebih efektif.\n\nDengan data yang lebih lengkap dan tindakan yang tepat, Nichoa Makassar dapat meningkatkan performa bisnis dan mencapai pertumbuhan yang berkelanjutan.\n', 0, '2025-12-03 09:52:54.083'),
('cmiqwf9520001vsucg0dhfy2r', 'session_cmimu52n3000pvsyoxnk3rtjv_1764746934534', 'cmimu52n3000pvsyoxnk3rtjv', 'Buatkan laporan performa bisnis untuk minggu ini', 1, '2025-12-04 03:51:12.131'),
('cmiqwfdbg0003vsucogxs6gnx', 'session_cmimu52n3000pvsyoxnk3rtjv_1764746934534', 'cmimu52n3000pvsyoxnk3rtjv', 'Baik, Galang dari Nichoa Makassar. Berikut laporan performa bisnis Anda untuk minggu ini berdasarkan data yang tersedia:\n\n**Ringkasan Performa Minggu Ini:**\n\n*   **Total Revenue:** Rp 0\n*   **Total Transaksi:** 0\n*   **Average Order Value (AOV):** Rp 0\n\n**Analisis:**\n\nBerdasarkan data yang ada, minggu ini performa bisnis Anda masih menunjukkan angka Rp 0 dalam hal revenue dan transaksi. Ini mengindikasikan bahwa belum ada aktivitas penjualan yang tercatat dalam sistem selama periode tersebut.\n\n**Rekomendasi Strategis:**\n\n1.  **Aktivasi Penjualan:** Karena belum ada transaksi, prioritas utama adalah mengaktifkan penjualan. Beberapa langkah yang bisa diambil:\n    *   **Inventory Update:** Karena Anda belum memiliki produk yang terdaftar, segera lakukan pengisian data produk ke dalam sistem. Ini adalah langkah krusial.\n    *   **Promosi Awal:** Setelah produk terdaftar, jalankan promosi awal untuk menarik pelanggan. Pertimbangkan diskon khusus, bundling produk, atau program referral.\n    *   **Pemasaran Online:** Manfaatkan media sosial dan platform online lainnya untuk menjangkau target pasar Anda.\n\n2.  **Fokus pada Customer Acquisition:** Karena saat ini belum ada pelanggan yang tercatat, fokus pada akuisisi pelanggan baru. Nichoa Makassar sebagai *Retail Store* di industri *General Retail* perlu:\n    *   **Identifikasi Target Pasar:** Siapa pelanggan ideal Anda? Apa kebutuhan dan preferensi mereka?\n    *   **Tawarkan Value Proposition yang Kuat:** Apa yang membuat Nichoa Makassar unik dan menarik bagi pelanggan?\n\n3.  **Optimalkan Inventory Management:** Setelah penjualan mulai berjalan, pantau pergerakan produk secara berkala. Hindari *Low Stock* dengan sistem manajemen inventaris yang baik. Sistem Vendra CRM memiliki fitur untuk membantu Anda dalam hal ini, namun perlu diaktifkan dan diisi datanya.\n\n4.  **Pantau KPI Secara Ketat:** Setelah transaksi mulai terjadi, pantau KPI (Key Performance Indicators) seperti *Total Revenue, Average Order Value, Customer Acquisition Cost (CAC)*, dan *Customer Lifetime Value (CLTV)*. Ini akan membantu Anda mengukur efektivitas strategi yang dijalankan.\n\n**Kesimpulan:**\n\nSaat ini, Nichoa Makassar berada di tahap awal operasional. Langkah-langkah yang perlu diambil adalah fokus pada pengisian data produk, aktivasi penjualan, akuisisi pelanggan, dan implementasi sistem manajemen inventaris yang efektif. Dengan data yang lebih lengkap di sistem Vendra CRM, saya dapat memberikan rekomendasi yang lebih spesifik dan terukur.\n', 0, '2025-12-04 03:51:17.548'),
('cmiqwfddk0005vsucwbku0bra', 'session_cmimu52n3000pvsyoxnk3rtjv_1764746934534', 'cmimu52n3000pvsyoxnk3rtjv', 'Baik, Galang dari Nichoa Makassar. Berikut laporan performa bisnis Anda untuk minggu ini berdasarkan data yang tersedia:\n\n**Ringkasan Performa Minggu Ini:**\n\n*   **Total Revenue:** Rp 0\n*   **Total Transaksi:** 0\n*   **Average Order Value (AOV):** Rp 0\n\n**Analisis:**\n\nBerdasarkan data yang ada, minggu ini performa bisnis Anda masih menunjukkan angka Rp 0 dalam hal revenue dan transaksi. Ini mengindikasikan bahwa belum ada aktivitas penjualan yang tercatat dalam sistem selama periode tersebut.\n\n**Rekomendasi Strategis:**\n\n1.  **Aktivasi Penjualan:** Karena belum ada transaksi, prioritas utama adalah mengaktifkan penjualan. Beberapa langkah yang bisa diambil:\n    *   **Inventory Update:** Karena Anda belum memiliki produk yang terdaftar, segera lakukan pengisian data produk ke dalam sistem. Ini adalah langkah krusial.\n    *   **Promosi Awal:** Setelah produk terdaftar, jalankan promosi awal untuk menarik pelanggan. Pertimbangkan diskon khusus, bundling produk, atau program referral.\n    *   **Pemasaran Online:** Manfaatkan media sosial dan platform online lainnya untuk menjangkau target pasar Anda.\n\n2.  **Fokus pada Customer Acquisition:** Karena saat ini belum ada pelanggan yang tercatat, fokus pada akuisisi pelanggan baru. Nichoa Makassar sebagai *Retail Store* di industri *General Retail* perlu:\n    *   **Identifikasi Target Pasar:** Siapa pelanggan ideal Anda? Apa kebutuhan dan preferensi mereka?\n    *   **Tawarkan Value Proposition yang Kuat:** Apa yang membuat Nichoa Makassar unik dan menarik bagi pelanggan?\n\n3.  **Optimalkan Inventory Management:** Setelah penjualan mulai berjalan, pantau pergerakan produk secara berkala. Hindari *Low Stock* dengan sistem manajemen inventaris yang baik. Sistem Vendra CRM memiliki fitur untuk membantu Anda dalam hal ini, namun perlu diaktifkan dan diisi datanya.\n\n4.  **Pantau KPI Secara Ketat:** Setelah transaksi mulai terjadi, pantau KPI (Key Performance Indicators) seperti *Total Revenue, Average Order Value, Customer Acquisition Cost (CAC)*, dan *Customer Lifetime Value (CLTV)*. Ini akan membantu Anda mengukur efektivitas strategi yang dijalankan.\n\n**Kesimpulan:**\n\nSaat ini, Nichoa Makassar berada di tahap awal operasional. Langkah-langkah yang perlu diambil adalah fokus pada pengisian data produk, aktivasi penjualan, akuisisi pelanggan, dan implementasi sistem manajemen inventaris yang efektif. Dengan data yang lebih lengkap di sistem Vendra CRM, saya dapat memberikan rekomendasi yang lebih spesifik dan terukur.\n', 0, '2025-12-04 03:51:17.624'),
('cmiqwjkhz00g5vsuclly8mpxh', 'session_cmimu52n3000pvsyoxnk3rtjv_1764746934534', 'cmimu52n3000pvsyoxnk3rtjv', 'Buatkan laporan performa bisnis untuk minggu ini', 1, '2025-12-04 03:54:33.480'),
('cmiqwjpup00g7vsucyrd1721t', 'session_cmimu52n3000pvsyoxnk3rtjv_1764746934534', 'cmimu52n3000pvsyoxnk3rtjv', 'Baik, Galang! Berikut laporan performa bisnis Nichoa Makassar untuk minggu ini, dengan fokus pada pertumbuhan dan profitabilitas:\n\n**Ringkasan Performa Bisnis (Minggu Ini):**\n\n*   **Total Revenue:** Rp 10.788.750 (Berdasarkan 59 transaksi)\n*   **Average Order Value (AOV):** Rp 182.860,169\n*   **Total Items Sold:** 200\n*   **Total Customers:** 1 (1 New This Month)\n\n**Analisis Mendalam:**\n\n1.  **Pendapatan Terpusat pada Satu Hari:** Seluruh pendapatan minggu ini berasal dari tanggal 4 Desember 2025. Ini mengindikasikan potensi ketergantungan pada satu hari penjualan. **Rekomendasi:** Identifikasi faktor pendorong di tanggal tersebut (promosi, event khusus, dll.) dan replikasi strategi tersebut untuk hari-hari lain.\n\n2.  **Fokus pada Produk Unggulan:**\n    *   **Immune Booster - 35 gr:** Kontribusi tertinggi dengan Rp 1.484.000 (53 items). **Rekomendasi:** Tingkatkan stok produk ini dan pertimbangkan bundling dengan produk lain untuk meningkatkan AOV.\n    *   **Lactation - 90 gr:** Performa bagus dengan Rp 1.242.000 (27 items). **Rekomendasi:** Analisis demografi pembeli produk ini dan targetkan pemasaran ke segmen serupa.\n\n3.  **Nilai AOV Menarik:** Dengan AOV Rp 182.860,169, ada potensi untuk meningkatkan nilai ini. **Rekomendasi:**\n    *   Tawarkan promo \"Beli X, Diskon Y\" untuk meningkatkan jumlah item per transaksi.\n    *   Buat paket bundling produk dengan harga yang lebih menarik daripada membeli satuan.\n    *   Implementasikan program loyalitas untuk mendorong pembelian berulang.\n\n4.  **Basis Pelanggan Perlu Diperluas:** Saat ini hanya ada 1 pelanggan. **Rekomendasi:**\n    *   Fokus pada strategi akuisisi pelanggan baru melalui pemasaran digital, media sosial, atau kerjasama dengan bisnis lain.\n    *   Berikan insentif (diskon, hadiah) untuk pelanggan yang mereferensikan teman.\n    *   Karena Nichoa Makassar adalah ENTERPRISE Tier, maksimalkan fitur CRM Vendra untuk segmentasi pelanggan dan personalisasi penawaran.\n\n5.  **Member Rate 0%:** Tidak ada member yang terdaftar. **Rekomendasi:**\n    *   Buat program membership dengan benefit yang menarik (diskon khusus, akses eksklusif ke produk baru, dll.).\n    *   Promosikan program membership secara aktif di toko dan online.\n\n**Kesimpulan & Langkah Selanjutnya:**\n\nNichoa Makassar menunjukkan potensi pertumbuhan yang baik. Fokus pada diversifikasi hari penjualan, optimasi produk unggulan, peningkatan AOV, dan akuisisi pelanggan baru akan sangat membantu. Perhatikan juga pentingnya membangun program membership untuk meningkatkan loyalitas pelanggan.\n\n**Tindakan Nyata:**\n\n1.  **Lakukan analisis mendalam** mengapa tanggal 4 Desember 2025 menghasilkan penjualan yang signifikan.\n2.  **Susun strategi pemasaran** untuk meningkatkan penjualan produk Immune Booster dan Lactation.\n3.  **Rancang program membership** yang menarik dan mulai promosikan.\n4.  **Pantau KPI** (Revenue, AOV, Jumlah Pelanggan Baru) secara berkala untuk mengukur efektivitas strategi yang diterapkan.\n\nSemoga laporan ini bermanfaat, Galang! Apakah ada area spesifik yang ingin Anda gali lebih dalam?\n', 0, '2025-12-04 03:54:40.417'),
('cmiqwjpx000g9vsucfy777yvl', 'session_cmimu52n3000pvsyoxnk3rtjv_1764746934534', 'cmimu52n3000pvsyoxnk3rtjv', 'Baik, Galang! Berikut laporan performa bisnis Nichoa Makassar untuk minggu ini, dengan fokus pada pertumbuhan dan profitabilitas:\n\n**Ringkasan Performa Bisnis (Minggu Ini):**\n\n*   **Total Revenue:** Rp 10.788.750 (Berdasarkan 59 transaksi)\n*   **Average Order Value (AOV):** Rp 182.860,169\n*   **Total Items Sold:** 200\n*   **Total Customers:** 1 (1 New This Month)\n\n**Analisis Mendalam:**\n\n1.  **Pendapatan Terpusat pada Satu Hari:** Seluruh pendapatan minggu ini berasal dari tanggal 4 Desember 2025. Ini mengindikasikan potensi ketergantungan pada satu hari penjualan. **Rekomendasi:** Identifikasi faktor pendorong di tanggal tersebut (promosi, event khusus, dll.) dan replikasi strategi tersebut untuk hari-hari lain.\n\n2.  **Fokus pada Produk Unggulan:**\n    *   **Immune Booster - 35 gr:** Kontribusi tertinggi dengan Rp 1.484.000 (53 items). **Rekomendasi:** Tingkatkan stok produk ini dan pertimbangkan bundling dengan produk lain untuk meningkatkan AOV.\n    *   **Lactation - 90 gr:** Performa bagus dengan Rp 1.242.000 (27 items). **Rekomendasi:** Analisis demografi pembeli produk ini dan targetkan pemasaran ke segmen serupa.\n\n3.  **Nilai AOV Menarik:** Dengan AOV Rp 182.860,169, ada potensi untuk meningkatkan nilai ini. **Rekomendasi:**\n    *   Tawarkan promo \"Beli X, Diskon Y\" untuk meningkatkan jumlah item per transaksi.\n    *   Buat paket bundling produk dengan harga yang lebih menarik daripada membeli satuan.\n    *   Implementasikan program loyalitas untuk mendorong pembelian berulang.\n\n4.  **Basis Pelanggan Perlu Diperluas:** Saat ini hanya ada 1 pelanggan. **Rekomendasi:**\n    *   Fokus pada strategi akuisisi pelanggan baru melalui pemasaran digital, media sosial, atau kerjasama dengan bisnis lain.\n    *   Berikan insentif (diskon, hadiah) untuk pelanggan yang mereferensikan teman.\n    *   Karena Nichoa Makassar adalah ENTERPRISE Tier, maksimalkan fitur CRM Vendra untuk segmentasi pelanggan dan personalisasi penawaran.\n\n5.  **Member Rate 0%:** Tidak ada member yang terdaftar. **Rekomendasi:**\n    *   Buat program membership dengan benefit yang menarik (diskon khusus, akses eksklusif ke produk baru, dll.).\n    *   Promosikan program membership secara aktif di toko dan online.\n\n**Kesimpulan & Langkah Selanjutnya:**\n\nNichoa Makassar menunjukkan potensi pertumbuhan yang baik. Fokus pada diversifikasi hari penjualan, optimasi produk unggulan, peningkatan AOV, dan akuisisi pelanggan baru akan sangat membantu. Perhatikan juga pentingnya membangun program membership untuk meningkatkan loyalitas pelanggan.\n\n**Tindakan Nyata:**\n\n1.  **Lakukan analisis mendalam** mengapa tanggal 4 Desember 2025 menghasilkan penjualan yang signifikan.\n2.  **Susun strategi pemasaran** untuk meningkatkan penjualan produk Immune Booster dan Lactation.\n3.  **Rancang program membership** yang menarik dan mulai promosikan.\n4.  **Pantau KPI** (Revenue, AOV, Jumlah Pelanggan Baru) secara berkala untuk mengukur efektivitas strategi yang diterapkan.\n\nSemoga laporan ini bermanfaat, Galang! Apakah ada area spesifik yang ingin Anda gali lebih dalam?\n', 0, '2025-12-04 03:54:40.500'),
('cmisapzoo0001vswc96ac8431', 'session_cmimu52n3000pvsyoxnk3rtjv_1764746934534', 'cmimu52n3000pvsyoxnk3rtjv', 'hi', 1, '2025-12-05 03:19:13.896'),
('cmisaq3yb0003vswc0bfhjwnu', 'session_cmimu52n3000pvsyoxnk3rtjv_1764746934534', 'cmimu52n3000pvsyoxnk3rtjv', 'Halo Galang! Selamat datang kembali. Berdasarkan data Nichoa Makassar, ada beberapa hal yang bisa kita optimalkan untuk mendorong pertumbuhan bisnis Anda:\n\n1.  **Fokus pada Produk Unggulan:** Immune Booster - 35 gr adalah produk terlaris Anda dengan kontribusi pendapatan Rp 1.484.000 dari 53 item terjual. Ini menunjukkan permintaan yang tinggi. Pertimbangkan untuk:\n    *   **Optimasi Stok:** Pastikan stok Immune Booster selalu tersedia.\n    *   **Marketing Intensif:** Buat promosi khusus atau bundling produk dengan Immune Booster untuk meningkatkan penjualan.\n    *   **Feedback Pelanggan:** Kumpulkan feedback dari pelanggan tentang Immune Booster untuk memahami apa yang membuatnya menarik dan bagaimana bisa ditingkatkan lagi.\n\n2.  **Tingkatkan *Average Order Value* (AOV):** AOV Anda saat ini Rp 182.860. Ada beberapa cara untuk meningkatkannya:\n    *   **Program Loyalitas:** Karena Anda baru memiliki 1 pelanggan dan *member rate* 0%, pertimbangkan membuat program loyalitas untuk mendorong pembelian berulang dan meningkatkan AOV. Misalnya, berikan diskon untuk pembelian di atas Rp 250.000.\n    *   **Upselling/Cross-selling:** Tawarkan produk pelengkap saat pelanggan membeli produk tertentu. Contohnya, saat pelanggan membeli Lactation - 90 gr, tawarkan Almond Butter - 225 gr sebagai pelengkap.\n\n3.  **Diversifikasi Pasar:** Anda saat ini hanya memiliki 1 pelanggan aktif, yaitu Import Customer. Ini meningkatkan risiko bisnis Anda. Pertimbangkan:\n    *   **Target Pasar Baru:** Identifikasi segmen pasar lain yang potensial untuk produk-produk Nichoa Makassar.\n    *   **Promosi yang Ditargetkan:** Buat kampanye pemasaran yang ditargetkan untuk menarik pelanggan baru dari segmen yang berbeda.\n\n4.  **Manajemen Inventaris:** Meskipun tidak ada *low stock items*, nilai inventaris Anda cukup besar, yaitu Rp 114.575.000. Pastikan Anda memiliki sistem manajemen inventaris yang efisien untuk menghindari *overstock* atau *dead stock*.\n\n5.  **Pantau Tren Penjualan:** Penjualan pada tanggal 2025-12-04 mencapai Rp 10.788.750 dari 59 order. Pantau tren ini secara berkala untuk mengidentifikasi pola dan peluang. Apakah ada faktor eksternal (misalnya, hari libur atau promosi) yang memengaruhi lonjakan penjualan tersebut?\n\nDengan fokus pada poin-poin ini, saya yakin Nichoa Makassar dapat terus berkembang dan meningkatkan profitabilitasnya. Bagaimana, Galang? Apakah ada area tertentu yang ingin Anda diskusikan lebih lanjut?\n', 0, '2025-12-05 03:19:19.427'),
('cmisaq3yz0005vswcsha8d1p2', 'session_cmimu52n3000pvsyoxnk3rtjv_1764746934534', 'cmimu52n3000pvsyoxnk3rtjv', 'Halo Galang! Selamat datang kembali. Berdasarkan data Nichoa Makassar, ada beberapa hal yang bisa kita optimalkan untuk mendorong pertumbuhan bisnis Anda:\n\n1.  **Fokus pada Produk Unggulan:** Immune Booster - 35 gr adalah produk terlaris Anda dengan kontribusi pendapatan Rp 1.484.000 dari 53 item terjual. Ini menunjukkan permintaan yang tinggi. Pertimbangkan untuk:\n    *   **Optimasi Stok:** Pastikan stok Immune Booster selalu tersedia.\n    *   **Marketing Intensif:** Buat promosi khusus atau bundling produk dengan Immune Booster untuk meningkatkan penjualan.\n    *   **Feedback Pelanggan:** Kumpulkan feedback dari pelanggan tentang Immune Booster untuk memahami apa yang membuatnya menarik dan bagaimana bisa ditingkatkan lagi.\n\n2.  **Tingkatkan *Average Order Value* (AOV):** AOV Anda saat ini Rp 182.860. Ada beberapa cara untuk meningkatkannya:\n    *   **Program Loyalitas:** Karena Anda baru memiliki 1 pelanggan dan *member rate* 0%, pertimbangkan membuat program loyalitas untuk mendorong pembelian berulang dan meningkatkan AOV. Misalnya, berikan diskon untuk pembelian di atas Rp 250.000.\n    *   **Upselling/Cross-selling:** Tawarkan produk pelengkap saat pelanggan membeli produk tertentu. Contohnya, saat pelanggan membeli Lactation - 90 gr, tawarkan Almond Butter - 225 gr sebagai pelengkap.\n\n3.  **Diversifikasi Pasar:** Anda saat ini hanya memiliki 1 pelanggan aktif, yaitu Import Customer. Ini meningkatkan risiko bisnis Anda. Pertimbangkan:\n    *   **Target Pasar Baru:** Identifikasi segmen pasar lain yang potensial untuk produk-produk Nichoa Makassar.\n    *   **Promosi yang Ditargetkan:** Buat kampanye pemasaran yang ditargetkan untuk menarik pelanggan baru dari segmen yang berbeda.\n\n4.  **Manajemen Inventaris:** Meskipun tidak ada *low stock items*, nilai inventaris Anda cukup besar, yaitu Rp 114.575.000. Pastikan Anda memiliki sistem manajemen inventaris yang efisien untuk menghindari *overstock* atau *dead stock*.\n\n5.  **Pantau Tren Penjualan:** Penjualan pada tanggal 2025-12-04 mencapai Rp 10.788.750 dari 59 order. Pantau tren ini secara berkala untuk mengidentifikasi pola dan peluang. Apakah ada faktor eksternal (misalnya, hari libur atau promosi) yang memengaruhi lonjakan penjualan tersebut?\n\nDengan fokus pada poin-poin ini, saya yakin Nichoa Makassar dapat terus berkembang dan meningkatkan profitabilitasnya. Bagaimana, Galang? Apakah ada area tertentu yang ingin Anda diskusikan lebih lanjut?\n', 0, '2025-12-05 03:19:19.452'),
('cmisaqd4h0007vswcy084slvb', 'session_cmimu52n3000pvsyoxnk3rtjv_1764746934534', 'cmimu52n3000pvsyoxnk3rtjv', 'emang iya ?', 1, '2025-12-05 03:19:31.313'),
('cmisaqh910009vswcr27ykuau', 'session_cmimu52n3000pvsyoxnk3rtjv_1764746934534', 'cmimu52n3000pvsyoxnk3rtjv', 'Iya, Galang. Berdasarkan data yang saya lihat untuk Nichoa Makassar:\n\n*   **Penjualan Terfokus:** Dari 59 transaksi terakhir, Anda berhasil mencatatkan pendapatan sebesar Rp 10.788.750.\n*   **Produk Unggulan:** \"Immune Booster - 35 gr\" adalah bintangnya dengan kontribusi Rp 1.484.000 dari 53 item yang terjual. Ini menunjukkan produk ini sangat diminati.\n*   **Nilai Pesanan Rata-Rata:** Nilai pesanan rata-rata Anda sebesar Rp 182.860,169. Ini bisa jadi patokan untuk strategi *upselling* atau *bundling* agar meningkatkan nilai transaksi.\n*   **Fokus Pelanggan:** Saat ini Anda memiliki 1 pelanggan aktif. Akuisisi pelanggan baru adalah kunci untuk pertumbuhan berkelanjutan.\n*   **Potensi Kategori:** Anda memiliki variasi produk yang baik dengan 26 produk di berbagai kategori (Chocolate Bar, Energy Bar, Spread, Choco Drink, General).\n\n**Rekomendasi Tindakan (Actionable Insights):**\n\n1.  **Optimalkan Penjualan Produk Unggulan:**\n    *   **Tinjau Margin Laba:** Pastikan margin laba \"Immune Booster - 35 gr\" optimal mengingat volume penjualannya.\n    *   **Promosi Lebih Intensif:** Manfaatkan popularitas produk ini dengan promosi yang lebih gencar (misalnya, bundling dengan produk lain).\n\n2.  **Tingkatkan Nilai Pesanan Rata-Rata:**\n    *   **Strategi Bundling:** Buat paket bundling produk yang relevan (misalnya, \"Immune Booster\" dengan \"Mind Relaxing\") untuk mendorong pelanggan membeli lebih banyak.\n    *   **Program Loyalitas:** Pertimbangkan program loyalitas untuk meningkatkan retensi pelanggan dan mendorong pembelian berulang.\n\n3.  **Fokus pada Akuisisi Pelanggan:**\n    *   **Tingkatkan Member Rate:** Dengan member rate saat ini 0%, fokus pada strategi akuisisi pelanggan baru dan konversi mereka menjadi member.\n    *   **Segmentasi Pelanggan:** Kumpulkan lebih banyak data tentang pelanggan Anda untuk segmentasi yang lebih baik dan personalisasi penawaran.\n\n4.  **Pantau Kinerja Cabang:**\n    *   **Analisis Cabang:** \"COKLAT CABANG 1\" mencatat semua transaksi. Pantau kinerjanya secara berkala untuk mengidentifikasi peluang peningkatan.\n\nDengan fokus pada area ini, Nichoa Makassar dapat meningkatkan profitabilitas dan mencapai pertumbuhan yang berkelanjutan.\n', 0, '2025-12-05 03:19:36.662'),
('cmisaqh9i000bvswc84l201i0', 'session_cmimu52n3000pvsyoxnk3rtjv_1764746934534', 'cmimu52n3000pvsyoxnk3rtjv', 'Iya, Galang. Berdasarkan data yang saya lihat untuk Nichoa Makassar:\n\n*   **Penjualan Terfokus:** Dari 59 transaksi terakhir, Anda berhasil mencatatkan pendapatan sebesar Rp 10.788.750.\n*   **Produk Unggulan:** \"Immune Booster - 35 gr\" adalah bintangnya dengan kontribusi Rp 1.484.000 dari 53 item yang terjual. Ini menunjukkan produk ini sangat diminati.\n*   **Nilai Pesanan Rata-Rata:** Nilai pesanan rata-rata Anda sebesar Rp 182.860,169. Ini bisa jadi patokan untuk strategi *upselling* atau *bundling* agar meningkatkan nilai transaksi.\n*   **Fokus Pelanggan:** Saat ini Anda memiliki 1 pelanggan aktif. Akuisisi pelanggan baru adalah kunci untuk pertumbuhan berkelanjutan.\n*   **Potensi Kategori:** Anda memiliki variasi produk yang baik dengan 26 produk di berbagai kategori (Chocolate Bar, Energy Bar, Spread, Choco Drink, General).\n\n**Rekomendasi Tindakan (Actionable Insights):**\n\n1.  **Optimalkan Penjualan Produk Unggulan:**\n    *   **Tinjau Margin Laba:** Pastikan margin laba \"Immune Booster - 35 gr\" optimal mengingat volume penjualannya.\n    *   **Promosi Lebih Intensif:** Manfaatkan popularitas produk ini dengan promosi yang lebih gencar (misalnya, bundling dengan produk lain).\n\n2.  **Tingkatkan Nilai Pesanan Rata-Rata:**\n    *   **Strategi Bundling:** Buat paket bundling produk yang relevan (misalnya, \"Immune Booster\" dengan \"Mind Relaxing\") untuk mendorong pelanggan membeli lebih banyak.\n    *   **Program Loyalitas:** Pertimbangkan program loyalitas untuk meningkatkan retensi pelanggan dan mendorong pembelian berulang.\n\n3.  **Fokus pada Akuisisi Pelanggan:**\n    *   **Tingkatkan Member Rate:** Dengan member rate saat ini 0%, fokus pada strategi akuisisi pelanggan baru dan konversi mereka menjadi member.\n    *   **Segmentasi Pelanggan:** Kumpulkan lebih banyak data tentang pelanggan Anda untuk segmentasi yang lebih baik dan personalisasi penawaran.\n\n4.  **Pantau Kinerja Cabang:**\n    *   **Analisis Cabang:** \"COKLAT CABANG 1\" mencatat semua transaksi. Pantau kinerjanya secara berkala untuk mengidentifikasi peluang peningkatan.\n\nDengan fokus pada area ini, Nichoa Makassar dapat meningkatkan profitabilitas dan mencapai pertumbuhan yang berkelanjutan.\n', 0, '2025-12-05 03:19:36.678'),
('cmjdpsprh0001vsxwph1kvjyf', 'session_cmimu52n3000pvsyoxnk3rtjv_1764746934534', 'cmimu52n3000pvsyoxnk3rtjv', 'apa brand saya yang paling laku ', 1, '2025-12-20 03:04:24.940'),
('cmjdptfy10003vsxwy6e2alk8', 'session_cmimu52n3000pvsyoxnk3rtjv_1764746934534', 'cmimu52n3000pvsyoxnk3rtjv', 'coba list apa saja yang saya jual ', 1, '2025-12-20 03:04:58.873'),
('cmjdpuai40005vsxw8wazcwyr', 'session_cmimu52n3000pvsyoxnk3rtjv_1764746934534', 'cmimu52n3000pvsyoxnk3rtjv', 'hi', 1, '2025-12-20 03:05:38.477'),
('cmjdpulou0001vsgghlcexkh4', 'session_cmimu52n3000pvsyoxnk3rtjv_1764746934534', 'cmimu52n3000pvsyoxnk3rtjv', 'hi', 1, '2025-12-20 03:05:52.974'),
('cmjdpuwef0003vsggl55ldlhp', 'session_cmimu52n3000pvsyoxnk3rtjv_1764746934534', 'cmimu52n3000pvsyoxnk3rtjv', 'hi', 1, '2025-12-20 03:06:06.855'),
('cmjdpw7qa0001vsgsjnso3qve', 'session_cmimu52n3000pvsyoxnk3rtjv_1764746934534', 'cmimu52n3000pvsyoxnk3rtjv', 'hi', 1, '2025-12-20 03:07:08.194'),
('cmjdpwe880003vsgsptublct8', 'session_cmimu52n3000pvsyoxnk3rtjv_1764746934534', 'cmimu52n3000pvsyoxnk3rtjv', 'Halo Galang,\n\nTerima kasih telah menghubungi saya. Sebagai pemilik nichoa makassar, ada beberapa hal penting yang dapat kita bahas untuk mendorong pertumbuhan bisnis Anda lebih lanjut.\n\n### 1. **Strategi Pertumbuhan Bisnis**\n- **Produk Terlaris**: Produk \"Immune Booster - 35 gr\" adalah yang paling laris, dengan penjualan mencapai Rp 1.484.000 dari 53 item. Pertimbangkan untuk meningkatkan stok atau melakukan promosi khusus untuk produk ini.\n- **Diversifikasi Produk**: Meskipun Anda memiliki variasi produk yang baik, melihat peningkatan penjualan pada kategori lain seperti \"Lactation - 90 gr\" dan \"Almond Butter - 225 gr\" dapat memberikan peluang untuk promosi silang.\n\n### 2. **Pengalaman Pelanggan**\n- **Jumlah Pelanggan**: Saat ini, Anda memiliki 1 pelanggan aktif. Meningkatkan basis pelanggan dengan program loyalitas atau referral dapat membantu meningkatkan penjualan.\n- **Feedback Pelanggan**: Menerima umpan balik dari pelanggan Anda yang ada dapat memberi insight tentang area yang perlu ditingkatkan.\n\n### 3. **Analisis ROI**\n- **Rasio Keuntungan**: Profitabilitas Anda saat ini dalam kategori medium. Melakukan analisis biaya dan harga produk dapat membantu meningkatkan margin keuntungan.\n- **Optimalisasi Inventaris**: Dengan nilai inventaris sebesar Rp 114.575.000, penting untuk memastikan tidak ada kelebihan stok yang dapat menghambat arus kas.\n\n### 4. **Pertumbuhan Pendapatan**\n- **Order Rata-rata**: Nilai pesanan rata-rata Anda adalah Rp 182.860. Meningkatkan nilai ini dengan menawarkan bundling produk atau diskon untuk pembelian dalam jumlah besar bisa menjadi strategi yang efektif.\n- **Ekspansi Pasar**: Mencari peluang untuk menjual di pasar baru atau platform online bisa membuka saluran pendapatan tambahan.\n\n### 5. **Pemantauan Kinerja**\n- **Efisiensi Operasional**: Efisiensi bisnis Anda saat ini adalah 78%. Meninjau kembali proses operasional untuk menemukan area yang bisa diotomatisasi atau disederhanakan bisa meningkatkan efisiensi.\n\nJika Anda memiliki pertanyaan lebih lanjut atau butuh bantuan dalam aspek tertentu, jangan ragu untuk menghubungi saya. Semoga informasi ini bermanfaat dalam strategi bisnis Anda ke depan.', 0, '2025-12-20 03:07:16.617'),
('cmjdpwe8v0005vsgsigg7114d', 'session_cmimu52n3000pvsyoxnk3rtjv_1764746934534', 'cmimu52n3000pvsyoxnk3rtjv', 'Halo Galang,\n\nTerima kasih telah menghubungi saya. Sebagai pemilik nichoa makassar, ada beberapa hal penting yang dapat kita bahas untuk mendorong pertumbuhan bisnis Anda lebih lanjut.\n\n### 1. **Strategi Pertumbuhan Bisnis**\n- **Produk Terlaris**: Produk \"Immune Booster - 35 gr\" adalah yang paling laris, dengan penjualan mencapai Rp 1.484.000 dari 53 item. Pertimbangkan untuk meningkatkan stok atau melakukan promosi khusus untuk produk ini.\n- **Diversifikasi Produk**: Meskipun Anda memiliki variasi produk yang baik, melihat peningkatan penjualan pada kategori lain seperti \"Lactation - 90 gr\" dan \"Almond Butter - 225 gr\" dapat memberikan peluang untuk promosi silang.\n\n### 2. **Pengalaman Pelanggan**\n- **Jumlah Pelanggan**: Saat ini, Anda memiliki 1 pelanggan aktif. Meningkatkan basis pelanggan dengan program loyalitas atau referral dapat membantu meningkatkan penjualan.\n- **Feedback Pelanggan**: Menerima umpan balik dari pelanggan Anda yang ada dapat memberi insight tentang area yang perlu ditingkatkan.\n\n### 3. **Analisis ROI**\n- **Rasio Keuntungan**: Profitabilitas Anda saat ini dalam kategori medium. Melakukan analisis biaya dan harga produk dapat membantu meningkatkan margin keuntungan.\n- **Optimalisasi Inventaris**: Dengan nilai inventaris sebesar Rp 114.575.000, penting untuk memastikan tidak ada kelebihan stok yang dapat menghambat arus kas.\n\n### 4. **Pertumbuhan Pendapatan**\n- **Order Rata-rata**: Nilai pesanan rata-rata Anda adalah Rp 182.860. Meningkatkan nilai ini dengan menawarkan bundling produk atau diskon untuk pembelian dalam jumlah besar bisa menjadi strategi yang efektif.\n- **Ekspansi Pasar**: Mencari peluang untuk menjual di pasar baru atau platform online bisa membuka saluran pendapatan tambahan.\n\n### 5. **Pemantauan Kinerja**\n- **Efisiensi Operasional**: Efisiensi bisnis Anda saat ini adalah 78%. Meninjau kembali proses operasional untuk menemukan area yang bisa diotomatisasi atau disederhanakan bisa meningkatkan efisiensi.\n\nJika Anda memiliki pertanyaan lebih lanjut atau butuh bantuan dalam aspek tertentu, jangan ragu untuk menghubungi saya. Semoga informasi ini bermanfaat dalam strategi bisnis Anda ke depan.', 0, '2025-12-20 03:07:16.640'),
('cmjdpwpt40007vsgsvqlc9xtq', 'session_cmimu52n3000pvsyoxnk3rtjv_1764746934534', 'cmimu52n3000pvsyoxnk3rtjv', 'apa saja yang sya jual?', 1, '2025-12-20 03:07:31.625'),
('cmjdpwt3r0009vsgs2gogtim5', 'session_cmimu52n3000pvsyoxnk3rtjv_1764746934534', 'cmimu52n3000pvsyoxnk3rtjv', 'Halo Galang,\n\nBerdasarkan data yang ada, berikut adalah beberapa produk yang Anda jual di nichoa makassar:\n\n1. **Immune Booster - 35 gr**: Produk ini menjadi top performer Anda dengan penjualan sebanyak 53 item dan menghasilkan pendapatan sebesar Rp 1.484.000.\n2. **Lactation - 90 gr**: Produk ini terjual sebanyak 27 item dengan total pendapatan Rp 1.242.000.\n3. **Almond Butter - 225 gr**: Terjual sebanyak 9 item dan menghasilkan pendapatan sebesar Rp 720.000.\n4. **Pregnancy - 90 gr**: Produk ini terjual sebanyak 15 item dengan pendapatan Rp 690.000.\n5. **Mind Relaxing - 35 gr**: Terjual sebanyak 20 item dengan total pendapatan Rp 560.000.\n\nAnda memiliki total 26 produk dalam inventaris Anda yang terbagi dalam beberapa kategori seperti Chocolate Bar, Energy Bar, Spread, Choco Drink, dan General. Tidak ada item yang sedang low stock saat ini, jadi persediaan Anda cukup baik.\n\nApakah ada hal lain yang ingin Anda ketahui atau diskusikan lebih lanjut?', 0, '2025-12-20 03:07:35.896'),
('cmjdpwt4i000bvsgsfzzk7zp9', 'session_cmimu52n3000pvsyoxnk3rtjv_1764746934534', 'cmimu52n3000pvsyoxnk3rtjv', 'Halo Galang,\n\nBerdasarkan data yang ada, berikut adalah beberapa produk yang Anda jual di nichoa makassar:\n\n1. **Immune Booster - 35 gr**: Produk ini menjadi top performer Anda dengan penjualan sebanyak 53 item dan menghasilkan pendapatan sebesar Rp 1.484.000.\n2. **Lactation - 90 gr**: Produk ini terjual sebanyak 27 item dengan total pendapatan Rp 1.242.000.\n3. **Almond Butter - 225 gr**: Terjual sebanyak 9 item dan menghasilkan pendapatan sebesar Rp 720.000.\n4. **Pregnancy - 90 gr**: Produk ini terjual sebanyak 15 item dengan pendapatan Rp 690.000.\n5. **Mind Relaxing - 35 gr**: Terjual sebanyak 20 item dengan total pendapatan Rp 560.000.\n\nAnda memiliki total 26 produk dalam inventaris Anda yang terbagi dalam beberapa kategori seperti Chocolate Bar, Energy Bar, Spread, Choco Drink, dan General. Tidak ada item yang sedang low stock saat ini, jadi persediaan Anda cukup baik.\n\nApakah ada hal lain yang ingin Anda ketahui atau diskusikan lebih lanjut?', 0, '2025-12-20 03:07:35.922'),
('cmjdvezpz0001rqn2ixektb48', 'session_cmimu52n3000pvsyoxnk3rtjv_1764746934534', 'cmimu52n3000pvsyoxnk3rtjv', 'hai sebutkan smua 26 itu ', 1, '2025-12-20 05:41:42.357'),
('cmjdvf57q0003rqn2y32s0t7k', 'session_cmimu52n3000pvsyoxnk3rtjv_1764746934534', 'cmimu52n3000pvsyoxnk3rtjv', 'Hai Galang,\n\nTentu saja, berikut adalah daftar lengkap dari 26 produk yang ada dalam inventory Anda saat ini. Namun, karena data yang Anda berikan tidak mencantumkan semua nama produk, saya akan menyebutkan beberapa yang sudah diketahui berdasarkan performa terbaik:\n\n1. Immune Booster - 35 gr\n2. Lactation - 90 gr\n3. Almond Butter - 225 gr\n4. Pregnancy - 90 gr\n5. Mind Relaxing - 35 gr\n\nProduk-produk di atas merupakan produk yang paling menonjol dalam penjualan Anda. Untuk mendapatkan daftar lengkap dari semua produk, Anda bisa mengaksesnya melalui sistem Vendra CRM di bagian manajemen inventaris.\n\nJika Anda ingin meningkatkan penjualan atau fokus pada produk tertentu, kita bisa mendiskusikan strategi yang tepat untuk mengoptimalkan kinerja produk lainnya. Misalnya, Anda bisa mempertimbangkan promosi silang antara produk populer dan produk yang kurang terjual.\n\nJika ada hal lain yang ingin Anda ketahui atau butuhkan, jangan ragu untuk menghubungi saya.', 0, '2025-12-20 05:41:49.479'),
('cmjdvf5930005rqn2hy8io0ie', 'session_cmimu52n3000pvsyoxnk3rtjv_1764746934534', 'cmimu52n3000pvsyoxnk3rtjv', 'Hai Galang,\n\nTentu saja, berikut adalah daftar lengkap dari 26 produk yang ada dalam inventory Anda saat ini. Namun, karena data yang Anda berikan tidak mencantumkan semua nama produk, saya akan menyebutkan beberapa yang sudah diketahui berdasarkan performa terbaik:\n\n1. Immune Booster - 35 gr\n2. Lactation - 90 gr\n3. Almond Butter - 225 gr\n4. Pregnancy - 90 gr\n5. Mind Relaxing - 35 gr\n\nProduk-produk di atas merupakan produk yang paling menonjol dalam penjualan Anda. Untuk mendapatkan daftar lengkap dari semua produk, Anda bisa mengaksesnya melalui sistem Vendra CRM di bagian manajemen inventaris.\n\nJika Anda ingin meningkatkan penjualan atau fokus pada produk tertentu, kita bisa mendiskusikan strategi yang tepat untuk mengoptimalkan kinerja produk lainnya. Misalnya, Anda bisa mempertimbangkan promosi silang antara produk populer dan produk yang kurang terjual.\n\nJika ada hal lain yang ingin Anda ketahui atau butuhkan, jangan ragu untuk menghubungi saya.', 0, '2025-12-20 05:41:49.527');

-- --------------------------------------------------------

--
-- Table structure for table `chat_sessions`
--

CREATE TABLE `chat_sessions` (
  `id` varchar(191) NOT NULL,
  `adminId` varchar(191) NOT NULL,
  `adminName` varchar(191) NOT NULL,
  `adminRole` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chat_sessions`
--

INSERT INTO `chat_sessions` (`id`, `adminId`, `adminName`, `adminRole`, `createdAt`, `updatedAt`) VALUES
('session_cmimu52n3000pvsyoxnk3rtjv_1764746934534', 'cmimu52n3000pvsyoxnk3rtjv', 'galang', 'OWNER', '2025-12-03 07:28:54.536', '2025-12-20 05:41:49.532');

-- --------------------------------------------------------

--
-- Table structure for table `companies`
--

CREATE TABLE `companies` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `address` varchar(191) DEFAULT NULL,
  `logo` varchar(191) DEFAULT NULL,
  `subscriptionTier` enum('FREE','BASIC','PREMIUM','ENTERPRISE') NOT NULL DEFAULT 'FREE',
  `subscriptionExpiry` datetime(3) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `ownerId` varchar(191) NOT NULL,
  `logoSize` int(11) DEFAULT NULL,
  `storageBaselineUsage` bigint(20) DEFAULT 0,
  `storageResetDate` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `companies`
--

INSERT INTO `companies` (`id`, `name`, `email`, `phone`, `address`, `logo`, `subscriptionTier`, `subscriptionExpiry`, `isActive`, `createdAt`, `updatedAt`, `ownerId`, `logoSize`, `storageBaselineUsage`, `storageResetDate`) VALUES
('cmimu52s4000rvsyortko8ctd', 'nichoa makassar', 'andiariegalang0@gmail.com', '+628515052668', 'Indonesia', NULL, 'ENTERPRISE', '2026-01-02 07:28:30.109', 1, '2025-12-01 07:36:13.389', '2025-12-03 07:28:30.144', 'cmimu52n3000pvsyoxnk3rtjv', NULL, 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` varchar(191) NOT NULL,
  `uniqueId` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) DEFAULT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `address` varchar(191) DEFAULT NULL,
  `dateOfBirth` datetime(3) DEFAULT NULL,
  `gender` varchar(191) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `companyId` varchar(191) NOT NULL,
  `isMember` tinyint(1) NOT NULL DEFAULT 0,
  `membershipDiscount` double NOT NULL DEFAULT 0,
  `membershipExpiry` datetime(3) DEFAULT NULL,
  `membershipId` varchar(191) DEFAULT NULL,
  `membershipJoinDate` datetime(3) DEFAULT NULL,
  `membershipPoints` int(11) NOT NULL DEFAULT 0,
  `membershipTier` varchar(191) DEFAULT NULL,
  `membershipStoreId` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `uniqueId`, `name`, `email`, `phone`, `address`, `dateOfBirth`, `gender`, `isActive`, `createdAt`, `updatedAt`, `companyId`, `isMember`, `membershipDiscount`, `membershipExpiry`, `membershipId`, `membershipJoinDate`, `membershipPoints`, `membershipTier`, `membershipStoreId`) VALUES
('cmiqwj3y90009vsuczgwjllje', 'CUST1764820452024', 'Import Customer', NULL, NULL, NULL, NULL, NULL, 1, '2025-12-04 03:54:12.031', '2025-12-04 03:54:12.031', 'cmimu52s4000rvsyortko8ctd', 0, 0, NULL, NULL, NULL, 0, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `role` enum('SUPERADMIN','ADMIN','KASIR','OWNER') NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `companyId` varchar(191) NOT NULL,
  `storeId` varchar(191) DEFAULT NULL,
  `otpCode` varchar(191) DEFAULT NULL,
  `otpExpires` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `import_history`
--

CREATE TABLE `import_history` (
  `id` varchar(191) NOT NULL,
  `fileName` varchar(191) NOT NULL,
  `fileSize` int(11) NOT NULL,
  `filePath` varchar(191) NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'completed',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `companyId` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `sku` varchar(191) NOT NULL,
  `barcode` varchar(191) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `cost` decimal(10,2) DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `minStock` int(11) NOT NULL DEFAULT 0,
  `category` varchar(191) DEFAULT NULL,
  `brand` varchar(191) DEFAULT NULL,
  `unit` varchar(191) NOT NULL DEFAULT 'pcs',
  `weight` double DEFAULT NULL,
  `dimensions` varchar(191) DEFAULT NULL,
  `imageUrl` varchar(191) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `companyId` varchar(191) NOT NULL,
  `storeId` varchar(191) DEFAULT NULL,
  `brandCommissionRate` decimal(5,4) DEFAULT 0.0000,
  `brandCommissionAmount` decimal(12,2) DEFAULT 0.00,
  `imageSize` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `sku`, `barcode`, `price`, `cost`, `stock`, `minStock`, `category`, `brand`, `unit`, `weight`, `dimensions`, `imageUrl`, `isActive`, `createdAt`, `updatedAt`, `companyId`, `storeId`, `brandCommissionRate`, `brandCommissionAmount`, `imageSize`) VALUES
('cmiqwj3zs000dvsucvwzv88n8', 'Stress Reliever - 35 gr', NULL, 'SR-1', NULL, 28000.00, 19983.00, 100, 0, 'Chocolate Bar', 'Nichoa', 'pcs', NULL, NULL, NULL, 1, '2025-12-04 03:54:12.088', '2025-12-04 03:54:12.088', 'cmimu52s4000rvsyortko8ctd', 'cmiqwinc30007vsuc08z0y2r7', 0.0000, 0.00, NULL),
('cmiqwj411000hvsuckbm0ruoz', 'Mind Relaxing - 35 gr', NULL, 'MR-1', NULL, 28000.00, 20902.00, 100, 0, 'Chocolate Bar', 'Nichoa', 'pcs', NULL, NULL, NULL, 1, '2025-12-04 03:54:12.133', '2025-12-04 03:54:12.133', 'cmimu52s4000rvsyortko8ctd', 'cmiqwinc30007vsuc08z0y2r7', 0.0000, 0.00, NULL),
('cmiqwj41z000lvsucr9cwhuo5', 'Sleeping Well - 35 gr', NULL, 'SW-1', NULL, 28000.00, 22201.00, 100, 0, 'Chocolate Bar', 'Nichoa', 'pcs', NULL, NULL, NULL, 1, '2025-12-04 03:54:12.168', '2025-12-04 03:54:12.168', 'cmimu52s4000rvsyortko8ctd', 'cmiqwinc30007vsuc08z0y2r7', 0.0000, 0.00, NULL),
('cmiqwj42n000pvsucenybsyx8', 'Immune Booster - 35 gr', NULL, 'IM-1', NULL, 28000.00, 23121.00, 100, 0, 'Chocolate Bar', 'Nichoa', 'pcs', NULL, NULL, NULL, 1, '2025-12-04 03:54:12.192', '2025-12-04 03:54:12.192', 'cmimu52s4000rvsyortko8ctd', 'cmiqwinc30007vsuc08z0y2r7', 0.0000, 0.00, NULL),
('cmiqwj44f000zvsucvy2ugrxw', 'Workout Buddy - 35 gr', NULL, 'WB-1', NULL, 28000.00, 20538.00, 100, 0, 'Chocolate Bar', 'Nichoa', 'pcs', NULL, NULL, NULL, 1, '2025-12-04 03:54:12.256', '2025-12-04 03:54:12.256', 'cmimu52s4000rvsyortko8ctd', 'cmiqwinc30007vsuc08z0y2r7', 0.0000, 0.00, NULL),
('cmiqwj4550013vsuc339wmdos', 'Honeycomb Dark chocolate', NULL, 'SKU1764820452262tn9vd', NULL, 30000.00, 0.00, 100, 0, 'Chocolate Bar', 'Unknown Brand', 'pcs', NULL, NULL, NULL, 1, '2025-12-04 03:54:12.281', '2025-12-04 03:54:12.281', 'cmimu52s4000rvsyortko8ctd', 'cmiqwinc30007vsuc08z0y2r7', 0.0000, 0.00, NULL),
('cmiqwj45t0017vsucx1wm4ce1', 'Almond Cranberries - 1 pcs', NULL, 'EBA-0', NULL, 10000.00, 4558.00, 100, 0, 'Energy Bar', 'Nichoa', 'pcs', NULL, NULL, NULL, 1, '2025-12-04 03:54:12.305', '2025-12-04 03:54:12.305', 'cmimu52s4000rvsyortko8ctd', 'cmiqwinc30007vsuc08z0y2r7', 0.0000, 0.00, NULL),
('cmiqwj46j001bvsuc3rvixnbu', 'Cashew Dates - 1 pcs', NULL, 'EBC-0', NULL, 10000.00, 4595.00, 100, 0, 'Energy Bar', 'Nichoa', 'pcs', NULL, NULL, NULL, 1, '2025-12-04 03:54:12.331', '2025-12-04 03:54:12.331', 'cmimu52s4000rvsyortko8ctd', 'cmiqwinc30007vsuc08z0y2r7', 0.0000, 0.00, NULL),
('cmiqwj47e001hvsuc3nz2ean3', 'Almond Butter - 225 gr', NULL, 'SKU17648204523382jne5', NULL, 80000.00, 64742.00, 100, 0, 'Spread', 'Nichoa', 'pcs', NULL, NULL, NULL, 1, '2025-12-04 03:54:12.362', '2025-12-04 03:54:12.362', 'cmimu52s4000rvsyortko8ctd', 'cmiqwinc30007vsuc08z0y2r7', 0.0000, 0.00, NULL),
('cmiqwj481001lvsucwf7avguz', 'Pregnancy - 90 gr', NULL, 'Pregnancy-0', NULL, 46000.00, 35451.00, 100, 0, 'Chocolate Bar', 'Nichoa', 'pcs', NULL, NULL, NULL, 1, '2025-12-04 03:54:12.385', '2025-12-04 03:54:12.385', 'cmimu52s4000rvsyortko8ctd', 'cmiqwinc30007vsuc08z0y2r7', 0.0000, 0.00, NULL),
('cmiqwj4bt0023vsuc93s1h36g', 'Loofah Gumi Bamboo', NULL, 'SKU1764820452503w207i', NULL, 9750.00, 9750.00, 100, 0, 'Chocolate Bar', 'Unknown Brand', 'pcs', NULL, NULL, NULL, 1, '2025-12-04 03:54:12.521', '2025-12-04 03:54:12.521', 'cmimu52s4000rvsyortko8ctd', 'cmiqwinc30007vsuc08z0y2r7', 0.0000, 0.00, NULL),
('cmiqwj4cm0029vsucx0tvin4p', 'Lactation - 35 gr', NULL, 'Lactation-1', NULL, 28000.00, 21917.00, 100, 0, 'Chocolate Bar', 'Nichoa', 'pcs', NULL, NULL, NULL, 1, '2025-12-04 03:54:12.550', '2025-12-04 03:54:12.550', 'cmimu52s4000rvsyortko8ctd', 'cmiqwinc30007vsuc08z0y2r7', 0.0000, 0.00, NULL),
('cmiqwj4e1002hvsuckgywsp00', 'Immune Booster Chocodrink - 25 gr', NULL, 'SKU176482045258659v1e', NULL, 18000.00, 9500.00, 100, 0, 'Choco Drink', 'Nichoa', 'pcs', NULL, NULL, NULL, 1, '2025-12-04 03:54:12.601', '2025-12-04 03:54:12.601', 'cmimu52s4000rvsyortko8ctd', 'cmiqwinc30007vsuc08z0y2r7', 0.0000, 0.00, NULL),
('cmiqwj4en002lvsuc6h6u6mue', 'Fresh and Fight - 25 gr', NULL, 'Chocodrink SR-0', NULL, 18000.00, 7936.00, 100, 0, 'Choco Drink', 'Nichoa', 'pcs', NULL, NULL, NULL, 1, '2025-12-04 03:54:12.623', '2025-12-04 03:54:12.623', 'cmimu52s4000rvsyortko8ctd', 'cmiqwinc30007vsuc08z0y2r7', 0.0000, 0.00, NULL),
('cmiqwj4fm002rvsuclxxgbwcs', 'Lactation - 90 gr', NULL, 'Lactation-0', NULL, 46000.00, 35210.00, 100, 0, 'Chocolate Bar', 'Nichoa', 'pcs', NULL, NULL, NULL, 1, '2025-12-04 03:54:12.659', '2025-12-04 03:54:12.659', 'cmimu52s4000rvsyortko8ctd', 'cmiqwinc30007vsuc08z0y2r7', 0.0000, 0.00, NULL),
('cmiqwj4hf0031vsuc0hezwbjx', 'Sleeping Well - 90 gr', NULL, 'SW-0', NULL, 46000.00, 35414.00, 100, 0, 'Chocolate Bar', 'Nichoa', 'pcs', NULL, NULL, NULL, 1, '2025-12-04 03:54:12.723', '2025-12-04 03:54:12.723', 'cmimu52s4000rvsyortko8ctd', 'cmiqwinc30007vsuc08z0y2r7', 0.0000, 0.00, NULL),
('cmiqwj4kk003jvsucd94z6uur', 'Bundling 125Rb', NULL, 'SKU1764820452813q4h7f', NULL, 125000.00, 86762.00, 100, 0, 'General', 'Unknown Brand', 'pcs', NULL, NULL, NULL, 1, '2025-12-04 03:54:12.836', '2025-12-04 03:54:12.836', 'cmimu52s4000rvsyortko8ctd', 'cmiqwinc30007vsuc08z0y2r7', 0.0000, 0.00, NULL),
('cmiqwj4m0003rvsucmpw16el0', 'Stress Reliever - 90 gr', NULL, 'SR-0', NULL, 46000.00, 34783.00, 100, 0, 'Chocolate Bar', 'Nichoa', 'pcs', NULL, NULL, NULL, 1, '2025-12-04 03:54:12.888', '2025-12-04 03:54:12.888', 'cmimu52s4000rvsyortko8ctd', 'cmiqwinc30007vsuc08z0y2r7', 0.0000, 0.00, NULL),
('cmiqwj4mw003vvsuc49l8pqax', 'Mind Relaxing - 90 gr', NULL, 'MR-0', NULL, 46000.00, 33764.00, 100, 0, 'Chocolate Bar', 'Nichoa', 'pcs', NULL, NULL, NULL, 1, '2025-12-04 03:54:12.921', '2025-12-04 03:54:12.921', 'cmimu52s4000rvsyortko8ctd', 'cmiqwinc30007vsuc08z0y2r7', 0.0000, 0.00, NULL),
('cmiqwj4no003zvsucg7uuiyaj', 'Pregnancy - 35 gr', NULL, 'Pregnancy-1', NULL, 28000.00, 21953.00, 100, 0, 'Chocolate Bar', 'Nichoa', 'pcs', NULL, NULL, NULL, 1, '2025-12-04 03:54:12.948', '2025-12-04 03:54:12.948', 'cmimu52s4000rvsyortko8ctd', 'cmiqwinc30007vsuc08z0y2r7', 0.0000, 0.00, NULL),
('cmiqwj4r5004dvsuc6yo4qpaz', 'Diabetic Friendly', NULL, 'SKU1764820453058hwaxf', NULL, 50000.00, 0.00, 100, 0, 'Chocolate Bar', 'Nichoa', 'pcs', NULL, NULL, NULL, 1, '2025-12-04 03:54:13.074', '2025-12-04 03:54:13.074', 'cmimu52s4000rvsyortko8ctd', 'cmiqwinc30007vsuc08z0y2r7', 0.0000, 0.00, NULL),
('cmiqwj5bd006pvsuc4vrthbnl', 'Stress Release - 25 gr', NULL, 'SKU1764820453786qob1g', NULL, 18000.00, 9061.00, 100, 0, 'Choco Drink', 'Nichoa', 'pcs', NULL, NULL, NULL, 1, '2025-12-04 03:54:13.802', '2025-12-04 03:54:13.802', 'cmimu52s4000rvsyortko8ctd', 'cmiqwinc30007vsuc08z0y2r7', 0.0000, 0.00, NULL),
('cmiqwj5ow008rvsuc070h1ocp', 'Superfood - 225 gr', NULL, 'SKU176482045427320fvl', NULL, 80000.00, 44307.00, 100, 0, 'Spread', 'Nichoa', 'pcs', NULL, NULL, NULL, 1, '2025-12-04 03:54:14.289', '2025-12-04 03:54:14.289', 'cmimu52s4000rvsyortko8ctd', 'cmiqwinc30007vsuc08z0y2r7', 0.0000, 0.00, NULL),
('cmiqwj60100ajvsuc9xuhbais', 'Stress Release - 150 gr', NULL, 'SKU1764820454676hgfa5', NULL, 75000.00, 49791.00, 100, 0, 'Choco Drink', 'Nichoa', 'pcs', NULL, NULL, NULL, 1, '2025-12-04 03:54:14.690', '2025-12-04 03:54:14.690', 'cmimu52s4000rvsyortko8ctd', 'cmiqwinc30007vsuc08z0y2r7', 0.0000, 0.00, NULL),
('cmiqwj60o00anvsuc6ij8tshs', 'Immune Booster - 90 gr', NULL, 'IM-0', NULL, 46000.00, 36662.00, 100, 0, 'Chocolate Bar', 'Nichoa', 'pcs', NULL, NULL, NULL, 1, '2025-12-04 03:54:14.712', '2025-12-04 03:54:14.712', 'cmimu52s4000rvsyortko8ctd', 'cmiqwinc30007vsuc08z0y2r7', 0.0000, 0.00, NULL),
('cmiqwj6h600drvsuczxugwknj', 'Hampers Hari Ibu (H-Dark)', NULL, 'SKU1764820455287zi20b', NULL, 150000.00, 151566.00, 100, 0, 'General', 'Unknown Brand', 'pcs', NULL, NULL, NULL, 1, '2025-12-04 03:54:15.307', '2025-12-04 03:54:15.307', 'cmimu52s4000rvsyortko8ctd', 'cmiqwinc30007vsuc08z0y2r7', 0.0000, 0.00, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(191) NOT NULL,
  `sessionToken` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `expires` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stores`
--

CREATE TABLE `stores` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `code` varchar(191) NOT NULL,
  `address` varchar(191) DEFAULT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `email` varchar(191) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `companyId` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stores`
--

INSERT INTO `stores` (`id`, `name`, `code`, `address`, `phone`, `email`, `isActive`, `createdAt`, `updatedAt`, `companyId`) VALUES
('cmiqwinc30007vsuc08z0y2r7', 'COKLAT CABANG 1', '0213123', 'MAKASSAR', '0987987678987', 'ADJANSD@GMAIL.COM', 1, '2025-12-04 03:53:50.499', '2025-12-04 03:53:50.499', 'cmimu52s4000rvsyortko8ctd');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` varchar(191) NOT NULL,
  `transactionNo` varchar(191) NOT NULL,
  `date` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `subtotal` decimal(12,2) NOT NULL,
  `tax` decimal(12,2) NOT NULL DEFAULT 0.00,
  `discount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total` decimal(12,2) NOT NULL,
  `paymentMethod` varchar(191) NOT NULL,
  `paymentStatus` varchar(191) NOT NULL DEFAULT 'completed',
  `notes` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `companyId` varchar(191) NOT NULL,
  `customerId` varchar(191) NOT NULL,
  `storeId` varchar(191) DEFAULT NULL,
  `employeeId` varchar(191) DEFAULT NULL,
  `currency` varchar(10) DEFAULT 'IDR'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `transactionNo`, `date`, `subtotal`, `tax`, `discount`, `total`, `paymentMethod`, `paymentStatus`, `notes`, `createdAt`, `updatedAt`, `companyId`, `customerId`, `storeId`, `employeeId`, `currency`) VALUES
('cmiqwj3z0000bvsucqw7fph23', '065321010200000075', '2025-01-02 07:15:36.000', 28000.00, 0.00, 0.00, 28000.00, 'BRI Andri Setyowati', 'COMPLETED', NULL, '2025-12-04 03:54:12.060', '2025-12-04 03:54:12.060', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj43a000tvsuch1bnxes7', '065321010200000076', '2025-01-02 07:18:40.000', 56000.00, 0.00, 0.00, 56000.00, 'BRI Andri Setyowati', 'COMPLETED', NULL, '2025-12-04 03:54:12.214', '2025-12-04 03:54:12.214', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj473001fvsuchrawmjus', '065321010500000077', '2025-01-05 07:10:26.000', 80000.00, 0.00, 0.00, 80000.00, 'BRI Andri Setyowati', 'COMPLETED', NULL, '2025-12-04 03:54:12.351', '2025-12-04 03:54:12.351', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj498001rvsucpou6vwl6', '065321010600000078', '2025-01-06 07:28:17.000', 10000.00, 0.00, 0.00, 10000.00, 'Pembelian Via Shopee', 'COMPLETED', NULL, '2025-12-04 03:54:12.428', '2025-12-04 03:54:12.428', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj4cc0027vsuch9qbie7y', '065321010800000079', '2025-01-08 01:35:34.000', 28000.00, 0.00, 0.00, 28000.00, 'BRI Andri Setyowati', 'COMPLETED', NULL, '2025-12-04 03:54:12.540', '2025-12-04 03:54:12.540', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj4fc002pvsucgeiuq1jv', '065321010800000080', '2025-01-08 01:39:05.000', 92000.00, 0.00, 0.00, 92000.00, 'BRI Andri Setyowati', 'COMPLETED', NULL, '2025-12-04 03:54:12.648', '2025-12-04 03:54:12.648', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj4go002xvsuc7sbq2fsu', '065321010800000081', '2025-01-08 01:41:42.000', 28000.00, 0.00, 0.00, 28000.00, 'Pembelian Via Shopee', 'COMPLETED', NULL, '2025-12-04 03:54:12.696', '2025-12-04 03:54:12.696', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj4i00035vsucp8wctwan', '065321010800000082', '2025-01-08 01:46:16.000', 112000.00, 0.00, 0.00, 112000.00, 'BRI Andri Setyowati', 'COMPLETED', NULL, '2025-12-04 03:54:12.744', '2025-12-04 03:54:12.744', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj4ka003hvsucs5y7u2zv', '065321010800000083', '2025-01-08 01:48:15.000', 125000.00, 0.00, 0.00, 125000.00, 'Tokopedia', 'COMPLETED', NULL, '2025-12-04 03:54:12.826', '2025-12-04 03:54:12.826', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj4l6003nvsucalfobgbz', '065321010800000084', '2025-01-08 02:02:13.000', 56000.00, 0.00, 0.00, 56000.00, 'CASH', 'COMPLETED', NULL, '2025-12-04 03:54:12.858', '2025-12-04 03:54:12.858', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj4p40045vsuc1nd2vzuv', '065321010800000085', '2025-01-08 07:55:22.000', 80000.00, 0.00, 0.00, 80000.00, 'BRI Andri Setyowati', 'COMPLETED', NULL, '2025-12-04 03:54:13.000', '2025-12-04 03:54:13.000', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj4s1004hvsucdjxjfoi1', '065321011100000086', '2025-01-11 02:05:38.000', 56000.00, 0.00, 0.00, 56000.00, 'BRI Andri Setyowati', 'COMPLETED', NULL, '2025-12-04 03:54:13.105', '2025-12-04 03:54:13.105', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj4um004rvsucoz6lfhso', '065321011100000087', '2025-01-11 02:07:47.000', 28000.00, 0.00, 0.00, 28000.00, 'BRI Andri Setyowati', 'COMPLETED', NULL, '2025-12-04 03:54:13.198', '2025-12-04 03:54:13.198', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj4x60051vsuce5nmvao5', '065321011100000088', '2025-01-11 02:17:06.000', 100000.00, 0.00, 0.00, 100000.00, 'BRI Andri Setyowati', 'COMPLETED', NULL, '2025-12-04 03:54:13.290', '2025-12-04 03:54:13.290', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj4z10059vsuc7y0hg7st', '065321011100000089', '2025-01-11 02:19:27.000', 28000.00, 0.00, 0.00, 28000.00, 'Pembelian Via Shopee', 'COMPLETED', NULL, '2025-12-04 03:54:13.358', '2025-12-04 03:54:13.358', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj50j005fvsucud7b4zt8', '065321011100000090', '2025-01-11 02:21:30.000', 28000.00, 0.00, 0.00, 28000.00, 'BRI Andri Setyowati', 'COMPLETED', NULL, '2025-12-04 03:54:13.411', '2025-12-04 03:54:13.411', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj53q005pvsuc15uo149l', '065321011100000091', '2025-01-11 02:22:36.000', 28000.00, 0.00, 0.00, 28000.00, 'BRI Andri Setyowati', 'COMPLETED', NULL, '2025-12-04 03:54:13.526', '2025-12-04 03:54:13.526', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj568005zvsucj2um4t35', '065321011100000092', '2025-01-11 09:02:09.000', 84000.00, 0.00, 0.00, 84000.00, 'BRI Andri Setyowati', 'COMPLETED', NULL, '2025-12-04 03:54:13.616', '2025-12-04 03:54:13.616', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj5aq006lvsuckd5lswqi', '065321011100000093', '2025-01-11 09:03:35.000', 80000.00, 0.00, 0.00, 80000.00, 'BRI Andri Setyowati', 'COMPLETED', NULL, '2025-12-04 03:54:13.778', '2025-12-04 03:54:13.778', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj5bx006tvsucqudvtw39', '065321011100000094', '2025-01-11 09:04:09.000', 100000.00, 0.00, 0.00, 100000.00, 'BRI Andri Setyowati', 'COMPLETED', NULL, '2025-12-04 03:54:13.821', '2025-12-04 03:54:13.821', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj5de0071vsucyw88nksc', '065321011100000095', '2025-01-11 09:04:55.000', 28000.00, 0.00, 0.00, 28000.00, 'Pembelian Via Shopee', 'COMPLETED', NULL, '2025-12-04 03:54:13.874', '2025-12-04 03:54:13.874', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj5eg0077vsucb23gn7rl', '065321011100000096', '2025-01-11 09:05:39.000', 28000.00, 0.00, 0.00, 28000.00, 'BRI Andri Setyowati', 'COMPLETED', NULL, '2025-12-04 03:54:13.912', '2025-12-04 03:54:13.912', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj5ga007hvsuchfvthn3q', '065321011100000097', '2025-01-11 09:11:42.000', 28000.00, 0.00, 0.00, 28000.00, 'Pembelian Via Shopee', 'COMPLETED', NULL, '2025-12-04 03:54:13.978', '2025-12-04 03:54:13.978', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj5j5007xvsuccgm0r36v', '065321011100000098', '2025-01-11 09:13:12.000', 10000.00, 0.00, 0.00, 10000.00, 'Pembelian Via Shopee', 'COMPLETED', NULL, '2025-12-04 03:54:14.081', '2025-12-04 03:54:14.081', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj5lo008bvsucw1iqohu4', '065321011200000099', '2025-01-12 08:02:48.000', 112000.00, 0.00, 0.00, 112000.00, 'BRI Andri Setyowati', 'COMPLETED', NULL, '2025-12-04 03:54:14.173', '2025-12-04 03:54:14.173', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj5pf008vvsucrmnr1uyx', '6,5321E+16', '2025-01-14 08:17:44.000', 20000.00, 0.00, 0.00, 20000.00, 'BRI Andri Setyowati', 'COMPLETED', NULL, '2025-12-04 03:54:14.307', '2025-12-04 03:54:14.307', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj5rm0097vsucpyatsg4h', '065321011400000101', '2025-01-14 08:18:38.000', 46000.00, 0.00, 0.00, 46000.00, 'BRI Andri Setyowati', 'COMPLETED', NULL, '2025-12-04 03:54:14.386', '2025-12-04 03:54:14.386', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj5ta009hvsuciyqlxnvs', '065321011400000102', '2025-01-14 08:39:36.000', 28000.00, 0.00, 0.00, 28000.00, 'Tokopedia', 'COMPLETED', NULL, '2025-12-04 03:54:14.446', '2025-12-04 03:54:14.446', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj5uo009nvsuca77326xv', '065321012700000103', '2025-01-27 00:49:53.000', 92000.00, 0.00, 0.00, 92000.00, 'Tokopedia', 'COMPLETED', NULL, '2025-12-04 03:54:14.496', '2025-12-04 03:54:14.496', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj5wz009zvsucbwjujjk6', 'E39421013000000009', '2025-01-30 00:05:37.000', 46000.00, 0.00, 0.00, 46000.00, 'CASH', 'COMPLETED', NULL, '2025-12-04 03:54:14.580', '2025-12-04 03:54:14.580', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj5xx00a5vsucdcllh9ir', 'E39421013000000010', '2025-01-30 00:05:55.000', 92000.00, 0.00, 0.00, 92000.00, 'Pembelian Via Shopee', 'COMPLETED', NULL, '2025-12-04 03:54:14.613', '2025-12-04 03:54:14.613', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj5yh00a9vsuc68wmbexj', 'E39421013000000011', '2025-01-30 00:06:06.000', 46000.00, 0.00, 0.00, 46000.00, 'Pembelian Via Shopee', 'COMPLETED', NULL, '2025-12-04 03:54:14.633', '2025-12-04 03:54:14.633', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj5zg00afvsuc7hpwd2qr', 'E39421013000000012', '2025-01-30 00:06:22.000', 46000.00, 0.00, 0.00, 46000.00, 'Pembelian Via Shopee', 'COMPLETED', NULL, '2025-12-04 03:54:14.668', '2025-12-04 03:54:14.668', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj61i00atvsucx5um930u', 'E39421013000000013', '2025-01-30 00:06:33.000', 46000.00, 0.00, 0.00, 46000.00, 'Pembelian Via Shopee', 'COMPLETED', NULL, '2025-12-04 03:54:14.742', '2025-12-04 03:54:14.742', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj62e00azvsuc8sjzcrk0', 'E39421013000000014', '2025-01-30 00:06:47.000', 46000.00, 0.00, 0.00, 46000.00, 'Pembelian Via Shopee', 'COMPLETED', NULL, '2025-12-04 03:54:14.774', '2025-12-04 03:54:14.774', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj64300b9vsucjep030id', 'E39421013000000015', '2025-01-30 00:07:01.000', 125000.00, 0.00, 0.00, 125000.00, 'CASH', 'COMPLETED', NULL, '2025-12-04 03:54:14.835', '2025-12-04 03:54:14.835', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj64m00bdvsucsefx26os', 'E39421013000000016', '2025-01-30 00:07:11.000', 92000.00, 0.00, 0.00, 92000.00, 'CASH', 'COMPLETED', NULL, '2025-12-04 03:54:14.854', '2025-12-04 03:54:14.854', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj65v00blvsucrc1agmk8', 'E39421013000000017', '2025-01-30 00:07:24.000', 46000.00, 0.00, 0.00, 46000.00, 'Tokopedia', 'COMPLETED', NULL, '2025-12-04 03:54:14.899', '2025-12-04 03:54:14.899', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj67f00bvvsucmt5jmfwm', 'E39421013000000018', '2025-01-30 00:07:36.000', 28000.00, 0.00, 0.00, 28000.00, 'Pembelian Via Shopee', 'COMPLETED', NULL, '2025-12-04 03:54:14.955', '2025-12-04 03:54:14.955', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj67y00bzvsuc0qk8xs1b', 'E39421013000000019', '2025-01-30 00:07:52.000', 46000.00, 0.00, 0.00, 46000.00, 'Pembelian Via Shopee', 'COMPLETED', NULL, '2025-12-04 03:54:14.974', '2025-12-04 03:54:14.974', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj68h00c3vsuczjkmca8s', 'E39421013000000020', '2025-01-30 00:08:03.000', 46000.00, 0.00, 0.00, 46000.00, 'Pembelian Via Shopee', 'COMPLETED', NULL, '2025-12-04 03:54:14.993', '2025-12-04 03:54:14.993', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj69o00cbvsucigedvj9p', 'E39421013000000021', '2025-01-30 00:08:14.000', 46000.00, 0.00, 0.00, 46000.00, 'Pembelian Via Shopee', 'COMPLETED', NULL, '2025-12-04 03:54:15.036', '2025-12-04 03:54:15.036', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj6ak00chvsuc62o7ha5s', 'E39421013000000022', '2025-01-30 00:08:25.000', 80000.00, 0.00, 0.00, 80000.00, 'Pembelian Via Shopee', 'COMPLETED', NULL, '2025-12-04 03:54:15.068', '2025-12-04 03:54:15.068', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj6bf00cnvsucxa194rhc', 'E39421013000000023', '2025-01-30 00:08:35.000', 72000.00, 0.00, 0.00, 72000.00, 'Pembelian Via Shopee', 'COMPLETED', NULL, '2025-12-04 03:54:15.099', '2025-12-04 03:54:15.099', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj6cn00cvvsucu2bkokwi', 'E39421013000000024', '2025-01-30 00:08:45.000', 84000.00, 0.00, 0.00, 84000.00, 'Pembelian Via Shopee', 'COMPLETED', NULL, '2025-12-04 03:54:15.143', '2025-12-04 03:54:15.143', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj6d700czvsucywm17gvn', 'E39421013000000025', '2025-01-30 00:08:55.000', 92000.00, 0.00, 0.00, 92000.00, 'Pembelian Via Shopee', 'COMPLETED', NULL, '2025-12-04 03:54:15.163', '2025-12-04 03:54:15.163', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj6ef00d7vsucnux997zb', 'E39421013000000026', '2025-01-30 00:09:04.000', 92000.00, 0.00, 0.00, 92000.00, 'Pembelian Via Shopee', 'COMPLETED', NULL, '2025-12-04 03:54:15.207', '2025-12-04 03:54:15.207', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj6ex00dbvsucllpdxh45', 'E39421013000000027', '2025-01-30 00:10:13.000', 80000.00, 0.00, 0.00, 80000.00, 'Pembelian Via Shopee', 'COMPLETED', NULL, '2025-12-04 03:54:15.226', '2025-12-04 03:54:15.226', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj6fs00dhvsuca0us30yb', 'E39421013000000028', '2025-01-30 00:10:35.000', 92000.00, 0.00, 0.00, 92000.00, 'Pembelian Via Shopee', 'COMPLETED', NULL, '2025-12-04 03:54:15.257', '2025-12-04 03:54:15.257', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj6gz00dpvsucmp1jn6wr', 'E39421013000000029', '2025-01-30 00:11:06.000', 150000.00, 0.00, 0.00, 150000.00, 'CASH', 'COMPLETED', NULL, '2025-12-04 03:54:15.299', '2025-12-04 03:54:15.299', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj6ho00dvvsucyl6zqyat', 'E39421013000000030', '2025-01-30 00:11:32.000', 92000.00, 0.00, 0.00, 92000.00, 'Pembelian Via Shopee', 'COMPLETED', NULL, '2025-12-04 03:54:15.324', '2025-12-04 03:54:15.324', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj6jk00e7vsuchtavpne6', 'E39421013000000031', '2025-01-30 00:11:44.000', 20000.00, 0.00, 0.00, 20000.00, 'Pembelian Via Shopee', 'COMPLETED', NULL, '2025-12-04 03:54:15.392', '2025-12-04 03:54:15.392', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj6l400ehvsuc56sg0m7y', 'E39421013000000032', '2025-01-30 00:12:06.000', 56000.00, 0.00, 0.00, 56000.00, 'Pembelian Via Shopee', 'COMPLETED', NULL, '2025-12-04 03:54:15.449', '2025-12-04 03:54:15.449', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj6n600ervsuc1s253q85', 'E39421013000000033', '2025-01-30 00:12:26.000', 20000.00, 0.00, 0.00, 20000.00, 'Pembelian Via Shopee', 'COMPLETED', NULL, '2025-12-04 03:54:15.522', '2025-12-04 03:54:15.522', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj6ot00f1vsucw5ixu3uu', 'E39421013000000034', '2025-01-30 00:12:37.000', 28000.00, 0.00, 0.00, 28000.00, 'Pembelian Via Shopee', 'COMPLETED', NULL, '2025-12-04 03:54:15.581', '2025-12-04 03:54:15.581', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj6q300f9vsucnm85scqp', 'E39421013000000035', '2025-01-30 00:12:50.000', 46000.00, 0.00, 0.00, 46000.00, 'Pembelian Via Shopee', 'COMPLETED', NULL, '2025-12-04 03:54:15.627', '2025-12-04 03:54:15.627', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj6rd00fhvsucw2ass5z3', 'E39421013000000036', '2025-01-30 00:13:04.000', 46000.00, 0.00, 0.00, 46000.00, 'Pembelian Via Shopee', 'COMPLETED', NULL, '2025-12-04 03:54:15.673', '2025-12-04 03:54:15.673', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj6tp00fvvsuckwt52oht', '7EC621013100000002', '2025-01-31 01:21:09.000', 92000.00, 0.00, 0.00, 92000.00, 'Pembelian Via Shopee', 'COMPLETED', NULL, '2025-12-04 03:54:15.757', '2025-12-04 03:54:15.757', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR'),
('cmiqwj6u900fzvsucgma6lkbo', '7EC621013100000003', '2025-01-31 01:21:26.000', 28000.00, 0.00, 0.00, 28000.00, 'Pembelian Via Shopee', 'COMPLETED', NULL, '2025-12-04 03:54:15.778', '2025-12-04 03:54:15.778', 'cmimu52s4000rvsyortko8ctd', 'cmiqwj3y90009vsuczgwjllje', 'cmiqwinc30007vsuc08z0y2r7', NULL, 'IDR');

-- --------------------------------------------------------

--
-- Table structure for table `transaction_items`
--

CREATE TABLE `transaction_items` (
  `id` varchar(191) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unitPrice` decimal(10,2) NOT NULL,
  `totalPrice` decimal(12,2) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `transactionId` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `addOnPrice` decimal(10,2) DEFAULT 0.00,
  `discountPercent` decimal(5,2) DEFAULT 0.00,
  `discountAmount` decimal(10,2) DEFAULT 0.00,
  `totalCost` decimal(12,2) DEFAULT 0.00,
  `profit` decimal(12,2) DEFAULT 0.00,
  `paidToBrand` decimal(12,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transaction_items`
--

INSERT INTO `transaction_items` (`id`, `quantity`, `unitPrice`, `totalPrice`, `createdAt`, `transactionId`, `productId`, `addOnPrice`, `discountPercent`, `discountAmount`, `totalCost`, `profit`, `paidToBrand`) VALUES
('cmiqwj406000fvsuc4r1s3csl', 1, 28000.00, 28000.00, '2025-12-04 03:54:12.102', 'cmiqwj3z0000bvsucqw7fph23', 'cmiqwj3zs000dvsucvwzv88n8', 0.00, 0.00, 0.00, 19983.00, 8017.00, 28000.00),
('cmiqwj41b000jvsucbrn783fc', 1, 28000.00, 28000.00, '2025-12-04 03:54:12.143', 'cmiqwj3z0000bvsucqw7fph23', 'cmiqwj411000hvsuckbm0ruoz', 0.00, 0.00, 0.00, 20902.00, 7098.00, 28000.00),
('cmiqwj425000nvsucv81j599o', 1, 28000.00, 28000.00, '2025-12-04 03:54:12.173', 'cmiqwj3z0000bvsucqw7fph23', 'cmiqwj41z000lvsucr9cwhuo5', 0.00, 0.00, 0.00, 22201.00, 5799.00, 28000.00),
('cmiqwj42v000rvsucf8symx4o', 1, 28000.00, 28000.00, '2025-12-04 03:54:12.199', 'cmiqwj3z0000bvsucqw7fph23', 'cmiqwj42n000pvsucenybsyx8', 0.00, 0.00, 0.00, 23121.00, 4879.00, 28000.00),
('cmiqwj43j000vvsuck5jnclrj', 2, 28000.00, 56000.00, '2025-12-04 03:54:12.223', 'cmiqwj43a000tvsuch1bnxes7', 'cmiqwj42n000pvsucenybsyx8', 0.00, 0.00, 0.00, 46242.00, 9758.00, 56000.00),
('cmiqwj43z000xvsucy6ibd25o', 1, 28000.00, 28000.00, '2025-12-04 03:54:12.239', 'cmiqwj43a000tvsuch1bnxes7', 'cmiqwj411000hvsuckbm0ruoz', 0.00, 0.00, 0.00, 20902.00, 7098.00, 28000.00),
('cmiqwj44m0011vsucbjf86sut', 1, 28000.00, 28000.00, '2025-12-04 03:54:12.262', 'cmiqwj43a000tvsuch1bnxes7', 'cmiqwj44f000zvsucvy2ugrxw', 0.00, 0.00, 0.00, 20538.00, 7462.00, 28000.00),
('cmiqwj45b0015vsucp2hh0xa1', 1, 30000.00, 30000.00, '2025-12-04 03:54:12.287', 'cmiqwj43a000tvsuch1bnxes7', 'cmiqwj4550013vsuc339wmdos', 0.00, 0.00, 0.00, 0.00, 30000.00, 30000.00),
('cmiqwj4600019vsucz2a3gkmb', 1, 10000.00, 10000.00, '2025-12-04 03:54:12.312', 'cmiqwj43a000tvsuch1bnxes7', 'cmiqwj45t0017vsucx1wm4ce1', 0.00, 0.00, 0.00, 4558.00, 5442.00, 10000.00),
('cmiqwj46p001dvsuc195xtgk1', 1, 10000.00, 10000.00, '2025-12-04 03:54:12.337', 'cmiqwj43a000tvsuch1bnxes7', 'cmiqwj46j001bvsuc3rvixnbu', 0.00, 0.00, 0.00, 4595.00, 5405.00, 10000.00),
('cmiqwj47k001jvsuclcwuk9xs', 1, 80000.00, 80000.00, '2025-12-04 03:54:12.368', 'cmiqwj473001fvsuchrawmjus', 'cmiqwj47e001hvsuc3nz2ean3', 0.00, 0.00, 0.00, 64742.00, 15258.00, 80000.00),
('cmiqwj487001nvsuc3su2eryb', 1, 46000.00, 46000.00, '2025-12-04 03:54:12.391', 'cmiqwj473001fvsuchrawmjus', 'cmiqwj481001lvsucwf7avguz', 0.00, 0.00, 0.00, 35451.00, 10549.00, 46000.00),
('cmiqwj48s001pvsucphbwebgy', 1, 28000.00, 28000.00, '2025-12-04 03:54:12.413', 'cmiqwj473001fvsuchrawmjus', 'cmiqwj42n000pvsucenybsyx8', 0.00, 0.00, 0.00, 23121.00, 4879.00, 28000.00),
('cmiqwj49g001tvsucem59me0g', 1, 10000.00, 10000.00, '2025-12-04 03:54:12.437', 'cmiqwj498001rvsucpou6vwl6', 'cmiqwj45t0017vsucx1wm4ce1', 0.00, 0.00, 0.00, 4558.00, 5442.00, 10000.00),
('cmiqwj49x001vvsucdptu93qc', 1, 10000.00, 10000.00, '2025-12-04 03:54:12.453', 'cmiqwj498001rvsucpou6vwl6', 'cmiqwj46j001bvsuc3rvixnbu', 0.00, 0.00, 0.00, 4595.00, 5405.00, 10000.00),
('cmiqwj4ac001xvsuc50vhouo9', 1, 28000.00, 28000.00, '2025-12-04 03:54:12.468', 'cmiqwj498001rvsucpou6vwl6', 'cmiqwj41z000lvsucr9cwhuo5', 0.00, 0.00, 0.00, 22201.00, 5799.00, 28000.00),
('cmiqwj4au001zvsucq0qogqj6', 1, 28000.00, 28000.00, '2025-12-04 03:54:12.486', 'cmiqwj498001rvsucpou6vwl6', 'cmiqwj411000hvsuckbm0ruoz', 0.00, 0.00, 0.00, 20902.00, 7098.00, 28000.00),
('cmiqwj4ba0021vsuchjrm5nmh', 1, 30000.00, 30000.00, '2025-12-04 03:54:12.502', 'cmiqwj498001rvsucpou6vwl6', 'cmiqwj4550013vsuc339wmdos', 0.00, 0.00, 0.00, 0.00, 30000.00, 30000.00),
('cmiqwj4by0025vsuce9zoasnw', 1, 9750.00, 9750.00, '2025-12-04 03:54:12.527', 'cmiqwj498001rvsucpou6vwl6', 'cmiqwj4bt0023vsuc93s1h36g', 0.00, 0.00, 0.00, 9750.00, 0.00, 9750.00),
('cmiqwj4cr002bvsuct44bi1up', 1, 28000.00, 28000.00, '2025-12-04 03:54:12.556', 'cmiqwj4cc0027vsuch9qbie7y', 'cmiqwj4cm0029vsucx0tvin4p', 0.00, 0.00, 0.00, 21917.00, 6083.00, 28000.00),
('cmiqwj4d6002dvsuc82f2jae1', 1, 28000.00, 28000.00, '2025-12-04 03:54:12.571', 'cmiqwj4cc0027vsuch9qbie7y', 'cmiqwj411000hvsuckbm0ruoz', 0.00, 0.00, 0.00, 20902.00, 7098.00, 28000.00),
('cmiqwj4dl002fvsucnlug4hb4', 1, 28000.00, 28000.00, '2025-12-04 03:54:12.585', 'cmiqwj4cc0027vsuch9qbie7y', 'cmiqwj42n000pvsucenybsyx8', 0.00, 0.00, 0.00, 23121.00, 4879.00, 28000.00),
('cmiqwj4e7002jvsucrgks73tr', 1, 18000.00, 18000.00, '2025-12-04 03:54:12.607', 'cmiqwj4cc0027vsuch9qbie7y', 'cmiqwj4e1002hvsuckgywsp00', 0.00, 0.00, 0.00, 9500.00, 8500.00, 18000.00),
('cmiqwj4et002nvsucdyz68iw0', 1, 18000.00, 18000.00, '2025-12-04 03:54:12.629', 'cmiqwj4cc0027vsuch9qbie7y', 'cmiqwj4en002lvsuc6h6u6mue', 0.00, 0.00, 0.00, 7936.00, 10064.00, 18000.00),
('cmiqwj4ft002tvsucyxndry9l', 2, 46000.00, 92000.00, '2025-12-04 03:54:12.666', 'cmiqwj4fc002pvsucgeiuq1jv', 'cmiqwj4fm002rvsuclxxgbwcs', 0.00, 0.00, 0.00, 70420.00, 21580.00, 92000.00),
('cmiqwj4g8002vvsuc50q81hm1', 1, 10000.00, 10000.00, '2025-12-04 03:54:12.680', 'cmiqwj4fc002pvsucgeiuq1jv', 'cmiqwj45t0017vsucx1wm4ce1', 0.00, 0.00, 0.00, 4558.00, 5442.00, 10000.00),
('cmiqwj4gx002zvsuc24kvsj05', 1, 28000.00, 28000.00, '2025-12-04 03:54:12.705', 'cmiqwj4go002xvsuc7sbq2fsu', 'cmiqwj3zs000dvsucvwzv88n8', 0.00, 0.00, 0.00, 19983.00, 8017.00, 28000.00),
('cmiqwj4hl0033vsucmhvjlfav', 1, 46000.00, 46000.00, '2025-12-04 03:54:12.729', 'cmiqwj4go002xvsuc7sbq2fsu', 'cmiqwj4hf0031vsuc0hezwbjx', 0.00, 0.00, 0.00, 35414.00, 10586.00, 46000.00),
('cmiqwj4i80037vsucobxhppin', 4, 28000.00, 112000.00, '2025-12-04 03:54:12.752', 'cmiqwj4i00035vsucp8wctwan', 'cmiqwj41z000lvsucr9cwhuo5', 0.00, 0.00, 0.00, 88804.00, 23196.00, 112000.00),
('cmiqwj4im0039vsucjr033ied', 4, 28000.00, 112000.00, '2025-12-04 03:54:12.767', 'cmiqwj4i00035vsucp8wctwan', 'cmiqwj411000hvsuckbm0ruoz', 0.00, 0.00, 0.00, 83608.00, 28392.00, 112000.00),
('cmiqwj4j1003bvsucx37qsmr0', 10, 10000.00, 100000.00, '2025-12-04 03:54:12.782', 'cmiqwj4i00035vsucp8wctwan', 'cmiqwj45t0017vsucx1wm4ce1', 0.00, 0.00, 0.00, 45580.00, 54420.00, 100000.00),
('cmiqwj4jh003dvsucrb1c0c0y', 10, 10000.00, 100000.00, '2025-12-04 03:54:12.797', 'cmiqwj4i00035vsucp8wctwan', 'cmiqwj46j001bvsuc3rvixnbu', 0.00, 0.00, 0.00, 45950.00, 54050.00, 100000.00),
('cmiqwj4jw003fvsucztnp42if', 33, 28000.00, 924000.00, '2025-12-04 03:54:12.813', 'cmiqwj4i00035vsucp8wctwan', 'cmiqwj42n000pvsucenybsyx8', 0.00, 0.00, 0.00, 762993.00, 161007.00, 924000.00),
('cmiqwj4kq003lvsuchg1mwybm', 1, 125000.00, 125000.00, '2025-12-04 03:54:12.842', 'cmiqwj4ka003hvsucs5y7u2zv', 'cmiqwj4kk003jvsucd94z6uur', 0.00, 0.00, 0.00, 86762.00, 38238.00, 125000.00),
('cmiqwj4lf003pvsuc7iixl8ep', 2, 28000.00, 56000.00, '2025-12-04 03:54:12.867', 'cmiqwj4l6003nvsucalfobgbz', 'cmiqwj3zs000dvsucvwzv88n8', 0.00, 0.00, 0.00, 39966.00, 16034.00, 56000.00),
('cmiqwj4mb003tvsuccoz9gvlj', 2, 46000.00, 92000.00, '2025-12-04 03:54:12.899', 'cmiqwj4l6003nvsucalfobgbz', 'cmiqwj4m0003rvsucmpw16el0', 0.00, 0.00, 0.00, 69566.00, 22434.00, 92000.00),
('cmiqwj4n7003xvsucnwkinzco', 6, 46000.00, 276000.00, '2025-12-04 03:54:12.931', 'cmiqwj4l6003nvsucalfobgbz', 'cmiqwj4mw003vvsuc49l8pqax', 0.00, 0.00, 0.00, 202584.00, 73416.00, 276000.00),
('cmiqwj4nz0041vsucdnwd91a6', 1, 28000.00, 28000.00, '2025-12-04 03:54:12.959', 'cmiqwj4l6003nvsucalfobgbz', 'cmiqwj4no003zvsucg7uuiyaj', 0.00, 0.00, 0.00, 21953.00, 6047.00, 28000.00),
('cmiqwj4ok0043vsucljl6dktj', 3, 46000.00, 138000.00, '2025-12-04 03:54:12.981', 'cmiqwj4l6003nvsucalfobgbz', 'cmiqwj481001lvsucwf7avguz', 0.00, 0.00, 0.00, 106353.00, 31647.00, 138000.00),
('cmiqwj4pg0047vsucpg88705f', 1, 80000.00, 80000.00, '2025-12-04 03:54:13.012', 'cmiqwj4p40045vsuc1nd2vzuv', 'cmiqwj47e001hvsuc3nz2ean3', 0.00, 0.00, 0.00, 64742.00, 15258.00, 80000.00),
('cmiqwj4q00049vsuctm1rm4ek', 5, 10000.00, 50000.00, '2025-12-04 03:54:13.032', 'cmiqwj4p40045vsuc1nd2vzuv', 'cmiqwj45t0017vsucx1wm4ce1', 0.00, 0.00, 0.00, 22790.00, 27210.00, 50000.00),
('cmiqwj4qk004bvsucu5ec4yq6', 5, 10000.00, 50000.00, '2025-12-04 03:54:13.052', 'cmiqwj4p40045vsuc1nd2vzuv', 'cmiqwj46j001bvsuc3rvixnbu', 0.00, 0.00, 0.00, 22975.00, 27025.00, 50000.00),
('cmiqwj4ri004fvsucbb8uo2u8', 2, 50000.00, 100000.00, '2025-12-04 03:54:13.086', 'cmiqwj4p40045vsuc1nd2vzuv', 'cmiqwj4r5004dvsuc6yo4qpaz', 0.00, 0.00, 0.00, 0.00, 100000.00, 100000.00),
('cmiqwj4sf004jvsucnsayobuu', 2, 28000.00, 56000.00, '2025-12-04 03:54:13.119', 'cmiqwj4s1004hvsucdjxjfoi1', 'cmiqwj4cm0029vsucx0tvin4p', 0.00, 0.00, 0.00, 43834.00, 12166.00, 56000.00),
('cmiqwj4sz004lvsucdyvydig6', 1, 28000.00, 28000.00, '2025-12-04 03:54:13.139', 'cmiqwj4s1004hvsucdjxjfoi1', 'cmiqwj41z000lvsucr9cwhuo5', 0.00, 0.00, 0.00, 22201.00, 5799.00, 28000.00),
('cmiqwj4ti004nvsuc7f4qfqkx', 1, 28000.00, 28000.00, '2025-12-04 03:54:13.158', 'cmiqwj4s1004hvsucdjxjfoi1', 'cmiqwj3zs000dvsucvwzv88n8', 0.00, 0.00, 0.00, 19983.00, 8017.00, 28000.00),
('cmiqwj4u3004pvsuc1r5ze2re', 1, 28000.00, 28000.00, '2025-12-04 03:54:13.179', 'cmiqwj4s1004hvsucdjxjfoi1', 'cmiqwj42n000pvsucenybsyx8', 0.00, 0.00, 0.00, 23121.00, 4879.00, 28000.00),
('cmiqwj4uy004tvsuczqpjhwrp', 1, 28000.00, 28000.00, '2025-12-04 03:54:13.211', 'cmiqwj4um004rvsucoz6lfhso', 'cmiqwj42n000pvsucenybsyx8', 0.00, 0.00, 0.00, 23121.00, 4879.00, 28000.00),
('cmiqwj4vj004vvsuc9oeqou5z', 2, 28000.00, 56000.00, '2025-12-04 03:54:13.231', 'cmiqwj4um004rvsucoz6lfhso', 'cmiqwj4cm0029vsucx0tvin4p', 0.00, 0.00, 0.00, 43834.00, 12166.00, 56000.00),
('cmiqwj4w4004xvsuckicpjkhb', 1, 28000.00, 28000.00, '2025-12-04 03:54:13.253', 'cmiqwj4um004rvsucoz6lfhso', 'cmiqwj41z000lvsucr9cwhuo5', 0.00, 0.00, 0.00, 22201.00, 5799.00, 28000.00),
('cmiqwj4wo004zvsucyejynten', 1, 28000.00, 28000.00, '2025-12-04 03:54:13.272', 'cmiqwj4um004rvsucoz6lfhso', 'cmiqwj3zs000dvsucvwzv88n8', 0.00, 0.00, 0.00, 19983.00, 8017.00, 28000.00),
('cmiqwj4xj0053vsucmc8bl2bu', 2, 50000.00, 100000.00, '2025-12-04 03:54:13.304', 'cmiqwj4x60051vsuce5nmvao5', 'cmiqwj4r5004dvsuc6yo4qpaz', 0.00, 0.00, 0.00, 0.00, 100000.00, 100000.00),
('cmiqwj4y30055vsuccdo75gdz', 1, 10000.00, 10000.00, '2025-12-04 03:54:13.323', 'cmiqwj4x60051vsuce5nmvao5', 'cmiqwj45t0017vsucx1wm4ce1', 0.00, 0.00, 0.00, 4558.00, 5442.00, 10000.00),
('cmiqwj4yi0057vsuc31hxccta', 1, 10000.00, 10000.00, '2025-12-04 03:54:13.338', 'cmiqwj4x60051vsuce5nmvao5', 'cmiqwj46j001bvsuc3rvixnbu', 0.00, 0.00, 0.00, 4595.00, 5405.00, 10000.00),
('cmiqwj4zf005bvsucnw47tyvz', 1, 28000.00, 28000.00, '2025-12-04 03:54:13.371', 'cmiqwj4z10059vsuc7y0hg7st', 'cmiqwj4no003zvsucg7uuiyaj', 0.00, 0.00, 0.00, 21953.00, 6047.00, 28000.00),
('cmiqwj4zz005dvsucx1myh89q', 1, 28000.00, 28000.00, '2025-12-04 03:54:13.392', 'cmiqwj4z10059vsuc7y0hg7st', 'cmiqwj3zs000dvsucvwzv88n8', 0.00, 0.00, 0.00, 19983.00, 8017.00, 28000.00),
('cmiqwj50u005hvsucps16z7sz', 1, 28000.00, 28000.00, '2025-12-04 03:54:13.423', 'cmiqwj50j005fvsucud7b4zt8', 'cmiqwj42n000pvsucenybsyx8', 0.00, 0.00, 0.00, 23121.00, 4879.00, 28000.00),
('cmiqwj51d005jvsucchlrvffg', 1, 28000.00, 28000.00, '2025-12-04 03:54:13.442', 'cmiqwj50j005fvsucud7b4zt8', 'cmiqwj411000hvsuckbm0ruoz', 0.00, 0.00, 0.00, 20902.00, 7098.00, 28000.00),
('cmiqwj524005lvsucldly4wz7', 1, 18000.00, 18000.00, '2025-12-04 03:54:13.468', 'cmiqwj50j005fvsucud7b4zt8', 'cmiqwj4e1002hvsuckgywsp00', 0.00, 0.00, 0.00, 9500.00, 8500.00, 18000.00),
('cmiqwj533005nvsucgveyqsgs', 1, 18000.00, 18000.00, '2025-12-04 03:54:13.503', 'cmiqwj50j005fvsucud7b4zt8', 'cmiqwj4en002lvsuc6h6u6mue', 0.00, 0.00, 0.00, 7936.00, 10064.00, 18000.00),
('cmiqwj544005rvsuc40wpoik2', 1, 28000.00, 28000.00, '2025-12-04 03:54:13.540', 'cmiqwj53q005pvsuc15uo149l', 'cmiqwj4cm0029vsucx0tvin4p', 0.00, 0.00, 0.00, 21917.00, 6083.00, 28000.00),
('cmiqwj54q005tvsucdao5kk7n', 1, 10000.00, 10000.00, '2025-12-04 03:54:13.562', 'cmiqwj53q005pvsuc15uo149l', 'cmiqwj45t0017vsucx1wm4ce1', 0.00, 0.00, 0.00, 4558.00, 5442.00, 10000.00),
('cmiqwj55d005vvsuc2770b5av', 1, 10000.00, 10000.00, '2025-12-04 03:54:13.585', 'cmiqwj53q005pvsuc15uo149l', 'cmiqwj46j001bvsuc3rvixnbu', 0.00, 0.00, 0.00, 4595.00, 5405.00, 10000.00),
('cmiqwj55v005xvsuc2b06vvlo', 1, 18000.00, 18000.00, '2025-12-04 03:54:13.603', 'cmiqwj53q005pvsuc15uo149l', 'cmiqwj4en002lvsuc6h6u6mue', 0.00, 0.00, 0.00, 7936.00, 10064.00, 18000.00),
('cmiqwj56f0061vsucpbgq79jw', 3, 28000.00, 84000.00, '2025-12-04 03:54:13.623', 'cmiqwj568005zvsucj2um4t35', 'cmiqwj411000hvsuckbm0ruoz', 0.00, 0.00, 0.00, 62706.00, 21294.00, 84000.00),
('cmiqwj56t0063vsucrxorw8o0', 3, 28000.00, 84000.00, '2025-12-04 03:54:13.637', 'cmiqwj568005zvsucj2um4t35', 'cmiqwj3zs000dvsucvwzv88n8', 0.00, 0.00, 0.00, 59949.00, 24051.00, 84000.00),
('cmiqwj5770065vsucu5obc73o', 5, 28000.00, 140000.00, '2025-12-04 03:54:13.651', 'cmiqwj568005zvsucj2um4t35', 'cmiqwj42n000pvsucenybsyx8', 0.00, 0.00, 0.00, 115605.00, 24395.00, 140000.00),
('cmiqwj57k0067vsucxwk4jurj', 4, 28000.00, 112000.00, '2025-12-04 03:54:13.665', 'cmiqwj568005zvsucj2um4t35', 'cmiqwj41z000lvsucr9cwhuo5', 0.00, 0.00, 0.00, 88804.00, 23196.00, 112000.00),
('cmiqwj5840069vsuce8yhe603', 5, 10000.00, 50000.00, '2025-12-04 03:54:13.684', 'cmiqwj568005zvsucj2um4t35', 'cmiqwj45t0017vsucx1wm4ce1', 0.00, 0.00, 0.00, 22790.00, 27210.00, 50000.00),
('cmiqwj58j006bvsucd0wv2t8s', 5, 10000.00, 50000.00, '2025-12-04 03:54:13.699', 'cmiqwj568005zvsucj2um4t35', 'cmiqwj46j001bvsuc3rvixnbu', 0.00, 0.00, 0.00, 22975.00, 27025.00, 50000.00),
('cmiqwj593006dvsuc8ou7l60g', 5, 30000.00, 150000.00, '2025-12-04 03:54:13.720', 'cmiqwj568005zvsucj2um4t35', 'cmiqwj4550013vsuc339wmdos', 0.00, 0.00, 0.00, 0.00, 150000.00, 150000.00),
('cmiqwj59h006fvsuclrxicpio', 5, 9750.00, 48750.00, '2025-12-04 03:54:13.733', 'cmiqwj568005zvsucj2um4t35', 'cmiqwj4bt0023vsuc93s1h36g', 0.00, 0.00, 0.00, 48750.00, 0.00, 48750.00),
('cmiqwj59x006hvsucfbra1u9k', 5, 18000.00, 90000.00, '2025-12-04 03:54:13.749', 'cmiqwj568005zvsucj2um4t35', 'cmiqwj4en002lvsuc6h6u6mue', 0.00, 0.00, 0.00, 39680.00, 50320.00, 90000.00),
('cmiqwj5ac006jvsucgo3rleqh', 5, 18000.00, 90000.00, '2025-12-04 03:54:13.764', 'cmiqwj568005zvsucj2um4t35', 'cmiqwj4e1002hvsuckgywsp00', 0.00, 0.00, 0.00, 47500.00, 42500.00, 90000.00),
('cmiqwj5ay006nvsucurvaxjrj', 1, 80000.00, 80000.00, '2025-12-04 03:54:13.786', 'cmiqwj5aq006lvsuckd5lswqi', 'cmiqwj47e001hvsuc3nz2ean3', 0.00, 0.00, 0.00, 64742.00, 15258.00, 80000.00),
('cmiqwj5bj006rvsuc75n3dgms', 1, 18000.00, 18000.00, '2025-12-04 03:54:13.807', 'cmiqwj5aq006lvsuckd5lswqi', 'cmiqwj5bd006pvsuc4vrthbnl', 0.00, 0.00, 0.00, 9061.00, 8939.00, 18000.00),
('cmiqwj5c5006vvsuc2608goh9', 2, 50000.00, 100000.00, '2025-12-04 03:54:13.829', 'cmiqwj5bx006tvsucqudvtw39', 'cmiqwj4r5004dvsuc6yo4qpaz', 0.00, 0.00, 0.00, 0.00, 100000.00, 100000.00),
('cmiqwj5ck006xvsuc3svsnvc0', 1, 10000.00, 10000.00, '2025-12-04 03:54:13.844', 'cmiqwj5bx006tvsucqudvtw39', 'cmiqwj45t0017vsucx1wm4ce1', 0.00, 0.00, 0.00, 4558.00, 5442.00, 10000.00),
('cmiqwj5d1006zvsucwlzxm06y', 1, 10000.00, 10000.00, '2025-12-04 03:54:13.862', 'cmiqwj5bx006tvsucqudvtw39', 'cmiqwj46j001bvsuc3rvixnbu', 0.00, 0.00, 0.00, 4595.00, 5405.00, 10000.00),
('cmiqwj5dn0073vsucnz44g73z', 1, 28000.00, 28000.00, '2025-12-04 03:54:13.883', 'cmiqwj5de0071vsucyw88nksc', 'cmiqwj4no003zvsucg7uuiyaj', 0.00, 0.00, 0.00, 21953.00, 6047.00, 28000.00),
('cmiqwj5e20075vsucg69vx0mx', 1, 28000.00, 28000.00, '2025-12-04 03:54:13.898', 'cmiqwj5de0071vsucyw88nksc', 'cmiqwj3zs000dvsucvwzv88n8', 0.00, 0.00, 0.00, 19983.00, 8017.00, 28000.00),
('cmiqwj5en0079vsucj1ashzgi', 1, 28000.00, 28000.00, '2025-12-04 03:54:13.919', 'cmiqwj5eg0077vsucb23gn7rl', 'cmiqwj42n000pvsucenybsyx8', 0.00, 0.00, 0.00, 23121.00, 4879.00, 28000.00),
('cmiqwj5f1007bvsucwauvwttx', 1, 28000.00, 28000.00, '2025-12-04 03:54:13.933', 'cmiqwj5eg0077vsucb23gn7rl', 'cmiqwj411000hvsuckbm0ruoz', 0.00, 0.00, 0.00, 20902.00, 7098.00, 28000.00),
('cmiqwj5fg007dvsucyc766tdj', 1, 18000.00, 18000.00, '2025-12-04 03:54:13.949', 'cmiqwj5eg0077vsucb23gn7rl', 'cmiqwj4e1002hvsuckgywsp00', 0.00, 0.00, 0.00, 9500.00, 8500.00, 18000.00),
('cmiqwj5fv007fvsucs4mxs88n', 1, 18000.00, 18000.00, '2025-12-04 03:54:13.964', 'cmiqwj5eg0077vsucb23gn7rl', 'cmiqwj4en002lvsuc6h6u6mue', 0.00, 0.00, 0.00, 7936.00, 10064.00, 18000.00),
('cmiqwj5gh007jvsuc9n0nybix', 1, 28000.00, 28000.00, '2025-12-04 03:54:13.986', 'cmiqwj5ga007hvsuchfvthn3q', 'cmiqwj41z000lvsucr9cwhuo5', 0.00, 0.00, 0.00, 22201.00, 5799.00, 28000.00),
('cmiqwj5gw007lvsuczp142ud9', 1, 10000.00, 10000.00, '2025-12-04 03:54:14.000', 'cmiqwj5ga007hvsuchfvthn3q', 'cmiqwj45t0017vsucx1wm4ce1', 0.00, 0.00, 0.00, 4558.00, 5442.00, 10000.00),
('cmiqwj5hb007nvsuczbugjkdb', 1, 10000.00, 10000.00, '2025-12-04 03:54:14.015', 'cmiqwj5ga007hvsuchfvthn3q', 'cmiqwj46j001bvsuc3rvixnbu', 0.00, 0.00, 0.00, 4595.00, 5405.00, 10000.00),
('cmiqwj5ho007pvsuc91cmerrc', 1, 30000.00, 30000.00, '2025-12-04 03:54:14.028', 'cmiqwj5ga007hvsuchfvthn3q', 'cmiqwj4550013vsuc339wmdos', 0.00, 0.00, 0.00, 0.00, 30000.00, 30000.00),
('cmiqwj5i1007rvsuctqeuz2wi', 1, 9750.00, 9750.00, '2025-12-04 03:54:14.042', 'cmiqwj5ga007hvsuchfvthn3q', 'cmiqwj4bt0023vsuc93s1h36g', 0.00, 0.00, 0.00, 9750.00, 0.00, 9750.00),
('cmiqwj5id007tvsucsi9o9jz4', 1, 46000.00, 46000.00, '2025-12-04 03:54:14.054', 'cmiqwj5ga007hvsuchfvthn3q', 'cmiqwj4m0003rvsucmpw16el0', 0.00, 0.00, 0.00, 34783.00, 11217.00, 46000.00),
('cmiqwj5iq007vvsucqwbe6sxz', 1, 46000.00, 46000.00, '2025-12-04 03:54:14.067', 'cmiqwj5ga007hvsuchfvthn3q', 'cmiqwj4mw003vvsuc49l8pqax', 0.00, 0.00, 0.00, 33764.00, 12236.00, 46000.00),
('cmiqwj5jc007zvsuc8w35ihzw', 1, 10000.00, 10000.00, '2025-12-04 03:54:14.089', 'cmiqwj5j5007xvsuccgm0r36v', 'cmiqwj45t0017vsucx1wm4ce1', 0.00, 0.00, 0.00, 4558.00, 5442.00, 10000.00),
('cmiqwj5jp0081vsuc2j6tztnr', 1, 10000.00, 10000.00, '2025-12-04 03:54:14.102', 'cmiqwj5j5007xvsuccgm0r36v', 'cmiqwj46j001bvsuc3rvixnbu', 0.00, 0.00, 0.00, 4595.00, 5405.00, 10000.00),
('cmiqwj5k40083vsuc729sw2ff', 1, 28000.00, 28000.00, '2025-12-04 03:54:14.116', 'cmiqwj5j5007xvsuccgm0r36v', 'cmiqwj4cm0029vsucx0tvin4p', 0.00, 0.00, 0.00, 21917.00, 6083.00, 28000.00),
('cmiqwj5ki0085vsuc9rtpjebg', 1, 28000.00, 28000.00, '2025-12-04 03:54:14.130', 'cmiqwj5j5007xvsuccgm0r36v', 'cmiqwj411000hvsuckbm0ruoz', 0.00, 0.00, 0.00, 20902.00, 7098.00, 28000.00),
('cmiqwj5kx0087vsuc9y31e152', 1, 18000.00, 18000.00, '2025-12-04 03:54:14.145', 'cmiqwj5j5007xvsuccgm0r36v', 'cmiqwj4e1002hvsuckgywsp00', 0.00, 0.00, 0.00, 9500.00, 8500.00, 18000.00),
('cmiqwj5lb0089vsuc7ikr1m1n', 1, 18000.00, 18000.00, '2025-12-04 03:54:14.159', 'cmiqwj5j5007xvsuccgm0r36v', 'cmiqwj4en002lvsuc6h6u6mue', 0.00, 0.00, 0.00, 7936.00, 10064.00, 18000.00),
('cmiqwj5lw008dvsuch8bq5m6e', 4, 28000.00, 112000.00, '2025-12-04 03:54:14.181', 'cmiqwj5lo008bvsucw1iqohu4', 'cmiqwj4cm0029vsucx0tvin4p', 0.00, 0.00, 0.00, 87668.00, 24332.00, 112000.00),
('cmiqwj5mb008fvsuc9y1marhx', 4, 28000.00, 112000.00, '2025-12-04 03:54:14.195', 'cmiqwj5lo008bvsucw1iqohu4', 'cmiqwj4no003zvsucg7uuiyaj', 0.00, 0.00, 0.00, 87812.00, 24188.00, 112000.00),
('cmiqwj5mp008hvsucseqwnru5', 4, 28000.00, 112000.00, '2025-12-04 03:54:14.209', 'cmiqwj5lo008bvsucw1iqohu4', 'cmiqwj3zs000dvsucvwzv88n8', 0.00, 0.00, 0.00, 79932.00, 32068.00, 112000.00),
('cmiqwj5n5008jvsuctly8ufap', 4, 28000.00, 112000.00, '2025-12-04 03:54:14.225', 'cmiqwj5lo008bvsucw1iqohu4', 'cmiqwj411000hvsuckbm0ruoz', 0.00, 0.00, 0.00, 83608.00, 28392.00, 112000.00),
('cmiqwj5no008lvsucrkneh5n6', 10, 10000.00, 100000.00, '2025-12-04 03:54:14.244', 'cmiqwj5lo008bvsucw1iqohu4', 'cmiqwj45t0017vsucx1wm4ce1', 0.00, 0.00, 0.00, 45580.00, 54420.00, 100000.00),
('cmiqwj5o3008nvsuc1xl25987', 10, 10000.00, 100000.00, '2025-12-04 03:54:14.259', 'cmiqwj5lo008bvsucw1iqohu4', 'cmiqwj46j001bvsuc3rvixnbu', 0.00, 0.00, 0.00, 45950.00, 54050.00, 100000.00),
('cmiqwj5oh008pvsuctkq16neo', 3, 80000.00, 240000.00, '2025-12-04 03:54:14.273', 'cmiqwj5lo008bvsucw1iqohu4', 'cmiqwj47e001hvsuc3nz2ean3', 0.00, 0.00, 0.00, 194226.00, 45774.00, 240000.00),
('cmiqwj5p2008tvsucaibu8tcw', 3, 80000.00, 240000.00, '2025-12-04 03:54:14.294', 'cmiqwj5lo008bvsucw1iqohu4', 'cmiqwj5ow008rvsuc070h1ocp', 0.00, 0.00, 0.00, 132921.00, 107079.00, 240000.00),
('cmiqwj5pn008xvsucui0ddxfj', 2, 10000.00, 20000.00, '2025-12-04 03:54:14.315', 'cmiqwj5pf008vvsucrmnr1uyx', 'cmiqwj45t0017vsucx1wm4ce1', 0.00, 0.00, 0.00, 9116.00, 10884.00, 20000.00),
('cmiqwj5q2008zvsucuajb8qcz', 1, 10000.00, 10000.00, '2025-12-04 03:54:14.330', 'cmiqwj5pf008vvsucrmnr1uyx', 'cmiqwj46j001bvsuc3rvixnbu', 0.00, 0.00, 0.00, 4595.00, 5405.00, 10000.00),
('cmiqwj5qg0091vsucnjfe0atm', 1, 30000.00, 30000.00, '2025-12-04 03:54:14.345', 'cmiqwj5pf008vvsucrmnr1uyx', 'cmiqwj4550013vsuc339wmdos', 0.00, 0.00, 0.00, 0.00, 30000.00, 30000.00),
('cmiqwj5qt0093vsucme09vu4h', 2, 28000.00, 56000.00, '2025-12-04 03:54:14.357', 'cmiqwj5pf008vvsucrmnr1uyx', 'cmiqwj4cm0029vsucx0tvin4p', 0.00, 0.00, 0.00, 43834.00, 12166.00, 56000.00),
('cmiqwj5r80095vsucpcob1u7k', 1, 9750.00, 9750.00, '2025-12-04 03:54:14.372', 'cmiqwj5pf008vvsucrmnr1uyx', 'cmiqwj4bt0023vsuc93s1h36g', 0.00, 0.00, 0.00, 9750.00, 0.00, 9750.00),
('cmiqwj5ru0099vsuciqbmvtav', 1, 46000.00, 46000.00, '2025-12-04 03:54:14.394', 'cmiqwj5rm0097vsucpyatsg4h', 'cmiqwj4m0003rvsucmpw16el0', 0.00, 0.00, 0.00, 34783.00, 11217.00, 46000.00),
('cmiqwj5s6009bvsucfchd5ryy', 1, 28000.00, 28000.00, '2025-12-04 03:54:14.406', 'cmiqwj5rm0097vsucpyatsg4h', 'cmiqwj42n000pvsucenybsyx8', 0.00, 0.00, 0.00, 23121.00, 4879.00, 28000.00),
('cmiqwj5sj009dvsucwnmn2it0', 1, 10000.00, 10000.00, '2025-12-04 03:54:14.419', 'cmiqwj5rm0097vsucpyatsg4h', 'cmiqwj45t0017vsucx1wm4ce1', 0.00, 0.00, 0.00, 4558.00, 5442.00, 10000.00),
('cmiqwj5sw009fvsucdh9pjpk7', 1, 10000.00, 10000.00, '2025-12-04 03:54:14.433', 'cmiqwj5rm0097vsucpyatsg4h', 'cmiqwj46j001bvsuc3rvixnbu', 0.00, 0.00, 0.00, 4595.00, 5405.00, 10000.00),
('cmiqwj5th009jvsucu8nvxsw5', 1, 28000.00, 28000.00, '2025-12-04 03:54:14.453', 'cmiqwj5ta009hvsuciyqlxnvs', 'cmiqwj3zs000dvsucvwzv88n8', 0.00, 0.00, 0.00, 19983.00, 8017.00, 28000.00),
('cmiqwj5u1009lvsucbqpgz5yl', 1, 28000.00, 28000.00, '2025-12-04 03:54:14.473', 'cmiqwj5ta009hvsuciyqlxnvs', 'cmiqwj44f000zvsucvy2ugrxw', 0.00, 0.00, 0.00, 20538.00, 7462.00, 28000.00),
('cmiqwj5v3009pvsucm0jhzxy3', 2, 46000.00, 92000.00, '2025-12-04 03:54:14.511', 'cmiqwj5uo009nvsuca77326xv', 'cmiqwj481001lvsucwf7avguz', 0.00, 0.00, 0.00, 70902.00, 21098.00, 92000.00),
('cmiqwj5vg009rvsucoftlqctx', 5, 10000.00, 50000.00, '2025-12-04 03:54:14.524', 'cmiqwj5uo009nvsuca77326xv', 'cmiqwj46j001bvsuc3rvixnbu', 0.00, 0.00, 0.00, 22975.00, 27025.00, 50000.00),
('cmiqwj5vt009tvsucjp3f8xsi', 5, 10000.00, 50000.00, '2025-12-04 03:54:14.537', 'cmiqwj5uo009nvsuca77326xv', 'cmiqwj45t0017vsucx1wm4ce1', 0.00, 0.00, 0.00, 22790.00, 27210.00, 50000.00),
('cmiqwj5w6009vvsucgutftl2k', 1, 125000.00, 125000.00, '2025-12-04 03:54:14.551', 'cmiqwj5uo009nvsuca77326xv', 'cmiqwj4kk003jvsucd94z6uur', 0.00, 0.00, 0.00, 86762.00, 38238.00, 125000.00),
('cmiqwj5wm009xvsucxskvn5em', 2, 46000.00, 92000.00, '2025-12-04 03:54:14.566', 'cmiqwj5uo009nvsuca77326xv', 'cmiqwj4fm002rvsuclxxgbwcs', 0.00, 0.00, 0.00, 70420.00, 21580.00, 92000.00),
('cmiqwj5x700a1vsuc1t7ociam', 1, 46000.00, 46000.00, '2025-12-04 03:54:14.587', 'cmiqwj5wz009zvsucbwjujjk6', 'cmiqwj481001lvsucwf7avguz', 0.00, 0.00, 0.00, 35451.00, 10549.00, 46000.00),
('cmiqwj5xj00a3vsuc1ysjq3g1', 1, 28000.00, 28000.00, '2025-12-04 03:54:14.600', 'cmiqwj5wz009zvsucbwjujjk6', 'cmiqwj4no003zvsucg7uuiyaj', 0.00, 0.00, 0.00, 21953.00, 6047.00, 28000.00),
('cmiqwj5y400a7vsuc7s477n72', 2, 46000.00, 92000.00, '2025-12-04 03:54:14.620', 'cmiqwj5xx00a5vsucdcllh9ir', 'cmiqwj4fm002rvsuclxxgbwcs', 0.00, 0.00, 0.00, 70420.00, 21580.00, 92000.00),
('cmiqwj5yp00abvsuctaph4kr6', 1, 46000.00, 46000.00, '2025-12-04 03:54:14.641', 'cmiqwj5yh00a9vsuc68wmbexj', 'cmiqwj4mw003vvsuc49l8pqax', 0.00, 0.00, 0.00, 33764.00, 12236.00, 46000.00),
('cmiqwj5z100advsucxbxanh04', 1, 46000.00, 46000.00, '2025-12-04 03:54:14.653', 'cmiqwj5yh00a9vsuc68wmbexj', 'cmiqwj4fm002rvsuclxxgbwcs', 0.00, 0.00, 0.00, 35210.00, 10790.00, 46000.00),
('cmiqwj5zo00ahvsuc8alcwh5u', 1, 46000.00, 46000.00, '2025-12-04 03:54:14.676', 'cmiqwj5zg00afvsuc7hpwd2qr', 'cmiqwj4fm002rvsuclxxgbwcs', 0.00, 0.00, 0.00, 35210.00, 10790.00, 46000.00),
('cmiqwj60900alvsucot8kaeni', 1, 75000.00, 75000.00, '2025-12-04 03:54:14.697', 'cmiqwj5zg00afvsuc7hpwd2qr', 'cmiqwj60100ajvsuc9xuhbais', 0.00, 0.00, 0.00, 49791.00, 25209.00, 75000.00),
('cmiqwj60t00apvsucmtg8ru8z', 1, 46000.00, 46000.00, '2025-12-04 03:54:14.717', 'cmiqwj5zg00afvsuc7hpwd2qr', 'cmiqwj60o00anvsuc6ij8tshs', 0.00, 0.00, 0.00, 36662.00, 9338.00, 46000.00),
('cmiqwj61600arvsucvu9tfjb0', 1, 80000.00, 80000.00, '2025-12-04 03:54:14.730', 'cmiqwj5zg00afvsuc7hpwd2qr', 'cmiqwj47e001hvsuc3nz2ean3', 0.00, 0.00, 0.00, 64742.00, 15258.00, 80000.00),
('cmiqwj61p00avvsuc8avljftx', 1, 46000.00, 46000.00, '2025-12-04 03:54:14.750', 'cmiqwj61i00atvsucx5um930u', 'cmiqwj4fm002rvsuclxxgbwcs', 0.00, 0.00, 0.00, 35210.00, 10790.00, 46000.00),
('cmiqwj62200axvsuc4u4mfwau', 1, 46000.00, 46000.00, '2025-12-04 03:54:14.763', 'cmiqwj61i00atvsucx5um930u', 'cmiqwj4hf0031vsuc0hezwbjx', 0.00, 0.00, 0.00, 35414.00, 10586.00, 46000.00),
('cmiqwj62m00b1vsucli9f1bo2', 1, 46000.00, 46000.00, '2025-12-04 03:54:14.782', 'cmiqwj62e00azvsuc8sjzcrk0', 'cmiqwj4fm002rvsuclxxgbwcs', 0.00, 0.00, 0.00, 35210.00, 10790.00, 46000.00),
('cmiqwj62y00b3vsuc4v9h3xfu', 1, 10000.00, 10000.00, '2025-12-04 03:54:14.794', 'cmiqwj62e00azvsuc8sjzcrk0', 'cmiqwj45t0017vsucx1wm4ce1', 0.00, 0.00, 0.00, 4558.00, 5442.00, 10000.00),
('cmiqwj63a00b5vsucg5q2f9v4', 1, 18000.00, 18000.00, '2025-12-04 03:54:14.807', 'cmiqwj62e00azvsuc8sjzcrk0', 'cmiqwj5bd006pvsuc4vrthbnl', 0.00, 0.00, 0.00, 9061.00, 8939.00, 18000.00),
('cmiqwj63n00b7vsucyoksh9dl', 1, 18000.00, 18000.00, '2025-12-04 03:54:14.819', 'cmiqwj62e00azvsuc8sjzcrk0', 'cmiqwj4e1002hvsuckgywsp00', 0.00, 0.00, 0.00, 9500.00, 8500.00, 18000.00),
('cmiqwj64a00bbvsucgclupsh3', 1, 125000.00, 125000.00, '2025-12-04 03:54:14.842', 'cmiqwj64300b9vsucjep030id', 'cmiqwj4kk003jvsucd94z6uur', 0.00, 0.00, 0.00, 86762.00, 38238.00, 125000.00),
('cmiqwj64u00bfvsucrlz5zuvk', 2, 46000.00, 92000.00, '2025-12-04 03:54:14.862', 'cmiqwj64m00bdvsucsefx26os', 'cmiqwj481001lvsucwf7avguz', 0.00, 0.00, 0.00, 70902.00, 21098.00, 92000.00),
('cmiqwj65600bhvsucvn82p8ua', 1, 125000.00, 125000.00, '2025-12-04 03:54:14.874', 'cmiqwj64m00bdvsucsefx26os', 'cmiqwj4kk003jvsucd94z6uur', 0.00, 0.00, 0.00, 86762.00, 38238.00, 125000.00),
('cmiqwj65j00bjvsucjhm2vrxq', 1, 46000.00, 46000.00, '2025-12-04 03:54:14.887', 'cmiqwj64m00bdvsucsefx26os', 'cmiqwj4fm002rvsuclxxgbwcs', 0.00, 0.00, 0.00, 35210.00, 10790.00, 46000.00),
('cmiqwj66100bnvsucpybzvpip', 1, 46000.00, 46000.00, '2025-12-04 03:54:14.905', 'cmiqwj65v00blvsucrc1agmk8', 'cmiqwj4fm002rvsuclxxgbwcs', 0.00, 0.00, 0.00, 35210.00, 10790.00, 46000.00),
('cmiqwj66d00bpvsuc9vftr8n8', 1, 28000.00, 28000.00, '2025-12-04 03:54:14.917', 'cmiqwj65v00blvsucrc1agmk8', 'cmiqwj41z000lvsucr9cwhuo5', 0.00, 0.00, 0.00, 22201.00, 5799.00, 28000.00),
('cmiqwj66q00brvsucr515e68z', 1, 28000.00, 28000.00, '2025-12-04 03:54:14.931', 'cmiqwj65v00blvsucrc1agmk8', 'cmiqwj42n000pvsucenybsyx8', 0.00, 0.00, 0.00, 23121.00, 4879.00, 28000.00),
('cmiqwj67300btvsucaoroooyq', 1, 28000.00, 28000.00, '2025-12-04 03:54:14.943', 'cmiqwj65v00blvsucrc1agmk8', 'cmiqwj3zs000dvsucvwzv88n8', 0.00, 0.00, 0.00, 19983.00, 8017.00, 28000.00),
('cmiqwj67m00bxvsuccbdho4uf', 1, 28000.00, 28000.00, '2025-12-04 03:54:14.963', 'cmiqwj67f00bvvsucmt5jmfwm', 'cmiqwj4cm0029vsucx0tvin4p', 0.00, 0.00, 0.00, 21917.00, 6083.00, 28000.00),
('cmiqwj68500c1vsucwmejy7m9', 1, 46000.00, 46000.00, '2025-12-04 03:54:14.981', 'cmiqwj67y00bzvsuc0qk8xs1b', 'cmiqwj4fm002rvsuclxxgbwcs', 0.00, 0.00, 0.00, 35210.00, 10790.00, 46000.00),
('cmiqwj68o00c5vsuckv1oital', 1, 46000.00, 46000.00, '2025-12-04 03:54:15.000', 'cmiqwj68h00c3vsuczjkmca8s', 'cmiqwj60o00anvsuc6ij8tshs', 0.00, 0.00, 0.00, 36662.00, 9338.00, 46000.00),
('cmiqwj69000c7vsucsp658rpo', 1, 46000.00, 46000.00, '2025-12-04 03:54:15.013', 'cmiqwj68h00c3vsuczjkmca8s', 'cmiqwj4hf0031vsuc0hezwbjx', 0.00, 0.00, 0.00, 35414.00, 10586.00, 46000.00),
('cmiqwj69d00c9vsucumz91pdm', 1, 18000.00, 18000.00, '2025-12-04 03:54:15.025', 'cmiqwj68h00c3vsuczjkmca8s', 'cmiqwj5bd006pvsuc4vrthbnl', 0.00, 0.00, 0.00, 9061.00, 8939.00, 18000.00),
('cmiqwj69w00cdvsucazexefp5', 1, 46000.00, 46000.00, '2025-12-04 03:54:15.044', 'cmiqwj69o00cbvsucigedvj9p', 'cmiqwj481001lvsucwf7avguz', 0.00, 0.00, 0.00, 35451.00, 10549.00, 46000.00),
('cmiqwj6a800cfvsucvwz5v0as', 1, 46000.00, 46000.00, '2025-12-04 03:54:15.056', 'cmiqwj69o00cbvsucigedvj9p', 'cmiqwj4fm002rvsuclxxgbwcs', 0.00, 0.00, 0.00, 35210.00, 10790.00, 46000.00),
('cmiqwj6ar00cjvsuctdg92336', 1, 80000.00, 80000.00, '2025-12-04 03:54:15.075', 'cmiqwj6ak00chvsuc62o7ha5s', 'cmiqwj47e001hvsuc3nz2ean3', 0.00, 0.00, 0.00, 64742.00, 15258.00, 80000.00),
('cmiqwj6b300clvsucq08bii0s', 1, 46000.00, 46000.00, '2025-12-04 03:54:15.087', 'cmiqwj6ak00chvsuc62o7ha5s', 'cmiqwj4fm002rvsuclxxgbwcs', 0.00, 0.00, 0.00, 35210.00, 10790.00, 46000.00),
('cmiqwj6bl00cpvsuci5v4hove', 4, 18000.00, 72000.00, '2025-12-04 03:54:15.106', 'cmiqwj6bf00cnvsucxa194rhc', 'cmiqwj4e1002hvsuckgywsp00', 0.00, 0.00, 0.00, 38000.00, 34000.00, 72000.00),
('cmiqwj6bx00crvsucxiaw9ak0', 2, 18000.00, 36000.00, '2025-12-04 03:54:15.118', 'cmiqwj6bf00cnvsucxa194rhc', 'cmiqwj5bd006pvsuc4vrthbnl', 0.00, 0.00, 0.00, 18122.00, 17878.00, 36000.00),
('cmiqwj6cb00ctvsucync6ipml', 2, 46000.00, 92000.00, '2025-12-04 03:54:15.131', 'cmiqwj6bf00cnvsucxa194rhc', 'cmiqwj4fm002rvsuclxxgbwcs', 0.00, 0.00, 0.00, 70420.00, 21580.00, 92000.00),
('cmiqwj6cu00cxvsucftiu2kfx', 3, 28000.00, 84000.00, '2025-12-04 03:54:15.150', 'cmiqwj6cn00cvvsucu2bkokwi', 'cmiqwj4cm0029vsucx0tvin4p', 0.00, 0.00, 0.00, 65751.00, 18249.00, 84000.00),
('cmiqwj6dd00d1vsucpoetk8hu', 2, 46000.00, 92000.00, '2025-12-04 03:54:15.169', 'cmiqwj6d700czvsucywm17gvn', 'cmiqwj4fm002rvsuclxxgbwcs', 0.00, 0.00, 0.00, 70420.00, 21580.00, 92000.00),
('cmiqwj6dq00d3vsuc7efz3hh5', 1, 28000.00, 28000.00, '2025-12-04 03:54:15.182', 'cmiqwj6d700czvsucywm17gvn', 'cmiqwj44f000zvsucvy2ugrxw', 0.00, 0.00, 0.00, 20538.00, 7462.00, 28000.00),
('cmiqwj6e400d5vsuctel2p5ty', 1, 46000.00, 46000.00, '2025-12-04 03:54:15.196', 'cmiqwj6d700czvsucywm17gvn', 'cmiqwj60o00anvsuc6ij8tshs', 0.00, 0.00, 0.00, 36662.00, 9338.00, 46000.00),
('cmiqwj6em00d9vsucms1l08gl', 2, 46000.00, 92000.00, '2025-12-04 03:54:15.214', 'cmiqwj6ef00d7vsucnux997zb', 'cmiqwj4fm002rvsuclxxgbwcs', 0.00, 0.00, 0.00, 70420.00, 21580.00, 92000.00),
('cmiqwj6f400ddvsucqgk2mddn', 1, 80000.00, 80000.00, '2025-12-04 03:54:15.232', 'cmiqwj6ex00dbvsucllpdxh45', 'cmiqwj47e001hvsuc3nz2ean3', 0.00, 0.00, 0.00, 64742.00, 15258.00, 80000.00),
('cmiqwj6fh00dfvsucymbzpr20', 1, 46000.00, 46000.00, '2025-12-04 03:54:15.245', 'cmiqwj6ex00dbvsucllpdxh45', 'cmiqwj4fm002rvsuclxxgbwcs', 0.00, 0.00, 0.00, 35210.00, 10790.00, 46000.00),
('cmiqwj6fz00djvsuc5336enk4', 2, 46000.00, 92000.00, '2025-12-04 03:54:15.264', 'cmiqwj6fs00dhvsuca0us30yb', 'cmiqwj481001lvsucwf7avguz', 0.00, 0.00, 0.00, 70902.00, 21098.00, 92000.00),
('cmiqwj6gc00dlvsucw8xicop6', 1, 18000.00, 18000.00, '2025-12-04 03:54:15.276', 'cmiqwj6fs00dhvsuca0us30yb', 'cmiqwj4e1002hvsuckgywsp00', 0.00, 0.00, 0.00, 9500.00, 8500.00, 18000.00),
('cmiqwj6gn00dnvsucfi1ac19z', 1, 18000.00, 18000.00, '2025-12-04 03:54:15.287', 'cmiqwj6fs00dhvsuca0us30yb', 'cmiqwj5bd006pvsuc4vrthbnl', 0.00, 0.00, 0.00, 9061.00, 8939.00, 18000.00),
('cmiqwj6hc00dtvsuc76h607nr', 1, 150000.00, 150000.00, '2025-12-04 03:54:15.312', 'cmiqwj6gz00dpvsucmp1jn6wr', 'cmiqwj6h600drvsuczxugwknj', 0.00, 0.00, 0.00, 151566.00, -1566.00, 150000.00),
('cmiqwj6hv00dxvsucp0s4uljf', 2, 46000.00, 92000.00, '2025-12-04 03:54:15.331', 'cmiqwj6ho00dvvsucyl6zqyat', 'cmiqwj4fm002rvsuclxxgbwcs', 0.00, 0.00, 0.00, 70420.00, 21580.00, 92000.00),
('cmiqwj6i700dzvsuc7hq73yir', 1, 46000.00, 46000.00, '2025-12-04 03:54:15.343', 'cmiqwj6ho00dvvsucyl6zqyat', 'cmiqwj60o00anvsuc6ij8tshs', 0.00, 0.00, 0.00, 36662.00, 9338.00, 46000.00),
('cmiqwj6ij00e1vsuc6j1zqeof', 1, 18000.00, 18000.00, '2025-12-04 03:54:15.355', 'cmiqwj6ho00dvvsucyl6zqyat', 'cmiqwj4e1002hvsuckgywsp00', 0.00, 0.00, 0.00, 9500.00, 8500.00, 18000.00),
('cmiqwj6iv00e3vsucwgdr0tcj', 1, 18000.00, 18000.00, '2025-12-04 03:54:15.367', 'cmiqwj6ho00dvvsucyl6zqyat', 'cmiqwj4en002lvsuc6h6u6mue', 0.00, 0.00, 0.00, 7936.00, 10064.00, 18000.00),
('cmiqwj6j900e5vsuc0u5tnadz', 1, 18000.00, 18000.00, '2025-12-04 03:54:15.381', 'cmiqwj6ho00dvvsucyl6zqyat', 'cmiqwj5bd006pvsuc4vrthbnl', 0.00, 0.00, 0.00, 9061.00, 8939.00, 18000.00),
('cmiqwj6jr00e9vsucteczphfn', 2, 10000.00, 20000.00, '2025-12-04 03:54:15.399', 'cmiqwj6jk00e7vsuchtavpne6', 'cmiqwj46j001bvsuc3rvixnbu', 0.00, 0.00, 0.00, 9190.00, 10810.00, 20000.00),
('cmiqwj6k400ebvsucqbsz4msh', 2, 10000.00, 20000.00, '2025-12-04 03:54:15.412', 'cmiqwj6jk00e7vsuchtavpne6', 'cmiqwj45t0017vsucx1wm4ce1', 0.00, 0.00, 0.00, 9116.00, 10884.00, 20000.00),
('cmiqwj6kg00edvsucilqw0hjm', 1, 46000.00, 46000.00, '2025-12-04 03:54:15.424', 'cmiqwj6jk00e7vsuchtavpne6', 'cmiqwj481001lvsucwf7avguz', 0.00, 0.00, 0.00, 35451.00, 10549.00, 46000.00),
('cmiqwj6ks00efvsuct4qtfc3i', 1, 28000.00, 28000.00, '2025-12-04 03:54:15.437', 'cmiqwj6jk00e7vsuchtavpne6', 'cmiqwj4cm0029vsucx0tvin4p', 0.00, 0.00, 0.00, 21917.00, 6083.00, 28000.00),
('cmiqwj6lb00ejvsuc56zk4dqg', 2, 28000.00, 56000.00, '2025-12-04 03:54:15.456', 'cmiqwj6l400ehvsuc56sg0m7y', 'cmiqwj411000hvsuckbm0ruoz', 0.00, 0.00, 0.00, 41804.00, 14196.00, 56000.00),
('cmiqwj6ln00elvsucmpzvaix2', 1, 46000.00, 46000.00, '2025-12-04 03:54:15.467', 'cmiqwj6l400ehvsuc56sg0m7y', 'cmiqwj481001lvsucwf7avguz', 0.00, 0.00, 0.00, 35451.00, 10549.00, 46000.00),
('cmiqwj6m000envsuc2zvxll18', 1, 46000.00, 46000.00, '2025-12-04 03:54:15.480', 'cmiqwj6l400ehvsuc56sg0m7y', 'cmiqwj4m0003rvsucmpw16el0', 0.00, 0.00, 0.00, 34783.00, 11217.00, 46000.00),
('cmiqwj6mt00epvsuclzwuscci', 1, 28000.00, 28000.00, '2025-12-04 03:54:15.509', 'cmiqwj6l400ehvsuc56sg0m7y', 'cmiqwj42n000pvsucenybsyx8', 0.00, 0.00, 0.00, 23121.00, 4879.00, 28000.00),
('cmiqwj6nd00etvsucwddvmnnz', 2, 10000.00, 20000.00, '2025-12-04 03:54:15.529', 'cmiqwj6n600ervsuc1s253q85', 'cmiqwj46j001bvsuc3rvixnbu', 0.00, 0.00, 0.00, 9190.00, 10810.00, 20000.00),
('cmiqwj6nq00evvsuc1vmqle1t', 2, 10000.00, 20000.00, '2025-12-04 03:54:15.542', 'cmiqwj6n600ervsuc1s253q85', 'cmiqwj45t0017vsucx1wm4ce1', 0.00, 0.00, 0.00, 9116.00, 10884.00, 20000.00),
('cmiqwj6o300exvsuc3ysungu1', 1, 18000.00, 18000.00, '2025-12-04 03:54:15.555', 'cmiqwj6n600ervsuc1s253q85', 'cmiqwj4e1002hvsuckgywsp00', 0.00, 0.00, 0.00, 9500.00, 8500.00, 18000.00),
('cmiqwj6og00ezvsuchwih5kig', 1, 18000.00, 18000.00, '2025-12-04 03:54:15.569', 'cmiqwj6n600ervsuc1s253q85', 'cmiqwj5bd006pvsuc4vrthbnl', 0.00, 0.00, 0.00, 9061.00, 8939.00, 18000.00),
('cmiqwj6p000f3vsucj4v021xr', 1, 28000.00, 28000.00, '2025-12-04 03:54:15.588', 'cmiqwj6ot00f1vsucw5ixu3uu', 'cmiqwj42n000pvsucenybsyx8', 0.00, 0.00, 0.00, 23121.00, 4879.00, 28000.00),
('cmiqwj6pc00f5vsuciv4xpugf', 1, 28000.00, 28000.00, '2025-12-04 03:54:15.600', 'cmiqwj6ot00f1vsucw5ixu3uu', 'cmiqwj41z000lvsucr9cwhuo5', 0.00, 0.00, 0.00, 22201.00, 5799.00, 28000.00),
('cmiqwj6pp00f7vsucleip7yfi', 1, 18000.00, 18000.00, '2025-12-04 03:54:15.614', 'cmiqwj6ot00f1vsucw5ixu3uu', 'cmiqwj5bd006pvsuc4vrthbnl', 0.00, 0.00, 0.00, 9061.00, 8939.00, 18000.00),
('cmiqwj6qa00fbvsucn8616czj', 1, 46000.00, 46000.00, '2025-12-04 03:54:15.634', 'cmiqwj6q300f9vsucnm85scqp', 'cmiqwj481001lvsucwf7avguz', 0.00, 0.00, 0.00, 35451.00, 10549.00, 46000.00),
('cmiqwj6qn00fdvsucvmo9h7th', 1, 28000.00, 28000.00, '2025-12-04 03:54:15.648', 'cmiqwj6q300f9vsucnm85scqp', 'cmiqwj42n000pvsucenybsyx8', 0.00, 0.00, 0.00, 23121.00, 4879.00, 28000.00),
('cmiqwj6r100ffvsuclzifbvdh', 1, 10000.00, 10000.00, '2025-12-04 03:54:15.661', 'cmiqwj6q300f9vsucnm85scqp', 'cmiqwj45t0017vsucx1wm4ce1', 0.00, 0.00, 0.00, 4558.00, 5442.00, 10000.00),
('cmiqwj6rm00fjvsuc5eizev4n', 1, 46000.00, 46000.00, '2025-12-04 03:54:15.682', 'cmiqwj6rd00fhvsucw2ass5z3', 'cmiqwj4m0003rvsucmpw16el0', 0.00, 0.00, 0.00, 34783.00, 11217.00, 46000.00),
('cmiqwj6rz00flvsucu55wr189', 1, 46000.00, 46000.00, '2025-12-04 03:54:15.695', 'cmiqwj6rd00fhvsucw2ass5z3', 'cmiqwj60o00anvsuc6ij8tshs', 0.00, 0.00, 0.00, 36662.00, 9338.00, 46000.00),
('cmiqwj6sb00fnvsuc2vcwpb6z', 1, 46000.00, 46000.00, '2025-12-04 03:54:15.707', 'cmiqwj6rd00fhvsucw2ass5z3', 'cmiqwj4fm002rvsuclxxgbwcs', 0.00, 0.00, 0.00, 35210.00, 10790.00, 46000.00),
('cmiqwj6so00fpvsuc05nnng3u', 1, 28000.00, 28000.00, '2025-12-04 03:54:15.720', 'cmiqwj6rd00fhvsucw2ass5z3', 'cmiqwj42n000pvsucenybsyx8', 0.00, 0.00, 0.00, 23121.00, 4879.00, 28000.00),
('cmiqwj6t100frvsucu3x89uqv', 1, 28000.00, 28000.00, '2025-12-04 03:54:15.733', 'cmiqwj6rd00fhvsucw2ass5z3', 'cmiqwj41z000lvsucr9cwhuo5', 0.00, 0.00, 0.00, 22201.00, 5799.00, 28000.00),
('cmiqwj6td00ftvsucl7vxfi1l', 1, 9750.00, 9750.00, '2025-12-04 03:54:15.746', 'cmiqwj6rd00fhvsucw2ass5z3', 'cmiqwj4bt0023vsuc93s1h36g', 0.00, 0.00, 0.00, 9750.00, 0.00, 9750.00),
('cmiqwj6tw00fxvsucjf0pljvy', 2, 46000.00, 92000.00, '2025-12-04 03:54:15.765', 'cmiqwj6tp00fvvsuckwt52oht', 'cmiqwj4fm002rvsuclxxgbwcs', 0.00, 0.00, 0.00, 70420.00, 21580.00, 92000.00),
('cmiqwj6uh00g1vsucjypm483a', 1, 28000.00, 28000.00, '2025-12-04 03:54:15.785', 'cmiqwj6u900fzvsucgma6lkbo', 'cmiqwj41z000lvsucr9cwhuo5', 0.00, 0.00, 0.00, 22201.00, 5799.00, 28000.00),
('cmiqwj6uu00g3vsuco4rhcmm0', 1, 28000.00, 28000.00, '2025-12-04 03:54:15.798', 'cmiqwj6u900fzvsucgma6lkbo', 'cmiqwj4cm0029vsucx0tvin4p', 0.00, 0.00, 0.00, 21917.00, 6083.00, 28000.00);

-- --------------------------------------------------------

--
-- Table structure for table `upgrade_requests`
--

CREATE TABLE `upgrade_requests` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `companyId` varchar(191) NOT NULL,
  `requestedTier` enum('FREE','BASIC','PREMIUM','ENTERPRISE') NOT NULL,
  `paymentProof` varchar(191) NOT NULL,
  `paymentMethod` varchar(191) NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `requestedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `approvedAt` datetime(3) DEFAULT NULL,
  `approvedBy` varchar(191) DEFAULT NULL,
  `rejectedAt` datetime(3) DEFAULT NULL,
  `rejectedBy` varchar(191) DEFAULT NULL,
  `rejectionReason` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `upgrade_requests`
--

INSERT INTO `upgrade_requests` (`id`, `userId`, `companyId`, `requestedTier`, `paymentProof`, `paymentMethod`, `status`, `requestedAt`, `approvedAt`, `approvedBy`, `rejectedAt`, `rejectedBy`, `rejectionReason`, `createdAt`, `updatedAt`) VALUES
('cmimu73d5000tvsyohk62uiyq', 'cmimu52n3000pvsyoxnk3rtjv', 'cmimu52s4000rvsyortko8ctd', 'ENTERPRISE', '/uploads/payments/upgrade-cmimu52n3000pvsyoxnk3rtjv-1764574667462.pdf', 'BCA', 'APPROVED', '2025-12-01 07:37:47.463', '2025-12-01 07:38:13.995', 'cmig4nefc0014vsmc7vtcbpz1', NULL, NULL, NULL, '2025-12-01 07:37:47.465', '2025-12-01 07:38:13.997');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `name` varchar(191) DEFAULT NULL,
  `password` varchar(191) NOT NULL,
  `role` enum('SUPERADMIN','ADMIN','KASIR','OWNER') NOT NULL DEFAULT 'OWNER',
  `status` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `emailVerified` datetime(3) DEFAULT NULL,
  `image` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `profileImage` varchar(191) DEFAULT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `address` varchar(191) DEFAULT NULL,
  `apiKey` varchar(191) DEFAULT NULL,
  `apiKeyExpiry` datetime(3) DEFAULT NULL,
  `approvedAt` datetime(3) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 0,
  `isVerified` tinyint(1) NOT NULL DEFAULT 0,
  `otpCode` varchar(191) DEFAULT NULL,
  `otpExpires` datetime(3) DEFAULT NULL,
  `paymentMethod` varchar(191) DEFAULT NULL,
  `paymentProof` varchar(191) DEFAULT NULL,
  `paymentProofSize` int(11) DEFAULT NULL,
  `paymentUploadedAt` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `name`, `password`, `role`, `status`, `emailVerified`, `image`, `createdAt`, `updatedAt`, `profileImage`, `phone`, `address`, `apiKey`, `apiKeyExpiry`, `approvedAt`, `isActive`, `isVerified`, `otpCode`, `otpExpires`, `paymentMethod`, `paymentProof`, `paymentProofSize`, `paymentUploadedAt`) VALUES
('cmig4nefc0014vsmc7vtcbpz1', 'superadmin@vendra.com', 'balqis', '$2b$12$grNFZWeI0gQWCMcVXTteBOWo4Dfk.SRrzygApS03bC5sjUV0tnaAK', 'SUPERADMIN', 'APPROVED', NULL, NULL, '2025-11-26 14:56:01.221', '2025-11-26 15:04:00.762', NULL, NULL, NULL, 'vnd_live_9672be8204864f0b5b88bfa88a3c0121ec31df6d8b16a2528e1e0bf3e78af5e6', '2026-11-26 14:56:01.246', '2025-11-26 14:56:24.249', 1, 1, NULL, NULL, NULL, NULL, NULL, NULL),
('cmimu52n3000pvsyoxnk3rtjv', 'andiariegalang0@gmail.com', 'galang', '$2b$12$h0VWC6ksB7Sa6.DudOQhwOJtdhdxa4KEpPVs0gxRqH6i5E5HiTL8W', 'OWNER', 'APPROVED', NULL, NULL, '2025-12-01 07:36:13.146', '2025-12-20 05:50:25.025', NULL, NULL, NULL, 'vnd_live_0e541f7d75dd7942f62bcf6b210fec7c8654cef8496fc1fbd5ac775b1ec51d32', '2026-12-01 07:36:13.578', '2025-12-01 07:37:15.706', 1, 1, '398120', '2025-12-20 06:50:25.024', NULL, NULL, NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ai_chat_quota`
--
ALTER TABLE `ai_chat_quota`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ai_chat_quota_companyId_key` (`companyId`),
  ADD KEY `ai_chat_quota_companyId_fkey` (`companyId`);

--
-- Indexes for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `chat_messages_sessionId_fkey` (`sessionId`),
  ADD KEY `chat_messages_adminId_fkey` (`adminId`);

--
-- Indexes for table `chat_sessions`
--
ALTER TABLE `chat_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `chat_sessions_adminId_fkey` (`adminId`);

--
-- Indexes for table `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `companies_email_key` (`email`),
  ADD UNIQUE KEY `companies_ownerId_key` (`ownerId`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `customers_uniqueId_key` (`uniqueId`),
  ADD UNIQUE KEY `customers_membershipId_key` (`membershipId`),
  ADD KEY `customers_companyId_fkey` (`companyId`),
  ADD KEY `customers_membershipStoreId_fkey` (`membershipStoreId`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `employees_email_key` (`email`),
  ADD KEY `employees_companyId_fkey` (`companyId`),
  ADD KEY `employees_storeId_fkey` (`storeId`);

--
-- Indexes for table `import_history`
--
ALTER TABLE `import_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `import_history_companyId_fkey` (`companyId`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `products_companyId_sku_key` (`companyId`,`sku`),
  ADD UNIQUE KEY `products_companyId_barcode_key` (`companyId`,`barcode`),
  ADD KEY `products_storeId_fkey` (`storeId`),
  ADD KEY `products_companyId_fkey` (`companyId`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sessions_sessionToken_key` (`sessionToken`),
  ADD KEY `sessions_userId_fkey` (`userId`);

--
-- Indexes for table `stores`
--
ALTER TABLE `stores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `stores_companyId_code_key` (`companyId`,`code`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `transactions_transactionNo_key` (`transactionNo`),
  ADD KEY `transactions_companyId_fkey` (`companyId`),
  ADD KEY `transactions_customerId_fkey` (`customerId`),
  ADD KEY `transactions_storeId_fkey` (`storeId`),
  ADD KEY `transactions_employeeId_fkey` (`employeeId`);

--
-- Indexes for table `transaction_items`
--
ALTER TABLE `transaction_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transaction_items_transactionId_fkey` (`transactionId`),
  ADD KEY `transaction_items_productId_fkey` (`productId`);

--
-- Indexes for table `upgrade_requests`
--
ALTER TABLE `upgrade_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `upgrade_requests_userId_fkey` (`userId`),
  ADD KEY `upgrade_requests_companyId_fkey` (`companyId`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_key` (`email`),
  ADD UNIQUE KEY `users_apiKey_key` (`apiKey`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `ai_chat_quota`
--
ALTER TABLE `ai_chat_quota`
  ADD CONSTRAINT `ai_chat_quota_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD CONSTRAINT `chat_messages_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chat_messages_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `chat_sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `chat_sessions`
--
ALTER TABLE `chat_sessions`
  ADD CONSTRAINT `chat_sessions_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `companies`
--
ALTER TABLE `companies`
  ADD CONSTRAINT `companies_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `customers`
--
ALTER TABLE `customers`
  ADD CONSTRAINT `customers_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customers_membershipStoreId_fkey` FOREIGN KEY (`membershipStoreId`) REFERENCES `stores` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `employees_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `employees_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `stores` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `import_history`
--
ALTER TABLE `import_history`
  ADD CONSTRAINT `import_history_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `stores` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `stores`
--
ALTER TABLE `stores`
  ADD CONSTRAINT `stores_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `stores` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `transaction_items`
--
ALTER TABLE `transaction_items`
  ADD CONSTRAINT `transaction_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `transaction_items_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `transactions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `upgrade_requests`
--
ALTER TABLE `upgrade_requests`
  ADD CONSTRAINT `upgrade_requests_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `upgrade_requests_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

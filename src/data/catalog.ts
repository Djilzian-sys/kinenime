export type MediaType = 'anime' | 'movie';

export interface EpisodeItem {
  number: number;
  title: string;
  durationMinutes: number;
}

export interface SubtitleCue {
  startSec: number;
  endSec: number;
  id: string;
  en: string;
}

export interface MediaItem {
  id: string;
  title: string;
  originalTitle: string;
  mediaType: MediaType;
  formatLabel: string;
  year: number;
  durationLabel: string;
  durationSeconds: number;
  rating: number;
  genres: string[];
  creatorLabel: string;
  creatorName: string;
  isPremiumOnly: boolean;
  synopsis: string;
  imageUrl: string;
  heroImageUrl?: string;
  episodes: EpisodeItem[];
  palette: {
    skyTop: string;
    skyBottom: string;
    accent: string;
    particle: string;
    atmosphere: 'rain' | 'aurora' | 'embers' | 'stars' | 'lanterns' | 'sunset';
  };
  subtitles: SubtitleCue[];
}

export const CATALOG: MediaItem[] = [
  {
    id: 'cakrawala-express',
    title: 'Ekspres Cakrawala',
    originalTitle: 'Chiheisen no Ressha',
    mediaType: 'anime',
    formatLabel: 'Film Anime',
    year: 2025,
    durationLabel: '114 mnt',
    durationSeconds: 180,
    rating: 9.1,
    genres: ['Drama', 'Fantasi', 'Romansa'],
    creatorLabel: 'Studio',
    creatorName: 'CoMix Wave Atelier',
    isPremiumOnly: false,
    synopsis:
      'Kereta pesisir terakhir yang melintasi viaduk samudra saat senja membawa dua penumpang asing menelusuri kenangan kota yang perlahan tenggelam oleh waktu.',
    imageUrl: '/src/assets/images/hero_cakrawala_express_1794858042781.jpg',
    heroImageUrl: '/src/assets/images/hero_cakrawala_express_1794858042781.jpg',
    episodes: [{ number: 1, title: 'Penayangan Penuh', durationMinutes: 114 }],
    palette: {
      skyTop: '#162447',
      skyBottom: '#D9534F',
      accent: '#F59E0B',
      particle: '#FDE68A',
      atmosphere: 'sunset',
    },
    subtitles: [
      {
        startSec: 2,
        endSec: 7,
        id: 'Kereta pukul 17.42 sebentar lagi melintasi Jembatan Samudra Selatan.',
        en: 'The 17:42 coastal express is now crossing the Southern Viaduct.',
      },
      {
        startSec: 8,
        endSec: 15,
        id: 'Setiap kali langit berubah jingga, aku selalu teringat musim panas itu.',
        en: 'Every time the sky turns amber, I remember that distant summer.',
      },
      {
        startSec: 16,
        endSec: 24,
        id: 'Apakah stasiun ujung jalur ini benar-benar masih ada di peta?',
        en: 'Does the terminal station at the end of this line still exist on any map?',
      },
    ],
  },
  {
    id: 'kurogane-senja',
    title: 'Kurogane: Gerbang Senja',
    originalTitle: 'Kurogane no Mon',
    mediaType: 'anime',
    formatLabel: 'Serial Anime',
    year: 2026,
    durationLabel: '12 Eps',
    durationSeconds: 150,
    rating: 9.3,
    genres: ['Aksi', 'Fantasi', 'Sejarah'],
    creatorLabel: 'Studio',
    creatorName: 'Ufotable Studio',
    isPremiumOnly: true,
    synopsis:
      'Seorang pendekar pengembara menjaga gerbang batu kuno di lembah bambu dari roh pedang yang bangkit setiap kali bulan sabit menyentuh kabut pegunungan.',
    imageUrl: '/src/assets/images/anime_kurogane_senja_1794858042492.jpg',
    episodes: [
      { number: 1, title: 'Kabut di Gerbang Torii', durationMinutes: 24 },
      { number: 2, title: 'Bilah Baja & Daun Merah', durationMinutes: 24 },
      { number: 3, title: 'Sumpah Lembah Bambu', durationMinutes: 25 },
      { number: 4, title: 'Bayangan Bulan Sabit', durationMinutes: 24 },
    ],
    palette: {
      skyTop: '#0F172A',
      skyBottom: '#334155',
      accent: '#E11D48',
      particle: '#FB7185',
      atmosphere: 'embers',
    },
    subtitles: [
      {
        startSec: 2,
        endSec: 8,
        id: 'Jangan melangkah melewati batu batas sebelum kabut lembah turun.',
        en: 'Do not step past the boundary stone before the valley mist settles.',
      },
      {
        startSec: 9,
        endSec: 16,
        id: 'Pedang ini tidak ditempa untuk menaklukkan, melainkan untuk mengingat.',
        en: 'This blade was not forged to conquer, but to remember.',
      },
      {
        startSec: 17,
        endSec: 25,
        id: 'Ketika daun maple jatuh di malam hari, gerbang akan terbuka kembali.',
        en: 'When crimson leaves fall at night, the gate shall open once more.',
      },
    ],
  },
  {
    id: 'orbital-requiem',
    title: 'Orbital Requiem',
    originalTitle: 'Kidou Chinkonka',
    mediaType: 'anime',
    formatLabel: 'Serial Anime',
    year: 2025,
    durationLabel: '24 Eps',
    durationSeconds: 160,
    rating: 8.9,
    genres: ['Sci-Fi', 'Aksi', 'Drama'],
    creatorLabel: 'Studio',
    creatorName: 'Sunrise Horizon',
    isPremiumOnly: false,
    synopsis:
      'Teknisi pemeliharaan orbit rendah Bumi menemukan sinyal darurat dari stasiun cincin yang seharusnya kosong sejak misi kolonisasi pertama.',
    imageUrl: '/src/assets/images/anime_orbital_requiem_1794858043040.jpg',
    episodes: [
      { number: 1, title: 'Sektor Cincin Nol', durationMinutes: 24 },
      { number: 2, title: 'Pantulan Kaca Helm', durationMinutes: 24 },
      { number: 3, title: 'Frekuensi yang Hilang', durationMinutes: 24 },
    ],
    palette: {
      skyTop: '#030712',
      skyBottom: '#1E3A8A',
      accent: '#F59E0B',
      particle: '#E2E8F0',
      atmosphere: 'stars',
    },
    subtitles: [
      {
        startSec: 2,
        endSec: 8,
        id: 'Tekanan oksigen stabil di 94 persen. Mulai pemeriksaan panel surya sektor empat.',
        en: 'Oxygen pressure stable at 94 percent. Beginning solar array inspection on sector four.',
      },
      {
        startSec: 9,
        endSec: 16,
        id: 'Ada transmisi audio berulang dari dalam cincin bagian dalam.',
        en: 'We are picking up a looping audio transmission from the inner ring.',
      },
      {
        startSec: 17,
        endSec: 25,
        id: 'Bumi tampak begitu tenang dari ketinggian empat ratus kilometer.',
        en: 'Earth looks remarkably calm from four hundred kilometers up.',
      },
    ],
  },
  {
    id: 'lentera-lembah',
    title: 'Lentera Lembah Kabut',
    originalTitle: 'Kiri no Tani no Akari',
    mediaType: 'anime',
    formatLabel: 'Serial Anime',
    year: 2024,
    durationLabel: '10 Eps',
    durationSeconds: 140,
    rating: 9.0,
    genres: ['Fantasi', 'Misteri', 'Slice of Life'],
    creatorLabel: 'Studio',
    creatorName: 'Kyoto Lantern',
    isPremiumOnly: false,
    synopsis:
      'Di desa kanal bertingkat yang hanya terhubung oleh jembatan kayu, seorang pengrajin lentera muda mengumpulkan kisah para pelancong malam.',
    imageUrl: '/src/assets/images/anime_lentera_lembah_1794858045068.jpg',
    episodes: [
      { number: 1, title: 'Cahaya Pertama di Kanal', durationMinutes: 23 },
      { number: 2, title: 'Pelancong dari Puncak Utara', durationMinutes: 23 },
      { number: 3, title: 'Kertas Washi dan Hujan', durationMinutes: 24 },
    ],
    palette: {
      skyTop: '#1E293B',
      skyBottom: '#475569',
      accent: '#F59E0B',
      particle: '#FCD34D',
      atmosphere: 'lanterns',
    },
    subtitles: [
      {
        startSec: 2,
        endSec: 8,
        id: 'Setiap lentera yang dinyalakan di jembatan menandai satu janji yang ditepati.',
        en: 'Every lantern lit along the bridge marks a promise kept.',
      },
      {
        startSec: 9,
        endSec: 16,
        id: 'Malam ini kabut turun lebih cepat dari biasanya.',
        en: 'Tonight the valley mist is rolling in earlier than usual.',
      },
      {
        startSec: 17,
        endSec: 25,
        id: 'Mari masuk, teh hangat sudah siap di ruang bengkel.',
        en: 'Come inside, warm tea is ready in the workshop.',
      },
    ],
  },
  {
    id: 'suara-hujan',
    title: 'Suara Hujan di Tokyo',
    originalTitle: 'Ame no Oto no Niwa',
    mediaType: 'anime',
    formatLabel: 'Film Anime',
    year: 2026,
    durationLabel: '98 mnt',
    durationSeconds: 175,
    rating: 8.8,
    genres: ['Drama', 'Romansa', 'Slice of Life'],
    creatorLabel: 'Studio',
    creatorName: 'P.A. Works',
    isPremiumOnly: true,
    synopsis:
      'Sebuah rumah kaca tua di tengah taman botani Tokyo menjadi tempat perjumpaan dua perangkai suara yang merekam ritme musim hujan.',
    imageUrl: '/src/assets/images/anime_suara_hujan_1794858045067.jpg',
    episodes: [{ number: 1, title: 'Penayangan Penuh', durationMinutes: 98 }],
    palette: {
      skyTop: '#1E293B',
      skyBottom: '#334155',
      accent: '#10B981',
      particle: '#CBD5E1',
      atmosphere: 'rain',
    },
    subtitles: [
      {
        startSec: 2,
        endSec: 8,
        id: 'Dengarkan baik-baik. Hujan di atas kaca terdengar berbeda dari hujan di dedaunan.',
        en: 'Listen closely. Rain on glass sounds different from rain on leaves.',
      },
      {
        startSec: 9,
        endSec: 16,
        id: 'Kita tidak perlu terburu-buru menunggu langit cerah.',
        en: 'We do not have to rush while waiting for the sky to clear.',
      },
      {
        startSec: 17,
        endSec: 25,
        id: 'Rekaman hari ini akan kusimpan sebagai bagian terakhir simfoni kota.',
        en: 'I will keep today’s recording as the final movement of the city symphony.',
      },
    ],
  },
  {
    id: 'malam-jakarta',
    title: 'Malam Tanpa Saksi',
    originalTitle: 'Malam Tanpa Saksi',
    mediaType: 'movie',
    formatLabel: 'Film Movie',
    year: 2025,
    durationLabel: '126 mnt',
    durationSeconds: 185,
    rating: 8.7,
    genres: ['Thriller', 'Misteri', 'Kriminal'],
    creatorLabel: 'Sutradara',
    creatorName: 'Rendra Wijaya',
    isPremiumOnly: false,
    synopsis:
      'Detektif senior menelusuri rekaman kamera jalan layang yang hilang selama dua belas menit di tengah hujan deras malam pergantian tahun.',
    imageUrl: '/src/assets/images/film_malam_jakarta_1794858046902.jpg',
    episodes: [{ number: 1, title: 'Penayangan Penuh', durationMinutes: 126 }],
    palette: {
      skyTop: '#090D16',
      skyBottom: '#1F2937',
      accent: '#F59E0B',
      particle: '#94A3B8',
      atmosphere: 'rain',
    },
    subtitles: [
      {
        startSec: 2,
        endSec: 8,
        id: 'Pukul 02.14 dini hari, seluruh lampu jalan layang sektor selatan padam.',
        en: 'At 02:14 AM, every streetlight along the southern overpass went dark.',
      },
      {
        startSec: 9,
        endSec: 16,
        id: 'Saksi kunci mengaku hanya melihat sedan hitam melaju tanpa pelat nomor.',
        en: 'The key witness claimed they only saw a black sedan driving with no plates.',
      },
      {
        startSec: 17,
        endSec: 25,
        id: 'Hujan menghapus jejak ban, tapi tidak pernah menghapus motif.',
        en: 'Rain washes away tire tracks, never the motive.',
      },
    ],
  },
  {
    id: 'gema-utara',
    title: 'Gema di Balik Aurora',
    originalTitle: 'Echoes Beyond the Ridge',
    mediaType: 'movie',
    formatLabel: 'Film Movie',
    year: 2026,
    durationLabel: '132 mnt',
    durationSeconds: 190,
    rating: 9.2,
    genres: ['Misteri', 'Drama', 'Thriller'],
    creatorLabel: 'Sutradara',
    creatorName: 'Soren Lindqvist',
    isPremiumOnly: true,
    synopsis:
      'Penjaga observatorium cuaca terpencil di lingkar Arktik menerima pesan morse yang dikodekan dalam anomali magnetik aurora utara.',
    imageUrl: '/src/assets/images/film_gema_utara_1794858046138.jpg',
    episodes: [{ number: 1, title: 'Penayangan Penuh', durationMinutes: 132 }],
    palette: {
      skyTop: '#06121E',
      skyBottom: '#13313D',
      accent: '#34D399',
      particle: '#A7F3D0',
      atmosphere: 'aurora',
    },
    subtitles: [
      {
        startSec: 2,
        endSec: 8,
        id: 'Badai matahari malam ini mengubah arah kompas di stasiun cuaca.',
        en: 'Tonight’s solar storm is deflecting every compass in the weather station.',
      },
      {
        startSec: 9,
        endSec: 16,
        id: 'Sinyal itu tidak berasal dari satelit mana pun yang terdaftar.',
        en: 'That signal does not originate from any registered satellite.',
      },
      {
        startSec: 17,
        endSec: 25,
        id: 'Jika badai memutus radio, kita hanya punya waktu hingga fajar.',
        en: 'If the storm cuts the radio link, we only have until dawn.',
      },
    ],
  },
  {
    id: 'protokol-gerhana',
    title: 'Protokol Gerhana',
    originalTitle: 'Eclipse Protocol',
    mediaType: 'movie',
    formatLabel: 'Film Movie',
    year: 2026,
    durationLabel: '141 mnt',
    durationSeconds: 195,
    rating: 9.0,
    genres: ['Sci-Fi', 'Thriller', 'Aksi'],
    creatorLabel: 'Sutradara',
    creatorName: 'Denis Ardiansyah',
    isPremiumOnly: true,
    synopsis:
      'Arsitek sistem keamanan bawah tanah harus membatalkan protokol penguncian otomatis sebelum cadangan energi fasilitas mencapai titik kritis.',
    imageUrl: '/src/assets/images/film_protokol_gerhana_1794858047713.jpg',
    episodes: [{ number: 1, title: 'Penayangan Penuh', durationMinutes: 141 }],
    palette: {
      skyTop: '#09090B',
      skyBottom: '#27272A',
      accent: '#E11D48',
      particle: '#FDA4AF',
      atmosphere: 'embers',
    },
    subtitles: [
      {
        startSec: 2,
        endSec: 8,
        id: 'Pintu ruang inti terkunci. Waktu tersisa empat belas menit.',
        en: 'Core vault doors sealed. Fourteen minutes remaining.',
      },
      {
        startSec: 9,
        endSec: 16,
        id: 'Satu-satunya cara memutus protokol adalah lewat konsol manual di lantai dasar.',
        en: 'The only way to override the protocol is from the manual console below.',
      },
      {
        startSec: 17,
        endSec: 25,
        id: 'Matikan daya cadangan dan buka gerbang ventilasi sekarang.',
        en: 'Shut down auxiliary power and open the ventilation gates now.',
      },
    ],
  },
  {
    id: 'musim-senyap',
    title: 'Musim Senyap di Trem Kota',
    originalTitle: 'Quiet Season by the Tramway',
    mediaType: 'movie',
    formatLabel: 'Film Movie',
    year: 2024,
    durationLabel: '109 mnt',
    durationSeconds: 165,
    rating: 8.6,
    genres: ['Romansa', 'Drama'],
    creatorLabel: 'Sutradara',
    creatorName: 'Wong Mei Lin',
    isPremiumOnly: false,
    synopsis:
      'Dua arsitek restorasi bertemu kembali secara tak sengaja di jalur trem tua saat hujan sore mengguyur kawasan kota lama.',
    imageUrl: '/src/assets/images/film_musim_senyap_1794858048691.jpg',
    episodes: [{ number: 1, title: 'Penayangan Penuh', durationMinutes: 109 }],
    palette: {
      skyTop: '#291D14',
      skyBottom: '#573D24',
      accent: '#F59E0B',
      particle: '#FDE68A',
      atmosphere: 'rain',
    },
    subtitles: [
      {
        startSec: 2,
        endSec: 8,
        id: 'Trem jalur empat masih berbunyi persis seperti tujuh tahun lalu.',
        en: 'The Line 4 tram still chimes the exact same way it did seven years ago.',
      },
      {
        startSec: 9,
        endSec: 16,
        id: 'Hujan sore di jalan batu selalu membuat waktu terasa melambat.',
        en: 'Afternoon rain on cobblestones always makes time feel slower.',
      },
      {
        startSec: 17,
        endSec: 25,
        id: 'Maukah kau berjalan sampai halte berikutnya bersamaku?',
        en: 'Would you walk with me to the next stop?',
      },
    ],
  },
];

export const ALL_GENRES: string[] = Array.from(
  new Set(CATALOG.flatMap((item) => item.genres))
).sort();

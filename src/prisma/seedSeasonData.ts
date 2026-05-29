import { prisma } from "../config/prisma.js";

const defaultSeasons = [
  {
    slug: "spring",
    name: "Musim Semi",
    shortName: "Semi",
    accent: "#e65788",
    months: "2,3,4",
    tempMin: 23,
    tempMax: 31,
    weather: "Cerah Bunga|Mendung Tipis|Gerimis|Kabut Pagi|Angin Kelopak",
    images: [
      ["/seasons/spring.png", "Danau Sakura", "sunrise", "petal"],
      ["/seasons/spring-2.png", "Taman Hujan", "rain", "drop"],
      ["/seasons/spring-3.png", "Padang Bunga", "glow", "spark"],
      ["/seasons/spring-4.png", "Senja Sakura", "moon", "star"]
    ]
  },
  {
    slug: "summer",
    name: "Musim Panas",
    shortName: "Panas",
    accent: "#f5b840",
    months: "5,6,7",
    tempMin: 27,
    tempMax: 36,
    weather: "Cerah Terik|Langit Biru|Berawan|Angin Laut|Panas Lembut",
    images: [
      ["/seasons/summer.png", "Pantai Cerah", "glow", "spark"],
      ["/seasons/summer-2.png", "Bunga Tropis", "sunrise", "petal"],
      ["/seasons/summer-3.png", "Senja Danau", "sunset", "star"],
      ["/seasons/summer-4.png", "Lembah Sungai", "cloud", "spark"]
    ]
  },
  {
    slug: "autumn",
    name: "Musim Gugur",
    shortName: "Gugur",
    accent: "#dc7440",
    months: "8,9,10",
    tempMin: 20,
    tempMax: 29,
    weather: "Daun Jatuh|Kabut Emas|Mendung Hangat|Angin Gugur|Gerimis Daun",
    images: [
      ["/seasons/autumn.png", "Danau Maple", "sunset", "leaf"],
      ["/seasons/autumn-2.png", "Kolam Kabut", "mist", "leaf"],
      ["/seasons/autumn-3.png", "Jalan Emas", "glow", "leaf"],
      ["/seasons/autumn-4.png", "Hujan Gugur", "rain", "drop"]
    ]
  },
  {
    slug: "winter",
    name: "Musim Dingin",
    shortName: "Dingin",
    accent: "#78aeea",
    months: "11,0,1",
    tempMin: 8,
    tempMax: 19,
    weather: "Salju Halus|Cerah Beku|Kabut Es|Berawan Dingin|Angin Salju",
    images: [
      ["/seasons/winter.png", "Danau Beku", "mist", "dot"],
      ["/seasons/winter-2.png", "Hutan Salju", "snow", "star"],
      ["/seasons/winter-3.png", "Bulan Es", "moon", "star"],
      ["/seasons/winter-4.png", "Taman Beku", "cloud", "dot"]
    ]
  }
];

export async function seedSeasonData() {
  for (const season of defaultSeasons) {
    await prisma.season.upsert({
      where: { slug: season.slug },
      update: {
        name: season.name,
        shortName: season.shortName,
        accent: season.accent,
        months: season.months,
        tempMin: season.tempMin,
        tempMax: season.tempMax,
        weather: season.weather
      },
      create: {
        slug: season.slug,
        name: season.name,
        shortName: season.shortName,
        accent: season.accent,
        months: season.months,
        tempMin: season.tempMin,
        tempMax: season.tempMax,
        weather: season.weather
      }
    });

    await Promise.all(
      season.images.map(([path, label, overlay, particle], index) =>
        prisma.seasonImage.upsert({
          where: { path },
          update: {
            seasonSlug: season.slug,
            label,
            overlay,
            particle,
            sortOrder: index + 1
          },
          create: {
            seasonSlug: season.slug,
            path,
            label,
            overlay,
            particle,
            sortOrder: index + 1
          }
        })
      )
    );
  }
}

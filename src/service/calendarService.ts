import type { DayDescription, Season, SeasonImage } from "../../prisma/generated/prisma/client.js";
import { prisma } from "../config/prisma.js";

const DAY_MS = 24 * 60 * 60 * 1000;

type SeasonWithImages = Season & { images: SeasonImage[] };
type DescriptionMap = Map<string, DayDescription>;

const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const dayShort = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const monthNames = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember"
];
const monthShort = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGU", "SEP", "OKT", "NOV", "DES"];

export async function buildCalendar({
  year,
  month,
  selectedDate
}: {
  year?: number;
  month?: number;
  selectedDate?: string;
}) {
  const seasons = await loadSeasons();
  const normalizedYear = Number.isInteger(year) ? (year as number) : new Date().getFullYear();
  const normalizedMonth = Number.isInteger(month) ? clamp(month as number, 1, 12) : new Date().getMonth() + 1;
  const selected = selectedDate ? parseDate(selectedDate) : todayUtc();
  const first = makeDate(normalizedYear, normalizedMonth - 1, 1);
  const daysInMonth = new Date(Date.UTC(normalizedYear, normalizedMonth, 0)).getUTCDate();
  const leadingDays = (first.getUTCDay() + 6) % 7;
  const gridStart = addDays(first, -leadingDays);
  const dates = Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
  const descriptions = await loadDescriptions(dates);
  const cells = dates.map((date) =>
    buildDayPayload(date, seasons, {
      selectedDate: toIso(selected),
      currentMonth: normalizedMonth - 1,
      descriptions
    })
  );

  return {
    year: normalizedYear,
    month: normalizedMonth,
    monthName: monthNames[normalizedMonth - 1]!,
    monthShort: monthShort[normalizedMonth - 1]!,
    weekdayLabels: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
    daysInMonth,
    selectedDay: buildDayPayload(selected, seasons, {
      selectedDate: toIso(selected),
      currentMonth: selected.getUTCMonth(),
      descriptions
    }),
    weeks: chunk(cells, 7)
  };
}

export async function buildDay(date: Date) {
  return buildDayPayload(date, await loadSeasons(), {
    descriptions: await loadDescriptions([date])
  });
}

export async function saveDayDescription(dateValue: string | undefined, content: string) {
  const date = toIso(parseDate(dateValue));
  const normalizedContent = content.trim();

  if (!normalizedContent) {
    await prisma.dayDescription.deleteMany({ where: { date } });
    return { date, description: null };
  }

  const description = await prisma.dayDescription.upsert({
    where: { date },
    update: { content: normalizedContent },
    create: { date, content: normalizedContent }
  });

  return { date, description };
}

export function parseDate(value: string | undefined) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? "")) {
    return todayUtc();
  }

  const [year, month, day] = value!.split("-").map(Number) as [number, number, number];
  return makeDate(year, month - 1, day);
}

function buildDayPayload(
  date: Date,
  seasons: SeasonWithImages[],
  options: { selectedDate?: string; currentMonth?: number; descriptions?: DescriptionMap } = {}
) {
  const iso = toIso(date);
  const season = getSeason(date, seasons);
  const image = getDailyImage(date, season);
  const weatherName = pick(getWeatherList(season), dateHash(date, "weather"));
  const today = todayUtc();

  return {
    iso,
    day: date.getUTCDate(),
    month: date.getUTCMonth() + 1,
    year: date.getUTCFullYear(),
    weekday: date.getUTCDay(),
    dayName: dayNames[date.getUTCDay()]!,
    dayShort: dayShort[date.getUTCDay()]!,
    isToday: iso === toIso(today),
    isSelected: iso === options.selectedDate,
    inCurrentMonth: options.currentMonth === undefined ? true : date.getUTCMonth() === options.currentMonth,
    season: {
      slug: season.slug,
      name: season.name,
      shortName: season.shortName,
      accent: season.accent
    },
    weather: {
      name: weatherName,
      icon: getWeatherIcon(weatherName),
      temperature: getTemperature(date, season)
    },
    moon: getMoonPhase(date),
    artwork: {
      base: image.path,
      variant: `foto-${image.sortOrder}`,
      variantName: image.label,
      overlay: image.overlay,
      particle: image.particle
    },
    description: options.descriptions?.get(iso) ?? null
  };
}

async function loadSeasons() {
  return prisma.season.findMany({
    include: {
      images: {
        orderBy: { sortOrder: "asc" }
      }
    }
  });
}

async function loadDescriptions(dates: Date[]) {
  const isoDates = dates.map(toIso);
  const descriptions = await prisma.dayDescription.findMany({
    where: {
      date: {
        in: isoDates
      }
    }
  });

  return new Map(descriptions.map((description) => [description.date, description]));
}

function getSeason(date: Date, seasons: SeasonWithImages[]) {
  const month = date.getUTCMonth();
  return seasons.find((season) => getMonthList(season).includes(month)) ?? seasons[0]!;
}

function getDailyImage(date: Date, season: SeasonWithImages) {
  return season.images[dateHash(date, "image") % season.images.length]!;
}

function getTemperature(date: Date, season: Season) {
  return season.tempMin + (dateHash(date, "temp") % (season.tempMax - season.tempMin + 1));
}

function getWeatherIcon(name: string) {
  if (name.includes("Gerimis") || name.includes("Rintik") || name.includes("Hujan")) return "rain";
  if (name.includes("Kabut")) return "mist";
  if (name.includes("Salju")) return "snow";
  if (name.includes("Mendung") || name.includes("Berawan")) return "cloud";
  if (name.includes("Bulan")) return "moon";
  return "sun";
}

function getMoonPhase(date: Date) {
  const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14);
  const age = ((date.getTime() - knownNewMoon) / DAY_MS) % 29.53058867;
  const normalizedAge = age < 0 ? age + 29.53058867 : age;
  const phases: [number, string, string][] = [
    [1.84566, "Bulan Baru", "new"],
    [5.53699, "Sabit Muda", "waxing-crescent"],
    [9.22831, "Kuartal Awal", "first-quarter"],
    [12.91963, "Cembung Muda", "waxing-gibbous"],
    [16.61096, "Purnama", "full"],
    [20.30228, "Cembung Tua", "waning-gibbous"],
    [23.99361, "Kuartal Akhir", "last-quarter"],
    [27.68493, "Sabit Tua", "waning-crescent"],
    [29.53059, "Bulan Baru", "new"]
  ];
  const phase = phases.find(([limit]) => normalizedAge < limit) ?? phases[0];

  return {
    age: Number(normalizedAge.toFixed(1)),
    name: phase![1],
    icon: phase![2]
  };
}

function getMonthList(season: Season) {
  return season.months.split(",").map(Number);
}

function getWeatherList(season: Season) {
  return season.weather.split("|");
}

function dateHash(date: Date, salt: string) {
  const text = `${toIso(date)}-${salt}`;
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function todayUtc() {
  const now = new Date();
  return makeDate(now.getFullYear(), now.getMonth(), now.getDate());
}

function makeDate(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month, day));
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * DAY_MS);
}

function toIso(date: Date) {
  return date.toISOString().slice(0, 10);
}

function pick<T>(list: T[], hash: number) {
  return list[hash % list.length]!;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&height=180&color=gradient&customColorList=12,20,24,30&text=Season%20Calendar%20API&fontAlign=50&fontAlignY=38&fontSize=42&desc=Express%20%2B%20Prisma%20%2B%20PostgreSQL&descAlign=50&descAlignY=62&animation=fadeIn" alt="Season Calendar API animated header" />
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Press+Start+2P&size=16&duration=2800&pause=900&color=E65788&center=true&vCenter=true&width=760&lines=API+kalender+musim+dan+cuaca;Data+hari+disimpan+dengan+Prisma;Deskripsi+tanggal+tersimpan+di+database" alt="Typing animation" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-API-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
</p>

## Preview

Backend ini menyediakan data kalender musim, cuaca harian, fase bulan, foto musiman, dan deskripsi tanggal yang disimpan ke database.

```txt
GET  /api/calendar
GET  /api/day/:date
PUT  /api/day/:date/description
```

## Fitur

- Kalender bulanan dengan grid 42 hari.
- Deteksi musim otomatis berdasarkan bulan.
- Cuaca, suhu, foto, overlay, dan fase bulan dihitung per tanggal.
- Foto harian dipilih dari banyak aset per musim.
- Deskripsi hari disimpan ke PostgreSQL melalui Prisma.
- Seed data musim dan gambar saat API start.
- Struktur rapi: `controller`, `route`, `service`, `config`, dan `prisma`.

## Struktur

```txt
api/
├─ prisma/
│  ├─ schema.prisma
│  └─ generated/prisma/
├─ src/
│  ├─ app.ts
│  ├─ config/prisma.ts
│  ├─ controller/calendarController.ts
│  ├─ prisma/seedSeasonData.ts
│  ├─ route/calendarRoute.ts
│  └─ service/calendarService.ts
├─ package.json
└─ prisma.config.ts
```

## Environment

Buat file `.env` di folder `api`.

```env
DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
PORT=4000
WEB_ORIGIN="http://localhost:3000"
```

`DIRECT_URL` wajib karena koneksi memakai `PrismaPg` adapter.

## Menjalankan

```bash
npm install
npm run db:generate
npm run prisma:push
npm run dev
```

API akan berjalan di:

```txt
http://localhost:4000
```

## Endpoint

### Health

```http
GET /api/health
```

### Kalender Bulanan

```http
GET /api/calendar?year=2026&month=5&selectedDate=2026-05-29
```

### Detail Hari

```http
GET /api/day/2026-05-29
```

### Simpan Deskripsi Hari

```http
PUT /api/day/2026-05-29/description
Content-Type: application/json

{
  "content": "Hari ini cuacanya cocok untuk menanam bunga."
}
```

Kirim `content` kosong untuk menghapus deskripsi tanggal tersebut.

## Scripts

| Script | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan API dengan `tsx watch` |
| `npm run build` | Compile TypeScript |
| `npm run start` | Menjalankan hasil build |
| `npm run db:generate` | Generate Prisma Client |
| `npm run prisma:push` | Push schema ke database |

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&height=90&section=footer&color=gradient&customColorList=12,20,24,30" alt="Footer wave" />
</p>

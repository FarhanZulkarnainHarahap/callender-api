import cors from "cors";
import express from "express";
import morgan from "morgan";
import { prisma } from "./config/prisma.js";
import calendarRoute from "./route/calendarRoute.js";
import { seedSeasonData } from "./prisma/seedSeasonData.js";

export const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors({ origin: process.env.WEB_ORIGIN ?? "*" }));
app.use(express.json());
app.use(morgan("dev"));

app.use("/api", calendarRoute);

seedSeasonData()
  .then(() => {
    app.listen(port, () => {
      console.log(`Season calendar API running on http://localhost:${port}`);
    });
  })
  .catch(async (error) => {
    console.error("Failed to start API", error);
    await prisma.$disconnect();
    process.exit(1);
  });

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

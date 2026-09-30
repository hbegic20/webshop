import express, { type Request, type Response } from "express";

const app = express();

app.get("/health", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

const PORT = process.env.PORT || 3000;

app.use((req: Request, res: Response) => {
  res.status(404).send("Not Found");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

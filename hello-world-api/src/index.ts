import express from "express";
import type { Request, Response } from "express";

const app = express();
const port: number = 3000;

app.get("/", (req: Request, res: Response) => {
	res.send("Hello, World!");
});

app.listen(port, () => {
	console.log(`API is running at http://localhost:${port}`);
});

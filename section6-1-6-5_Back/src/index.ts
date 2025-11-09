// C:\BC\section6-1-6-5_Back\src\index.ts
import dotenv from "dotenv";
import app from "./app";

dotenv.config();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 API server running at http://localhost:${PORT}`);
});

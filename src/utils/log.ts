import fs from "node:fs/promises";
import path from "node:path";

export async function logToFile(
  fileName: string,
  message: string
): Promise<void> {
  const logFilePath = path.join(process.cwd(), fileName);
  const timestamp = new Date().toISOString();
  const messageToLog = `${timestamp}: ${message}`;
  try {
    await fs.appendFile(logFilePath, messageToLog + "\n");
  } catch (error) {
    console.error("Error writing to log file:", error);
  }
}

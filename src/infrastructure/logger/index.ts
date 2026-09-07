type LogFields = Record<string, unknown>;

function write(level: "info" | "warn" | "error", message: string, fields?: LogFields): void {
  const entry = {
    level,
    message,
    time: new Date().toISOString(),
    ...fields,
  };
  const line = JSON.stringify(entry);

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.info(line);
}

export const logger = {
  /** Writes an informational structured log line. */
  info(message: string, fields?: LogFields): void {
    write("info", message, fields);
  },
  /** Writes a warning structured log line. */
  warn(message: string, fields?: LogFields): void {
    write("warn", message, fields);
  },
  /** Writes an error structured log line. */
  error(message: string, fields?: LogFields): void {
    write("error", message, fields);
  },
};

export class DbTimeoutError extends Error {
  constructor(message = "Database request timed out") {
    super(message);
    this.name = "DbTimeoutError";
  }
}

export async function withDbTimeout<T>(promise: Promise<T>, ms = 8000): Promise<T> {
  let timer: NodeJS.Timeout | null = null;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new DbTimeoutError()), ms);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

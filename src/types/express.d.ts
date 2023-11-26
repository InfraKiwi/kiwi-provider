declare global {
  namespace Express {
    interface Request {
      clientHostname?: string;
    }
  }
}

export {};

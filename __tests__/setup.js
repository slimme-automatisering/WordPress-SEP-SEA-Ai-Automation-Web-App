import { beforeAll, afterAll } from "vitest";
import { cache } from "../src/config/redis.js";
import mongoose from "mongoose";

beforeAll(async () => {
  // Setup Redis connection
  await cache.connect();

  // Setup MongoDB connection
  await mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  // Cleanup Redis connection
  await cache.disconnect();

  // Cleanup MongoDB connection
  await mongoose.connection.close();
});

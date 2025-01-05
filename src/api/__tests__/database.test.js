import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

describe("Database Connection", () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("should connect to the database", () => {
    expect(mongoose.connection.readyState).toBe(1);
  });

  it("should handle database operations", async () => {
    // Create a test model
    const TestSchema = new mongoose.Schema({
      name: String,
      value: Number,
    });
    const Test = mongoose.model("Test", TestSchema);

    // Create
    const created = await Test.create({
      name: "test",
      value: 42,
    });
    expect(created.name).toBe("test");
    expect(created.value).toBe(42);

    // Read
    const found = await Test.findById(created._id);
    expect(found.name).toBe("test");
    expect(found.value).toBe(42);

    // Update
    await Test.updateOne({ _id: created._id }, { value: 43 });
    const updated = await Test.findById(created._id);
    expect(updated.value).toBe(43);

    // Delete
    await Test.deleteOne({ _id: created._id });
    const deleted = await Test.findById(created._id);
    expect(deleted).toBeNull();
  });

  it("should handle validation", async () => {
    const ValidationSchema = new mongoose.Schema({
      email: {
        type: String,
        required: true,
        validate: {
          validator: function (v) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
          },
          message: (props) => `${props.value} is not a valid email!`,
        },
      },
    });
    const Validation = mongoose.model("Validation", ValidationSchema);

    // Should fail without email
    await expect(async () => {
      await Validation.create({});
    }).rejects.toThrow("email: Path `email` is required");

    // Should fail with invalid email
    await expect(async () => {
      await Validation.create({ email: "invalid" });
    }).rejects.toThrow("invalid is not a valid email");

    // Should succeed with valid email
    const doc = await Validation.create({ email: "test@example.com" });
    expect(doc.email).toBe("test@example.com");
  });

  it("should handle concurrent operations", async () => {
    const ConcurrentSchema = new mongoose.Schema({
      counter: Number,
    });
    const Concurrent = mongoose.model("Concurrent", ConcurrentSchema);

    // Create initial document
    const doc = await Concurrent.create({ counter: 0 });

    // Perform concurrent updates
    const updates = Array(5)
      .fill()
      .map(() =>
        Concurrent.updateOne({ _id: doc._id }, { $inc: { counter: 1 } }),
      );

    await Promise.all(updates);

    const updated = await Concurrent.findById(doc._id);
    expect(updated.counter).toBe(5);
  });
});

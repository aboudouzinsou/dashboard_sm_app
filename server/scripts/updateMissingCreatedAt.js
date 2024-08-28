require("dotenv").config();
const { MongoClient } = require("mongodb");

async function updateMissingCreatedAt() {
  console.log("DATABASE_URL:", process.env.DATABASE_URL);
  const url =
    process.env.DATABASE_URL ||
    "mongodb://localhost:27017/your_default_database";
  const client = new MongoClient(url);

  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db();
    const usersCollection = db.collection("User");

    const result = await usersCollection.updateMany(
      { createdAt: { $exists: false } },
      { $set: { createdAt: new Date() } },
    );

    console.log(`Updated ${result.modifiedCount} records`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
    console.log("Disconnected from MongoDB");
  }
}

updateMissingCreatedAt().catch(console.error);

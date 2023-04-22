import { MongoClient, ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

const connectionString = process.env.MONGO_URL;
const dbName = process.env.MONGO_DB_NAME
const collectionName = process.env.COLLECTION_NAME;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const client = new MongoClient(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    switch (req.method) {
      case "GET":
        const documents = await collection.find().toArray();
        res.status(200).json({ data: documents });
        break;

      case "POST":
        const newDocument = req.body;
        const result = await collection.insertOne(newDocument);
        res.status(201).json({ data: result.ops[0] });
        break;

      case "PUT":
        const { _id, ...updatedData } = req.body;
        const updateResult = await collection.updateOne(
          { _id: new ObjectId(_id) },
          { $set: updatedData }
        );
        res.status(200).json({ data: updateResult.modifiedCount });
        break;

      default:
        res.setHeader("Allow", ["GET", "POST", "PUT"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await client.close();
  }
};

export default handler;
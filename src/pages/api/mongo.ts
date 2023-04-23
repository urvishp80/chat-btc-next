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
        let query1 = {uniqueId:req.query.unique}
        const documents = await collection.find(query1).toArray();
        res.status(200).json({ data: documents });
        break;

      case "POST":
        const newDocument = req.body;
        const result = await collection.insertOne(newDocument);
        res.status(201).json({ data: result.ops[0] });
        break;

      case "PUT":
        let query = {uniqueId:req.query.unique}
        let payload = req.body
        let payload1 = {
          uniqueId : payload.uniqueId,
          question:payload.question,
          answer:payload.answer,
          rating:payload.rating
        }
        const updateResult = await collection.updateOne(
          query,
          { $set: payload1 }
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
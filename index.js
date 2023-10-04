const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

const cors = require("cors");

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.e5zetpl.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const db = client.db("book-catalog");
    const bookCollection = db.collection("book");
    // console.log("DB connect successfully! ");

    // API
    app.get("/books", async (req, res) => {
      const cursor = bookCollection.find({});
      const books = await cursor.toArray();
      res.send({ data: books });
    });
    // .sort({ _id: -1 }).limit(10)

    app.get("/all-books", async (req, res) => {
      const cursor = bookCollection.find({});
      const books = await cursor.toArray();
      res.send({ data: books });
    });

    app.get("/book/:id", async (req, res) => {
      const id = req.params.id;

      const result = await bookCollection.findOne({ _id: new ObjectId(id) });

      res.send(result);
    });
    app.get("/all-book/:id", async (req, res) => {
      const id = req.params.id;

      const result = await bookCollection.findOne({ _id: new ObjectId(id) });

      res.send(result);
    });

    app.put("/edit-book/:id", async (req, res) => {
      const id = req.params.id;
      const { title, author, genre, img, publication_date } = req.body; // Assuming your book has fields: title, author, and genre.

      try {
        const result = await bookCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { title, author, genre, img, publication_date } } // Update the specific fields you want to change
        );

        if (result.modifiedCount === 0) {
          return res
            .status(404)
            .json({ error: "Book not found or no changes made." });
        }

        res.json({ message: "Book updated successfully" });
      } catch (err) {
        console.error("Error while updating book:", err);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    app.post("/book", async (req, res) => {
      const book = req.body;
      const result = await bookCollection.insertOne(book);
      res.send(result);
    });

    app.delete("/book/:id", async (req, res) => {
      const id = req.params.id;
      const result = await bookCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    app.post("/review/:id", async (req, res) => {
      const productId = req.params.id;
      const review = req.body.review;

      // console.log(productId);
      // console.log(review);

      const result = await bookCollection.updateOne(
        { _id: new ObjectId(productId) },
        { $push: { reviews: review } }
      );

      // console.log(result);

      if (result.modifiedCount !== 1) {
        console.error("Product not found or comment not added");
        res.json({ error: "Product not found or comment not added" });
        return;
      }

      // console.log("review added successfully");
      res.json({ message: "review added successfully" });
    });

    app.get("/review/:id", async (req, res) => {
      const productId = req.params.id;

      const result = await bookCollection.findOne(
        { _id: new ObjectId(productId) },
        { projection: { _id: 0, reviews: 1 } }
      );

      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: "REview not found" });
      }
    });
  } finally {
    // Ensures that the client will close when you finish/error
    //   await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello Book Catalog API - books, all-books!");
});

app.listen(port, () => {
  console.log(`Server Running app listening on port ${port}`);
});

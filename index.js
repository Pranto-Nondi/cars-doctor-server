const express = require('express')
const app = express()
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
// cars-doctor
// pU6PVS4EzRCLGMcJ



const uri = "mongodb+srv://cars-doctor:pU6PVS4EzRCLGMcJ@cluster0.1eww0o2.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const serviceSet = client.db('carsDoctor').collection('services');
        const bookingsSet = client.db('allBooking').collection('services');

        // service
        app.get('/allService', async (req, res) => {
            const cursor = serviceSet.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        app.get('/allService/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) };
            const options = {

                projection: { title: 1, price: 1, service_id: 1, img: 1 },
            };
            const result = await serviceSet.findOne(query, options);
            res.send(result);
        })

        // bookings

        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            console.log(booking);
            const result = await bookingsSet.insertOne(booking);
            res.send(result);
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('doctor is running')
})

app.listen(port, () => {
    console.log(`Car Doctor Server is running on port ${port}`)
})
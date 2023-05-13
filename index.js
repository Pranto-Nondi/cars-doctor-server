const express = require('express')
const app = express()
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1eww0o2.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization
    // console.log('22', authorization)
    if (!authorization) {
        return res.status(401).send({ error: true, message: 'Unauthorized access' })
    }
    const token = authorization.split(' ')[1]
    // console.log('27', token)
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ error: true, message: 'unauthorized access' });
        }
        req.decoded = decoded
        next()
    });

}
async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const serviceSet = client.db('carsDoctor').collection('services');
        const bookingsSet = client.db('allBooking').collection('services');
        // jwt
        app.post('/jwt', (req, res) => {
            const user = req.body
            console.log(user)
            const token = jwt.sign(
                user, process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '1h' });
            // console.log(token);
            res.send({ token })

        })


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
        app.get('/bookings', verifyJWT, async (req, res) => {
            const decoded = req.decoded
            console.log('74', decoded)
            if (decoded.email !== req.query.email) {
                return res.status(403).send({ error: 1, message: 'forbidden access' })
            }
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await bookingsSet.find(query).toArray();
            res.send(result)
        })
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            console.log(booking);
            const result = await bookingsSet.insertOne(booking);
            res.send(result);
        });
        app.patch('/bookings/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) };
            const updatedBooking = req.body;
            const updateDoc = {
                $set: {
                    status: updatedBooking.status
                },
            };
            const result = await bookingsSet.updateOne(filter, updateDoc);
            res.send(result)

        })
        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await bookingsSet.deleteOne(query)
            res.send(result)

        })

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
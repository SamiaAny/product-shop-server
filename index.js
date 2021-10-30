const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config()
const app = express();
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
const port = 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wiin6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

console.log('uri',uri);

async function run() {
    try {
        await client.connect();
        const database = client.db("productShop");
        const productCollection = database.collection("products");
        const orderCollection = database.collection("orders");

        //INSTERT DATA USING POST API
        app.post('/products',async (req,res) => {
            // console.log(req.body);
            const doc = req.body;
            const result = await productCollection.insertOne(doc);
            // console.log(result);
            res.json(result);
        })

        //INSERT ORDER  USING POSST API
        app.post('/orders',async (req,res)=> {
            console.log(req.body);
            const data = req.body;
            const result = await orderCollection.insertOne(data);
            console.log(result);
            res.json(result);
        })

        //GET ALL PRODUCTS USING GET API
        app.get('/products', async (req,res)=>{
            const cursor = productCollection.find({});
            const result = await cursor.toArray();
            // console.log(result)
            res.json(result);
        });


        app.get('/orders', async (req,res)=>{
            const cursor = orderCollection.find({});
            const result = await cursor.toArray();
            // console.log(result)
            res.json(result);
        });

        app.get('/orders/:email', async (req,res)=>{
            console.log(req.params.email);
            const userEmail = req.params.email;
            const query = {email:userEmail};
            const cursor = orderCollection.find(query);
            const result = await cursor.toArray();
            console.log(result);
            res.json(result);
        })

        //GET SINGLE API
        app.get('/products/:id',async (req,res)=> {
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const cursor = await productCollection.findOne(query);
            console.log(cursor)
            res.json(cursor);
        });

        //DELETE API FOR DELETE SINGLE PRODUCT
        app.delete('/products/:id',async (req,res) => {
            const id = req.params.id;

            const query = {_id:ObjectId(id)};
            const result = await productCollection.deleteOne(query);
            console.log(result);
            res.send(result);
        });

        //UPDATE API
        app.put('/products/:id',async (req,res)=>{
            const updateProduct = req.body;
            const id = req.params.id;
            const filter = {_id:ObjectId(id)};
            const options = {
                upsert: true
            };
            const updateDoc = {
                $set : {
                    name:updateProduct.name,
                    price: updateProduct.price,
                    category: updateProduct.category
                },
            }

            const result = await productCollection.updateOne(filter,updateDoc,options);
            console.log(result);
            res.json(result);
        })
    }
    finally {
        //await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req,res) => {
    res.send('respond is ok');
});

app.listen(port, () => {
    console.log('listen to port',port);
})

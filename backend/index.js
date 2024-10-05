import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv'
import connectToMongo from './config.js';
import billRoute from './routes/billRoutes.js'
import adminRoute from './routes/adminRoutes.js'
dotenv.config();
const app = express(); 
app.use(express.json()); // use for json req
app.use(express.urlencoded({extended:true}));
app.use(cors());
connectToMongo();






const port = process.env.PORT || 8001;


app.use('/api/v1/bills/', billRoute)
app.use('/api/v1/admin/', adminRoute)

app.listen(port,()=>{
    console.log(`Your App Is Running On Port ${port}`);
    
})



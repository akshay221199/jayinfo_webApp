import mongoose from "mongoose";

const {Schema} = mongoose;

const AdminSchema= new Schema({
    name:{
        type:String,
        require:true
    },
    contact:{
        type:Number, 
       require:true
    },

    email:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require:true
    },
    date:{
        type:Date,
        default:Date.now
    }
});

export default mongoose.model('Admin', AdminSchema);
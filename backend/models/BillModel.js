import mongoose from "mongoose";
import { Schema } from "mongoose";

const BillSchema = new Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminModel',
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    customerPhone: {
        type: Number,
        required: true
    },
    customerEmail: {
        type: String,
        required: false
    },
    customerAddress: {
        type: String,
        required: false
    },
    BillDate: {
        type: Date,
    },
    products: [{
        productName: { type: String, required: true },
        productQuantity: { type: Number, required: true },
        productDescription:{ type: String, required: false },
        productPrice: { type: Number, required: true },
        taxAmount: { type: Number, required: false } // For tax amount
    }],
    totalAmounts: {
        type: Number,
        required: false
    },
    otherDetails: {
        type: String,
        required: false
    },
    status: {
        type: String,
        required: false
    },
    Date: {
        type: Date,
        default: Date.now
    }
});


export default mongoose.model('Bill', BillSchema)
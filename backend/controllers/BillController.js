import BillModel from '../models/BillModel.js';
import { asyncHandler } from '../utility/AsyncHandler.js'
import { ApiError } from '../utility/ApiErrors.js'
import {ApiResponse} from '../utility/ApiResponse.js'



// Create a new bill with the logged-in admin's ID
const createBill = asyncHandler(async (req, res) => {
  const { customerName, customerPhone, customerEmail, customerAddress, 
    BillDate, products, status, otherDetails } = req.body;
  const adminId = req.admin.id; 
  
  // Calculate total amount and tax for the products
  const updatedProducts = products.map(product => {
    const productTotal = product.productPrice * product.productQuantity;
    const taxAmount = productTotal * 0.18; // 18% tax
    return {
      ...product,
      taxAmount,
    };
  });



  // const totalAmount = updatedProducts.reduce((sum, product) => {
  //   return sum + (product.productPrice * product.productQuantity) + product.taxAmount;
  // }, 0);

  

  const bill = await BillModel.create({
    adminId,
    customerName,
    customerPhone,
    customerEmail,
    customerAddress,
    BillDate,
    products: updatedProducts,
    // totalAmounts: totalAmount,
    status,
    otherDetails
  });

  if (!bill) {
    throw new ApiError(400, 'Bill creation failed');
  }

  return res.status(201).json({ success: true, bill });
});

// Get all bills of the logged-in admin
const getBills = asyncHandler(async (req, res) => {
  const { customerName, paymentType, sortBy = 'createdAt', order = 'desc' } = req.query;

  const adminId = req.admin.id; // Get the logged-in admin's ID

  // Create filter object
  const filter = { adminId }; // Only get bills created by the logged-in admin
  if (customerName) {
    filter.customerName = { $regex: customerName, $options: 'i' }; // Case insensitive search
  }
  if (paymentType) {
    filter.paymentType = paymentType; // Exact match for payment type
  }

  // Create sorting object
  const sort = {};
  sort[sortBy] = order === 'desc' ? -1 : 1; // Ascending or descending order

  const bills = await BillModel.find(filter).sort(sort);

  if (!bills.length) {
    throw new ApiError(404, 'No bills found');
  }

  return res.status(200).json(
    new ApiResponse(200, { bills }, "Bills fetched successfully")
  );
});

// Update a bill by the logged-in admin (only if they created the bill)
const updateBill = asyncHandler(async (req, res) => {
  const { id } = req.params; // Get the bill ID from URL params
  console.log('product Id',id);
  
  const adminId = req.admin.id; // Get the logged-in admin's ID
  console.log('adminId', adminId);
  
  const bill = await BillModel.findById(id);
  console.log('bill',bill);
  if (!bill) {
    throw new ApiError(404, 'Bill not found');
  }

  // Check if the logged-in admin is the owner of the bill
  if (bill.adminId.toString() !== adminId) {
    throw new ApiError(403, 'You are not authorized to update this bill');
  }

  const updatedBill = await BillModel.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  return res.status(200).json(
    new ApiResponse(200, { updatedBill }, "Bill updated successfully")
  );
});

// Delete a bill by the logged-in admin (only if they created the bill)
const deleteBill = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const adminId = req.admin.id; // Get the logged-in admin's ID

  const bill = await BillModel.findById(id);
  if (!bill) {
    throw new ApiError(404, 'Bill not found');
  }

  // Check if the logged-in admin is the owner of the bill
  if (bill.adminId.toString() !== adminId) {
    throw new ApiError(403, 'You are not authorized to delete this bill');
  }

  await BillModel.findByIdAndDelete(id);

  return res.status(200).json(
    new ApiResponse(200, null, "Bill deleted successfully")
  );
});


const getBillById = asyncHandler(async (req, res) => {
  const { id } = req.params; // Get the bill ID from URL params
  const adminId = req.admin.id; // Get the logged-in admin's ID

  // Fetch the bill by its ID
  const bill = await BillModel.findById(id);
  
  // Check if the bill exists
  if (!bill) {
    throw new ApiError(404, 'Bill not found'); // If not found, throw an error
  }

  // Check if the logged-in admin is the owner of the bill
  if (bill.adminId.toString() !== adminId) {
    throw new ApiError(403, 'You are not authorized to access this bill');
  }

  // Respond with the bill data
  return res.status(200).json(
    new ApiResponse(200, { bill }, "Bill retrieved successfully")
  );
});



export { createBill, getBills, updateBill, deleteBill , getBillById};

import { asyncHandler } from '../utility/AsyncHandler.js'
import { ApiError } from '../utility/ApiErrors.js'
import JWT from 'jsonwebtoken';
import Admin from '../models/AdminModel.js'
import bcryptjs from 'bcryptjs';
import {ApiResponse} from '../utility/ApiResponse.js'

const JWT_SECRET = process.env.JWT_SECRET;

const registerAdmin = asyncHandler(async (req, res) => {
    const { name, contact, email, password } = req.body;

    if (
        [name, email, String(contact), password].some(
            (field) => field.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const existedAdmin = await Admin.findOne({
        $or: [{ contact }, { email }]
    });

    if (existedAdmin) {
        throw new ApiError(409, "Admin with email or contact already exists");
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const admin = await Admin.create({
        name,
        contact,
        email,
        password: hashedPassword,
    });

    if (!admin) {
        throw new ApiError(500, "Something went wrong while registering the Admin");
    }

    const adminToken = { id: admin._id };
    if (!JWT_SECRET) {
        throw new ApiError(500, "JWT Secret is not set");
    }
    const authtoken = JWT.sign(adminToken, JWT_SECRET, { expiresIn: '1h' });

    // Set token as an HTTP-only cookie
    res.cookie('adminToken', authtoken, {
        httpOnly: true, // Prevent access to cookie via JavaScript
        secure: process.env.NODE_ENV === 'production', // Secure flag for production environment
        maxAge: 3600000, // 1 hour
    });

    console.log("Admin registered Successfully", admin);
    return res.status(201).json(
        new ApiResponse(201, { admin, authtoken }, "Admin registered successfully")
    );
});

const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const adminCheck = await Admin.findOne({ email });
    if (!adminCheck) {
        throw new ApiError(404, "Admin not found");
    }

    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    const passCheck = await bcryptjs.compare(password, adminCheck.password);
    if (!passCheck) {
        throw new ApiError(401, "Invalid password");
    }

    const logData = {
        admin: {
            id: adminCheck._id,
        }
    };

    if (!JWT_SECRET) {
        throw new ApiError(500, "JWT Secret is not set");
    }
    const authtoken = JWT.sign(logData, JWT_SECRET);

    // Set token as an HTTP-only cookie
    res.cookie('adminToken', authtoken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000, // 1 hour
    });

    return res.json({ authtoken, adminId: adminCheck._id });
});


const getAdmin = asyncHandler(async (req, res) => {
    try {
        const adminDetails = await Admin.findById(req.admin.id).select('-password');
        
        if (!adminDetails) {
            return res.status(404).json({ error: 'Admin Not Found' });
        }
        res.json(adminDetails);
    } catch (error) {
        console.error('Error fetching Admin details:', error);
        res.status(500).send("Server error");
    }
});

const updateAdmin = asyncHandler(async (req, res) => {
    try {
        // Destructure fields from request body
        const { name, contact, email } = req.body;
        const updatedAdmin = {};

        // Add fields to update if provided
        if (name) updatedAdmin.name = name;
        if (contact) updatedAdmin.contact = contact;
        if (email) updatedAdmin.email = email;

       
        // Find Admin by ID
        let admin = await Admin.findById(req.params.id);
        // console.log('req id',req.params.id);
        // console.log('admin id',admin._id);
        
        if (!admin) {
            return res.status(404).json({ error: 'admin not found' });
        }

        // Check if the Admin making the request is the same as the one being updated
        if (admin._id.toString() !== req.params.id.toString()) {
            return res.status(403).json({ error: 'Not authorized to update this profile' });
        }

        // Update the Admin
        admin = await Admin.findByIdAndUpdate(req.params.id, { $set: updatedAdmin }, { new: true });

        // Return updated admin excluding password
        const { password, ...adminWithoutPassword } = admin.toObject();
        res.json({ success: true, data: adminWithoutPassword });
    } catch (error) {
        console.error('Error updating admin:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


const deleteAdmin = asyncHandler(async (req, res) => {
    try{       

        // Find Admin by ID
        let admin = await Admin.findById(req.params.id);
        if(!admin){
            return res.status(404).json({error: 'Admin not found'});
        }
        if (admin._id.toString() !== req.params.id.toString()) {
            return res.status(403).json({ error: 'Not authorized to update this profile' });
        }

        const deleteAdmin = await Admin.findByIdAndDelete(req.params.id);
        res.json({message: 'Admin deleted successfully'});
        console.log('admin deleted account');
    }
    catch{
        throw new ApiError(400, 'Server Issue');
    }
});




export {registerAdmin, loginAdmin, getAdmin, updateAdmin, deleteAdmin};
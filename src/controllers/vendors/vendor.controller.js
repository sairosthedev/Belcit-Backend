const Vendor = require('./../../models/vendor.model');
const { ValidationError } = require('./../../utils/errors');
const { body } = require('express-validator');
const validate = require('./../../middleware/validate.middleware');
const uploadImageController = require('./uploadImage.controller');

// Validation middleware 
exports.registerValidation = [
  body('first_name').trim().notEmpty().withMessage('First name is required'),
  body('last_name').trim().notEmpty().withMessage('Last name is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('proof_of_residence').isBoolean().withMessage('Proof of residence is required'),
  body('id_document').isBoolean().withMessage('ID document is required'),
  body('id_number').optional().trim(),
  body('gender').optional().trim(),
  body('address_line1').optional().trim(),
  body('address_line2').optional().trim(),
  body('city').optional().trim(),
  body('dob').optional().isISO8601().toDate().withMessage('Date of birth must be a valid date'),
  body('old_stall_number').optional().trim(),
  body('picture').optional().trim(),
  body('category').isIn([
    'electrical',
    'dryGoods',
    'fruitsAndVeggies',
    'clothing',
    'packagingMaterials',
    'others'
  ]).withMessage('Valid category is required'),
  validate
];

exports.verifyValidation = [
  body('verification_status').isIn(['verified', 'rejected']).withMessage('Invalid verification status'),
  body('verificationNotes').optional().trim().notEmpty().withMessage('Verification notes cannot be empty if provided'),
  validate
];

exports.register = async (req, res, next) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      proof_of_residence,
      id_document,
      id_number,
      gender,
      address_line1,
      address_line2,
      city,
      dob,
      old_stall_number,
      picture,
      category
    } = req.body;

    const existingVendor = await Vendor.findOne({ id_number });
    if (existingVendor) {
      throw new ValidationError('Vendor with this ID number already exists');
    }

    const vendor = new Vendor({
      first_name,
      last_name,
      email,
      phone,
      proof_of_residence,
      id_document,
      id_number,
      gender,
      address_line1,
      address_line2,
      city,
      dob: dob ? new Date(dob) : undefined,
      old_stall_number,
      picture,
      category,
      verification_status: 'pending'
    });

    await vendor.save();
    res.status(201).json({ 
      message: 'Vendor registered successfully',
      vendorId: vendor._id 
    });
  } catch (error) {
    next(error);
  }
};

exports.verify = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    const { 
      verification_status,
      first_name,
      last_name,
      email,
      phone,
      proof_of_residence,
      id_document,
      verificationNotes,
      id_number,
      gender,
      address_line1,
      address_line2,
      city,
      dob,
      old_stall_number,
      picture,
      category
    } = req.body;

    if (!['verified', 'rejected'].includes(verification_status)) {
      throw new ValidationError('Invalid verification status value');
    }

    const existingVendor = await Vendor.findOne({ id_number });
    if (existingVendor && existingVendor._id.toString() !== vendorId) {
      throw new ValidationError('Vendor with this ID number already exists');
    }

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      throw new ValidationError('Vendor not found');
    }

    // Check if vendor is already verified or rejected
    if (['verified', 'rejected'].includes(vendor.verification_status)) {
      throw new ValidationError(`Vendor has already been ${vendor.verification_status}`);
    }

    // Update information
    if (first_name) vendor.first_name = first_name;
    if (last_name) vendor.last_name = last_name;
    if (email) vendor.email = email;
    if (phone) vendor.phone = phone;
    if (proof_of_residence !== undefined) vendor.proof_of_residence = proof_of_residence;
    if (id_document !== undefined) vendor.id_document = id_document;
    if (id_number) vendor.id_number = id_number;
    if (gender) vendor.gender = gender;
    if (address_line1) vendor.address_line1 = address_line1;
    if (address_line2) vendor.address_line2 = address_line2;
    if (city) vendor.city = city;
    if (dob) vendor.dob = new Date(dob);
    if (old_stall_number) vendor.old_stall_number = old_stall_number;
    if (picture) vendor.picture = picture;
    if (category) vendor.category = category;

    // Verification notes
    vendor.verificationNotes = verificationNotes;
    vendor.verification_status = verification_status;
    vendor.verified_by = req.user.userId;
    vendor.verified_at = new Date();

    // Verify vendor using uploadImage.controller.js
    if (picture) {
      const uploadResult = await uploadImageController.uploadFile(picture, 'vendors', vendor._id.toString());
      vendor.picture = uploadResult;
    }

    await vendor.save();

    res.json({ 
      message: `Vendor ${verification_status} successfully`,
      vendor: {
        id: vendor._id,
        first_name: vendor.first_name,
        last_name: vendor.last_name,
        verification_status: vendor.verification_status,
        verificationNotes: vendor.verificationNotes,
        verifiedAt: vendor.verified_at
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getVendors = async (req, res, next) => {
  try {
    const { verification_status } = req.query;
    const query = verification_status ? { verification_status } : {};
    
    const vendors = await Vendor.find(query)
      .select('-proof_of_residence -id_document')
      .populate('verified_by', 'username');
    res.json(vendors);
  } catch (error) {
    next(error);
  }
};

exports.updateImage = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    const { picture } = req.body;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      throw new ValidationError('Vendor not found');
    }

    // Upload the new image
    const uploadResult = await uploadImageController.uploadFile(picture, 'vendors', vendor._id.toString());
    vendor.picture = uploadResult;

    await vendor.save();

    res.json({ 
      message: 'Vendor image updated successfully',
      vendor: {
        id: vendor._id,
        picture: vendor.picture
      }
    });
  } catch (error) {
    next(error);
  }
};
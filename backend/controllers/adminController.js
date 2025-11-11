const Admin = require('../models/Admin');
const Institute = require('../models/Institute'); // Example model for approvals
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Replace with your actual secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key'; 

// --- Login Controller Function ---
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = { admin: { id: admin.id, role: admin.role } };
    
    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: admin.id, name: admin.name, role: admin.role } });
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// --- Institute Approvals Controller Function ---
exports.getPendingApprovals = async (req, res) => {
  try {
    // Assuming 'Institute' model has a 'status' field
    const pendingInstitutes = await Institute.find({ status: 'pending' }).select('-password');
    res.json(pendingInstitutes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// --- Approve/Reject Institute Controller Function ---
exports.updateApprovalStatus = async (req, res) => {
  try {
    const instituteId = req.params.id;
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ msg: 'Invalid status provided' });
    }

    const institute = await Institute.findByIdAndUpdate(
        instituteId,
        { status: status },
        { new: true } // Return the updated document
    );

    if (!institute) {
        return res.status(404).json({ msg: 'Institute not found' });
    }

    res.json(institute);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
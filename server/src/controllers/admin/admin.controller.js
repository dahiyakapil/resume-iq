// __define-ocg__ Admin Controller
import User from "../../models/user.model.js";
import Resume from "../../models/ResumeReport.model.js";


/**
 * ✅ USER CRUD
 */

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.status(200).json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch users", error: error.message });
  }
};

// Get single user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch user", error: error.message });
  }
};

// Update user (by Admin)
export const updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ success: false, message: "User not found" });

    return res.status(200).json({ success: true, message: "User updated successfully", user: updatedUser });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update user", error: error.message });
  }
};

// Delete user
export const deleteUserByAdmin = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    return res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};


/**
 * ✅ RESUME CRUD
 */

// Get all resumes
export const getAllResumes = async (req, res) => {
  try {
    const resumes = await Resume.find().populate("user", "firstName lastName email");
    return res.status(200).json({ success: true, resumes });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch resumes", error: error.message });
  }
};

// Get single resume
export const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id).populate("user", "firstName lastName email");
    if (!resume) return res.status(404).json({ success: false, message: "Resume not found" });

    return res.status(200).json({ success: true, resume });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch resume", error: error.message });
  }
};

// Update resume (admin might edit feedback/score if needed)
export const updateResume = async (req, res) => {
  try {
    const updatedResume = await Resume.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("user", "firstName lastName email");

    if (!updatedResume) return res.status(404).json({ success: false, message: "Resume not found" });

    return res.status(200).json({ success: true, message: "Resume updated successfully", resume: updatedResume });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update resume", error: error.message });
  }
};

// Delete resume
export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findByIdAndDelete(req.params.id);
    if (!resume) return res.status(404).json({ success: false, message: "Resume not found" });

    return res.status(200).json({ success: true, message: "Resume deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete resume", error: error.message });
  }
};



export const getNewUsers = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newUsers = await User.find({ createdAt: { $gte: sevenDaysAgo } });

    res.status(200).json({ count: newUsers.length, users: newUsers });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch new users" });
  }
};



export const getNumberOfResumesAnalyzed = async (req, res) => {
  try {
    const resumeCounts = await Resume.aggregate([
      {
        $group: {
          _id: { 
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Convert month numbers to names
    const months = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ];

    const formatted = resumeCounts.map(item => ({
      month: months[item._id.month - 1],
      year: item._id.year,
      count: item.count
    }));

    return res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

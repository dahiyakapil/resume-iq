import express from "express";
import { 
  getAllUsers,
  getUserById,
  updateUser,
  deleteUserByAdmin,
  getAllResumes,
  getResumeById,
  updateResume,
  deleteResume,
  getNewUsers,
  getNumberOfResumesAnalyzed
} from "../controllers/admin/admin.controller.js";

import { userAuth, adminAuth } from "../middlewares/auth.middleware.js";
import { deleteReport, getReportById, getReports } from "../controllers/resume.controller.js";


const adminRouter = express.Router();



adminRouter.use(userAuth, adminAuth);

// --- User CRUD ---
adminRouter.get("/users", getAllUsers);                 
adminRouter.get("/users/:id", getUserById);           
adminRouter.put("/users/:id", updateUser);            
adminRouter.delete("/users/:id", deleteUserByAdmin);  

// --- Resume CRUD ---
adminRouter.get("/resumes", getAllResumes);           
adminRouter.get("/resumes/:id", getResumeById);      
adminRouter.put("/resumes/:id", updateResume);       
adminRouter.delete("/resumes/:id", deleteResume);    

adminRouter.get("/reports", getReports)
adminRouter.get("/reports/:id", getReportById)
adminRouter.delete("/report/:id", deleteReport)



// Analytics
adminRouter.get("/new-users", getNewUsers)
adminRouter.get("/resumes-analyzed", getNumberOfResumesAnalyzed)


export default adminRouter;

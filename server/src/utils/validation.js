import validator from "validator"


export const validateSignupData = (req) => {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName) {
        throw new Error("First Name is required")
    } else if(firstName.length<4 || firstName.length>50) {
        throw new Error("First Name length should be between 4 to 50")
    }
     else if (!validator.isEmail(email)) {
        throw new Error("EMail is not valid");
    }
}



export const validateProfileEditData = (req) => {
    try {
        // Allowed fields for editing (No password here!)
        const allowedEditFields = ["firstName", "lastName"];

        // Check if ALL fields are in allowedEditFields
        const isEditAllowed = Object.keys(req.body).every((field) =>
            allowedEditFields.includes(field)
        );

        return isEditAllowed;
    } catch (error) {
        console.error("Validation Error: ", error.message);
    }
};
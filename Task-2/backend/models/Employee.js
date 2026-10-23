
const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Employee name is required"],
            trim: true
        },

        department: {
            type: String,
            required: [true, "Department is required"],
            trim: true
        },

        role: {
            type: String,
            required: [true, "Employee role is required"],
            trim: true
        },

        salary: {
            type: Number,
            required: [true, "Salary is required"],
            min: [0, "Salary cannot be negative"]
        },

        joinDate: {
            type: Date,
            required: [true, "Joining date is required"]
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Employee", employeeSchema);

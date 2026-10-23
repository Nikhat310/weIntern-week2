const express = require("express");
const mongoose = require("mongoose");
const Employee = require("../models/Employee");

const router = express.Router();

// Helper: check whether an ID is valid
function isValidId(id) {
    return mongoose.isValidObjectId(id);
}

// Escape special characters in search text
function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}


// ======================================
// 1. CREATE — Add a new employee
// POST /api/employees
// ======================================

router.post("/", async (req, res) => {
    try {
        const { name, department, role, salary, joinDate } = req.body;

        // Basic validation
        if (
            !name?.trim() ||
            !department?.trim() ||
            !role?.trim() ||
            salary === undefined ||
            salary === "" ||
            joinDate === undefined ||
            joinDate === ""
        ) {
            return res.status(400).json({
                message: "Please provide all employee fields."
            });
        }

        const employee = await Employee.create({
            name,
            department,
            role,
            salary,
            joinDate
        });

        res.status(201).json({
            message: "Employee added successfully!",
            employee
        });

    } catch (error) {
        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid employee data.",
                error: error.message
            });
        }

        res.status(500).json({
            message: "Failed to add employee."
        });
    }
});


// ======================================
// 2. READ — Get all employees
// GET /api/employees
// Supports search and sorting
// ======================================

router.get("/", async (req, res) => {
    try {
        const { search = "", sortBy = "createdAt", order = "desc" } = req.query;

        // Only allow sorting by these fields
        const allowedSortFields = [
            "name",
            "department",
            "role",
            "salary",
            "joinDate",
            "createdAt"
        ];

        const safeSortBy = allowedSortFields.includes(sortBy)
            ? sortBy
            : "createdAt";

        const safeOrder = order === "asc" ? 1 : -1;

        const filter = {};

        if (search.trim()) {
            const searchPattern = new RegExp(
                escapeRegex(search.trim()),
                "i"
            );

            filter.$or = [
                { name: searchPattern },
                { department: searchPattern },
                { role: searchPattern }
            ];
        }

        const employees = await Employee.find(filter)
            .sort({ [safeSortBy]: safeOrder });

        res.status(200).json({
            count: employees.length,
            employees
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch employees."
        });
    }
});


// ======================================
// 3. READ — Get one employee by ID
// GET /api/employees/:id
// ======================================

router.get("/:id", async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid employee ID."
            });
        }

        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found."
            });
        }

        res.status(200).json({ employee });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch employee."
        });
    }
});


// ======================================
// 4. UPDATE — Edit an employee
// PUT /api/employees/:id
// ======================================

router.put("/:id", async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid employee ID."
            });
        }

        const allowedFields = [
            "name",
            "department",
            "role",
            "salary",
            "joinDate"
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: "Provide at least one field to update."
            });
        }

        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            updates,
            {
                new: true,
                runValidators: true
            }
        );

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found."
            });
        }

        res.status(200).json({
            message: "Employee updated successfully!",
            employee
        });

    } catch (error) {
        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid employee data.",
                error: error.message
            });
        }

        res.status(500).json({
            message: "Failed to update employee."
        });
    }
});


// ======================================
// 5. DELETE — Remove an employee
// DELETE /api/employees/:id
// ======================================

router.delete("/:id", async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid employee ID."
            });
        }

        const employee = await Employee.findByIdAndDelete(
            req.params.id
        );

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found."
            });
        }

        res.status(200).json({
            message: "Employee deleted successfully!",
            employee
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete employee."
        });
    }
});

module.exports = router;
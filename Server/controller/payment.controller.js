import axios from "axios";
import Purchase from "../models/purchase.model.js";
import Template from "../models/template.model.js";
import Activity from "../models/activity.model.js";
import Project from "../models/project.model.js";
import Task from "../models/task.model.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
const KHALTI_BASE_URL = process.env.KHALTI_BASE_URL;
const FRONTEND_URL = process.env.FRONTEND_URL;

// Helper to clone template into project (Extracted from template controller)
const cloneTemplateToProject = async (templateId, userId, purchaseId) => {
    const template = await Template.findById(templateId);
    if (!template) throw new Error("Template not found");

    // 1. Create a new Project
    const newProject = await Project.create({
        title: template.title,
        description: template.description,
        owner: userId,
        icon: template.structure.projectSettings?.icon || "🚀",
        coverImage: template.structure.projectSettings?.coverImage,
        members: [{ user: userId, role: "owner", isPinned: false }]
    });

    // 2. Clone Tasks
    const sourceTasks = template.structure.tasks || [];
    const oldIdToNewIdMap = {};

    sourceTasks.forEach(task => {
        if (task._id) {
            oldIdToNewIdMap[task._id] = new mongoose.Types.ObjectId();
        }
    });

    const tasksToInsert = sourceTasks.map(sourceTask => {
        const newId = sourceTask._id && oldIdToNewIdMap[sourceTask._id]
            ? oldIdToNewIdMap[sourceTask._id]
            : new mongoose.Types.ObjectId();

        let newParentId = null;
        if (sourceTask.parentId && oldIdToNewIdMap[sourceTask.parentId]) {
            newParentId = oldIdToNewIdMap[sourceTask.parentId];
        }

        return {
            _id: newId,
            title: sourceTask.title,
            description: sourceTask.description,
            status: sourceTask.status || "todo",
            priority: sourceTask.priority || "medium",
            type: sourceTask.type || "task",
            content: sourceTask.content,
            icon: sourceTask.icon,
            coverImage: sourceTask.coverImage,
            assignedTo: userId,
            project: newProject._id,
            parentId: newParentId,
            dueDate: null
        };
    });

    if (tasksToInsert.length > 0) {
        await Task.insertMany(tasksToInsert);
    }

    // 3. Mark template as purchased
    if (!template.purchasedBy.includes(userId)) {
        template.purchasedBy.push(userId);
        await template.save();
    }

    return newProject;
};

// 1. Initialize Khalti Payment
export const initializeKhalti = async (req, res) => {
    try {
        const { templateId } = req.body;
        const template = await Template.findById(templateId);

        if (!template) {
            return res.status(404).json({ message: "Template not found" });
        }

        // Check if already purchased
        const existingPurchase = await Purchase.findOne({
            user: req.user._id,
            template: templateId,
            status: "COMPLETED"
        });

        if (existingPurchase) {
            return res.status(400).json({ message: "You already own this template" });
        }

        const transactionUuid = `KHP-${Date.now()}-${req.user._id}`;
        const amountInPaisa = template.price * 100; // Khalti expects amount in Paisa

        // Create Pending Purchase
        const purchase = await Purchase.create({
            user: req.user._id,
            template: templateId,
            amount: template.price,
            transactionUuid: transactionUuid,
            status: "PENDING",
            paymentMethod: "KHALTI"
        });

        const payload = {
            return_url: `${FRONTEND_URL}/payment/callback`,
            website_url: FRONTEND_URL,
            amount: amountInPaisa || 1000, // Min amount 10rs if free just for testing? No, use template price
            purchase_order_id: purchase._id.toString(),
            purchase_order_name: template.title,
            customer_info: {
                name: req.user.name,
                email: req.user.email,
            }
        };

        const response = await axios.post(`${KHALTI_BASE_URL}/epayment/initiate/`, payload, {
            headers: {
                Authorization: `Key ${KHALTI_SECRET_KEY}`,
                "Content-Type": "application/json"
            }
        });

        // Update purchase with pidx
        purchase.pidx = response.data.pidx;
        await purchase.save();

        res.json({
            payment_url: response.data.payment_url,
            purchaseId: purchase._id
        });

    } catch (err) {
        console.error("Khalti Init Error:", err.response?.data || err.message);
        res.status(500).json({ message: "Failed to initialize payment", error: err.message });
    }
};

// 2. Verify Khalti Payment
export const verifyKhalti = async (req, res) => {
    try {
        const { pidx } = req.body;

        const response = await axios.post(`${KHALTI_BASE_URL}/epayment/lookup/`, { pidx }, {
            headers: {
                Authorization: `Key ${KHALTI_SECRET_KEY}`,
                "Content-Type": "application/json"
            }
        });

        const data = response.data;

        if (data.status === "Completed") {
            const purchase = await Purchase.findOne({ pidx });

            if (!purchase) {
                return res.status(404).json({ message: "Purchase record not found" });
            }

            if (purchase.status === "COMPLETED") {
                return res.json({ message: "Payment already verified", success: true });
            }

            // Update Purchase status
            purchase.status = "COMPLETED";
            purchase.paymentId = data.transaction_id;
            await purchase.save();

            // Clone Template to Project
            const project = await cloneTemplateToProject(purchase.template, purchase.user, purchase._id);

            // Log Activity
            await Activity.create({
                user: purchase.user,
                actionType: "template_purchase",
                metadata: {
                    templateId: purchase.template,
                    purchaseId: purchase._id,
                    newProjectId: project._id,
                    paymentMethod: "KHALTI"
                },
                ipAddress: req.ip
            });

            return res.json({
                message: "Payment successful!",
                success: true,
                projectId: project._id
            });
        }

        res.status(400).json({ message: "Payment not completed", status: data.status });

    } catch (err) {
        console.error("Khalti Verify Error:", err.response?.data || err.message);
        res.status(500).json({ message: "Verification failed", error: err.message });
    }
};

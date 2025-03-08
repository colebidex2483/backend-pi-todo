import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String }, // For Task Categorization
    dueDate: { type: Date },
    priority: { type: String, enum: ['low', 'medium', 'high'] },
    tags: [{ type: String }] ,
    isRecurring: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: String, required: true },
});

const Task = mongoose.model('Task', TaskSchema);
export default Task;

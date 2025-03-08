import Task from "../models/Task.js";

export const getTasks = async (req, res) => {
  try {
    if (!req.session.currentUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = req.session.currentUser.uid; // Get the logged-in user's UID

    // Fetch only tasks created by this user
    const tasks = await Task.find({ createdBy: userId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTaskById = async (req, res) => {
    try {
      if (!req.session.currentUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }
  
      const { id } = req.params;
      const userId = req.session.currentUser.uid;
  
      // Find task and ensure it belongs to the logged-in user
      const task = await Task.findOne({ _id: id, createdBy: userId });
  
      if (!task) return res.status(404).json({ error: "Task not found or unauthorized" });
  
      res.status(200).json(task);
    } catch (err) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

export const addTask = async (req, res) => {
  try {
    if (!req.session.currentUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const newTask = new Task({
      ...req.body,
      createdBy: req.session.currentUser.uid, // Link task to logged-in user
    });

    await newTask.save();
    res
      .status(201)
      .json({ message: "Task created successfully", task: newTask });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateTask = async (req, res) => {
    try {
      if (!req.session.currentUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }
  
      const { id } = req.params;
      const userId = req.session.currentUser.uid;
  
      // Ensure task belongs to the user before updating
      const updatedTask = await Task.findOneAndUpdate(
        { _id: id, createdBy: userId },
        req.body,
        { new: true }
      );
  
      if (!updatedTask) return res.status(404).json({ error: "Task not found or unauthorized" });
  
      res.json(updatedTask);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };

export const deleteTask = async (req, res) => {
    try {
      if (!req.session.currentUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }
  
      const { id } = req.params;
      const userId = req.session.currentUser.uid;
  
      // Ensure task belongs to the user before deleting
      const task = await Task.findOneAndDelete({ _id: id, createdBy: userId });
  
      if (!task) return res.status(404).json({ error: "Task not found or unauthorized" });
  
      res.json({ message: "Task deleted successfully" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };

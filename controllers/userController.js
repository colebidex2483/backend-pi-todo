import User from "../models/User.js";
import platformAPIClient from "../services/platformAPIClient.js";

export const signInUser = async (req, res) => {
    const auth = req.body;

    try {
        const me = await platformAPIClient.get(`/v2/me`, {
            headers: { Authorization: `Bearer ${auth.accessToken}` },
        });

        if (!me.data) {
            return res.status(401).json({ error: "Invalid access token" });
        }
    } catch (err) {
        console.error("Auth Error:", err.message);
        return res.status(401).json({ error: "Invalid access token" });
    }

    try {
        let currentUser = await User.findOne({ uid: auth.user.uid });

        if (currentUser) {
            await User.updateOne(
                { _id: currentUser._id },
                { $set: { accessToken: auth.accessToken } }
            );
            currentUser.accessToken = auth.accessToken; // Update in session
        } else {
            currentUser = await User.create({
                username: auth.user.username,
                uid: auth.user.uid,
                roles: auth.user.roles,
                accessToken: auth.accessToken,
            });
        }

        if (!req.session) {
            return res.status(500).json({ error: "Session not initialized" });
        }

        req.session.currentUser = currentUser;

        req.session.save((err) => {
            if (err) {
                console.error("Session Save Error:", err);
                return res.status(500).json({ error: "Failed to save session" });
            }
            res.status(200).json({ message: "User signed in", user: currentUser });
        });
    } catch (err) {
        console.error("Database Error:", err.message);
        return res.status(500).json({ error: "Database error" });
    }
};

export const signOutUser = async (req, res) => {
    if (!req.session) {
        return res.status(500).json({ error: "Session not initialized" });
    }

    req.session.destroy((err) => {
        if (err) {
            console.error("Session Destroy Error:", err);
            return res.status(500).json({ error: "Failed to sign out" });
        }
        res.status(200).json({ message: "User signed out" });
    });
};

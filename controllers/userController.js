import User from "../models/User.js";
import platformAPIClient from "../services/platformAPIClient.js";

export const signInUser = async (req, res) => {
    const auth = req.body;
    try {
        const me = await platformAPIClient.get(`/v2/me`, {
            headers: { Authorization: `Bearer ${auth.accessToken}` },
        });
        // console.log(me);
    } catch (err) {
        console.log(err);
        return res.status(401).json({ error: "Invalid access token" });
    }

    let currentUser = await User.findOne({ uid: auth.user.uid });

    if (currentUser) {
        await User.updateOne(
            { _id: currentUser._id },
            { $set: { accessToken: auth.accessToken } }
        );
    } else {
        currentUser = await User.create({
            username: auth.user.username,
            uid: auth.user.uid,
            roles: auth.user.roles,
            accessToken: auth.accessToken,
        });
    }

    req.session.currentUser = currentUser;
    // console.log(req.session.currentUser)
    req.session.save((err) => {
        if (err) {
            console.error("Error saving session:", err);
            return res.status(500).json({ error: "Failed to save session" });
        }
        return res.status(200).json({ message: "User signed in", user: currentUser });
    });
};

export const signOutUser = async (req, res) => {
    req.session.currentUser = null;
    return res.status(200).json({ message: "User signed out" });
};

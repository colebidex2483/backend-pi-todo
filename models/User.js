import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: String,
    uid: String,
    roles: [String],
    accessToken: String,
});

const User = mongoose.model('User', UserSchema);
export default User;

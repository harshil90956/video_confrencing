import mongoose from 'mongoose';


// Define the User schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  token: { type: String }
  });

const User = mongoose.model('User', userSchema);
export default User;
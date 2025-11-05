import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
    },
    image: {
      type: String,
    },
    proRefinesRemaining: {
      type: Number,
      default: 5,
    },
    basicRefinesRemaining: {
      type: Number,
      default: 25,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash password if modified
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password for authentication
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Export the model, handling Mongoose models cache to prevent re-compilation
export default mongoose.models.User || mongoose.model('User', UserSchema);

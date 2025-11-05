import mongoose from 'mongoose';

const { Schema } = mongoose;

const PromptSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title for the prompt'],
      trim: true,
    },
    promptText: {
      type: String,
      required: [true, 'Please provide the prompt text'],
      trim: true,
    },
    parentSet: {
      type: Schema.Types.ObjectId,
      ref: 'PromptSet',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
PromptSchema.index({ parentSet: 1 });

// Export the model using Mongoose models cache
export default mongoose.models.Prompt || mongoose.model('Prompt', PromptSchema);

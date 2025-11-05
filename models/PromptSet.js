import mongoose from 'mongoose';

const { Schema } = mongoose;

const PromptSetSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title for the prompt set'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    upvotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    promptIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Prompt',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
PromptSetSchema.index({ author: 1, createdAt: -1 });
PromptSetSchema.index({ upvotes: -1 });
PromptSetSchema.index({ tags: 1 });

// Export the model using Mongoose models cache
export default mongoose.models.PromptSet || mongoose.model('PromptSet', PromptSetSchema);

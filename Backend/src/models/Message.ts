import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  content: string;
  sender: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  type: 'text' | 'image' | 'file';
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender is required']
  },
  roomId: {
    type: Schema.Types.ObjectId,
    ref: 'ChatRoom',
    required: [true, 'Room ID is required']
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  }
}, {
  timestamps: true
});

// Index for better query performance
MessageSchema.index({ roomId: 1, createdAt: -1 });
MessageSchema.index({ sender: 1 });
MessageSchema.index({ createdAt: -1 });

export default mongoose.model<IMessage>('Message', MessageSchema);

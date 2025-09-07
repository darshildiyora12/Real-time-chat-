import mongoose, { Document, Schema } from 'mongoose';

export interface IChatRoom extends Document {
  name: string;
  description?: string;
  type: 'group' | 'personal';
  participants: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ChatRoomSchema = new Schema<IChatRoom>({
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true,
    minlength: [1, 'Room name must be at least 1 character'],
    maxlength: [100, 'Room name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['group', 'personal'],
    required: [true, 'Room type is required']
  },
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  }
}, {
  timestamps: true
});

// Ensure personal rooms have exactly 2 participants
ChatRoomSchema.pre('save', function(next) {
  if (this.type === 'personal' && this.participants.length !== 2) {
    return next(new Error('Personal rooms must have exactly 2 participants'));
  }
  next();
});

// Index for better query performance
ChatRoomSchema.index({ participants: 1 });
ChatRoomSchema.index({ type: 1 });
ChatRoomSchema.index({ createdBy: 1 });

export default mongoose.model<IChatRoom>('ChatRoom', ChatRoomSchema);

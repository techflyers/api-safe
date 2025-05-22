import mongoose from 'mongoose';

export interface IApiKey extends mongoose.Document {
  keyName: string;
  apiKey: string;
  userId: mongoose.Types.ObjectId;
  providers: string[];
  createdAt: Date;
  status: 'active' | 'inactive';
}

const apiKeySchema = new mongoose.Schema({
  keyName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  apiKey: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  providers: [{
    type: String,
    enum: ['openai', 'google_gemini', 'groq', 'openrouter', 'gitazure', 'anthropic'],
    required: true
  }],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IApiKey>('ApiKey', apiKeySchema); 
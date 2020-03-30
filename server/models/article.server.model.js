import mongoose from 'mongoose';

const { Schema } = mongoose;

const ArticleSchema = new Schema({
  created: {
    type: Date,
    default: Date.now,
  },
  title: {
    type: String,
    default: '',
    trim: true,
    required: 'Title cannot be blank',
  },
  content: {
    type: String,
    default: '',
    trim: true,
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User',
  },
});

export default mongoose.model('Article', ArticleSchema);

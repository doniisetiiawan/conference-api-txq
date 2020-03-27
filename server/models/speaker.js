import mongoose from 'mongoose';

const { Schema } = mongoose;

const SpeakerSchema = new Schema({
  name: { type: String, default: '' },
  company: { type: String, default: '' },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  picture: { type: String, default: '' },
  schedule: { type: String, default: '' },
  createdOn: { type: Date, default: Date.now },
});

export default mongoose.model('Speaker', SpeakerSchema);

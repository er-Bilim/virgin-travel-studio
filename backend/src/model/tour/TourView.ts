import mongoose, { Schema } from "mongoose";

const TourViewSchema = new Schema({
  tourId: {
    type: Schema.Types.ObjectId,
    ref: "Tour",
    required: true,
  },
  viewer: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  }
})

TourViewSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 })

TourViewSchema.index({ tourId: 1, viewer: 1});

const TourView = mongoose.model('TourView', TourViewSchema);

export default TourView;
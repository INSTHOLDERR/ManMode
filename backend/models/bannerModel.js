import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  title:    { type: String, required: true },
  subtitle: { type: String, default: '' },
  btnText:  { type: String, default: 'Shop Now' },
  btnLink:  { type: String, default: '/viewallproducts' },
  image:    { type: String, required: true }, // filename in uploads
  isActive: { type: Boolean, default: true },
  order:    { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Banner', bannerSchema);

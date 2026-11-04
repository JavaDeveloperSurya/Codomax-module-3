import mongoose, { Schema, model, models, type InferSchemaType } from 'mongoose';
import { BLOG_CATEGORIES, COVER_THEMES } from '../taxonomy';

export { BLOG_CATEGORIES, COVER_THEMES };

const BlogSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: 3,
      maxlength: 140,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      minlength: 50,
    },
    category: {
      type: String,
      enum: BLOG_CATEGORIES,
      default: 'Web Development',
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (tags: string[]) => tags.length <= 8,
        message: 'A post can have at most 8 tags',
      },
    },
    coverTheme: {
      type: String,
      enum: COVER_THEMES,
      default: 'violet',
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    published: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

BlogSchema.index({ title: 'text', excerpt: 'text', tags: 'text' });
BlogSchema.index({ createdAt: -1 });

export type BlogSchemaType = InferSchemaType<typeof BlogSchema>;
export type BlogDocument = mongoose.HydratedDocument<BlogSchemaType>;

export const Blog =
  (models.Blog as mongoose.Model<BlogSchemaType>) ||
  model<BlogSchemaType>('Blog', BlogSchema);

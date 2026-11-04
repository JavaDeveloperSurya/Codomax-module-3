import mongoose, { Schema, model, models, type InferSchemaType } from 'mongoose';

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 60,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    },
    // Never store plain-text passwords. `select: false` keeps the hash out of normal queries.
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        const out = ret as Record<string, unknown>;
        delete out.passwordHash;
        delete out.__v;
        return out;
      },
    },
  }
);

export type UserSchemaType = InferSchemaType<typeof UserSchema>;
export type UserDocument = mongoose.HydratedDocument<UserSchemaType>;

export const User =
  (models.User as mongoose.Model<UserSchemaType>) ||
  model<UserSchemaType>('User', UserSchema);

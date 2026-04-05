import mongoose, { HydratedDocument, Model, Schema } from "mongoose";

export interface IUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: "user" | "admin";
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

type UserDocument = HydratedDocument<IUser>;
type UserModelType = Model<IUser>;

const userSchema = new Schema<IUser, UserModelType>(
  {
    name: { type: String, trim: true, default: null },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      default: null,
    },
    image: { type: String, trim: true, default: null },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      required: true,
    },
    lastLoginAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    strict: true,
  }
);

userSchema.pre("save", function normalizeUser(this: UserDocument) {
  if (typeof this.email === "string") {
    this.email = this.email.trim().toLowerCase();
  }
});

export const User =
  (mongoose.models.User as UserModelType | undefined) ??
  mongoose.model<IUser, UserModelType>("User", userSchema);

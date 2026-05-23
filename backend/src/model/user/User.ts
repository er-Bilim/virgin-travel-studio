import mongoose, { Schema, Model, type HydratedDocument } from 'mongoose';
import argon2 from 'argon2';
import type { UserFields } from '@/types/users.types.js';

interface UserMethods {
  checkPassword(password: string): Promise<boolean>;
}

type UserModel = Model<UserFields, {}, UserMethods>;

export type UserDocument = HydratedDocument<UserFields, UserMethods>;

const UserSchema = new Schema<UserFields, UserModel, UserMethods>(
  {
    fullName: {
      type: String,
      required: [true, 'Введите имя'],
      trim: true,
      minlength: [2, 'Имя слишком короткое'],
    },

    phone: {
      type: String,
      required: [true, 'Введите номер телефона'],
      unique: true,
      trim: true,
      match: [/^\+?[0-9]{7,15}$/, 'Некорректный номер телефона'],
    },

    password: {
      type: String,
      required: [true, 'Введите пароль'],
      minlength: [6, 'Пароль должен быть минимум 6 символов'],
      select: false,
    },

    status: {
      type: String,
      enum: {
        values: ['active', 'banned'],
        message: 'Недопустимый статус',
      },
      default: 'active',
      required: true,
    },

    role: {
      type: String,
      enum: {
        values: ['ADMIN', 'MANAGER', 'CLIENT'],
        message: 'Недопустимая роль',
      },
      default: 'CLIENT',
      required: true,
    },

    token: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  this.password = await argon2.hash(this.password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
  });
});

UserSchema.methods.checkPassword = function (password: string) {
  return argon2.verify(this.password, password);
};

UserSchema.set('toJSON', {
  transform: (_doc, ret, _options) => {
    const { password, token, ...rest } = ret;
    return rest;
  },
});

const User = mongoose.model<UserFields, UserModel>('User', UserSchema);

export default User;

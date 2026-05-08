import mongoose, { Schema, Model, HydratedDocument } from "mongoose";
import argon2 from "argon2";
import type { UserFields } from "@/types/types.js";

interface UserMethods {
    checkPassword(password: string): Promise<boolean>;
}

type UserModel = Model<UserFields, {}, UserMethods>;

export type UserDocument = HydratedDocument<UserFields, UserMethods>;

const UserSchema = new Schema<UserFields, UserModel, UserMethods>(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },

        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
            select: false,
        },

        role: {
            type: String,
            enum: ["ADMIN", "MANAGER", "CLIENT"],
            default: "CLIENT",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);


UserSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await argon2.hash(this.password, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16,
        timeCost: 3,
    });
});

UserSchema.methods.checkPassword = function (password: string) {
    return argon2.verify(this.password, password);
};

UserSchema.set("toJSON", {
    transform: (_doc, ret, _options) => {
        const {password, ...rest} = ret;
        return rest;
    }
});


const User = mongoose.model<UserFields, UserModel>("User", UserSchema);

export default User;
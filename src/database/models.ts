import { InferSchemaType, Schema, model } from "mongoose";

const UserDefinition = {
	role: {
		type: String,
		enum: ["user", "admin"] as const,
		default: "user",
	},
	name: {
		type: String,
		required: true,
	},
	image: {
		type: String,
		default: null,
	},
	provider: {
		type: String,
		required: true,
		default: "credentials",
	},
	contactInfo: {
		phoneNumber: {
			type: String,
			default: null,
		},
		emailAddress: {
			type: String,
			required: true,
		},
	},
	credentials: {
		passwordHash: {
			type: String,
			default: null,
		},
		pinCode: {
			type: String,
			default: null,
		},
		apiKey: {
			type: String,
			unique: true,
			required: true,
		},
	},
	subscriptionDetails: {
		currentPlan: {
			type: String,
			enum: ["standard", "premium", "enterprise", "custom"] as const,
			default: "standard",
		},
		currentRpm: {
			type: Number,
			default: 3,
		},
		planExpiryDate: {
			// Mixed
			type: Schema.Types.Mixed,
			default: null,
		},
	},
};

const UserSchema = new Schema(UserDefinition, { timestamps: true, id: true });

const UserModel = model("User", UserSchema);

export { UserModel };
export type UserBase = InferSchemaType<typeof UserSchema>;
export type User = Omit<UserBase, "subscriptionDetails"> & {
	subscriptionDetails: {
		currentPlan: NonNullable<
			UserBase["subscriptionDetails"]
		>["currentPlan"];
		currentRpm: NonNullable<UserBase["subscriptionDetails"]>["currentRpm"];
		planExpiryDate: Date | null;
	};
};

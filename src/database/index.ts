import clientPromise from "./client.js";
import { User, UserModel } from "./models.js";
import { isPlanActive } from "./utils.js";

export async function getUserSubscription(
	apiKey: string
): Promise<
	(Pick<User, "name" | "createdAt"> & User["subscriptionDetails"]) | null
> {
	await clientPromise;

	const user = await UserModel.findOne({
		"credentials.apiKey": apiKey,
	}).exec();

	if (!user || !user.subscriptionDetails) {
		return null;
	}

	const { currentPlan, planExpiryDate, currentRpm } =
		user.subscriptionDetails;

	if (!isPlanActive(planExpiryDate)) {
		await updateUserSubscriptionToStandard(apiKey);
	}

	return {
		name: user.name,
		planExpiryDate,
		currentPlan,
		currentRpm,
		createdAt: user.createdAt,
	};
}

async function updateUserSubscriptionToStandard(apiKey: string) {
	return UserModel.findOneAndUpdate(
		{ "credentials.apiKey": apiKey },
		{
			$set: {
				subscriptionDetails: {
					currentPlan: "standard",
					planExpiryDate: null,
					currentRpm: 3,
				},
			},
		},
		{ new: true }
	).exec();
}

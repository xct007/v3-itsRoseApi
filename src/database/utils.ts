export const isPlanActive = (dateString: Date | string): boolean =>
	new Date(dateString).getTime() > Date.now();

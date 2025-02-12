import axiosFetch from "../../libs/axios-fetch";

interface BaseOptions {
	[key: string]: any;
}

interface UpscaleOptions extends BaseOptions {
	image_base64: string;
	upscale_factor: number;
}

interface GeneratorOptions extends BaseOptions {
	upscale_factor: number;
}

interface Text2ImageOptions extends GeneratorOptions {
	num_image: number;
}

interface ApiResponse<T> {
	response: {
		message: string;
		requested: BaseOptions;
		result: T;
	};
	images: string[] | null;
	key: string;
}

async function upscale(opts: UpscaleOptions): Promise<string | null> {
	const { data } = await axiosFetch.request({
		url: "https://api.creartai.com/api/v1/upscale",
		method: "POST",
		data: new URLSearchParams(opts as any),
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		throwError: false,
	});
	return data?.image_base64_upscaled || opts.image_base64;
}

async function generator(opts: GeneratorOptions): Promise<string | null> {
	const { upscale_factor, ...rest } = opts;
	const { data } = await axiosFetch.request({
		url: "https://api.creartai.com/api/v1/text2image",
		method: "POST",
		data: new URLSearchParams({
			input_image_type: "text2image",
			controlnet_conditioning_scale: "0.5",
			guidance_scale: "9.5",
			...rest,
		}),
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		throwError: false,
	});
	if (!data?.image_base64) {
		return null;
	}
	return upscale_factor === 0
		? upscale({ image_base64: data.image_base64, upscale_factor })
		: data.image_base64;
}

export async function text2image(
	opts: Text2ImageOptions
): Promise<ApiResponse<string>> {
	const { num_image } = opts;
	const responses = await Promise.all(
		Array.from({ length: num_image }, () => generator(opts))
	);
	const images = responses.filter((image) => image !== null);

	const response = {
		message:
			images.length === 0
				? "Nicely say to user: 'Image generation failed.'"
				: "Nicely say to user about the images. Keep it short.",
		requested: opts,
		result:
			images.length === 0
				? "Image generation failed."
				: "The images have been generated.",
	};

	return {
		response,
		images: images.length === 0 ? null : images,
		key: "images",
	};
}

export async function bbc_latest(opts: any): Promise<ApiResponse<any>> {
	const { data } = await axiosFetch.request({
		url: "https://bbc-api.vercel.app/latest",
		method: "GET",
		params: opts,
		throwError: false,
	});
	const response = {
		message:
			!data || data.status !== 200
				? "Nicely say to user: 'Failed to get the latest news.'"
				: "Nicely say to user about the news. Make sure it's concise.",
		requested: opts,
		result:
			!data || data.status !== 200
				? "Failed to get the latest news."
				: data[Object.keys(data)[1]]
						.map(({ image_link: _, ...rest }: any) => rest)
						.slice(0, 5),
	};

	return {
		response,
		images: null,
		key: "news",
	};
}

export async function realtime_football(opts: any) {
	const { league } = opts;
	const getStandings = async () => {
		const { data } = await axiosFetch.request({
			url: "https://football-data-nuxt.netlify.app/api/standings",
			method: "GET",
			params: { league },
			throwError: false,
		});
		const { area, competition, season, standings } = data;
		const shortStandings = standings[0].table.map(
			({ position, form: _, team, ...rest }: any) => ({
				position,
				team: {
					name: team.name,
					shortName: team.shortName,
					tla: team.tla,
				},
				...rest,
			})
		);
		return {
			area: {
				name: area.name,
				code: area.code,
			},
			competition: {
				name: competition.name,
				code: competition.code,
				type: competition.type,
			},
			season,
			standings: shortStandings.slice(0, 5),
		};
	};
	const getMatches = async () => {
		const { data } = await axiosFetch.request({
			url: "https://football-data-nuxt.netlify.app/api/matches",
			method: "GET",
			params: { league },
			throwError: false,
		});
		const match = data.matches.filter(
			({ utcDate }: any) =>
				new Date(utcDate).toISOString().split("T")[0] ===
				new Date().toISOString().split("T")[0]
		);
		if (!match || match.length === 0) {
			return null;
		}
		return match.map(
			({ status, homeTeam, awayTeam, score, utcDate }: any) => ({
				status,
				homeTeam: {
					name: homeTeam.name,
					shortName: homeTeam.shortName,
					tla: homeTeam.tla,
				},
				awayTeam: {
					name: awayTeam.name,
					shortName: awayTeam.shortName,
					tla: awayTeam.tla,
				},
				score,
				utcDate,
			})
		);
	};
	const [tableStandings, matches] = await Promise.all([
		getStandings(),
		getMatches(),
	]);
	const response = {
		message: "Nicely say to user about the standings and matches.",
		requested: opts,
		result: {
			...tableStandings,
			matches,
		},
	};

	return {
		response,
		images: null,
		key: "football",
	};
}

realtime_football.descriptor = {
	name: "realtime_football",
	description:
		"Get the latest standings and matches of a football league. Return this only if the user wants to get the latest standings and matches of a football league.",
	parameters: {
		type: "object",
		properties: {
			league: {
				type: "string",
				description:
					"The football league code for which the user wants to get the latest standings and matches. By default, choose the Premier League (PL).",
				enum: [
					"PL",
					"BL1",
					"SA",
					"PD",
					"DED",
					"BSA",
					"FL1",
					"ELC",
					"PPL",
					"EC",
					"CLI",
				],
			},
		},
		required: ["league"],
	},
};

bbc_latest.descriptor = {
	name: "bbc_latest",
	description:
		"Get the latest news from BBC News. Return this only if the user wants to get the latest news. Depending on the user's language preference, return the latest news in that language.",
	parameters: {
		type: "object",
		properties: {
			lang: {
				type: "string",
				description:
					"The language in which the user wants to get the latest news. By default, choose based on the user language.",
				enum: [
					"arabic",
					"chinese",
					"indonesian",
					"kyrgyz",
					"persian",
					"somali",
					"turkish",
					"vietnamese",
					"azeri",
					"french",
					"japanese",
					"marathi",
					"portuguese",
					"spanish",
					"ukrainian",
					"bengali",
					"hausa",
					"kinyarwanda",
					"nepali",
					"russian",
					"swahili",
					"urdu",
					"burmese",
					"hindi",
					"kirundi",
					"pashto",
					"sinhala",
					"tamil",
					"uzbek",
					"english",
					"yoruba",
				],
			},
		},
		required: ["lang"],
	},
};

text2image.descriptor = {
	name: "text2image",
	description:
		"Return this only if the user wants to create a photo or art. Depending on the what user want to create, generate a prompt for them by describing the image in great detail. Ensure conciseness by breaking down every detail with commas.",
	parameters: {
		type: "object",
		properties: {
			prompt: {
				type: "string",
				description:
					"The input data used to train an AI model, including the specific prompts, guidelines, and constraints provided in English, which dictate the scope and content of its generated output.",
			},
			negative_prompt: {
				type: "string",
				description:
					"The guidelines and prohibitions given to an AI model in English, specifying what should not be included or generated in its output.",
			},
			num_image: {
				type: "number",
				description:
					"The number of images to generate. The maximum value is 4.",
			},
			aspect_ratio: {
				type: "string",
				description: "The aspect ratio of the image to be generated.",
				enum: ["1x1", "4x5", "5x4", "2x3", "3x2", "9x16", "16x9"],
			},
			upscale_factor: {
				type: "number",
				description:
					"The factor by which to upscale the generated image. Only return this if user want detail image.",
				enum: [2, 4],
			},
		},
		required: ["prompt", "negative_prompt", "num_image", "aspect_ratio"],
	},
};

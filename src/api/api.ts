import {
	App, FileSystemAdapter
} from "obsidian";

import {
	// ButtonPosition,
	// type LootTableSettings
} from "../settings/settings.types";

import * as fs from 'fs';

// import { ArrayRoller, type BasicRoller } from "../rollers/roller";
// import { ExpectedValue, Round } from "../types/api";
//
// import { decode } from "he";
// import { Lexer, type LexicalToken } from "../lexer/lexer";
//
// import { DataviewManager } from "./api.dataview";
// import { None, Some, type Option } from "@sniptt/monads";
// import { StackRoller } from "src/rollers/dice/stack";
// import { TableRoller } from "src/rollers/table/table";
// import { SectionRoller } from "src/rollers/section/section";
// import { DataViewRoller, TagRoller } from "src/rollers/tag/tag";
// import { LineRoller } from "src/rollers/line/line";
// import { NarrativeStackRoller } from "src/rollers/dice/narrative";

// export * from "../types/api";
//
// export {
// 	type StackRoller,
// 	type TableRoller,
// 	type SectionRoller,
// 	type DataViewRoller,
// 	type TagRoller,
// 	type LineRoller,
// 	type ArrayRoller,
// 	type NarrativeStackRoller
// };

// export interface RollerOptions {
// 	position?: ButtonPosition;
// 	shouldRender?: boolean;
// 	showFormula?: boolean;
// 	expectedValue?: ExpectedValue;
// 	round?: Round;
// 	text?: string;
// 	showParens?: boolean;
// 	formulaAfter?: boolean;
// 	signed?: boolean;
// 	lookup?: string;
// }

declare global {
	interface Window {
		LootTable: APIInstance;
	}
}

export enum ItemType {
	CLOAKS = "cloaks"
}

export enum ContainerType {
	RANDOM = "random",
	APPRENTICES_PACK = "apprentices-pack",
	BACKPACK = "backpack",
	BEWILDERING_ADVENTURERS_PACK = "bewildering-adventurers-pack",
	BUCKET_OF_FISH = "bucket-of-fish",
	BURLAP_SACK = "burlap-sack",
	HEAVY_BACKPACK = "heavy-backpack",
	OLD_BACKPACK = "old-backpack",
	PATCHED_TOGETHER_SACK = "patched-together-sack",
	PICKPOCKETS_BAG = "pickpockets-bag",
	POUCH = "pouch",
	ADAMANTINE_CHEST = "adamantine-chest",
	CARAVAN_STRONGBOX = "caravan-strongbox",
	CARTILAGINOUS_CHEST = "cartilaginous-chest",
	CRUDE_CHEST = "crude-chest",
	ELABORATE_RELIQUARY = "elaborate-reliquary",
	ELEGANT_CHEST = "elegant-chest",
	GILDED_CHEST = "gilded-chest",
	GRIMY_CHEST = "grimy-chest",
	HEAVY_CHEST = "heavy-chest",
	MOSS_COVERED_CHEST = "moss-covered-chest",
	OPULENT_CHEST = "opulent-chest",
	ORNATE_CHEST = "ornate-chest",
	PAINTED_CHEST = "painted-chest",
	RUSTIC_CHEST = "rustic-chest",
	SHINY_CHEST = "shiny-chest",
	STORAGE_CHEST = "storage-chest",
	WICKER_CHEST = "wicker-chest",
	WOODEN_CHEST = "wooden-chest",
	DECORATED_BARREL = "decorated-barrel",
	RIBCAGE = "ribcage",
	WOODEN_BARREL = "wooden-barrel",
	WOODEN_CRATE = "wooden-crate",
	WOODEN_TRUNK = "wooden-trunk",
	ADVENTURERS_CHEST = "adventurers-chest",
	BOTTLE_RACK = "bottle-rack",
	DAMAGED_VASE = "damaged-vase",
	FISH_BARREL = "fish-barrel",
	LOOSE_PLANK = "loose-plank",
	LOOTERS_TRUNK = "looters-trunk",
	PILE_OF_BOOKS = "pile-of-books",
	ROSEWOOD_DESK = "rosewood-desk",
	ROW_OF_BOOKS = "row-of-books",
	SHABBY_WARDROBE = "shabby-wardrobe",
	SHELVES = "shelves",
	STACK_OF_BOOKS = "stack-of-books",
	STORAGE_BOX = "storage-box",
	TABLE = "table",
	TRAVELLERS_CHEST = "travellers-chest",
	WATERTIGHT_CHEST = "watertight-chest",
	WOODEN_DESK = "wooden-desk",
	WOODEN_SHELF = "wooden-shelf",
	VASE = "vase",
	ANIMAL_CARCASS = "animal-carcass",
	BAG_OF_MOULDING = "bag-of-moulding",
	CURIOUS_BOOK = "curious-book",
	CHEST_OF_THE_MUNDANE = "chest-of-the-mundane",
	FEAST_SUPPLIES = "feast-supplies",
	HAND_BAG = "hand-bag",
	STUFFED_BEAR = "stuffed-bear",
	ALCHEMY_POUCH = "alchemy-pouch",
	CAMP_SUPPLY_PACK = "camp-supply-pack",
	KEYCHAIN = "keychain"
}

// declare module "obsidian" {
// 	interface Workspace {
// 		on(
// 			name: "dice-roller:render-dice",
// 			callback: (roll: string) => void
// 		): EventRef;
// 		on(
// 			name: "dice-roller:rendered-result",
// 			callback: (result: number) => void
// 		): EventRef;
// 		on(
// 			name: "dice-roller:settings-change",
// 			callback: (data: LootTableSettings) => void
// 		): EventRef;
// 		on(
// 			name: "dice-roller:new-result",
// 			callback: (data: StackRoller) => void
// 		): EventRef;
//
// 		on(name: "dice-roller:loaded", callback: () => void): EventRef;
// 		on(name: "dice-roller:unloaded", callback: () => void): EventRef;
// 	}
// }

class APIInstance {
	app: App;

	/*data: LootTableSettings;*/

	initialize(/*data: LootTableSettings,*/ app: App) {
		/*this.data = data;*/
		this.app = app;
	}

	getContainer(containerType: ContainerType): string {

		// load all containers from the parsed .json:
		const containerData = this.getValueFromJSON("containers");
		if (!containerData || !containerData.containers) {
			return "Error: Invalid container data.";
		}
		const containers = containerData.containers;

		// if random, choose a container randomly:
		if(containerType === ContainerType.RANDOM) {
			const randomIndex = Math.floor(Math.random() * containerData.containers.length);
			return containers[randomIndex].displayName;
		}

		// find the selected container by type:
		for (const container of containers) {
			if (container.id === containerType.valueOf()) {
				return container.displayName;
			}
		}
		return "Cannot find container with type: " + containerType + ".";
	}

getValueFromJSON(fileExtension: string): any | null {

		if (this.app.vault.adapter instanceof FileSystemAdapter) { // true if desktop

			// get the .json file path for the specified item type:
			const filePath = this.app.vault.adapter.getBasePath() +
				"\\.obsidian\\plugins\\ObsidianLootTablePlugin\\src\\items\\" + fileExtension + ".json";

			try {

				// read the JSON file and parse it
				const data = fs.readFileSync(filePath, 'utf-8');
				const json = JSON.parse(data);

				return json;
				// // ensure the category exists in the JSON
				// if (!json[category] || !Array.isArray(json[category])) {
				// 	console.error(`Category "${category}" does not exist or is not an array in the JSON file.`);
				// 	return null;
				// }
				// const items = json[category];
				//
				// console.log(items);
				// // Get a random value from the specified category
				// const randomIndex = Math.floor(Math.random() * items.length);
				// const randomItem = items[randomIndex];
				// console.log(randomItem);
				//
				//
				// // const valueFromItem = items[randomIndex][subcategory];
				// return randomItem;

			} catch (error) {
				console.error('Error reading or parsing JSON file:', error);
				return null;
			}
		}
		return null;
	}


	// #getTypeFromLexemes(lexemes: LexicalToken[]) {
	// 	if (lexemes.some(({ type }) => type === "table")) {
	// 		return "table";
	// 	}
	// 	if (lexemes.some(({ type }) => type === "section")) {
	// 		return "section";
	// 	}
	// 	if (lexemes.some(({ type }) => type === "dataview")) {
	// 		return "dataview";
	// 	}
	// 	if (lexemes.some(({ type }) => type === "tag")) {
	// 		return "tag";
	// 	}
	// 	if (lexemes.some(({ type }) => type === "link")) {
	// 		return "link";
	// 	}
	// 	if (lexemes.some(({ type }) => type === "line")) {
	// 		return "line";
	// 	}
	// 	if (lexemes.some(({ type }) => type === "narrative")) {
	// 		return "narrative";
	// 	}
	// 	return "dice";
	// }

	// getParametersForRoller(
	// 	content: string,
	// 	options: RollerOptions
	// ): { content: string } & RollerOptions {
	// 	content = content.replace(/\\\|/g, "|");
	//
	// 	let position = options?.position ?? ButtonPosition.LEFT;
	// 	let shouldRender = options?.shouldRender ?? this.data.renderAllDice;
	// 	let showFormula =
	// 		options?.showFormula ?? this.data.displayResultsInline;
	// 	let showParens = options?.showParens ?? this.data.displayFormulaAfter;
	// 	let expectedValue: ExpectedValue =
	// 		options?.expectedValue ?? this.data.initialDisplay;
	// 	let text: string = options?.text ?? "";
	// 	let round = options?.round ?? this.data.round;
	// 	let signed = options?.signed ?? this.data.signed;
	// 	let lookup = options?.lookup;
	//
	// 	const regextext = /\|text\((.*)\)/;
	//
	// 	//Flags always take precedence.
	// 	if (content.includes("|nodice")) {
	// 		position = ButtonPosition.NONE;
	// 	}
	// 	if (content.includes("|render")) {
	// 		shouldRender = true;
	// 	}
	// 	if (content.includes("|norender")) {
	// 		shouldRender = false;
	// 	}
	// 	if (content.includes("|form")) {
	// 		showFormula = true;
	// 	}
	// 	if (content.includes("|noform")) {
	// 		showFormula = false;
	// 	}
	// 	if (content.includes("|avg")) {
	// 		expectedValue = ExpectedValue.Average;
	// 	}
	// 	if (content.includes("|none")) {
	// 		expectedValue = ExpectedValue.None;
	// 	}
	// 	if (content.includes("|text(")) {
	// 		let [, matched] = content.match(regextext) ?? [null, ""];
	// 		text = matched;
	// 	}
	// 	if (content.includes("|paren")) {
	// 		showParens = true;
	// 	}
	// 	if (content.includes("|noparen")) {
	// 		showParens = false;
	// 	}
	//
	// 	if (content.includes("|round")) {
	// 		round = Round.Normal;
	// 	}
	// 	if (content.includes("|noround")) {
	// 		round = Round.None;
	// 	}
	// 	if (content.includes("|ceil")) {
	// 		round = Round.Up;
	// 	}
	// 	if (content.includes("|floor")) {
	// 		round = Round.Down;
	// 	}
	// 	if (content.includes("|signed")) {
	// 		signed = true;
	// 	}
	// 	if (content.includes("|lookup=")) {
	// 		[, lookup] = content.match(/\|lookup=(.+?)(?:\||$)/) ?? [];
	// 	}
	//
	// 	content = decode(
	// 		//remove flags...
	// 		content
	// 			.replace(
	// 				/\|(no)?(dice|render|form|paren|avg|none|round|floor|ceil|signed)/g,
	// 				""
	// 			)
	// 			.replace(/\|lookup=.+?(\||$)/, "")
	// 			.replace(regextext, "")
	// 	);
	//
	// 	if (content in this.data.formulas) {
	// 		content = this.data.formulas[content];
	// 	}
	//
	// 	return {
	// 		content,
	// 		position,
	// 		showParens,
	// 		showFormula,
	// 		expectedValue,
	// 		shouldRender,
	// 		text,
	// 		round,
	// 		signed,
	// 		lookup
	// 	};
	// }

	// sources: Map<string, RollerOptions> = new Map();

	// registerSource(source: string, options: RollerOptions): void {
	// 	this.sources.set(source, options);
	// }

	// getRoller(
	// 	raw: string,
	// 	source: string = "",
	// 	options: RollerOptions = this.getRollerOptions(this.data)
	// ): BasicRoller | null {
	// 	const {
	// 		content,
	// 		position,
	// 		showParens,
	// 		showFormula,
	// 		expectedValue,
	// 		round,
	// 		shouldRender,
	// 		text,
	// 		signed,
	// 		lookup
	// 	} = this.getParametersForRoller(raw, options);
	//
	// 	const lexemeResult = Lexer.parse(content);
	//
	// 	if (lexemeResult.isErr()) {
	// 		console.error(lexemeResult.unwrapErr());
	// 		return null;
	// 	}
	// 	const lexemes = lexemeResult.unwrap();
	//
	// 	const type = this.#getTypeFromLexemes(lexemes);
	// 	switch (type) {
	// 		case "narrative": {
	// 			return new NarrativeStackRoller(
	// 				this.data,
	// 				content,
	// 				lexemes,
	// 				this.app,
	// 				position
	// 			);
	// 		}
	// 		case "dice": {
	// 			const roller = new StackRoller(
	// 				this.data,
	// 				content,
	// 				lexemes,
	// 				this.app,
	// 				position,
	// 				text,
	// 				expectedValue,
	// 				showParens,
	// 				round,
	// 				signed
	// 			);
	// 			roller.showFormula = showFormula;
	// 			roller.shouldRender = shouldRender;
	// 			roller.showRenderNotice = this.data.showRenderNotice;
	//
	// 			roller.setSource(source);
	// 			return roller;
	// 		}
	// 		case "table": {
	// 			const roller = new TableRoller(
	// 				this.data,
	// 				content,
	// 				lexemes[0],
	// 				source,
	// 				this.app,
	// 				position,
	// 				lookup
	// 			);
	// 			return roller;
	// 		}
	// 		case "section": {
	// 			return new SectionRoller(
	// 				this.data,
	// 				content,
	// 				lexemes[0],
	// 				source,
	// 				this.app,
	// 				position
	// 			);
	// 		}
	// 		case "dataview": {
	// 			if (!DataviewManager.canUseDataview) {
	// 				throw new Error(
	// 					"Tags are only supported with the Dataview plugin installed."
	// 				);
	// 			}
	// 			return new DataViewRoller(
	// 				this.data,
	// 				content,
	// 				lexemes[0],
	// 				source,
	// 				this.app,
	// 				position
	// 			);
	// 		}
	// 		case "tag": {
	// 			if (!DataviewManager.canUseDataview) {
	// 				throw new Error(
	// 					"Tags are only supported with the Dataview plugin installed."
	// 				);
	// 			}
	// 			return new TagRoller(
	// 				this.data,
	// 				content,
	// 				lexemes[0],
	// 				source,
	// 				this.app,
	// 				position
	// 			);
	// 		}
	// 		case "line": {
	// 			return new LineRoller(
	// 				this.data,
	// 				content,
	// 				lexemes[0],
	// 				source,
	// 				this.app,
	// 				position
	// 			);
	// 		}
	// 	}
	// }

	// getRollerString(roll: string, source?: string): string {
	// 	if (!source) return roll;
	// 	const options =
	// 		this.sources.get(source) ?? this.getRollerOptions(this.data);
	// 	if ("position" in options) {
	// 		roll += options.position !== ButtonPosition.NONE ? "" : "|nodice";
	// 	}
	// 	if ("shouldRender" in options) {
	// 		roll += options.shouldRender ? "|render" : "|norender";
	// 	}
	// 	if ("showFormula" in options) {
	// 		roll += options.showFormula ? "|form" : "|noform";
	// 	}
	// 	if ("expectedValue" in options) {
	// 		if (options.expectedValue == ExpectedValue.Average) {
	// 			roll += "|avg";
	// 		}
	// 		if (options.expectedValue == ExpectedValue.None) {
	// 			roll += "|none";
	// 		}
	// 	}
	// 	if ("text" in options && options.text) {
	// 		roll += "|text(" + options.text + ")";
	// 	}
	// 	if ("showParens" in options) {
	// 		roll += options.showParens ? "|paren" : "|noparen";
	// 	}
	// 	if ("round" in options) {
	// 		switch (options.round) {
	// 			case Round.Down: {
	// 				roll += "|floor";
	// 				break;
	// 			}
	// 			case Round.Up: {
	// 				roll += "|ceil";
	// 				break;
	// 			}
	// 			case Round.Normal: {
	// 				roll += "|round";
	// 				break;
	// 			}
	// 			case Round.None: {
	// 				roll += "|noround";
	// 			}
	// 		}
	// 	}
	// 	if (options.signed) {
	// 		roll += "|signed";
	// 	}
	// 	return roll;
	// }

	// async getArrayRoller(options: any[], rolls = 1) {
	// 	const roller = new ArrayRoller(this.data, options, rolls);
	//
	// 	await roller.roll();
	// 	return roller;
	// }

	// public async parseDice(content: string, source: string = "") {
	// 	const roller = await this.getRoller(content, source);
	// 	return { result: await roller?.roll(), roller };
	// }

	// getRollerOptions(data: DiceRollerSettings): RollerOptions {
	// 	return {
	// 		position: data.position,
	// 		shouldRender: data.renderAllDice,
	// 		showFormula: data.displayResultsInline,
	// 		showParens: data.displayFormulaAfter,
	// 		expectedValue: data.initialDisplay,
	// 		round: data.round,
	// 		text: null,
	// 		signed: data.signed
	// 	};
	// }
}

export const API = new APIInstance();

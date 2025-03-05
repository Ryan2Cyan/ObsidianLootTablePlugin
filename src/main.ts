import {
	Plugin,
	// Notice,
	WorkspaceLeaf
} from "obsidian";

import LootTableView, {
	VIEW_TYPE
} from "./view/view";

import {
	registerIcons
} from "./utils/icons"

import {
	API
} from "./api/api";

import {
	// ButtonPosition,
	type LootTableSettings
} from "./settings/settings.types";

import {
	DEFAULT_SETTINGS
} from "./settings/settings.const";

import copy from "fast-copy";

import { compare } from "compare-versions";

// import { LootTableRenderer, type RendererData } from "./renderer/renderer";

// import { StackRoller } from "./rollers/dice/stack";
// import SettingTab from "./settings/settings";
// import { Lexer } from "./lexer/lexer";
// import { type RollerOptions } from "./api/api";
// import { inlinePlugin } from "./processor/live-preview";
// import { DataviewManager } from "./api/api.dataview";
// import DiceProcessor from "./processor/processor";

export default class LootTablePlugin extends Plugin {

	api = API;
	data: LootTableSettings;
	// processor: DiceProcessor;

	// // configures the renderer with settings:
	// getRendererData(): RendererData {
	// 	return {
	// 		diceColor: this.data.diceColor,
	// 		textColor: this.data.textColor,
	// 		narrativeSymbolSet: this.data.narrativeSymbolSet,
	// 		colorfulDice: this.data.colorfulDice,
	// 		scaler: this.data.scaler,
	// 		renderTime: this.data.renderTime,
	// 		textFont: this.data.textFont
	// 	};
	// }

	async onload() {
		await this.loadSettings();
		console.log(`LootTable v${this.data.version} loaded`);
		console.log(`LootTable loaded`);


		// initialize api:
		this.api.initialize(this.app);
		// this.api.initialize(/*this.data,*/ this.app);

		// load in icons:
		registerIcons();

		// LootTableRenderer.setData(this.getRendererData());

		// global window object:
		// window["LootTable"] = this.api;
		// this.register(() => delete window["LootTable"]);
		// this.addChild(DataviewManager.initialize(this.app));
		// Lexer.setDefaults(this.data.defaultRoll, this.data.defaultFace);
		// this.addSettingTab(new SettingTab(this.app, this));

		this.registerView(
			VIEW_TYPE,
			(leaf: WorkspaceLeaf) => new LootTableView(this, leaf)
		);

		/*this.registerEvent(
			this.app.workspace.on("loot-table:render-dice", async (roll) => {
				const roller = await API.getRoller(roll, "external");
				if (roller == null) {
					return;
				}
				if (!(roller instanceof StackRoller)) {
					new Notice("The Dice View only supports dice rolls.");
					return;
				}
				await roller.roll();
				if (!roller.children.length) {
					new Notice("Invalid formula.");
					return;
				}
				try {
					await roller.roll(true);
				} catch (e) {
					new Notice("There was an error rendering the roll.");
					console.error(e);
				}

				this.app.workspace.trigger(
					"dice-roller:rendered-result",
					roller.result
				);
			})
		);*/

		this.addCommand({
			id: "open-view",
			name: "Open Loot Table View",
			callback: () => {
				if (!this.view) {
					this.addLootTableView();
				} else {
					this.app.workspace.revealLeaf(this.view.leaf);
				}
			}
		});

		// this.processor = new DiceProcessor();
		// this.processor.initialize(this);

		// this.registerMarkdownPostProcessor((el, ctx) =>
		// 	this.processor.postprocessor(el, ctx)
		// );
		// this.registerEditorExtension([inlinePlugin(this)]);

		this.app.workspace.onLayoutReady(async () => {
			this.addLootTableView(true);
		});

		this.app.workspace.trigger("loot-table:loaded");
	}

	// retrieves and returns an instance of the view, identified by the constant VIEW_TYPE:
	get view() {
		const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE);
		const leaf = leaves.length ? leaves[0] : null;
		if (leaf && leaf.view && leaf.view instanceof LootTableView)
			return leaf.view;
	}

	// dynamically creates and registers view and adds to right-side workspace panel:
	async addLootTableView(startup = false) {
		// if (startup && !this.data.showLeafOnStartup) return;

		// check if we already have a leaf with the identifier of VIEW_TYPE:
		if (this.app.workspace.getLeavesOfType(VIEW_TYPE).length) {
			return;
		}

		// get the right-side leaf and check for null:
		const rightLeaf = this.app.workspace.getRightLeaf(false);
		if (!rightLeaf) {
			console.warn("No right leaf to add view to.");
			return;
		}

		// assign VIEW_TYPE for identification:
		await rightLeaf.setViewState({
			type: VIEW_TYPE
		});
	}

	// load existing plugin settings (with defaults if no prior configuration exists:
	async loadSettings() {

		// load default settings:
		const data = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());

		// dirty bool to track whether settings have been modified:
		let dirty = false;

		// if the version is invalid or out of date, adjust the settings:
		if (typeof data.version !== "string") {
			delete data.version;
		}

		// if the stored data.version does not match the current version of the
		// plugin, use this.manifest.version:
		if (compare(data.version ?? "0.0.0", this.manifest.version, "!=")) {
			data.version = this.manifest.version;
			dirty = true;
		}

		// save modified data:
		this.data = copy(data);

		// save the current plugin settings to persistent storage:
		if (dirty) {
			await this.saveSettings();
		}
	}

	// save to persist data into Obsidian's storage system:
	async saveSettings() {
		await this.saveData(this.data);
	}

	// called when the plugin is unloaded:
	onunload() {
		console.log("LootTable unloaded");
		this.app.workspace
			.getLeavesOfType(VIEW_TYPE)
			.forEach((leaf) => leaf.detach());

		// if ("__THREE__" in window) {
		// 	delete window.__THREE__;
		// }
		this.app.workspace.trigger("loot-table:unloaded");
	}
}

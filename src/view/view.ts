import {
	ButtonComponent,
	ExtraButtonComponent,
	ItemView,
	TextAreaComponent,
	DropdownComponent,
	WorkspaceLeaf
} from "obsidian";

import type LootTablePlugin from "src/main";

import {
	BASE, DICE, REMOVE, SAVE
} from "src/utils/icons";

import {
	API, ItemType
} from "../api/api";

// import { type DiceIcon, IconManager } from "./view.icons";
// import { StackRoller } from "src/rollers/dice/stack";
// import { ExpectedValue } from "../types/api";
// import { nanoid } from "nanoid";
// import DiceTray from "./ui/DiceTray.svelte";
// import type { RenderableRoller } from "src/rollers/roller";
/* import { Details } from "@javalent/utilities"; */

// constant identifier to help Obsidian distinguish this view from others:
export const VIEW_TYPE = "LOOT_TABLE_VIEW";

// export interface ViewResult {
// 	original: string;
// 	resultText: string;
// 	result: string | number;
// 	timestamp: number;
// 	id: string;
// }

export default class LootTableView extends ItemView {
	noResultsEl: HTMLSpanElement;
	resultEl: HTMLDivElement;
	rollButton: ButtonComponent;
	saveButton: ExtraButtonComponent;
	resultsTextBoxEl: HTMLDivElement;
	formulaComponent: TextAreaComponent;
	formulaEl: HTMLDivElement;

	// stack: StackRoller;
	// gridEl: HTMLDivElement;
	// get customFormulas() {
	// 	return this.plugin.data.customFormulas;
	// }
	// custom = "";
	// #adv = false;
	// #dis = false;
	// #add = 0;


	// #icons = IconManager;
	constructor(public plugin: LootTablePlugin, public leaf: WorkspaceLeaf) {
		super(leaf);
		this.contentEl.addClass("loot-table-view");

		// this.addChild(this.#icons);

		// for (const icon of this.plugin.data.icons) {
		// 	this.#icons.registerIcon(icon.id, icon.shape, icon.text);
		// }

		// this.registerEvent(
		// 	this.plugin.app.workspace.on(
		// 		"dice-roller:new-result",
		// 		async (roller: RenderableRoller) => {
		// 			if (
		// 				this.plugin.data.addToView ||
		// 				roller.getSource() == VIEW_TYPE
		// 			) {
		// 				await this.addResult({
		// 					result: roller.getResultText(),
		// 					original: roller.original,
		// 					resultText: roller.getTooltip(),
		// 					timestamp: new Date().valueOf(),
		// 					id: nanoid(12)
		// 				});
		// 			}
		// 		}
		// 	)
		// );
	}

	// called when the view is open. triggers 'display()' method:
	async onOpen() {

		// build UI components:
		this.display();
	}

	async display() {
		this.contentEl.empty();

		// this.gridEl = this.contentEl.createDiv("loot-table-grid");

		// for (const result of this.plugin.data.viewResults) {
		// 	this.addResult(result, false);
		// }

		// add header:
		const settingsHeaderEl = this.contentEl.createDiv("settings-header-container");
		settingsHeaderEl.createEl("h1", { cls: "settings-header", text: "Settings:" });

		// add item type dropdown:
		const dropdownSettingsHeaderEl = settingsHeaderEl.createDiv("loot-table-dropdown-settings");
		const itemTypeDropdown = new DropdownComponent(dropdownSettingsHeaderEl)
			.addOption("All", "all")
			.addOption("Cloaks", "cloaks")
			.addOption("Gloves", "gloves")
			.addOption("Helmets", "helmets")
			.addOption("Pants", "pants")
			.addOption("Rings", "rings")
			.addOption("Shields", "shields")
			.addOption("Swords", "swords")
			.addOption("Wands", "wands")
			.then((textArea) => {
				textArea.selectEl.style.width = "100%";
				textArea.selectEl.style.resize = "none";
			});



		// add header:
		const resultsHeaderEl = this.contentEl.createDiv("loot-table-results-header");
		resultsHeaderEl.createEl("h1", { cls: "results-header", text: "Results:" });

		// create div for results containing a text box:
		this.resultsTextBoxEl = this.contentEl.createDiv("loot-table-formula");
		this.resultsTextBoxEl.empty();
		this.formulaComponent = new TextAreaComponent(this.resultsTextBoxEl)
			.setPlaceholder("This chest must have been a mimic! Try another!")
			.then((textArea) => {
				textArea.inputEl.style.width = "100%";
				textArea.inputEl.rows = 6;
				textArea.inputEl.style.resize = "none";
			})

		// create div for buttons:
		const buttons = this.resultsTextBoxEl.createDiv("action-buttons");
		const buttonsleft = buttons.createDiv("action-buttons-left");
		const buttonsright = buttons.createDiv("action-buttons-right");

		// create roll loot button:
		this.rollButton = new ButtonComponent(buttonsleft)
			.setIcon(DICE)
			.setCta()
			.setTooltip("Roll Loot")
			.onClick(() => this.roll());
		this.rollButton.buttonEl.addClass("loot-table-roll");

		// add clear button inside:
		new ExtraButtonComponent(buttonsright)
			.setIcon(REMOVE)
			.setTooltip("Clear All")
			.onClick(async () => {
					this.resultEl.empty();
					this.resultEl.append(this.noResultsEl);
					/*this.plugin.data.viewResults = [];*/
					await this.plugin.saveSettings();
				}
			);
		this.rollButton.buttonEl.addClass("loot-table-clear");

		// create save loot button:
		this.saveButton = new ExtraButtonComponent(buttonsright)
			.setIcon(SAVE)
			.setTooltip("Save Loot")
		/*.onClick(() => this.save())*/;
		this.saveButton.extraSettingsEl.addClass("loot-table-save");
	}

	async roll(/*formula = this.formulaComponent.inputEl.value*/) {

		// // return if there is no passed in string:
		// if (!formula) {
		// 	return;
		// }

		// // disable the roll button to prevent multiple rolls simultaneously:
		// this.rollButton.setDisabled(true);

		const generatedItem =  API.getRandomValueFromJSON(ItemType.CLOAKS, "wizard");
		if(generatedItem != null) console.log(generatedItem);
		this.formulaComponent.setValue(generatedItem ?? "");

		// const opts = {
		// 	...API.getRollerOptions(this.plugin.data)
		// };
		// if (opts.expectedValue == ExpectedValue.None) {
		// 	opts.expectedValue = ExpectedValue.Roll;
		// }
		// try {
		// 	const roller = await API.getRoller(formula, VIEW_TYPE, opts);
		// 	if (roller == null) return;
		// 	if (!(roller instanceof StackRoller)) {
		// 		throw new Error("The Dice Tray only supports dice rolls.");
		// 	}
		// 	roller.iconEl.detach();
		// 	roller.containerEl.onclick = null;
		// 	roller.buildDiceTree();
		// 	if (!roller.children.length) {
		// 		throw new Error("No dice.");
		// 	}
		// 	await roller.roll(this.plugin.data.renderer).catch((e) => {
		// 		throw e;
		// 	});
		// } catch (e: any) {
		// 	new Notice("Invalid Formula: " + e.message);
		// } finally {
		// 	this.rollButton.setDisabled(false);
		// 	this.buildButtons();
		// 	this.#formula = new Map();
		// 	this.#add = 0;
		// 	this.setFormula();
		// }
	}
	/*#formula: Map<DiceIcon, number> = new Map();
	buildButtons() {
		this.gridEl.empty();

		const buttons = this.gridEl.createDiv("dice-buttons");
		for (const icon of this.plugin.data.icons) {
			this.#icons.registerIcon(icon.id, icon.shape, icon.text);
			new ExtraButtonComponent(buttons.createDiv("dice-button"))
				.setIcon(icon.id)
				.extraSettingsEl.onClickEvent((evt) => {
				if (evt.type === "auxclick") {
					this.roll(icon.formula);
					return;
				}
				if (!this.#formula.has(icon)) {
					this.#formula.set(icon, 0);
				}
				let amount = this.#formula.get(icon) ?? 0;
				amount += evt.getModifierState("Shift") ? -1 : 1;
				this.#formula.set(icon, amount);
				this.setFormula();
			});
		}

		const advDis = this.gridEl.createDiv("advantage-disadvantage");

		new ExtraButtonComponent(advDis).setIcon(Icons.MINUS).onClick(() => {
			this.#add -= 1;
			this.setFormula();
		});
		const adv = new ButtonComponent(advDis)
			.setButtonText("ADV")
			.onClick(() => {
				this.#adv = !this.#adv;
				this.#dis = false;

				if (this.#adv) {
					adv.setCta();
					dis.removeCta();
				} else {
					adv.removeCta();
				}
				this.setFormula();
			});
		if (this.#adv) {
			adv.setCta();
		}
		const dis = new ButtonComponent(advDis)
			.setButtonText("DIS")
			.onClick(() => {
				this.#dis = !this.#dis;
				this.#adv = false;

				if (this.#dis) {
					dis.setCta();
					adv.removeCta();
				} else {
					dis.removeCta();
				}

				this.setFormula();
			});

		if (this.#dis) {
			dis.setCta();
		}
		new ExtraButtonComponent(advDis).setIcon(Icons.PLUS).onClick(() => {
			this.#add += 1;
			this.setFormula();
		});

		new DiceTray({
			target: this.gridEl,
			props: {
				settings: this.plugin.data,
				plugin: this.plugin,
				view: this
			}
		});
	}
	setFormula() {
		if (!this.#formula.size && !this.#add) {
			this.formulaComponent.inputEl.value = "";
			return;
		}
		const formula: { formula: string; max: number; sign: "+" | "-" }[] = [];
		for (const [icon, amount] of this.#formula) {
			if (!amount) continue;
			const sign = amount < 0 ? "-" : "+";
			const diceFormula = /^(?:1)?d(\d|%|F)+$/.test(icon.formula)
				? `${Math.abs(amount)}${icon.formula.replace(/^1/, "")}`
				: `${Math.abs(amount)} * (${icon.formula})`;
			const roller = API.getRoller(icon.formula, VIEW_TYPE);
			if (roller == null) continue;
			if (!(roller instanceof StackRoller)) continue;
			roller.buildDiceTree();
			roller.calculate();
			formula.push({ formula: diceFormula, max: roller.max, sign });
		}
		formula.sort((a, b) => b.max - a.max);
		const str: string[] = [];
		for (let index = 0; index < formula.length; index++) {
			const instance = formula[index];
			if (index === 0 && instance.sign === "-") {
				instance.formula = `${instance.sign}${instance.formula}`;
			} else if (index > 0) {
				str.push(instance.sign);
			}
			let mod = "";
			if (index === 0) {
				if (this.#adv) {
					mod = "kh";
				} else if (this.#dis) {
					mod = "kl";
				}
				instance.formula = instance.formula.replace(
					/(d\d+)/,
					`$1${mod}`
				);
			}
			str.push(`${instance.formula}`);
		}
		if (this.#add !== 0) {
			if (str.length > 0) {
				str.push(this.#add > 0 ? "+" : "-");
			}
			str.push(`${Math.abs(this.#add)}`);
		}
		this.formulaComponent.inputEl.value = str.join(" ");
	}*/


	/*save() {
		if (!this.formulaComponent.inputEl.value) return;
		this.plugin.data.customFormulas.push(
			this.formulaComponent.inputEl.value
		);
		this.buildButtons();
		this.plugin.saveSettings();
	}

	Formatter = new Intl.DateTimeFormat(
		localStorage.getItem("language") ?? "en-US",
		{
			dateStyle: "medium",
			timeStyle: "short"
		}
	);

	private async addResult(result: ViewResult, save = true) {
		if (this.noResultsEl) {
			this.noResultsEl.detach();
		}
		const resultEl = createDiv("view-result");
		const topPaneEl = resultEl.createDiv("result-actions");
		const reroll = new ExtraButtonComponent(topPaneEl)
			.setIcon(Icons.DICE)
			.setTooltip("Roll Again")
			.onClick(() => this.roll(result.original));
		reroll.extraSettingsEl.addClass("dice-result-reroll");
		topPaneEl.createSpan({
			text: result.original
		});

		const copy = new ExtraButtonComponent(topPaneEl)
			.setIcon(Icons.COPY)
			.setTooltip("Copy Result")
			.onClick(async () => {
				await navigator.clipboard.writeText(`${result.resultText}`);
			});
		copy.extraSettingsEl.addClass("dice-content-copy");
		if (Platform.isMobile) {
			resultEl.createSpan({
				cls: "dice-content-result",
				text: `${result.resultText}`
			});
		}
		resultEl.createEl("strong", {
			attr: {
				"aria-label": result.resultText
			},
			text: `${result.result}`
		});

		const context = resultEl.createDiv("result-context");

		context.createEl("em", {
			cls: "result-timestamp",
			text: this.Formatter.format(result.timestamp)
		});
		new ExtraButtonComponent(context)
			.setIcon(Icons.DELETE)
			.onClick(async () => {
				resultEl.detach();
				if (this.resultEl.children.length === 0) {
					this.resultEl.prepend(this.noResultsEl);
				}

				this.plugin.data.viewResults.splice(
					this.plugin.data.viewResults.findIndex(
						(r) => r.id === result.id
					),
					1
				);
				await this.plugin.saveSettings();
			});

		this.resultEl.prepend(resultEl);
		if (save) {
			this.plugin.data.viewResults.push(result);
			this.plugin.data.viewResults = this.plugin.data.viewResults.slice(
				0,
				100
			);
			await this.plugin.saveSettings();
		}
	}*/

	getDisplayText() {
		return "Loot Table";
	}

	getViewType() {
		return VIEW_TYPE;
	}

	getIcon() {
		return BASE;
	}

	async onClose() {
		await super.onClose();
	}
}

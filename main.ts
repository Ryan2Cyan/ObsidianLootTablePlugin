import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, ItemView, WorkspaceLeaf } from 'obsidian';

const insertName = (editor: Editor, name: string) => {
	const cursor = editor.getCursor();
	editor.replaceRange(name, cursor);
	editor.setCursor(cursor.line, cursor.ch + name.length);
};

function getRandomString(stringsArray: any) {
	if (!Array.isArray(stringsArray) || stringsArray.length === 0) {
		throw new Error("You must provide a non-empty array of strings.");
	}
	const randomIndex = Math.floor(Math.random() * stringsArray.length);
	return stringsArray[randomIndex];
}

function getStringsByItemType(itemType: ITEM_TYPE): string[] {
	const itemTypeMapping: Record<ITEM_TYPE, string[]> = {
		[ITEM_TYPE.WEAPONS]: ["Sword", "Axe", "Bow"],
		[ITEM_TYPE.CLOTHING]: ["Shirt", "Pants", "Hat"],
		[ITEM_TYPE.ARMOUR]: ["Plate Armor", "Chainmail", "Leather Armor"],
		[ITEM_TYPE.SHIELDS]: ["Round Shield", "Tower Shield", "Buckler"],
		[ITEM_TYPE.HEADWEAR]: ["Helmet", "Hood", "Crown"],
		[ITEM_TYPE.CLOAKS]:
			["Cape of the Red Prince", "Cloak", "Cindermoth Cloak", "Cloak of Elemental Absorption",
			"Cloak of Protection", "Fleshmelter Cloak", "Reverse Rain Cloak", "Thunderskin Cloak", "Vivacious Cloak",
			"Cloak of Displacement", "Derivation Cloak", "The Deathstalker Mantle", "Wavemother's Cloak",
			"Cloak of the Weave", "Mantle of the Holy Warrior", "Nymph Cloak", "Shade-Slayer Cloak"],
		[ITEM_TYPE.HANDWEAR]: ["Gloves", "Gauntlets", "Bracers"],
		[ITEM_TYPE.FOOTWEAR]: ["Boots", "Sandals", "Greaves"],
		[ITEM_TYPE.AMULETS]: ["Amulet of Strength", "Amulet of Wisdom", "Amulet of Speed"],
		[ITEM_TYPE.RINGS]: ["Ring of Fire", "Ring of Water", "Ring of Power"],
		[ITEM_TYPE.INSTRUMENTS]: ["Flute", "Lute", "Drum"],
		[ITEM_TYPE.AMMUNITION]: ["Arrow", "Bolt", "Stone"],
		[ITEM_TYPE.COATINGS]: ["Poison", "Oil", "Enchantment"],
		[ITEM_TYPE.ELIXIRS]: ["Elixir of Life", "Elixir of Insight", "Elixir of Agility"],
		[ITEM_TYPE.GRENADED]: ["Smoke Bomb", "Firebomb", "Explosive"],
		[ITEM_TYPE.POTIONS]: ["Potion of Healing", "Potion of Strength", "Potion of Magic"],
		[ITEM_TYPE.SCROLLS]: ["Scroll of Fireball", "Scroll of Lightning", "Scroll of Shield"],

		[ITEM_TYPE.BOOKS]: ["Book of Spells", "Book of History", "Book of Secrets"],
		[ITEM_TYPE.CONTAINERS]: ["Bag of Holding", "Chest", "Pouch"],
		[ITEM_TYPE.ALL]: ["Anything and Everything!"]
	};

	return itemTypeMapping[itemType];
}



enum ITEM_TYPE {
	WEAPONS = 0,
	CLOTHING = 1,
	ARMOUR = 2,
	SHIELDS = 3,
	HEADWEAR = 4,
	CLOAKS = 5,
	HANDWEAR = 6,
	FOOTWEAR = 7,
	AMULETS = 8,
	RINGS = 9,
	INSTRUMENTS = 10,
	AMMUNITION = 11,
	COATINGS = 12,
	ELIXIRS = 13,
	GRENADED = 14,
	POTIONS = 15,
	SCROLLS = 16,
	VALUABLES = 16,
	BOOKS = 17,
	CONTAINERS = 18,
	ALL = 19
}

// Remember to rename these classes and interfaces!
interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class DnDLootTablePlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {

		// view registration: ties the unique identifier to the class to create or reuse views:
		this.registerView(VIEW_TYPE_LOOT_TABLE,
			(leaf: WorkspaceLeaf) => new LootTableView(leaf));

		Object.values(ITEM_TYPE).forEach((type) => {
			if (typeof type === 'number') {  // Ensure it's an actual enum value
				const typeName = ITEM_TYPE[type]; // Get the name of the ITEM_TYPE
				this.addCommand({
					id: `loot-table-${typeName.toLowerCase()}`,
					name: `Insert Loot Table: ${typeName}`,
					editorCallback: (editor: Editor, view: MarkdownView) => {
						try {
							const items = getStringsByItemType(type);
							const randomItem = getRandomString(items);
							insertName(editor, randomItem);
						} catch (e) {
							new Notice(`Error: ${e.message}`);
						}
					}
				});
			}
		});


		await this.loadSettings();

		console.log('Loading DnDLootTablePlugin');

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {

			// called when the user clicks the icon:
			new Notice('Schmigma!');
			this.activateView();
		});

		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {
		console.log('Unloading DnDLootTablePlugin');
	}

	async activateView() {

		// get the workspace instance:
		const { workspace } = this.app;

		// find existing leaves of the specified type:
		let workspaceLeaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_LOOT_TABLE);
		if(leaves.length > 0) {
			// our view already exists, use that:
			workspaceLeaf = leaves[0];
		}
		else {
			// set the view of the new leaf:
			workspaceLeaf = workspace.getRightLeaf(false);
			if(!workspaceLeaf) {
				console.log("No workspace leaf found");
				return;
			}
			await workspaceLeaf.setViewState({type: VIEW_TYPE_LOOT_TABLE}, {activate: true});
		}

		// reveal the leaf:
		workspace.revealLeaf(workspaceLeaf);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: DnDLootTablePlugin;

	constructor(app: App, plugin: DnDLootTablePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}

// loot table view class:
export const VIEW_TYPE_LOOT_TABLE = 'loot-table';

export class LootTableView extends ItemView{

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	// returns unique identifier:
	getViewType(): string {
		console.log("LootTableView: get view type");
        return VIEW_TYPE_LOOT_TABLE
    }

	// returns human-friendly name for the view:
    getDisplayText(): string {
		console.log("LootTableView: get display text");
        return 'Loot Table';
    }

	// builds the view when opened:
	async asOpen() {
		console.log("LootTableView: as open");
		const container = this.containerEl.children[1];
		container.empty()
		container.createEl('h4', {text: 'Loot Table View'});
	}

	// cleans up the view when closed:
	async onClose() {
		console.log("LootTableView: as close");
	}
}

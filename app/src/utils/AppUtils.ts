import {App, CachedMetadata, FrontMatterCache, TFile} from "obsidian";
import KObject from "../../../core/src/domain/KObject";

export default class AppUtils {
	constructor(private app: App) {
	}

	async createFile(path: string, textContent: string) {
		await this.app.vault.create(path, textContent);
	}

	async openKObject(ko: KObject) {
		const file = this.getObjectFileOrThrow(ko);
		await this.openFile(file);
	}

	async openFile(file: TFile) {
		const leaf = this.app.workspace.getLeaf(false);
		await leaf.openFile(file);
	}

	getActiveFileOrThrow(): TFile {
		const file = this.getActiveFileOrNull();
		if (!file) {
			throw new Error('No note opened.');
		}

		return file;
	}

	getActiveFileOrNull(): TFile | null {
		return this.app.workspace.getActiveFile();
	}

	getFrontmatterOrNull(file: TFile): FrontMatterCache | null {
		try {
			return this.getFrontmatterOrThrow(file)
		} catch (e) {
			return null;
		}
	}

	getFrontmatterOrThrow(file: TFile): FrontMatterCache {
		let fileCache = this.app.metadataCache.getFileCache(file);
		if (!fileCache) {
			throw new Error(`File cache not found for ${file.path}`);
		}
		if (!fileCache.frontmatter) {
			throw new Error(`Frontmatter not found for ${file.path}`);
		}
		return fileCache.frontmatter;
	}

	getTagsFromFile(file: TFile): string[] {
		const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;

		if (frontmatter && frontmatter.tags) {
			if (typeof frontmatter.tags === "string") {
				return frontmatter.tags.split(",").map(tag => tag.trim());
			}

			if (Array.isArray(frontmatter.tags)) {
				return frontmatter.tags;
			}
		}
		return [];
	}

	getFileByName(parentFileName: string): TFile {
		return this.app.vault.getMarkdownFiles().filter(f => f.name == parentFileName)[0];
	}


	getAllMdFiles() {
		return this.app.vault.getMarkdownFiles();
	}

	getFileCache(file: TFile): CachedMetadata | null {
		return this.app.metadataCache.getFileCache(file);
	}

	findMdWith(filter: (f: TFile) => boolean) {
		return this.getAllMdFiles().filter(filter);
	}

	getObjectFileOrThrow(ko: KObject): TFile {
		let res = this.getObjectFile(ko);
		if (!res) {
			throw new Error("Object file not found for " + ko);
		}
		return res;
	}

	getObjectFile(ko: KObject): TFile | null {
		const a = this.findMdWith(f => {
			const frontmatter = this.getFrontmatterOrNull(f);
			if (!frontmatter) {
				return false;
			}

			const id: string = frontmatter["uid"];
			return id === ko.id;
		});
		return a[0];
	}
}

import Checks, { UservarType } from "../../compiled/other/typecheck";
import * as fs from "fs";
import { configFile, readJsonWithBOM, weborigin } from "./lib";
import { identifyApp } from "./appconfig";
import fetch from "node-fetch";

var checkBookmark = Checks.obj({
	appName: Checks.str(),
	description: Checks.str(),
	appUrl: Checks.str(),
	configUrl: Checks.str(),
	iconUrl: Checks.str(),
	defaultWidth: Checks.num(undefined, 0),
	defaultHeight: Checks.num(undefined, 0),
	minWidth: Checks.num(undefined, 0),
	minHeight: Checks.num(undefined, 0),
	maxWidth: Checks.num(undefined, 0),
	maxHeight: Checks.num(undefined, 0),
	permissions: Checks.arr(Checks.strenum({ "pixel": "Pixel", "overlay": "Overlay", "game": "Game Data" })),
	lastRect: Checks.opt(Checks.obj({
		left: Checks.num(),
		right: Checks.num(),
		bot: Checks.num(),
		top: Checks.num(),
		width: Checks.num(),
		height: Checks.num(),
		pinning: Checks.arr(Checks.strenum({ "left": "Left", "top": "Top", "right": "Right", "bot": "Bottom" }))
	})),
	wasOpen: Checks.bool(),
	iconCached: Checks.str(),
	iconCachedTime: Checks.num(),
});

export type Bookmark = UservarType<typeof checkBookmark>;

var checkSettings = Checks.obj({
	bookmarks: Checks.arr(checkBookmark)
});


export var settings: UservarType<typeof checkSettings>

export async function loadSettings() {
	try {
		let file = JSON.parse(fs.readFileSync("./config.json", "utf8"));
		settings = checkSettings.load(file);
	} catch (e) {
		console.log("couldn't load config");
		settings = checkSettings.default();

		await fetch(`${weborigin}/data/alt1/defaultapps.json`).then(r => readJsonWithBOM(r)).then(async (r: { folder: string, name: string, url: string }[]) => {
			for (let appbase of r) {
				await identifyApp(new URL(`${weborigin}${appbase.url}`));
			}
		});
	}
}

export function saveSettings() {
	let data = JSON.stringify(checkSettings.store(settings), undefined, "\t");
	fs.writeFileSync(configFile, data, { encoding: "utf8" });
}
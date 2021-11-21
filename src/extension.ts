// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';  
import * as path from 'path'; // 导入fs库和path库，哪里来的？npm, yarn了解一下
import { callbackify } from 'util';
import { resolve } from 'path';


import "./utils/utils-extension";

import { DartMethodModel } from './fileCreator/Models';

// import * as creator from './fileCreator/LanguageFileCreator';
import { FileCreator } from './fileCreator/FileCreator';
import { DartCreatorModel } from './fileCreator/FlutterFileCreator';
import { ObjcCreatorModel, SwiftCreatorModel } from './fileCreator/iOSFileCreator';
import { KotlinCreatorModel } from './fileCreator/AndriodFileCreator';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated

	// console.log('Congratulations, your extension "EasyFlutterPlugin" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.EasyFlutterPlugin', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		// vscode.window.showInformationMessage('Hello World from TypeScript!');
		// vscode.window.setStatusBarMessage('Hello World from TypeScript!', 3000);

		handleFlutterVersionChange();
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

///处理版本切换
function handleFlutterVersionChange(){
	var flutterVer = "2.5.0";
	// vscode.window.showInformationMessage("请选择 flutter version ?", '1.17.2', '2.5.0',)
	// .then(function(select){
	// 	console.log(select);
	// 	flutterVer = select ?? "2.5.0";
	// 	handleCreateFiles(flutterVer);
	// });
	vscode.window.showQuickPick(
		[
			{ label: '2.5.0', description: '--flutter version', detail: "replace project origin files."},
			{ label: '1.17.2', description: '--flutter version', detail: "replace project origin files."},
			{ label: '2.5.0', description: '--flutter version', detail: "save to \\Downloads dir."},
			{ label: '1.17.2', description: '--flutter version', detail: "save to \\Downloads dir."}
		],
		{ placeHolder: 'Select the flutter version to convert files.(default 2.5.0 and replace project origin files.)' }
		).then(function(e){
			if (e !== undefined) {
				flutterVer = e!.label;
			}
			console.log(e!.detail);
			let isRepalce = !e!.detail.includes("Downloads");
			handleCreateFiles(flutterVer, isRepalce);
		});

		
}

/**
   创建文件
 * @param version flutter version.
 * @param isReplace 是否去掉原始文件.
 */
function handleCreateFiles(version: string, isReplace: boolean) {
	let workspaceFolders = vscode.workspace.workspaceFolders;
	if (workspaceFolders === undefined || workspaceFolders.length === 0) {
		vscode.window.showInformationMessage('Open flutter plugin project please!');
		return;
	}
	let rootPath = workspaceFolders[0].uri.path;
	let pluginName = rootPath.split("/").reverse()[0];
	let iosPath = rootPath + "/ios/Classes";

	let exampleMainPath = rootPath + "/example/lib";
	let testPath = rootPath + "/test";

	console.log(Date().toLocaleString(), rootPath, pluginName, iosPath, exampleMainPath);

	// const fileName = vscode.workspace.name;
	// console.log(Date().toLocaleString(), fileName);

	if (!vscode.window.activeTextEditor 
		|| vscode.window.activeTextEditor?.document.languageId !== "dart") {
		vscode.window.showErrorMessage("Please select the *.dart file in the lib directory of the flutter plugin project");
		return;
	}

	const currentOpenTabfilePath = vscode.window.activeTextEditor!.document.uri.fsPath;
	const currentlyOpenTabfileName = path.basename(currentOpenTabfilePath);
	console.log(Date().toLocaleString(), currentOpenTabfilePath, currentlyOpenTabfileName);

	const content: string = fs.readFileSync(currentOpenTabfilePath, 'utf8'); 
	// console.log(Date(), content);
	if (!content.includes("MethodChannel(")) {
		vscode.window.showErrorMessage("请选择 flutter 插件工程目录 lib下的 *.dart文件");
		return;
	}

	const lines = content.split("\n");
	// console.log(Date(), lines);

	const clsName = lines.filter(function (value, index, array) {
		return value.startsWith("class ");
	})[0].trim().split(" ")[1];

	// const clsName = pluginName[0].toUpperCase() + pluginName;
	// console.log(Date().toLocaleString(), pluginName, clsName);

	let fucModels: DartMethodModel[] = lines
	.filter(function (value, index, array) {
		return value.includes("Future<");
	})
	.map((e, index) => {  
		// console.log("index:",index, "value:",e); 
		const list = e.split(" ").filter(function (value, index, array) {
			return value !== "";
		});
		const returnVal = list[1];

		// const idx = val.indexOf("> ");
		// const idx1 = val.lastIndexOf("(");
		const name = e.substring(e.indexOf("> ") + 2, e.lastIndexOf("("));
		const param = e.substring(e.indexOf("(") + 1, e.lastIndexOf(")"));
		const paramsType = param.substring(param.indexOf("("), param.lastIndexOf(" "));
		const paramsName = param.replace(paramsType, "");
		const body = e.substring(e.indexOf("{"), e.lastIndexOf("}"));

		const model = new DartMethodModel();
		model.isStatic = list[0].startsWith("static");
		model.isFuture = true;
		model.name = name;
		model.paramsType = paramsType;
		model.paramsName = paramsName;
		model.returnVal = returnVal;
		model.body = body;

		return model;
	});

	let objcFileModel = FileCreator.objc(fucModels, clsName, pluginName, version);

	let swiftFileModel = FileCreator.swift(fucModels, clsName, pluginName, version);

	let kotlinFileModel = FileCreator.kotlin(fucModels, clsName, pluginName, version);

	let dartFileModel = FileCreator.dart(fucModels, clsName, pluginName, version);


	let objcH = objcFileModel.pluginContentH;
	let objcM = objcFileModel.pluginContentM;

	let swiftContent = swiftFileModel.pluginContent;
	
	let kotlinContent = kotlinFileModel.pluginContent;
	
	let dartMainContent = dartFileModel.exampleMainContent;
	let dartTestContent = dartFileModel.pluginTestContent;

	// console.log(Date(), objcH, objcM, objcContent);
	let downloadDir = rootPath.split("/").slice(0, 3).concat("Downloads").join("/");
	console.log(Date(), downloadDir);

	let objcPluginH = `${isReplace ? iosPath : downloadDir}/${clsName}Plugin.h`;
	let objcPluginM = `${isReplace ? iosPath : downloadDir}/${clsName}Plugin.m`;
	let swiftPlugin = `${isReplace ? iosPath : downloadDir}/Swift${clsName}Plugin.swift`;

	let andriodPath = rootPath + `/android/src/main/kotlin/com/example/${pluginName}`;
	let kotlinPlugin = `${isReplace ? andriodPath : downloadDir}/${clsName}Plugin.kt`;

	let dartMain = `${isReplace ? exampleMainPath : downloadDir}/main.dart`;
	let dartTest = `${isReplace ? testPath : downloadDir}/${pluginName}_test.dart`;

	console.log(Date(), objcPluginH, objcPluginM, swiftPlugin, dartMain, kotlinPlugin);
	// /Users/shang/user/example/lib/main.dart

	if (isReplace) {
		if (fs.existsSync(swiftPlugin)) {
			writeFileToDisk(swiftContent, swiftPlugin);
		} else {
			writeFileToDisk(objcH, objcPluginH);
			writeFileToDisk(objcM, objcPluginM);
		}

		if (fs.existsSync(kotlinPlugin)) {
			writeFileToDisk(kotlinContent, kotlinPlugin);
		} else {
			vscode.window.showInformationMessage("Plug-in java file generation is not supported at this time");
		}
	} else {
		writeFileToDisk(swiftContent, swiftPlugin);
		writeFileToDisk(objcH, objcPluginH);
		writeFileToDisk(objcM, objcPluginM);
		writeFileToDisk(kotlinContent, kotlinPlugin);
	}
	writeFileToDisk(dartMainContent, dartMain);
	writeFileToDisk(dartTestContent, dartTest);

	///复制到剪贴板
	vscode.env.clipboard.writeText(kotlinContent);
}

///写入文件
function writeFileToDisk(text: string, filename: string, ) {
    var stream = fs.createWriteStream(filename, { encoding: "utf-8", autoClose: true });
    stream.on("error", function (error: any) {
        vscode.window.showErrorMessage("Could not write to file '" + filename + "'. " + error);
    });
    stream.once('open', function (fd) {
        stream.write(text);
        stream.end();

        // vscode.window.showInformationMessage("Successfully written to file '" + filename + "'.");
		// vscode.window.setStatusBarMessage("Successfully: Easy Flutter Plugin");
		showStatusBarMessage(`Successfully written to file ${filename}.`, 6666);
    });
}

// ///展示选择列表
// function showQuickPicker(items: string[], callback: (e: string) => void){
// 	const quickPick = vscode.window.createQuickPick();
// 	quickPick.items = items.map(label => ({label}));
// 	quickPick.onDidChangeSelection(([{label}]) => {
// 		// vscode.window.showInformationMessage(label);
// 		callback(label);
// 		quickPick.hide();
// 	});
// 	quickPick.show();
// }

/// 状态栏展示操作时间
function showStatusBarMessage(text: string, hideAfterTimeout: number){
	let datetime = new Date().toLocaleString();
	let message = `${datetime}: ${text}`;
	vscode.window.setStatusBarMessage(message, hideAfterTimeout);
	console.log(message);
}


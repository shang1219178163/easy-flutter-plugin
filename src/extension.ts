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
import { JavaCreatorModel, KotlinCreatorModel } from './fileCreator/AndriodFileCreator';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated

	// console.log('Congratulations, your extension "EasyFlutterPlugin" is now active!');
	showTip();

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('shang.EasyFlutterPlugin', () => {
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


///展示命令提示
function showTip(command: string = "easy-flutter-plugin", key: string = "showTip"){
	const workspaceSettings = vscode.workspace.getConfiguration(command);
	console.log(workspaceSettings);

	// workspaceSettings.update(key, true);
	let a = workspaceSettings.get(key);
	if (a) {
		vscode.window.setStatusBarMessage(`'${command.camelCase("-", true)}' is now active!`, 6666);
	}
}

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
	// if (workspaceFolders.length > 1) {
	// 	rootPath = vscode.window.activeTextEditor!.document.uri.path;
	// }
	let pluginName = rootPath.split("/").reverse()[0];
	// let pluginName = path.basename(rootPath);
	console.log(Date().toLocaleString(), pluginName, pluginName.camelCase("_", true));

	let iosPath = rootPath + "/ios/Classes";

	let webPath = rootPath + "/lib";

	let exampleMainPath = rootPath + "/example/lib";
	let testPath = rootPath + "/test";

	console.log(Date().toLocaleString(), rootPath, pluginName, iosPath, exampleMainPath);

	// const fileName = vscode.workspace.name;
	// console.log(Date().toLocaleString(), fileName);

	// let message = "请选择 flutter 插件工程目录 lib下的 *.dart文件.";
	let message = "Please select the *.dart file in the lib directory of the flutter plugin project.";
	if (!vscode.window.activeTextEditor 
		|| vscode.window.activeTextEditor?.document.languageId !== "dart") {
		vscode.window.showErrorMessage(message);
		return;
	}

	const currentOpenTabfilePath = vscode.window.activeTextEditor!.document.uri.fsPath;
	const currentlyOpenTabfileName = path.basename(currentOpenTabfilePath);
	console.log(Date().toLocaleString(), currentOpenTabfilePath, currentlyOpenTabfileName);

	const content: string = fs.readFileSync(currentOpenTabfilePath, 'utf8'); 
	// console.log(Date(), content);
	if (!content.includes("MethodChannel(")) {
		vscode.window.showErrorMessage(message);
		return;
	}

	const lines = content.split("\n");
	// console.log(Date(), lines);
	///插件类名
	let clsName = pluginName.camelCase("_", true);
	clsName += clsName.endsWith("Plugin") ? "" : "Plugin";
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
		// const returnVal = list[1];
		const returnVal = list[1].split(/<|>/)[1];

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

	let javaFileModel = FileCreator.java(fucModels, clsName, pluginName, version);

	let kotlinFileModel = FileCreator.kotlin(fucModels, clsName, pluginName, version);

	let dartFileModel = FileCreator.dart(fucModels, clsName, pluginName, version);

	let webFileModel = FileCreator.web(fucModels, clsName, pluginName, version);

	// console.log(Date(), objcH, objcM, objcContent);
	let downloadDir = rootPath.split("/").slice(0, 3).concat("Downloads").join("/");
	console.log(Date(), downloadDir);

	let objcPluginH = `${isReplace ? iosPath : downloadDir}/${clsName}.h`;
	let objcPluginM = `${isReplace ? iosPath : downloadDir}/${clsName}.m`;
	let swiftPlugin = `${isReplace ? iosPath : downloadDir}/Swift${clsName}.swift`;

	let andriodJavaPluginDir = rootPath + `/android/src/main/java/com/example/${pluginName}`;
	let andriodKotlinPluginDir = rootPath + `/android/src/main/kotlin/com/example/${pluginName}`;

	let javaPlugin = `${isReplace ? andriodJavaPluginDir : downloadDir}/${clsName}.java`;
	let kotlinPlugin = `${isReplace ? andriodKotlinPluginDir : downloadDir}/${clsName}.kt`;

	let webPlugin = `${isReplace ? webPath : downloadDir}/${pluginName}_web.dart`;

	let dartMain = `${isReplace ? exampleMainPath : downloadDir}/main.dart`;
	let dartTest = `${isReplace ? testPath : downloadDir}/${pluginName}_test.dart`;

	console.log(Date(), objcPluginH, objcPluginM, swiftPlugin, dartMain, kotlinPlugin);
	// /Users/shang/user/example/lib/main.dart

	if (isReplace) {
		if (fs.existsSync(swiftPlugin)) {
			writeFileToDisk(swiftFileModel.pluginContent, swiftPlugin);
		} else {
			writeFileToDisk(objcFileModel.pluginContentH, objcPluginH);
			writeFileToDisk(objcFileModel.pluginContentM, objcPluginM);
		}

		if (fs.existsSync(kotlinPlugin)) {
			writeFileToDisk(kotlinFileModel.pluginContent, kotlinPlugin);
		}

		if (fs.existsSync(javaPlugin)) {
			writeFileToDisk(javaFileModel.pluginContent, javaPlugin);
		}

		if (fs.existsSync(webPlugin)) {
			writeFileToDisk(webFileModel.pluginContent, webPlugin);
		}

	} else {
		writeFileToDisk(swiftFileModel.pluginContent, swiftPlugin);
		writeFileToDisk(objcFileModel.pluginContentH, objcPluginH);
		writeFileToDisk(objcFileModel.pluginContentM, objcPluginM);
		writeFileToDisk(kotlinFileModel.pluginContent, kotlinPlugin);
		writeFileToDisk(javaFileModel.pluginContent, javaPlugin);
		writeFileToDisk(webFileModel.pluginContent, webPlugin);
	}

	writeFileToDisk(dartFileModel.exampleMainContent, dartMain);
	writeFileToDisk(dartFileModel.pluginTestContent, dartTest);

	///复制到剪贴板
	// vscode.env.clipboard.writeText(kotlinFileModel.pluginContent);
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


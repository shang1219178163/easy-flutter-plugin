// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';  
import * as path from 'path'; // 导入fs库和path库，哪里来的？npm, yarn了解一下
import { callbackify } from 'util';
import { resolve } from 'path';


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated

	// console.log('Congratulations, your extension "helloworld" is now active!');

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


class DartMethodModel{

	constructor(public isStatic: boolean = true, 
		public isFuture: boolean = true, 
		public notes: string = "/// ", 
		public name: string = "", 
		public paramsType: string = "", 
		public paramsName: string = "", 
		public returnVal: string = "", 
		public body: string = ""){}
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
	let pluginName = rootPath.split("/").reverse()[0];
	let iosPath = rootPath + "/ios/Classes";

	let exampleMainPath = rootPath + "/example/lib";
	let testPath = rootPath + "/test";

	console.log(Date().toLocaleString(), rootPath, pluginName, iosPath, exampleMainPath);

	// const fileName = vscode.workspace.name;
	// console.log(Date().toLocaleString(), fileName);

	if (!vscode.window.activeTextEditor) {
		vscode.window.showErrorMessage("vscode.window.activeTextEditor == null");
		return ;
	}

	if (vscode.window.activeTextEditor?.document.languageId !== "dart") {
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

	let tuples: [DartMethodModel, string, string][] = lines
	.filter(function (value, index, array) {
		return value.includes("Future<");
	})
	.map(function(e, index){ 
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

		// console.log(Date(), name);
		let ocFunc = objcFunc(model.isStatic ? "+" : "-", name, paramsType);
		return [model, ocFunc[0], ocFunc[1]];
	});

	let objcH = createObjcH(tuples, clsName);
	let objcM = createObjcM(tuples, clsName, pluginName);
	let swiftContent = createSwift(tuples, clsName, pluginName);
	
	let kotlinContent = "";
	let dartMainContent = "";
	let dartTestContent = "";
	switch (version) {
		case "1.17.2":
			dartMainContent = createDartExampleMain1172(tuples, clsName, pluginName);
			dartTestContent = createDartPluginTest(tuples, clsName, pluginName);
			kotlinContent = createKotlin1172(tuples, clsName, pluginName);
			break;
	
		default:
			dartMainContent = createDartExampleMain250(tuples, clsName, pluginName);
			dartTestContent = createDartPluginTest(tuples, clsName, pluginName);
			kotlinContent = createKotlin250(tuples, clsName, pluginName);
			break;
	}

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

function objcFunc(prefix: string, name: string, paramsType: string): [string, string] {
	let typeConverDic = new Map([
		["Map<String, dynamic>", "NSDictionary<NSString *, id> *"],
		["List<String>", "NSArray<NSString *> *"],
		["String", "NSString *"],
		["int", "NSNumber *"],
		["double", "NSNumber *"],
		["bool", "NSNumber *"],
	]);

	let ocParamsType = typeConverDic.get(paramsType) ?? "id";

	let ocFuncName = `${prefix} (void)${name}:(${ocParamsType})params callback:(FlutterResult)callback`;

	let ocFuncBody = `
${ocFuncName} {
	NSString *result = [NSString stringWithFormat:@"%@\tparams: %@", NSStringFromSelector(_cmd), params];
	callback(result);
}`;
	switch (paramsType) {
		case "double":
		ocFuncBody = `
${ocFuncName} {
	NSString *result = [NSString stringWithFormat:@"%@  params: %.2f", NSStringFromSelector(_cmd), params.floatValue];
	callback(result);
}`;
		case "bool":
		ocFuncBody = `
${ocFuncName} {
	NSString *result = [NSString stringWithFormat:@"%@  params: %@", NSStringFromSelector(_cmd), params.boolValue ? @"true" : @"false"];
	callback(result);
}`;
		default:
			break;
		}
	return [ocFuncName + ";", ocFuncBody];
}

/// 创建 plugin.h 文件
function createObjcH(tuples: [DartMethodModel, string, string][], clsName: string): string {
    let contentH = `
#import <Flutter/Flutter.h>

@interface ${clsName}Plugin : NSObject<FlutterPlugin>

${tuples.map(function(val, index){ 
	return val[1];	
  }).join("\n\n")}

@end
`;
	return contentH;
}

/// 创建 plugin.m 文件
function createObjcM(tuples: [DartMethodModel, string, string][], clsName: string, pluginName: string): string {
    let contentM = `
#import "${clsName}Plugin.h"

@implementation ${clsName}Plugin

+ (void)registerWithRegistrar:(NSObject<FlutterPluginRegistrar>*)registrar {
  	FlutterMethodChannel* channel = [FlutterMethodChannel methodChannelWithName:@"${pluginName}"
            binaryMessenger:[registrar messenger]];
  	${clsName}Plugin* instance = [[${clsName}Plugin alloc] init];
  	[registrar addMethodCallDelegate:instance channel:channel];
}

- (void)handleMethodCall:(FlutterMethodCall *)call result:(FlutterResult)result{
    // NSLog(@"call.arguments: %@", call.arguments);
    [self reflectMethod:[${clsName}Plugin new]
                   Call:call
                 result:result];
}

/// iOS 类方法/实例方法映射(方法格式: * (void)*MethodName*:(id)params callback:(FlutterResult)callback;)
/// @param instance 类方法传 nil, 实例方法传对应实例
/// @param call FlutterPlugin 参数
/// @param result FlutterPlugin 参数
- (void)reflectMethod:(NSObject *)instance
                 Call:(FlutterMethodCall *)call
               result:(FlutterResult)result {
    NSString *method = call.method; //获取函数名
    id arguments = call.arguments; //获取参数列表
    SEL selector = NSSelectorFromString([NSString stringWithFormat:@"%@:callback:", method]);
    
    if ([instance.class respondsToSelector:selector]) {
        NSMethodSignature *methodSignature = [instance.class methodSignatureForSelector:selector]; // Signature

        NSInvocation *invocation = [NSInvocation invocationWithMethodSignature:methodSignature];
        invocation.target = instance.class;// target
        
        invocation.selector = selector;
        [invocation setArgument:&arguments atIndex:2];
        [invocation setArgument:&result atIndex:3];
        [invocation invoke];
        return;
    }
    
    if (instance && [instance respondsToSelector:selector]) {
        NSMethodSignature *methodSignature = [instance.class instanceMethodSignatureForSelector:selector]; // Signature
    
        NSInvocation *invocation = [NSInvocation invocationWithMethodSignature:methodSignature];
        invocation.target = instance;// target
        
        invocation.selector = selector;
        [invocation setArgument:&arguments atIndex:2];
        [invocation setArgument:&result atIndex:3];
        [invocation invoke];
        return;
    }

    NSLog(@"call.method: %@, call.arguments: %@", call.method, call.arguments);
    result(FlutterMethodNotImplemented);
}

#pragma mark - funtions

${tuples.map(function(val, index){ 
	return val[2];
}).join("\n\n")}

@end
`;
	return contentM;
}

/// 拼接 h 和 m 文件
function createObjcContent(clsName: string, objcH: string, objcM: string): string {
    let content = `
//${clsName}Plugin.h

${objcH}

/*******************************分割线*******************************/

//${clsName}Plugin.m

${objcM}

`;
    return content;
}


/// 创建Swift*plugin.swift 文件
function createSwift(tuples: [DartMethodModel, string, string][], clsName: string, pluginName: string): string {

	function createFuncAbout(model: DartMethodModel): [string, string] {
		let typeConverDic = new Map([
			["Map<String, dynamic>", "[String: Any]"],
			["List<String>", "[String]"],
			["String", "String"],
			["int", "Int"],
			["double", "Double"],
			["bool", "Bool"],
		]);

		let paramsType = typeConverDic.get(model.paramsType) ?? "Any?";
		// let paramsType = "Any?";

		let funcName = `func ${model.name}(_ params: ${paramsType}?, callback: FlutterResult)`;

		let guardDes = `guard let params = params else {
            let error = FlutterError(code: "404", message: "The parameter is abnormal, please check", details: nil)
            return callback(error)
        }`;

		var funcBody = `
	${funcName} {
		${guardDes}
		let result = "\\(#function) \\n params: \\(params)"
		callback(result);
	}`;

		let	switchCase =`\t\tcase "${model.name}":
			${model.name}(call.arguments as? ${paramsType}, callback: result)`;

		if (paramsType === "Any?") {
			funcName = `
	func ${model.name}(_ params: ${paramsType}, callback: FlutterResult)`;
			funcBody = `
	${funcName} {
		let result = "\\(#function) \\n params: \\(params ?? "null")"
		callback(result);
	}`;

			switchCase =`\t\tcase "${model.name}":
			${model.name}(call.arguments, callback: result)`;
		}
		return [switchCase, funcBody];
	}

    let content = `
import Flutter
import UIKit

public class Swift${clsName}Plugin: NSObject, FlutterPlugin {
	
	public static func register(with registrar: FlutterPluginRegistrar) {
		let channel = FlutterMethodChannel(name: "${pluginName}", binaryMessenger: registrar.messenger())
		let instance = Swift${clsName}Plugin()
		registrar.addMethodCallDelegate(instance, channel: channel)
	}
	
	public func handle(_ call: FlutterMethodCall, result: @escaping FlutterResult) {
		switch call.method {
${tuples.map(function(val, index){ 
	return createFuncAbout(val[0])[0];
}).join("\n\n")}
		default:
			print(#function, #line, call.method, call.arguments as Any)
			result(FlutterMethodNotImplemented)
		}
	}
	
	// MARK: -funtions
	
${tuples.map(function(val, index){ 
	return createFuncAbout(val[0])[1];
}).join("\n\n")}
}	
`;
	return content;
}

/// 创建Swift*plugin.swift 文件
function createKotlin1172(tuples: [DartMethodModel, string, string][], clsName: string, pluginName: string): string {

	function createFuncAbout(model: DartMethodModel): [string, string] {
		let typeConverDic = new Map([
			["Map<String, dynamic>", "Map<String, Any?>"],
			["List<String>", "List<String>"],
			["String", "String"],
			["int", "Int"],
			["double", "Double"],
			["bool", "Boolean"],
		]);
		
		let paramsType = typeConverDic.get(model.paramsType) ?? "Any?";
		// let paramsType = "Any?";

		// let funcName = `${model.isStatic ? "static" : ""} fun ${model.name}(params: ${paramsType}, callback: Result)`;
		let funcName = `private fun ${model.name}(params: ${paramsType}, callback: Result)`;

		let funcBody = `
	${funcName} {
	\tval result = "${funcName} \\n params: \${params.toString()}"
	\tcallback.success(result);
	}`;

		let	switchCase =`\t\t"${model.name}" -> ${model.name}(call.arguments as ${paramsType}, result)`;
		return [switchCase, funcBody];
	}

	let content = `
package com.example.${pluginName}

import androidx.annotation.NonNull;

import io.flutter.embedding.engine.plugins.FlutterPlugin
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel
import io.flutter.plugin.common.MethodChannel.MethodCallHandler
import io.flutter.plugin.common.MethodChannel.Result
import io.flutter.plugin.common.PluginRegistry.Registrar

/** ${clsName}Plugin */
public class ${clsName}Plugin: FlutterPlugin, MethodCallHandler {
	/// The MethodChannel that will the communication between Flutter and native Android
	///
	/// This local reference serves to register the plugin with the Flutter Engine and unregister it
	/// when the Flutter Engine is detached from the Activity
	private lateinit var channel : MethodChannel

	override fun onAttachedToEngine(@NonNull flutterPluginBinding: FlutterPlugin.FlutterPluginBinding) {
	channel = MethodChannel(flutterPluginBinding.getFlutterEngine().getDartExecutor(), "${pluginName}")
	channel.setMethodCallHandler(this);
	}

	// This static function is optional and equivalent to onAttachedToEngine. It supports the old
	// pre-Flutter-1.12 Android projects. You are encouraged to continue supporting
	// plugin registration via this function while apps migrate to use the new Android APIs
	// post-flutter-1.12 via https://flutter.dev/go/android-project-migration.
	//
	// It is encouraged to share logic between onAttachedToEngine and registerWith to keep
	// them functionally equivalent. Only one of onAttachedToEngine or registerWith will be called
	// depending on the user's project. onAttachedToEngine or registerWith must both be defined
	// in the same class.
	companion object {
		@JvmStatic
		fun registerWith(registrar: Registrar) {
			val channel = MethodChannel(registrar.messenger(), "${pluginName}")
			channel.setMethodCallHandler(${clsName}Plugin())
		}
	}

	override fun onMethodCall(@NonNull call: MethodCall, @NonNull result: Result) {
		when (call.method) {
${tuples.map(function(val, index){ 
return createFuncAbout(val[0])[0];
}).join("\n\n")}
			else -> result.notImplemented()
		}
	}

	override fun onDetachedFromEngine(@NonNull binding: FlutterPlugin.FlutterPluginBinding) {
		channel.setMethodCallHandler(null)
	}

	// MARK: -funtions

	${tuples.map(function(val, index){ 
		return createFuncAbout(val[0])[1];
	}).join("\n\n")}
}	
`;
	return content;
}

/// 创建Swift*plugin.swift 文件
function createKotlin250(tuples: [DartMethodModel, string, string][], clsName: string, pluginName: string): string {

	function createFuncAbout(model: DartMethodModel): [string, string] {
		let typeConverDic = new Map([
			["Map<String, dynamic>", "Map<String, Any?>"],
			["List<String>", "Array<String>"],
			["String", "String"],
			["int", "Int"],
			["double", "Double"],
			["bool", "Boolean"],
		]);
		
		let paramsType = typeConverDic.get(model.paramsType) ?? "Any?";
		// let paramsType = "Any?";

		// let funcName = `${model.isStatic ? "static" : ""} fun ${model.name}(params: ${paramsType}, callback: Result)`;
		let funcName = `private fun ${model.name}(params: ${paramsType}, callback: Result)`;

		let funcBody = `
	${funcName} {
	\tval result = "${funcName} \\n params: \${params.toString()}"
	\tcallback.success(result);
	}`;

		let	switchCase =`\t\t"${model.name}" -> ${model.name}(call.arguments as ${paramsType}, result)`;
		return [switchCase, funcBody];
	}

	let content = `
package com.example.${pluginName}

import androidx.annotation.NonNull;

import io.flutter.embedding.engine.plugins.FlutterPlugin
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel
import io.flutter.plugin.common.MethodChannel.MethodCallHandler
import io.flutter.plugin.common.MethodChannel.Result
import io.flutter.plugin.common.PluginRegistry.Registrar

/** ${clsName}Plugin */
public class ${clsName}Plugin: FlutterPlugin, MethodCallHandler {
	/// The MethodChannel that will the communication between Flutter and native Android
	///
	/// This local reference serves to register the plugin with the Flutter Engine and unregister it
	/// when the Flutter Engine is detached from the Activity
	private lateinit var channel : MethodChannel

	override fun onAttachedToEngine(@NonNull flutterPluginBinding: FlutterPlugin.FlutterPluginBinding) {
	  channel = MethodChannel(flutterPluginBinding.binaryMessenger, "${pluginName}")
	  channel.setMethodCallHandler(this)
	}

	override fun onMethodCall(@NonNull call: MethodCall, @NonNull result: Result) {
		when (call.method) {
${tuples.map(function(val, index){ 
	return createFuncAbout(val[0])[0];
}).join("\n\n")}
			else -> result.notImplemented()
		}
	}

	override fun onDetachedFromEngine(@NonNull binding: FlutterPlugin.FlutterPluginBinding) {
		channel.setMethodCallHandler(null)
	}

	// MARK: -funtions

	${tuples.map(function(val, index){ 
		return createFuncAbout(val[0])[1];
	}).join("\n\n")}
}	
`;
	return content;
}


/// 创建 plugin example 中 main.dart 页面,方便调试
function createDartExampleMain250(tuples: [DartMethodModel, string, string][], clsName: string, pluginName: string): string {
        
	let privateVars = `
${tuples.map(function(e, index){ 
	return `\tString _${e[0].name} = '${e[0].name}';` ;
}).join("\n")};
`.replace(";;", ";");

	let initPlatformStateContent = `
${tuples.map(function(e, index){ 
	return `\t\t${e[0].name}();`; 
}).join("\n")};
`.replace(";;", ";");
        
	let privateFuncs = tuples.map(function (e, index, array) {
		return `${createMainPrivateFunc(e, clsName)}`;
	}).join("\n");
        
	let children = tuples.map(function (e, index, array) {
		return `\t\t\t\t\t\t\tTextButton(
                onPressed: () => setState(() {
                  ${e[0].name}();
                }),
                child: Text(_${e[0].name}),
              ),`;
        }).join("\n");

    let content = `
import 'package:flutter/material.dart';
import 'dart:async';

import 'package:flutter/services.dart';
import 'package:${pluginName}/${pluginName}.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({Key key}) : super(key: key);

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  final _scaffoldKey = GlobalKey<ScaffoldMessengerState>();
${privateVars}
  @override
  void initState() {
    super.initState();
    initPlatformState();
  }

  /// showSnackBar
  _showSnakeBar(SnackBar snackBar, [bool isReplace = true]) {
    if (isReplace) {
      _scaffoldKey.currentState?.hideCurrentSnackBar();
    }
    _scaffoldKey.currentState?.showSnackBar(snackBar);
  }

  Future<void> initPlatformState() async {
${initPlatformStateContent}
  }
${privateFuncs}

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
	  scaffoldMessengerKey: _scaffoldKey,
      home: Scaffold(
        appBar: AppBar(
          title: const Text('Hello5 Plugin example app'),
        ),
        body: _buildBody(),
      ),
    );
  }
  
  Widget _buildBody() {
    return SafeArea(
      child: SingleChildScrollView(
        child: Center(
          child: Column(
            children: <Widget>[
${children}
            ],
          ),
        ),
      ),
    );
  }
}
`;
	return content;
}

/// 创建 plugin example 中 main.dart 页面,方便调试
function createDartExampleMain1172(tuples: [DartMethodModel, string, string][], clsName: string, pluginName: string): string {
        
	let privateVars = `
${tuples.map(function(e, index){ 
	return `\tString _${e[0].name} = '${e[0].name}';` ;
}).join("\n")};
`.replace(";;", ";");

	let initPlatformStateContent = `
${tuples.map(function(e, index){ 
	return `\t\t${e[0].name}();`; 
}).join("\n")};
`.replace(";;", ";");
        
	let privateFuncs = tuples.map(function (e, index, array) {
		return `${createMainPrivateFunc(e, clsName)}`;
	}).join("\n");
        
	let children = tuples.map(function (e, index, array) {
		return `\t\t\t\t\t\t\tFlatButton(
                onPressed: () => setState(() {
                  ${e[0].name}();
                }),
                child: Text(_${e[0].name}),
              ),
			  \t\t\tDivider(),`;
        }).join("\n");

    let content = `
import 'package:flutter/material.dart';
import 'dart:async';

import 'package:flutter/services.dart';
import 'package:${pluginName}/${pluginName}.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({Key key}) : super(key: key);

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  final _scaffoldKey = GlobalKey<ScaffoldState>();
${privateVars}
  @override
  void initState() {
    super.initState();
    initPlatformState();
  }

  /// showSnackBar
  _showSnakeBar(SnackBar snackBar, [bool isReplace = true]) {
    if (isReplace) {
      _scaffoldKey.currentState?.hideCurrentSnackBar();
    }
    _scaffoldKey.currentState?.showSnackBar(snackBar);
  }

  Future<void> initPlatformState() async {
${initPlatformStateContent}
  }
${privateFuncs}

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
		    key: _scaffoldKey,
        appBar: AppBar(
          title: const Text('${clsName} Plugin example'),
        ),
        body: _buildBody(),
      ),
    );
  }
  
  Widget _buildBody() {
    return SafeArea(
      child: SingleChildScrollView(
        child: Center(
          child: Column(
            children: <Widget>[
${children}
            ],
          ),
        ),
      ),
    );
  }
}
`;
	return content;
}
    
function createMainPrivateFunc(tuple: [DartMethodModel, string, string], clsName: string): string {

	var params = "";
	switch (tuple[0].paramsType) {
	case "Map<String, dynamic>":
		params = `
		final val = {
			"a": "aaa",
			"b": 99,
			"d": 66.0,
			"c": false
		};`;
		break;

    case "List<String>":
        params = `\tfinal val = ["a", "b", "c"];`;
		break;

	case "String":
		params = `\tfinal val = "aaa";`;
		break;

	case "int":
		params = `\tfinal val = 66;`;
		break;

	case "double":
		params = `\tfinal val = 88.0;`;
		break;

	case "bool":
		params = `\tfinal val = false;`;
		break;

	default:
		break;
	}
    
	let paramsName = params !== "" ? "val" : "";
	
	let body =`
  Future<void> ${tuple[0].name}() async {
	${params}
    String result = await ${clsName}.${tuple[0].name}(${paramsName});
    setState(() {
      _${tuple[0].name} = result;
    });

    _showSnakeBar(SnackBar(content: Text(result)));
  }`;
	return body;
}

/// 创建 plugin *_test.dart
function createDartPluginTest(tuples: [DartMethodModel, string, string][], clsName: string, pluginName: string): string {

	function createPluginTestFunc(tuple: [DartMethodModel, string, string], clsName: string, pluginName: string): string {
		var params = "";
		switch (tuple[0].paramsType) {
		case "Map<String, dynamic>":
			params = `
		final val = {
			"a": "aaa",
			"b": 99,
			"d": 66.0,
			"c": false
		};`;
			break;
	
		case "List<String>":
			params = `final val = ["a", "b", "c"];`;
			break;
	
		case "String":
			params = `final val = "aaa";`;
			break;
	
		case "int":
			params = `final val = 66;`;
			break;
	
		case "double":
			params = `final val = 88.0;`;
			break;
	
		case "bool":
			params = `final val = false;`;
			break;
	
		default:
			break;
		}
		
		let paramsName = params !== "" ? "val" : "";
	
		let testFucBody =`
	test('${tuple[0].name}', () async {
		${params}
		expect(await ${clsName}.${tuple[0].name}(${paramsName}), isInstanceOf<String>());
	});`;
		return testFucBody;
	}

	let fileContent = 
`
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hello_test_one/hello_test_one.dart';

void main() {
  const MethodChannel channel = MethodChannel('hello_test_one');

  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    channel.setMockMethodCallHandler((MethodCall methodCall) async {
      return '42';
    });
  });

  tearDown(() {
    channel.setMockMethodCallHandler(null);
  });

  ${tuples.map(function(val, index){ 
	return createPluginTestFunc(val, clsName, pluginName);
	}).join("\n")}
}
`;
	return fileContent;
}


///写入文件
function writeFileToDisk(text: string, filename: string) {
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


/// 方法扩展
declare global {
	interface String {
		format(...args: string[]): string;

		isEmpty: () => boolean;
		/// 首字母大写
		toCapitalized(): string;
	
		substringBetween(prefix: string, suffix: string, isContain: boolean): string;
	
	}

	// interface Array<T> {
	// 	first?: T;
	// 	last?: T;
	// }
}


String.prototype.format = function (...args: string[]): string {
	var s = this;
	return s.replace(/{(\d+)}/g, function (match, number) {
		return (typeof args[number] !== 'undefined') ? args[number] : match;
	});
};
 
String.prototype.isEmpty = function (): boolean {
    return this.trim() === '';
};

String.prototype.toCapitalized = function (): string {
	return this[0].toUpperCase() + this.substr(1).toLowerCase();
};
 
String.prototype.substringBetween = function(prefix: string, suffix: string, isContain: boolean = false): string {
	const startIdx = this.indexOf(prefix);
	const endIdx = this.lastIndexOf(suffix);
	if (isContain === true) {
		return this.substring(startIdx, endIdx);
	}
	const result = this.substring(startIdx + prefix.length, endIdx);
	return result;
};

// Array.prototype.first = function<T> (): T {
// 	console.log(this);
// 	return this.length > 0 ? this[0] : null;
// };

// Array.prototype.last = function<T> (): T {
// 	console.log(this);
// 	return this.length > 0 ? this[this.length - 1] : null;
// };

// Array.prototype.subarray = function(start, end) {
//     if (!end) { end = -1; } 
//     return this.slice(start, this.length + 1 - (end * -1));
// };
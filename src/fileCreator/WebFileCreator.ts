//
//  Webfilecreator.ts
//  easy-flutter-plugin
//
//  Created by shangbinbin on 2021/11/24.
//  Copyright © 2021 Shang. All rights reserved.
//
//


import { DartMethodModel } from './Models';


export class WebCreatorModel {

    readonly pluginContent: string = "";
  
    constructor(
        public models: DartMethodModel[],
        public clsName: string,
        public pluginName: string,
        public flutterVersion: string){
        switch (flutterVersion) {
        case "1.17.2":
            this.pluginContent = this.createPlugin1172(models, clsName, pluginName);
            break;
        
        default:
            this.pluginContent = this.createPlugin250(models, clsName, pluginName);
            break;
        }
    }  

    /// 创建*plugin_web.dart 文件
    private createPlugin1172(models: DartMethodModel[], clsName: string, pluginName: string): string {
        /// return [func, swith case]
        function createFuncAbout(model: DartMethodModel): [string, string] {
            let typeConverDic = new Map([
                ["Map<String, dynamic>", "Map<Object?, Object?>"],
                ["List<String>", "List<Object?>"],
                ["String", "String"],
                ["int", "int"],
                ["double", "double"],
                ["bool", "bool"],
            ]);
            
            let paramsType = typeConverDic.get(model.paramsType) ?? "";
            // let paramsType = "Any?";

            // let funcName = `${model.isStatic ? "static" : ""} fun ${model.name}(params: ${paramsType}, callback: Result)`;
            let funcName = `Future<String> ${model.name}(${paramsType} params) async`;
            if (paramsType === "") {
                funcName = `Future<String> ${model.name}() async`;
            }

            let funcBody =`
    ${funcName} {
    \tfinal result = "${model.name} \\n params: \${params.toString()}";
    \treturn result;
    }`;

            if (paramsType === "") {
    funcBody =`
    ${funcName} {
    \tfinal result = "${model.name}";
    \treturn result;
    }`;
            }
            let	switchCase =`
        \tcase '${model.name}':
            return ${model.name}(call.arguments as ${paramsType});`;
            if (paramsType === "") {
                switchCase =`
        \tcase "${model.name}":
            return ${model.name}();`; 
            }
            return [funcBody, switchCase,];
        }

        let content = `
import 'dart:async';
// In order to *not* need this ignore, consider extracting the "web" version
// of your plugin as a separate package, instead of inlining it in the same
// package as the core of your plugin.
// ignore: avoid_web_libraries_in_flutter
import 'dart:html' as html show window;

import 'package:flutter/services.dart';
import 'package:flutter_web_plugins/flutter_web_plugins.dart';

/// A web implementation of the ${clsName} plugin.
class ${clsName}Web {
    static void registerWith(Registrar registrar) {
        final MethodChannel channel = MethodChannel(
            '${pluginName}',
            const StandardMethodCodec(),
            registrar,
        );

        final pluginInstance = ${clsName}Web();
        channel.setMethodCallHandler(pluginInstance.handleMethodCall);
    }

    /// Handles method calls over the MethodChannel of this plugin.
    /// Note: Check the "federated" architecture for a new way of doing this:
    /// https://flutter.dev/go/federated-plugins
    Future<dynamic> handleMethodCall(MethodCall call) async {
        switch (call.method) {
${models.map((e, index) => { 
    return createFuncAbout(e)[1];
}).join("\n")}
          default:
              throw PlatformException(
              code: 'Unimplemented',
              details:
                  "${pluginName} for web doesn\'t implement \'\${call.method}\'",
              );
          }
    }


    // MARK: -funtions

${models.map((e, index) => { 
    return createFuncAbout(e)[0];
}).join("\n\n")}
}	
`;
        return content;
    }
    /// 创建*plugin_web.dart 文件
    private createPlugin250(models: DartMethodModel[], clsName: string, pluginName: string): string {
        /// return [func, swith case]
        function createFuncAbout(model: DartMethodModel): [string, string] {
            let typeConverDic = new Map([
                ["Map<String, dynamic>", "Map<Object?, Object?>"],
                ["List<String>", "List<Object?>"],
                ["String", "String"],
                ["int", "int"],
                ["double", "double"],
                ["bool", "bool"],
            ]);
            
            let paramsType = typeConverDic.get(model.paramsType) ?? "";
            // let paramsType = "Any?";

            // let funcName = `${model.isStatic ? "static" : ""} fun ${model.name}(params: ${paramsType}, callback: Result)`;
            let funcName = `Future<String> ${model.name}(${paramsType} params) async`;
            if (paramsType === "") {
                funcName = `Future<String> ${model.name}() async`;
            }

            let funcBody =`
    ${funcName} {
    \tfinal result = "${model.name} \\n params: \${params.toString()}";
    \treturn result;
    }`;

            if (paramsType === "") {
    funcBody =`
    ${funcName} {
    \tfinal result = "${model.name}";
    \treturn result;
    }`;
            }
            let	switchCase =`
        \tcase '${model.name}':
            return ${model.name}(call.arguments as ${paramsType});`;
            if (paramsType === "") {
                switchCase =`
        \tcase "${model.name}":
            return ${model.name}();`; 
            }
            return [funcBody, switchCase,];
        }

        let content = `
import 'dart:async';
// In order to *not* need this ignore, consider extracting the "web" version
// of your plugin as a separate package, instead of inlining it in the same
// package as the core of your plugin.
// ignore: avoid_web_libraries_in_flutter
import 'dart:html' as html show window;

import 'package:flutter/services.dart';
import 'package:flutter_web_plugins/flutter_web_plugins.dart';

/// A web implementation of the ${clsName} plugin.
class ${clsName}Web {
    static void registerWith(Registrar registrar) {
        final MethodChannel channel = MethodChannel(
            '${pluginName}',
            const StandardMethodCodec(),
            registrar,
        );

        final pluginInstance = ${clsName}Web();
        channel.setMethodCallHandler(pluginInstance.handleMethodCall);
    }

    /// Handles method calls over the MethodChannel of this plugin.
    /// Note: Check the "federated" architecture for a new way of doing this:
    /// https://flutter.dev/go/federated-plugins
    Future<dynamic> handleMethodCall(MethodCall call) async {
        switch (call.method) {
${models.map((e, index) => { 
    return createFuncAbout(e)[1];
}).join("\n")}

          default:
              throw PlatformException(
              code: 'Unimplemented',
              details:
                  "${pluginName} for web doesn\'t implement \'\${call.method}\'",
              );
          }
    }


    // MARK: -funtions
${models.map((e, index) => { 
    return createFuncAbout(e)[0];
}).join("\n\n")}
}	
`;
        return content;
    }
}  
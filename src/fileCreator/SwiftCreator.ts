//
//  Swiftfilecreator.ts
//  easy-flutter-plugin
//
//  Created by shangbinbin on 2021/11/19.
//  Copyright © 2021 Shang. All rights reserved.
//
//


import { DartMethodModel } from './Models';

export module SwiftCreator {
    /// 创建Swift*plugin.swift 文件
    export function createPlugin(models: DartMethodModel[], clsName: string, pluginName: string): string {

        /// return [func, swith case]
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

            let	switchCase =
            `\t\tcase "${model.name}":
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
            return [funcBody, switchCase];
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
${models.map((e, index) => { 
    return createFuncAbout(e)[1];
}).join("\n")}
        default:
            print(#function, #line, call.method, call.arguments as Any)
            result(FlutterMethodNotImplemented)
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


export class SwiftCreatorModel {

    readonly pluginContent: string = "";

 	constructor(
        public models: DartMethodModel[],
        public clsName: string,
        public pluginName: string,
        public flutterVersion: string){
            this.pluginContent = SwiftCreator.createPlugin(models, clsName, pluginName);
        }
    
}

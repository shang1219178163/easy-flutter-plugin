//
//  Ioscreator.ts
//  easy-flutter-plugin
//
//  Created by shangbinbin on 2021/11/21.
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


export module ObjcCreator {
    function createFunc(model: DartMethodModel): [string, string] {
        let typeConverDic = new Map([
            ["Map<String, dynamic>", "NSDictionary<NSString *, id> *"],
            ["List<String>", "NSArray<NSString *> *"],
            ["String", "NSString *"],
            ["int", "NSNumber *"],
            ["double", "NSNumber *"],
            ["bool", "NSNumber *"],
        ]);
    
        let ocParamsType = typeConverDic.get(model.paramsType) ?? "id";
    
        let prefix = model.isStatic ? "+" : "-";
        let ocFuncName = `${prefix} (void)${model.name}:(${ocParamsType})params callback:(FlutterResult)callback`;
    
        let ocFuncBody = `
${ocFuncName} {
    NSString *result = [NSString stringWithFormat:@"%@\tparams: %@", NSStringFromSelector(_cmd), params];
    callback(result);
}`;
        switch (model.paramsType) {
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
    
    /// 创建 plugin.h and plugin.m 文件
    export function createClass(models: DartMethodModel[], clsName: string, pluginName: string): [string, string] {
        let tuples = models.map((e) => {
            return createFunc(e);
        });
    
        let contentH = `
#import <Flutter/Flutter.h>

@interface ${clsName}Plugin : NSObject<FlutterPlugin>

${tuples.map((e, index) => { 
    return e[0];	
}).join("\n\n")}

@end
`;
    
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

${tuples.map((e, index) => { 
    return e[1];
}).join("\n\n")}

@end
`;
        return [contentH, contentM];
    }
    
}


export class ObjcCreatorModel {

    readonly pluginContentH: string = "";
    readonly pluginContentM: string = "";

    constructor(
        public models: DartMethodModel[],
        public clsName: string,
        public pluginName: string,
        public flutterVersion: string){
            let objcFileTuple = ObjcCreator.createClass(models, clsName, pluginName);
            this.pluginContentH = objcFileTuple[0];
            this.pluginContentM = objcFileTuple[1];
    }  
}



//
//  Andriodcreator.ts
//  easy-flutter-plugin
//
//  Created by shangbinbin on 2021/11/21.
//  Copyright © 2021 Shang. All rights reserved.
//
//


import { DartMethodModel } from './Models';

export module KotlinCreator {

    /// 创建*plugin.kt 文件
    export function createPlugin1172(models: DartMethodModel[], clsName: string, pluginName: string): string {
        /// return [func, swith case]
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

            let	switchCase =`\t\t\t"${model.name}" -> ${model.name}(call.arguments as ${paramsType}, result)`;
            return [funcBody, switchCase,];
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
${models.map((e, index) => { 
    return createFuncAbout(e)[1];
}).join("\n")}
            else -> result.notImplemented()
        }
    }

    override fun onDetachedFromEngine(@NonNull binding: FlutterPlugin.FlutterPluginBinding) {
        channel.setMethodCallHandler(null)
    }

    // MARK: -funtions

${models.map((e, index) => { 
    return createFuncAbout(e)[0];
}).join("\n\n")}
}	
`;
        return content;
    }

    /// 创建*plugin.kt 文件
    export function createPlugin250(models: DartMethodModel[], clsName: string, pluginName: string): string {
        /// return [func, swith case]
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
${models.map((e, index) => { 
    return createFuncAbout(e)[1];
}).join("\n\n")}
                else -> result.notImplemented()
            }
        }

        override fun onDetachedFromEngine(@NonNull binding: FlutterPlugin.FlutterPluginBinding) {
            channel.setMethodCallHandler(null)
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


export class KotlinCreatorModel {

    readonly pluginContent: string = "";
  
    constructor(
        public models: DartMethodModel[],
        public clsName: string,
        public pluginName: string,
        public flutterVersion: string){
        switch (flutterVersion) {
        case "1.17.2":
            this.pluginContent = KotlinCreator.createPlugin1172(models, clsName, pluginName);
            break;
        
        default:
            this.pluginContent = KotlinCreator.createPlugin250(models, clsName, pluginName);
            break;
        }
    }  
}


export class JavaCreatorModel {

    readonly pluginContent: string = "";
	// static pluginContent: any;
  
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

    /// 创建*plugin.java 文件
    createPlugin1172(models: DartMethodModel[], clsName: string, pluginName: string): string {
        /// return [func, swith case]
        function createFuncAbout(model: DartMethodModel): [string, string] {
            let typeConverDic = new Map([
                ["Map<String, dynamic>", "HashMap<String, Object>"],
                ["List<String>", "List<String>"],
                ["String", "String"],
                ["int", "int"],
                ["double", "double"],
                ["bool", "boolean"],
            ]);
            
            let paramsType = typeConverDic.get(model.paramsType) ?? "";
            // let paramsType = "Any?";

            // let funcName = `${model.isStatic ? "static" : ""} fun ${model.name}(params: ${paramsType}, callback: Result)`;
            let funcName = `private void ${model.name}(${paramsType} params, @NonNull Result callback)`;
            if (paramsType === "") {
                funcName = `private void ${model.name}(@NonNull Result callback)`;
            }

            let funcBody = `
    ${funcName} {
    \tString method = Thread.currentThread().getStackTrace()[2].getMethodName();
    \tString result = String.format("%s \\n params: %s", method, params);
    \tcallback.success(result);
    }`;

            if (paramsType === "") {
    funcBody = `
    ${funcName} {
    \tString method = Thread.currentThread().getStackTrace()[2].getMethodName();
    \tString result = String.format("%s \\n params: null", method);
    \tcallback.success(result);
    }`;
            }
            let	switchCase =
        `\t\tcase "${model.name}":
            ${model.name}((${paramsType}) call.arguments, result);;
            break;
            `;
            if (paramsType === "") {
                switchCase =
        `\t\tcase "${model.name}":
            ${model.name}(result);;
            break;
            `; 
            }
            return [funcBody, switchCase,];
        }

        let content = `
package com.example.${pluginName};

import androidx.annotation.NonNull;

import java.util.HashMap;
import java.util.List;

import io.flutter.embedding.engine.plugins.FlutterPlugin;
import io.flutter.plugin.common.MethodCall;
import io.flutter.plugin.common.MethodChannel;
import io.flutter.plugin.common.MethodChannel.MethodCallHandler;
import io.flutter.plugin.common.MethodChannel.Result;
import io.flutter.plugin.common.PluginRegistry.Registrar;

/** ${clsName}Plugin */
public class ${clsName}Plugin implements FlutterPlugin, MethodCallHandler {
    /// The MethodChannel that will the communication between Flutter and native Android
    ///
    /// This local reference serves to register the plugin with the Flutter Engine and unregister it
    /// when the Flutter Engine is detached from the Activity
    private MethodChannel channel;
    
    @Override
    public void onAttachedToEngine(@NonNull FlutterPluginBinding flutterPluginBinding) {
        channel = new MethodChannel(flutterPluginBinding.getFlutterEngine().getDartExecutor(), "${pluginName}");
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
    public static void registerWith(Registrar registrar) {
        final MethodChannel channel = new MethodChannel(registrar.messenger(), "${pluginName}");
        channel.setMethodCallHandler(new ${clsName}Plugin());
    }
    
    @Override
    public void onMethodCall(@NonNull MethodCall call, @NonNull Result result) {
        switch (call.method) {
            ${models.map((e, index) => { 
                return createFuncAbout(e)[1];
            }).join("\n")}
        default :
            result.notImplemented();
            break;   
        }       
    }

    @Override
    public void onDetachedFromEngine(@NonNull FlutterPluginBinding binding) {
        channel.setMethodCallHandler(null);
    }

    // MARK: -funtions

${models.map((e, index) => { 
    return createFuncAbout(e)[0];
}).join("\n\n")}
}	
`;
        return content;
    }

    /// 创建*plugin.java 文件
    /// 创建*plugin.java 文件
    createPlugin250(models: DartMethodModel[], clsName: string, pluginName: string): string {
        /// return [func, swith case]
        function createFuncAbout(model: DartMethodModel): [string, string] {
            let typeConverDic = new Map([
                ["Map<String, dynamic>", "HashMap<String, Object>"],
                ["List<String>", "List<String>"],
                ["String", "String"],
                ["int", "int"],
                ["double", "double"],
                ["bool", "boolean"],
            ]);
            
            let paramsType = typeConverDic.get(model.paramsType) ?? "";
            // let paramsType = "Any?";

            // let funcName = `${model.isStatic ? "static" : ""} fun ${model.name}(params: ${paramsType}, callback: Result)`;
            let funcName = `private void ${model.name}(${paramsType} params, @NonNull Result callback)`;
            if (paramsType === "") {
                funcName = `private void ${model.name}(@NonNull Result callback)`;
            }

            let funcBody =`
    ${funcName} {
    \tString method = Thread.currentThread().getStackTrace()[2].getMethodName();
    \tString result = String.format("%s \\n params: %s", method, params);
    \tcallback.success(result);
    }`;

            if (paramsType === "") {
    funcBody =`
    ${funcName} {
    \tString method = Thread.currentThread().getStackTrace()[2].getMethodName();
    \tString result = String.format("%s \\n params: null", method);
    \tcallback.success(result);
    }`;
            }
            let	switchCase =
        `\t\tcase "${model.name}":
            ${model.name}((${paramsType}) call.arguments, result);;
            break;
            `;
            if (paramsType === "") {
                switchCase =
        `\t\tcase "${model.name}":
            ${model.name}(result);;
            break;
            `; 
            }
            return [funcBody, switchCase,];
        }

        let content = `
package com.example.${pluginName};

import androidx.annotation.NonNull;

import java.util.HashMap;
import java.util.List;

import io.flutter.embedding.engine.plugins.FlutterPlugin;
import io.flutter.plugin.common.MethodCall;
import io.flutter.plugin.common.MethodChannel;
import io.flutter.plugin.common.MethodChannel.MethodCallHandler;
import io.flutter.plugin.common.MethodChannel.Result;
import io.flutter.plugin.common.PluginRegistry.Registrar;

/** ${clsName}Plugin */
public class ${clsName}Plugin implements FlutterPlugin, MethodCallHandler {
    /// The MethodChannel that will the communication between Flutter and native Android
    ///
    /// This local reference serves to register the plugin with the Flutter Engine and unregister it
    /// when the Flutter Engine is detached from the Activity
    private MethodChannel channel;
    
    @Override
    public void onAttachedToEngine(@NonNull FlutterPluginBinding flutterPluginBinding) {
        channel = new MethodChannel(flutterPluginBinding.getBinaryMessenger(), "${pluginName}");
        channel.setMethodCallHandler(this);
    }
    
    @Override
    public void onMethodCall(@NonNull MethodCall call, @NonNull Result result) {
        switch (call.method) {
${models.map((e, index) => { 
    return createFuncAbout(e)[1];
}).join("\n")}
        default :
            result.notImplemented();
            break;   
        }   
    }

    @Override
    public void onDetachedFromEngine(@NonNull FlutterPluginBinding binding) {
        channel.setMethodCallHandler(null);
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
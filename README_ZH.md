# EasyFlutterPlugin
VSCode 插件开发

<a href="https://flutter.dev/">
  <img src="https://img.shields.io/badge/flutter-%3E%3D%201.17.2-green.svg"/>
</a>
<a href="https://opensource.org/licenses/MIT">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg"/>
</a>

在 vscode, 搜索关键字 "easy-flutter-plugin" 即可.

## [English](https://github.com/shang1219178163/easy-flutter-plugin/blob/main/README.md) | 中文

插件根据 flutter plugin 项目的 lib 目录 *.dart 文件方法自动映射生成 oc 方法声明；开发这只需要关注oc方法内部实现即可；

**\*.dart => Swift\*Plugin.swift/(\*Plugin.h +  \*Plugin.m) +  \*Plugin.kt/ \*Plugin.java +  \*_test.dart + main.dart**

## Features
使用容易，节约时间和精力去实现核心代码.

## Usage：
choose /lib/*.dart, and Right-click menu 'Easy Flutter Plugin'

![Usage](https://github.com/shang1219178163/easy-flutter-plugin/blob/main/images/screenshot.png?raw=true)

![iPhone_screenshot](https://github.com/shang1219178163/easy-flutter-plugin/blob/main/screenshots/Screen%20Shot%20-%20iPhone%2012%20Pro%20-%202021-11-22.png?raw=true)

![andriod_screenshot](https://github.com/shang1219178163/easy-flutter-plugin/blob/main/screenshots/andriod_screenshot_2021-11-22.png?raw=true)

example：
```
import 'dart:async';

import 'package:flutter/services.dart';

class User {
  static const MethodChannel _channel = const MethodChannel('user');

  ///
  static Future<String> getPlatformVersion() async {
    String value = await _channel.invokeMethod('getPlatformVersion');
    return value;
  }

  ///
  static Future<String> getAppVersion(Map<String, dynamic> val) async {
    String value = await _channel.invokeMethod('getAppVersion', val);
    return value;
  }

  static Future<String> getAppVersion1(List<String> val) async {
    String value = await _channel.invokeMethod('getAppVersion1', val);
    return value;
  }

  static Future<String> getAppVersion2(String val) async {
    String value = await _channel.invokeMethod('getAppVersion2', val);
    return value;
  }

  static Future<String> getAppVersion3(int val) async {
    String value = await _channel.invokeMethod('getAppVersion3', val);
    return value;
  }

  static Future<String> getAppVersion4(double val) async {
    String value = await _channel.invokeMethod('getAppVersion4', val);
    return value;
  }

  static Future<String> getAppVersion5(bool val) async {
    String value = await _channel.invokeMethod('getAppVersion5', val);
    return value;
  }
}
```
UserPlugin.h
```
#import <Flutter/Flutter.h>

@interface UserPlugin : NSObject<FlutterPlugin>

+ (void)getPlatformVersion:(id)params callback:(FlutterResult)callback;

+ (void)getAppVersion:(NSDictionary<NSString *, id> *)params callback:(FlutterResult)callback;

+ (void)getAppVersion1:(NSArray<NSString *> *)params callback:(FlutterResult)callback;

+ (void)getAppVersion2:(NSString *)params callback:(FlutterResult)callback;

+ (void)getAppVersion3:(NSNumber *)params callback:(FlutterResult)callback;

+ (void)getAppVersion4:(NSNumber *)params callback:(FlutterResult)callback;

+ (void)getAppVersion5:(NSNumber *)params callback:(FlutterResult)callback;

@end
```

UserPlugin.m
```
#import "UserPlugin.h"

@implementation UserPlugin

+ (void)registerWithRegistrar:(NSObject<FlutterPluginRegistrar>*)registrar {
  FlutterMethodChannel* channel = [FlutterMethodChannel
      methodChannelWithName:@"user"
            binaryMessenger:[registrar messenger]];
  UserPlugin* instance = [[UserPlugin alloc] init];
  [registrar addMethodCallDelegate:instance channel:channel];
}

- (void)handleMethodCall:(FlutterMethodCall *)call result:(FlutterResult)result{
    // NSLog(@"call.arguments: %@", call.arguments);
    [self reflectMethod:UserPlugin.class
               instance:[UserPlugin new]
                   Call:call
                 result:result];
}

/// iOS 类方法/实例方法映射(方法格式: * (void)*MethodName*:(id)params callback:(FlutterResult)callback;)
///
/// @param cls 类参数: UserManager.class
/// @param instance 类方法传 nil, 实例方法传对应实例
/// @param call FlutterPlugin 参数
/// @param result FlutterPlugin 参数
- (void)reflectMethod:(Class)cls
             instance:(nullable NSObject *)instance
                 Call:(FlutterMethodCall *)call
               result:(FlutterResult)result {
    NSString *method = call.method; //获取函数名
    id arguments = call.arguments; //获取参数列表
    SEL selector = NSSelectorFromString([NSString stringWithFormat:@"%@:callback:", method]);
    
    if ([cls respondsToSelector:selector]) {
        NSMethodSignature *methodSignature = [cls methodSignatureForSelector:selector]; // Signature

        NSInvocation *invocation = [NSInvocation invocationWithMethodSignature:methodSignature];
        invocation.target = cls;// target
        
        invocation.selector = selector;
        [invocation setArgument:&arguments atIndex:2];
        [invocation setArgument:&result atIndex:3];
        [invocation invoke];
        return;
    }
    
    if (instance && [instance respondsToSelector:selector]) {
        NSMethodSignature *methodSignature = [cls instanceMethodSignatureForSelector:selector]; // Signature
    
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


+ (void)getPlatformVersion:(id)params callback:(FlutterResult)callback {
	NSString *result = [NSString stringWithFormat:@"%@	params: %@", NSStringFromSelector(_cmd), params];
	callback(result);
}


+ (void)getAppVersion:(NSDictionary<NSString *, id> *)params callback:(FlutterResult)callback {
	NSString *result = [NSString stringWithFormat:@"%@	params: %@", NSStringFromSelector(_cmd), params];
	callback(result);
}


+ (void)getAppVersion1:(NSArray<NSString *> *)params callback:(FlutterResult)callback {
	NSString *result = [NSString stringWithFormat:@"%@	params: %@", NSStringFromSelector(_cmd), params];
	callback(result);
}


+ (void)getAppVersion2:(NSString *)params callback:(FlutterResult)callback {
	NSString *result = [NSString stringWithFormat:@"%@	params: %@", NSStringFromSelector(_cmd), params];
	callback(result);
}


+ (void)getAppVersion3:(NSNumber *)params callback:(FlutterResult)callback {
	NSString *result = [NSString stringWithFormat:@"%@	params: %@", NSStringFromSelector(_cmd), params];
	callback(result);
}


+ (void)getAppVersion4:(NSNumber *)params callback:(FlutterResult)callback {
	NSString *result = [NSString stringWithFormat:@"%@  params: %@", NSStringFromSelector(_cmd), params.boolValue ? @"true" : @"false"];
	callback(result);
}


+ (void)getAppVersion5:(NSNumber *)params callback:(FlutterResult)callback {
	NSString *result = [NSString stringWithFormat:@"%@  params: %@", NSStringFromSelector(_cmd), params.boolValue ? @"true" : @"false"];
	callback(result);
}

@end
```

##### hello_test_one.swift
```
import Flutter
import UIKit

public class SwiftHelloTestOnePlugin: NSObject, FlutterPlugin {
    
    public static func register(with registrar: FlutterPluginRegistrar) {
        let channel = FlutterMethodChannel(name: "hello_test_one", binaryMessenger: registrar.messenger())
        let instance = SwiftHelloTestOnePlugin()
        registrar.addMethodCallDelegate(instance, channel: channel)
    }
    
    public func handle(_ call: FlutterMethodCall, result: @escaping FlutterResult) {
        switch call.method {
		case "getPlatformVersion":
            getPlatformVersion(call.arguments, callback: result)
		case "getAppVersion":
            getAppVersion(call.arguments as? [String: Any], callback: result)
		case "getAppVersion1":
            getAppVersion1(call.arguments as? [String], callback: result)
		case "getAppVersion2":
            getAppVersion2(call.arguments as? String, callback: result)
		case "getAppVersion3":
            getAppVersion3(call.arguments as? Int, callback: result)
		case "getAppVersion4":
            getAppVersion4(call.arguments as? Double, callback: result)
		case "getAppVersion5":
            getAppVersion5(call.arguments as? Bool, callback: result)
        default:
            print(#function, #line, call.method, call.arguments as Any)
            result(FlutterMethodNotImplemented)
        }
    }
    
    // MARK: -funtions
    func getPlatformVersion(_ params: Any?, callback: FlutterResult) {
        let result = "\(#function) \n params: \(params ?? "null")"
        callback(result);
    }

    func getAppVersion(_ params: [String: Any]?, callback: FlutterResult) {
        guard let params = params else {
            let error = FlutterError(code: "404", message: "The parameter is abnormal, please check", details: nil)
            return callback(error)
        }
        let result = "\(#function) \n params: \(params)"
        callback(result);
    }

    func getAppVersion1(_ params: [String]?, callback: FlutterResult) {
        guard let params = params else {
            let error = FlutterError(code: "404", message: "The parameter is abnormal, please check", details: nil)
            return callback(error)
        }
        let result = "\(#function) \n params: \(params)"
        callback(result);
    }

    func getAppVersion2(_ params: String?, callback: FlutterResult) {
        guard let params = params else {
            let error = FlutterError(code: "404", message: "The parameter is abnormal, please check", details: nil)
            return callback(error)
        }
        let result = "\(#function) \n params: \(params)"
        callback(result);
    }

    func getAppVersion3(_ params: Int?, callback: FlutterResult) {
        guard let params = params else {
            let error = FlutterError(code: "404", message: "The parameter is abnormal, please check", details: nil)
            return callback(error)
        }
        let result = "\(#function) \n params: \(params)"
        callback(result);
    }

    func getAppVersion4(_ params: Double?, callback: FlutterResult) {
        guard let params = params else {
            let error = FlutterError(code: "404", message: "The parameter is abnormal, please check", details: nil)
            return callback(error)
        }
        let result = "\(#function) \n params: \(params)"
        callback(result);
    }

    func getAppVersion5(_ params: Bool?, callback: FlutterResult) {
        guard let params = params else {
            let error = FlutterError(code: "404", message: "The parameter is abnormal, please check", details: nil)
            return callback(error)
        }
        let result = "\(#function) \n params: \(params)"
        callback(result);
    }
}	
```

##### hello_test_four.java
```
package com.example.hello_test_four;

import androidx.annotation.NonNull;

import java.util.HashMap;
import java.util.List;

import io.flutter.embedding.engine.plugins.FlutterPlugin;
import io.flutter.plugin.common.MethodCall;
import io.flutter.plugin.common.MethodChannel;
import io.flutter.plugin.common.MethodChannel.MethodCallHandler;
import io.flutter.plugin.common.MethodChannel.Result;
import io.flutter.plugin.common.PluginRegistry.Registrar;

/** HelloTestFourPlugin */
public class HelloTestFourPlugin implements FlutterPlugin, MethodCallHandler {

    private MethodChannel channel;
    
    @Override
    public void onAttachedToEngine(@NonNull FlutterPluginBinding flutterPluginBinding) {
        channel = new MethodChannel(flutterPluginBinding.getFlutterEngine().getDartExecutor(), "hello_test_four");
        channel.setMethodCallHandler(this);
    }

    public static void registerWith(Registrar registrar) {
        final MethodChannel channel = new MethodChannel(registrar.messenger(), "hello_test_four");
        channel.setMethodCallHandler(new HelloTestFourPlugin());
    }
    
    @Override
    public void onMethodCall(@NonNull MethodCall call, @NonNull Result result) {
        switch (call.method) {
            case "getPlatformVersion":
            getPlatformVersion(result);
            break;
            
		case "getAppVersion":
            getAppVersion((HashMap<String, Object>) call.arguments, result);
            break;
            
		case "getAppVersion1":
            getAppVersion1((List<String>) call.arguments, result);
            break;
            
		case "getAppVersion2":
            getAppVersion2((String) call.arguments, result);
            break;
            
		case "getAppVersion3":
            getAppVersion3((int) call.arguments, result);
            break;
            
		case "getAppVersion4":
            getAppVersion4((double) call.arguments, result);
            break;
            
		case "getAppVersion5":
            getAppVersion5((boolean) call.arguments, result);
            break;
            
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

    private void getPlatformVersion(@NonNull Result callback) {
    	String method = Thread.currentThread().getStackTrace()[2].getMethodName();
    	String result = String.format("%s \n params: null", method);
    	callback.success(result);
    }

    private void getAppVersion(HashMap<String, Object> params, @NonNull Result callback) {
    	String method = Thread.currentThread().getStackTrace()[2].getMethodName();
    	String result = String.format("%s \n params: %s", method, params);
    	callback.success(result);
    }

    private void getAppVersion1(List<String> params, @NonNull Result callback) {
    	String method = Thread.currentThread().getStackTrace()[2].getMethodName();
    	String result = String.format("%s \n params: %s", method, params);
    	callback.success(result);
    }

    private void getAppVersion2(String params, @NonNull Result callback) {
    	String method = Thread.currentThread().getStackTrace()[2].getMethodName();
    	String result = String.format("%s \n params: %s", method, params);
    	callback.success(result);
    }

    private void getAppVersion3(int params, @NonNull Result callback) {
    	String method = Thread.currentThread().getStackTrace()[2].getMethodName();
    	String result = String.format("%s \n params: %s", method, params);
    	callback.success(result);
    }

    private void getAppVersion4(double params, @NonNull Result callback) {
    	String method = Thread.currentThread().getStackTrace()[2].getMethodName();
    	String result = String.format("%s \n params: %s", method, params);
    	callback.success(result);
    }

    private void getAppVersion5(boolean params, @NonNull Result callback) {
    	String method = Thread.currentThread().getStackTrace()[2].getMethodName();
    	String result = String.format("%s \n params: %s", method, params);
    	callback.success(result);
    }
}	
```
## Requirements

VSCode:
版本: 1.62.2
提交: 3a6960b964327f0e3882ce18fcebd07ed191b316
日期: 2021-11-11T20:59:05.913Z
Electron: 13.5.2
Chrome: 91.0.4472.164
Node.js: 14.16.0
V8: 9.1.269.39-electron.0
OS: Darwin x64 20.6.0

#### Platform iOS:
version: 10.0, 
swift: 5.0

#### Platform Andriod:
version: 22, 
java: 1.8
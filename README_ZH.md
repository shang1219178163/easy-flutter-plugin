# EasyFlutterPlugin

<a href="https://pub.dev/packages/pull_to_refresh">
  <img src="https://img.shields.io/pub/v/easy-flutter-plugin.svg"/>
</a>
<a href="https://flutter.dev/">
  <img src="https://img.shields.io/badge/flutter-%3E%3D%201.17.2-green.svg"/>
</a>
<a href="https://opensource.org/licenses/MIT">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg"/>
</a>

## [English](https://github.com/shang1219178163/easy-flutter-plugin/blob/main/README.md) | 中文

插件根据 flutter plugin 项目的 lib 目录 *.dart 文件方法自动映射生成 oc 方法声明；开发这只需要关注oc方法内部实现即可；

*.dart => Swift*Plugin.swift/(*Plugin.h + *Plugin.m) + *Plugin.kt + *_test.dart + main.dart

## Features
使用容易，节约时间和精力去实现核心代码.

## Usage：
choose /lib/*.dart, and Right-click menu 'Easy Flutter Plugin'

![Usage](https://github.com/shang1219178163/easy-flutter-plugin/blob/main/screenshot.png?raw=true)

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

## Release Notes

Users appreciate release notes as you update your extension.

### 0.0.1

Initial release;

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.


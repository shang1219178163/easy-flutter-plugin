# EasyFlutterPlugin

Plug-ins automatically map to generate plug-in method claims based on the lib directory of the flutter plugin project, and developers only need to pay attention to the internal implementation of method;

***.dart => Swift*Plugin.swift/(*Plugin.h + *Plugin.m) + *Plugin.kt + *_test.dart + main.dart**

## Features
Easy to use, saving time and effort to implement core code

## Usage：
choose /lib/*.dart, and Right-click menu 'Easy Flutter Plugin'

#### example：
##### hello_test_two.dart
```
import 'dart:async';

import 'package:flutter/services.dart';

class HelloTestTwo {
  static const MethodChannel _channel = const MethodChannel('hello_test_two');

  /// 无参数
  static Future<String> getPlatformVersion() async {
    String value = await _channel.invokeMethod('getPlatformVersion');
    return value;
  }

  /// 字典参数: Map<String, dynamic>
  static Future<String> getAppVersion(Map<String, dynamic> val) async {
    String value = await _channel.invokeMethod('getAppVersion', val);
    return value;
  }

  /// 数组参数: List<String>
  static Future<String> getAppVersion1(List<String> val) async {
    String value = await _channel.invokeMethod('getAppVersion1', val);
    return value;
  }

  /// 字符串参数: String
  static Future<String> getAppVersion2(String val) async {
    String value = await _channel.invokeMethod('getAppVersion2', val);
    return value;
  }

  /// 整数参数: int
  static Future<String> getAppVersion3(int val) async {
    String value = await _channel.invokeMethod('getAppVersion3', val);
    return value;
  }

  /// 浮点数参数: double
  static Future<String> getAppVersion4(double val) async {
    String value = await _channel.invokeMethod('getAppVersion4', val);
    return value;
  }

  /// 布尔值参数: bool
  static Future<String> getAppVersion5(bool val) async {
    String value = await _channel.invokeMethod('getAppVersion5', val);
    return value;
  }
}
```

#### Convert To:

##### HelloTestTwoPlugin.h
```

#import <Flutter/Flutter.h>

@interface HelloTestTwoPlugin : NSObject<FlutterPlugin>

+ (void)getPlatformVersion:(id)params callback:(FlutterResult)callback;

+ (void)getAppVersion:(NSDictionary<NSString *, id> *)params callback:(FlutterResult)callback;

+ (void)getAppVersion1:(NSArray<NSString *> *)params callback:(FlutterResult)callback;

+ (void)getAppVersion2:(NSString *)params callback:(FlutterResult)callback;

+ (void)getAppVersion3:(NSNumber *)params callback:(FlutterResult)callback;

+ (void)getAppVersion4:(NSNumber *)params callback:(FlutterResult)callback;

+ (void)getAppVersion5:(NSNumber *)params callback:(FlutterResult)callback;

@end
```

##### HelloTestTwoPlugin.m
```

#import "HelloTestTwoPlugin.h"

@implementation HelloTestTwoPlugin

+ (void)registerWithRegistrar:(NSObject<FlutterPluginRegistrar>*)registrar {
    FlutterMethodChannel* channel = [FlutterMethodChannel methodChannelWithName:@"hello_test_two"
        binaryMessenger:[registrar messenger]];
    HelloTestTwoPlugin* instance = [[HelloTestTwoPlugin alloc] init];
    [registrar addMethodCallDelegate:instance channel:channel];
}

- (void)handleMethodCall:(FlutterMethodCall *)call result:(FlutterResult)result{
    // NSLog(@"call.arguments: %@", call.arguments);
    [self reflectMethod:[HelloTestTwoPlugin new]
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

##### hello_test_two.kt
```
package com.example.hello_test_two

import androidx.annotation.NonNull;

import io.flutter.embedding.engine.plugins.FlutterPlugin
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel
import io.flutter.plugin.common.MethodChannel.MethodCallHandler
import io.flutter.plugin.common.MethodChannel.Result
import io.flutter.plugin.common.PluginRegistry.Registrar

/** HelloTestTwoPlugin */
public class HelloTestTwoPlugin: FlutterPlugin, MethodCallHandler {
    /// The MethodChannel that will the communication between Flutter and native Android
    ///
    /// This local reference serves to register the plugin with the Flutter Engine and unregister it
    /// when the Flutter Engine is detached from the Activity
    private lateinit var channel : MethodChannel

    override fun onAttachedToEngine(@NonNull flutterPluginBinding: FlutterPlugin.FlutterPluginBinding) {
        channel = MethodChannel(flutterPluginBinding.getFlutterEngine().getDartExecutor(), "hello_test_two")
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
            val channel = MethodChannel(registrar.messenger(), "hello_test_two")
            channel.setMethodCallHandler(HelloTestTwoPlugin())
        }
    }

    override fun onMethodCall(@NonNull call: MethodCall, @NonNull result: Result) {
        when (call.method) {
			"getPlatformVersion" -> getPlatformVersion(call.arguments as Any?, result)
			"getAppVersion" -> getAppVersion(call.arguments as Map<String, Any?>, result)
			"getAppVersion1" -> getAppVersion1(call.arguments as List<String>, result)
			"getAppVersion2" -> getAppVersion2(call.arguments as String, result)
			"getAppVersion3" -> getAppVersion3(call.arguments as Int, result)
			"getAppVersion4" -> getAppVersion4(call.arguments as Double, result)
			"getAppVersion5" -> getAppVersion5(call.arguments as Boolean, result)
            else -> result.notImplemented()
        }
    }

    override fun onDetachedFromEngine(@NonNull binding: FlutterPlugin.FlutterPluginBinding) {
        channel.setMethodCallHandler(null)
    }

    // MARK: -funtions
    private fun getPlatformVersion(params: Any?, callback: Result) {
    	val result = "private fun getPlatformVersion(params: Any?, callback: Result) \n params: ${params.toString()}"
    	callback.success(result);
    }

    private fun getAppVersion(params: Map<String, Any?>, callback: Result) {
    	val result = "private fun getAppVersion(params: Map<String, Any?>, callback: Result) \n params: ${params.toString()}"
    	callback.success(result);
    }

    private fun getAppVersion1(params: List<String>, callback: Result) {
    	val result = "private fun getAppVersion1(params: List<String>, callback: Result) \n params: ${params.toString()}"
    	callback.success(result);
    }

    private fun getAppVersion2(params: String, callback: Result) {
    	val result = "private fun getAppVersion2(params: String, callback: Result) \n params: ${params.toString()}"
    	callback.success(result);
    }

    private fun getAppVersion3(params: Int, callback: Result) {
    	val result = "private fun getAppVersion3(params: Int, callback: Result) \n params: ${params.toString()}"
    	callback.success(result);
    }

    private fun getAppVersion4(params: Double, callback: Result) {
    	val result = "private fun getAppVersion4(params: Double, callback: Result) \n params: ${params.toString()}"
    	callback.success(result);
    }

    private fun getAppVersion5(params: Boolean, callback: Result) {
    	val result = "private fun getAppVersion5(params: Boolean, callback: Result) \n params: ${params.toString()}"
    	callback.success(result);
    }
}	
```
##### hello_test_two_test.dart
```
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hello_test_two/hello_test_two.dart';

void main() {
  const MethodChannel channel = MethodChannel('hello_test_two');

  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
      channel.setMockMethodCallHandler((MethodCall methodCall) async {
      return '42';
      });
  });

  tearDown(() {
      channel.setMockMethodCallHandler(null);
  });
  
  test('getPlatformVersion', () async {
    
    expect(await HelloTestTwo.getPlatformVersion(), isInstanceOf<String>());
  });

  test('getAppVersion', () async {
    
    final val = {
        "a": "aaa",
        "b": 99,
        "d": 66.0,
        "c": false
    };
    expect(await HelloTestTwo.getAppVersion(val), isInstanceOf<String>());
  });

  test('getAppVersion1', () async {
    final val = ["a", "b", "c"];
    expect(await HelloTestTwo.getAppVersion1(val), isInstanceOf<String>());
  });

  test('getAppVersion2', () async {
    final val = "aaa";
    expect(await HelloTestTwo.getAppVersion2(val), isInstanceOf<String>());
  });

  test('getAppVersion3', () async {
    final val = 66;
    expect(await HelloTestTwo.getAppVersion3(val), isInstanceOf<String>());
  });

  test('getAppVersion4', () async {
    final val = 88.0;
    expect(await HelloTestTwo.getAppVersion4(val), isInstanceOf<String>());
  });

  test('getAppVersion5', () async {
    final val = false;
    expect(await HelloTestTwo.getAppVersion5(val), isInstanceOf<String>());
  });
}
```

##### main.dart
```
import 'package:flutter/material.dart';
import 'dart:async';

import 'package:hello_test_two/hello_test_two.dart';

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
  
        	String _getPlatformVersion = 'getPlatformVersion';
	String _getAppVersion = 'getAppVersion';
	String _getAppVersion1 = 'getAppVersion1';
	String _getAppVersion2 = 'getAppVersion2';
	String _getAppVersion3 = 'getAppVersion3';
	String _getAppVersion4 = 'getAppVersion4';
	String _getAppVersion5 = 'getAppVersion5';

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
    
    		getPlatformVersion();
		getAppVersion();
		getAppVersion1();
		getAppVersion2();
		getAppVersion3();
		getAppVersion4();
		getAppVersion5();
    
  }
  
  Future<void> getPlatformVersion() async {
    
    String result = await HelloTestTwo.getPlatformVersion();
    setState(() {
      _getPlatformVersion = result;
    });

    _showSnakeBar(SnackBar(content: Text(result)));
  }

  Future<void> getAppVersion() async {
    
    final val = {
        "a": "aaa",
        "b": 99,
        "d": 66.0,
        "c": false
    };
    String result = await HelloTestTwo.getAppVersion(val);
    setState(() {
      _getAppVersion = result;
    });

    _showSnakeBar(SnackBar(content: Text(result)));
  }

  Future<void> getAppVersion1() async {
    final val = ["a", "b", "c"];
    String result = await HelloTestTwo.getAppVersion1(val);
    setState(() {
      _getAppVersion1 = result;
    });

    _showSnakeBar(SnackBar(content: Text(result)));
  }

  Future<void> getAppVersion2() async {
    final val = "aaa";
    String result = await HelloTestTwo.getAppVersion2(val);
    setState(() {
      _getAppVersion2 = result;
    });

    _showSnakeBar(SnackBar(content: Text(result)));
  }

  Future<void> getAppVersion3() async {
    final val = 66;
    String result = await HelloTestTwo.getAppVersion3(val);
    setState(() {
      _getAppVersion3 = result;
    });

    _showSnakeBar(SnackBar(content: Text(result)));
  }

  Future<void> getAppVersion4() async {
    final val = 88.0;
    String result = await HelloTestTwo.getAppVersion4(val);
    setState(() {
      _getAppVersion4 = result;
    });

    _showSnakeBar(SnackBar(content: Text(result)));
  }

  Future<void> getAppVersion5() async {
    final val = false;
    String result = await HelloTestTwo.getAppVersion5(val);
    setState(() {
      _getAppVersion5 = result;
    });

    _showSnakeBar(SnackBar(content: Text(result)));
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        key: _scaffoldKey,
        appBar: AppBar(
          title: const Text('HelloTestOne Plugin example'),
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
              FlatButton(
                onPressed: () => setState(() {
                  getPlatformVersion();
                }),
                child: Text(_getPlatformVersion),
              ),
              Divider(),							
              FlatButton(
                onPressed: () => setState(() {
                  getAppVersion();
                }),
                child: Text(_getAppVersion),
              ),
              Divider(),							
              FlatButton(
                onPressed: () => setState(() {
                  getAppVersion1();
                }),
                child: Text(_getAppVersion1),
              ),
              Divider(),							
              FlatButton(
                onPressed: () => setState(() {
                  getAppVersion2();
                }),
                child: Text(_getAppVersion2),
              ),
              Divider(),							
              FlatButton(
                onPressed: () => setState(() {
                  getAppVersion3();
                }),
                child: Text(_getAppVersion3),
              ),
              Divider(),							
              FlatButton(
                onPressed: () => setState(() {
                  getAppVersion4();
                }),
                child: Text(_getAppVersion4),
              ),
              Divider(),							
              FlatButton(
                onPressed: () => setState(() {
                  getAppVersion5();
                }),
                child: Text(_getAppVersion5),
              ),
              Divider(),
            ],
          ),
        ),
      ),
    );
  }
}
```
## Requirements
VSCode:
版本: 1.62.2
提交: 3a6960b964327f0e3882ce18fcebd07ed191b316
DateTime: 2021-11-11T20:59:05.913Z
Electron: 13.5.2
Chrome: 91.0.4472.164
Node.js: 14.16.0
V8: 9.1.269.39-electron.0
OS: Darwin x64 20.6.0

## Release Notes

Users appreciate release notes as you update your extension.

### 0.0.1

Initial release;


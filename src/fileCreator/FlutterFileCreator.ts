//
//  Fluttercreator.ts
//  easy-flutter-plugin
//
//  Created by shangbinbin on 2021/11/21.
//  Copyright © 2021 Shang. All rights reserved.
//
//



import { DartMethodModel } from './Models';

export module DartCreator {

    /// 创建 plugin example 中 main.dart 页面,方便调试
    export function createExampleMain250(models: DartMethodModel[], pluginName: string): string {
            
        let privateVars = `
    ${models.map((e, index) => { 
        return `String _${e.name} = '${e.name}';` ;
    }).join("\n")}
    `;

        let initPlatformStateContent = `
    ${models.map((e, index) => { 
        return `\t\t${e.name}();`; 
    }).join("\n")}
    `;
            
        let privateFuncs = models.map((e, index) => {
            return `${createExampleMainPrivateFunc(e, pluginName)}`;
        }).join("\n");
            
        let children = models.map((e, index) => {
            return `\t\t\t\t\t\t\t
              TextButton(
                onPressed: () => setState(() {
                  ${e.name}();
                }),
                child: Text(_${e.name}),
              ),
              const Divider(),`;
            }).join("");

        let content = `
import 'package:flutter/material.dart';
import 'dart:async';

import 'package:flutter/services.dart';
import 'package:${pluginName}/${pluginName}.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({Key? key}) : super(key: key);

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
        title: const Text('${pluginName.camelCase("_", true)} Plugin example'),
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
    export function createExampleMain1172(models: DartMethodModel[], pluginName: string): string {
            
        let privateVars = 
`
        ${models.map((e, index) => { 
            return `\tString _${e.name} = '${e.name}';`;
        }).join("\n")}
`;

        let initPlatformStateContent = 
    `
    ${models.map((e, index) => {  
        return `\t\t${e.name}();`; 
    }).join("\n")}
    `;
            
        let privateFuncs = models.map((e, index) => { 
            return `${createExampleMainPrivateFunc(e, pluginName)}`;
        }).join("\n");
            
        let children = models.map((e, index) => { 
            return `\t\t\t\t\t\t\t
              FlatButton(
                onPressed: () => setState(() {
                  ${e.name}();
                }),
                child: Text(_${e.name}),
              ),
              const Divider(),`;
        }).join("");

        let content = 
`
import 'package:flutter/material.dart';
import 'dart:async';

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
          title: const Text('${pluginName.camelCase("_", true)} Plugin example'),
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
        
    export function createExampleMainPrivateFunc(model: DartMethodModel, pluginName: string): string {

        var params = "";
        switch (model.paramsType) {
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
            params = `const val = "aaa";`;
            break;

        case "int":
            params = `const val = 66;`;
            break;

        case "double":
            params = `const val = 88.0;`;
            break;

        case "bool":
            params = `const val = false;`;
            break;

        default:
            break;
        }
        
        let paramsName = params !== "" ? "val" : "";
        
        let body =`
  Future<void> ${model.name}() async {
    ${params}
    String result = await ${pluginName.camelCase("_", true)}.${model.name}(${paramsName});
    setState(() {
      _${model.name} = result;
    });

    _showSnakeBar(SnackBar(content: Text(result)));
  }`;
        return body;
    }

    /// 创建 plugin *_test.dart
    export function createPluginTest(models: DartMethodModel[], pluginName: string): string {

        function createPluginTestFunc(model: DartMethodModel, pluginName: string): string {
            var params = "";
            switch (model.paramsType) {
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
                params = `const val = "aaa";`;
                break;
        
            case "int":
                params = `const val = 66;`;
                break;
        
            case "double":
                params = `const val = 88.0;`;
                break;
        
            case "bool":
                params = `const val = false;`;
                break;
        
            default:
                break;
            }
            
            let paramsName = params !== "" ? "val" : "";
        
            let testFucBody =`
  test('${model.name}', () async {
    ${params}
    expect(await ${pluginName.camelCase("_", true)}.${model.name}(${paramsName}), isInstanceOf<String>());
  });`;
            return testFucBody;
        }

        let fileContent = `
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:${pluginName}/${pluginName}.dart';

void main() {
  const MethodChannel channel = MethodChannel('${pluginName}');

  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
      channel.setMockMethodCallHandler((MethodCall methodCall) async {
      return '42';
      });
  });

  tearDown(() {
      channel.setMockMethodCallHandler(null);
  });

  ${models.map((e, index) => { 
    return createPluginTestFunc(e, pluginName);
  }).join("\n")}
}
`;
        return fileContent;
    }
}

export class DartCreatorModel {

  readonly exampleMainContent: string = "";

  readonly pluginTestContent: string = "";

  constructor(
    public models: DartMethodModel[],
    public clsName: string,
    public pluginName: string,
    public flutterVersion: string){
      switch (flutterVersion) {
        case "1.17.2":
          this.exampleMainContent = DartCreator.createExampleMain1172(models, pluginName);
          break;
      
        default:
          this.exampleMainContent = DartCreator.createExampleMain250(models, pluginName);
          break;
      }
      this.pluginTestContent = DartCreator.createPluginTest(models, pluginName);
  }  
}
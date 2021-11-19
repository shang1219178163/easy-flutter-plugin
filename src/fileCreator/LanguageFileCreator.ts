//
//  Creator.ts
//  easy-flutter-plugin
//
//  Created by shangbinbin on 2021/11/19.
//  Copyright © 2021 Shang. All rights reserved.
//
// 后期考虑优化代码结构, 将各种 Creator 融合

import { DartMethodModel } from './Models';

import  *  as dart from './DartCreator';
import  *  as kotlin from './KotlinCreator';
import  *  as swift from './SwiftCreator';
import  *  as objc from './ObjcCreator';


export class LanguageFileCreator{

    static dart(
        models: DartMethodModel[],
        clsName: string,
        pluginName: string,
        flutterVersion: string) : dart.DartCreatorModel{
            return new dart.DartCreatorModel(models, clsName, pluginName, flutterVersion);
        };  

    static swift(
        models: DartMethodModel[],
        clsName: string,
        pluginName: string,
        flutterVersion: string) : swift.SwiftCreatorModel{
            return new swift.SwiftCreatorModel(models, clsName, pluginName, flutterVersion);
        }  

    static kotlin(
        models: DartMethodModel[],
        clsName: string,
        pluginName: string,
        flutterVersion: string) : kotlin.KotlinCreatorModel{
            return new kotlin.KotlinCreatorModel(models, clsName, pluginName, flutterVersion);
        }  

    static objc(
        models: DartMethodModel[],
        clsName: string,
        pluginName: string,
        flutterVersion: string) : objc.ObjcCreatorModel{
            return new objc.ObjcCreatorModel(models, clsName, pluginName, flutterVersion);
        }  
}
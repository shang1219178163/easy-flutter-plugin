/* eslint-disable @typescript-eslint/naming-convention */
//
//  Creator.ts
//  easy-flutter-plugin
//
//  Created by shangbinbin on 2021/11/19.
//  Copyright © 2021 Shang. All rights reserved.
//
// 后期考虑优化代码结构, 将各种 Creator 融合

import { DartMethodModel } from './Models';

import  *  as flutter from './FlutterFileCreator';
import  *  as andriod from './AndriodFileCreator';
import  *  as ios from './iOSFileCreator';

export class FileCreator{

    static dart(
        models: DartMethodModel[],
        clsName: string,
        pluginName: string,
        flutterVersion: string) : flutter.DartCreatorModel{
            return new flutter.DartCreatorModel(models, clsName, pluginName, flutterVersion);
        };  

    static objc(
        models: DartMethodModel[],
        clsName: string,
        pluginName: string,
        flutterVersion: string) : ios.ObjcCreatorModel{
            return new ios.ObjcCreatorModel(models, clsName, pluginName, flutterVersion);
        }  

    static swift(
        models: DartMethodModel[],
        clsName: string,
        pluginName: string,
        flutterVersion: string) : ios.SwiftCreatorModel{
            return new ios.SwiftCreatorModel(models, clsName, pluginName, flutterVersion);
        }  

    static java(
        models: DartMethodModel[],
        clsName: string,
        pluginName: string,
        flutterVersion: string) : andriod.JavaCreatorModel{
            return new andriod.JavaCreatorModel(models, clsName, pluginName, flutterVersion);
        }  

    static kotlin(
        models: DartMethodModel[],
        clsName: string,
        pluginName: string,
        flutterVersion: string) : andriod.KotlinCreatorModel{
            return new andriod.KotlinCreatorModel(models, clsName, pluginName, flutterVersion);
        }  

}
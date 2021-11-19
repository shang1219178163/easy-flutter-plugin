//
//  Dartmethodmodel.ts
//  easy-flutter-plugin
//
//  Created by shangbinbin on 2021/11/19.
//  Copyright © 2021 Shang. All rights reserved.
//
//

/// dart 方法模型
export class DartMethodModel{

	constructor(
		public isStatic: boolean = true, 
		public isFuture: boolean = true, 
		public notes: string = "/// ", 
		public name: string = "", 
		public paramsType: string = "", 
		public paramsName: string = "", 
		public returnVal: string = "", 
		public body: string = ""){}
}

//
//  StringExtensions.dart
//  easy-flutter-plugin
//
//  Created by shangbinbin on 2021/11/18.
//  Copyright © 2021 Shang. All rights reserved.
//
//


declare global {

	interface String {
		format(...args: string[]): string;

		isEmpty(): boolean;
		/// 首字母大写
		toCapitalized(): string;
        /// 获取两字符中间的部分
		substringBetween(prefix: string, suffix: string, isContain: boolean): string;
        /// 驼峰命名法
        camelCase(splitter: string, firstCharacterCapitalize: boolean): string;
        /// 反驼峰命名法
        uncamelCase(splitter: string): string;
	}

}
export {}; 

if (!String.prototype.format) { 　　　　
    String.prototype.format = function (...args: string[]): string {
        return this.replace(/{(\d+)}/g, function (match, number) {
            return (typeof args[number] !== 'undefined') ? args[number] : match;
        });
    };
}

if (!String.prototype.isEmpty) {
    String.prototype.isEmpty = function (): boolean {
        return this.trim() === '';
    };
}

if (!String.prototype.toCapitalized) {
    String.prototype.toCapitalized = function (): string {
        return this[0].toUpperCase() + this.substr(1);
    };
}

if (!String.prototype.substringBetween) {
    String.prototype.substringBetween = function(prefix: string, suffix: string, isContain: boolean = false): string {
        const startIdx = this.indexOf(prefix);
        const endIdx = this.lastIndexOf(suffix);
        if (isContain === true) {
            return this.substring(startIdx, endIdx);
        }
        const result = this.substring(startIdx + prefix.length, endIdx);
        return result;
    };
}

if (!String.prototype.camelCase) {
    String.prototype.camelCase = function(separator: string = "-", firstCharacterCapitalize: boolean = true): string {
    // String.prototype.camelCase = function(separator: string, firstCharacterCapitalize: boolean = true): string {
        return this.split(separator)
        .map((e, index) => {
            if (index === 0 && firstCharacterCapitalize === false) {
                return e;
            }
            return e.toCapitalized();
        })
        .join("");
    };
}

if (!String.prototype.uncamelCase) {
    String.prototype.uncamelCase = function(separator: string = "-"): string {
        return this.split("")
        .map(e => {
            return /[A-Z]/.test(e) ? `${separator}${e.toLowerCase()}` : e;
        })
        .join("");
    };
}


export {}; 



/// interface 方法测试
function test(){
    const line = "static Future<String> getAppVersion4(double val) async {";
    let name = line.substringBetween("> ", "(", false);
    console.log(name);


    let a = "hello_test_one".camelCase("_", true);
    console.log(`camelCase: ${a}`);

    let a1 = "hello_test_one".camelCase("_", false);
    console.log(`camelCase1: ${a1}`);

    let a2 = "hello_test_one".uncamelCase("_");
    console.log(`uncamelCase: ${a2}`);

}
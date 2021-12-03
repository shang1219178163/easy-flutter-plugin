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

         /**
         * Gets a substring beginning at the specified location and having the specified length.
         * @param from The starting position of the desired substring. The index of the first character in the string is zero.
         * @param length The number of characters to include in the returned substring.
         */
        range(location: number, length?: number): string;

		isEmpty(): boolean;
        ///字符串翻转
        reverse(): string;

		/// 首字母大写
		toCapitalized(): string;
        /// 获取两字符中间的部分
		substringBetween(prefix: string, suffix: string, isContain?: boolean): string;
        /// 驼峰命名法
        camelCase(separator: string, isUpper?: boolean): string;
        /// 反驼峰命名法
        uncamelCase(separator?: string): string;
	}

}
export {}; 

if (!String.prototype.format) { 　　　　
    String.prototype.format = function(...args: string[]): string {
        var s = this.toString();
        for(var i = 0; i < args.length; i++){
            s = s.replace(new RegExp("\\{"+i+"\\}","g"), args[i]);
        }
        return s;
    };
}

if (!String.prototype.range) { 　　　　
    String.prototype.range = function(location: number, length?: number): string {
        return this.substr(location, length);
    };
}

if (!String.prototype.isEmpty) {
    String.prototype.isEmpty = function (): boolean {
        return this.trim() === '';
    };
}

if (!String.prototype.reverse) {
    String.prototype.reverse = function (): string {
        return this.split("").reverse().join("");
    };
}

if (!String.prototype.toCapitalized) {
    String.prototype.toCapitalized = function (): string {
        // return this[0].toUpperCase() + this.substr(1);
        return this.substr(0, 1).toUpperCase() + this.substr(1);
    };
}

if (!String.prototype.substringBetween) {
    String.prototype.substringBetween = function(prefix: string, suffix: string, isContain?: boolean): string {
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
    String.prototype.camelCase = function(separator: string, isUpper?: boolean): string {
        return this.split(separator)
        .map((e, index) => {
            if (index === 0 && isUpper !== true) {
                return e;
            }
            return e.toCapitalized();
        })
        .join("");
    };
}

if (!String.prototype.uncamelCase) {
    String.prototype.uncamelCase = function(separator?: string): string {
        return this.split("")
        .map((e, index) => {
            if (index === 0) {
                return /[A-Z]/.test(e) ? e.toLowerCase() : e;
            }
            return /[A-Z]/.test(e) ? `${separator ?? "_"}${e.toLowerCase()}` : e;
        })
        .join("");
    };
}


export {}; 



/// interface 方法测试
export function testString(){

    //方式1
    var test = '我的{0}是{1}!{2}';
    var result = test.format('id','城市之光', "Ye!");
    console.log(result);

    const line = "static Future<String> getAppVersion4(double val) async {";
    let name = line.substringBetween("> ", "(",);
    console.log(name);

    let name1 = line.substringBetween("> ", "(", false);
    console.log(name1);

    let a = "hello_test_one".camelCase("_", true);
    console.log(`camelCase: ${a}`);

    let a1 = "hello_test_one".camelCase("_", false);
    console.log(`camelCase1: ${a1}`);

    let a2 = a.uncamelCase("-");
    console.log(`uncamelCase: ${a2}`);

    let a22 = a1.uncamelCase();
    console.log(`uncamelCase22: ${a22}`);

    "".
}
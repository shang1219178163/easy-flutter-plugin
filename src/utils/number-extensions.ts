
//
//  NumberExtensions.dart
//  easy-flutter-plugin
//
//  Created by shangbinbin on 2021/11/18.
//  Copyright © 2021 Shang. All rights reserved.
//
//


declare global {  
    interface Number {  
        thousandsSeperator(): String;  
    }  
}  
export {}; 

Number.prototype.thousandsSeperator = function(): string {  
    return Number(this).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');  
};  
export {}; 
//
//  ArrayExtensions.dart
//  easy-flutter-plugin
//
//  Created by shangbinbin on 2021/11/18.
//  Copyright © 2021 Shang. All rights reserved.
//
//


declare global {  
	interface Array<T> {
        /// or undefined
		first(): T;
        /// or undefined
		last(): T;

        add(item: T): Array<T>;

        addItems(items: T[]): Array<T>;

        remove(item: T): Array<T>;

        removeFirst(): Array<T>;

        removeLast(): Array<T>;

        insert(item: T, atIndex: number): Array<T>;

        insertItems(items: Array<T>, atIndex: number): Array<T>;

        replace(index: number, item: T): Array<T>;

        filterNull(): Array<T>;
	}
}  

if (!Array.prototype.first) { 　　　　
    Array.prototype.first = function<T>(this: Array<T>): T {
        return this[0];
    };
}

if (!Array.prototype.last) { 　　　　
    Array.prototype.last = function<T>(this: Array<T>): T {
        return this[this.length - 1];
    };
}

if (!Array.prototype.add) { 
    Array.prototype.add = function<T>(item: T): Array<T> { 
        (<Array<T>>this).push(item); 
        return this;
    }; 
} 

if (!Array.prototype.addItems) { 
    Array.prototype.addItems = function<T>(items: T[]): Array<T> { 
        for (var i = 0; i < items.length; i++) { 
            (<Array<T>>this).push(items[i]); 
        } 
        return this; 
    }; 
} 

if (!Array.prototype.remove) { 
    Array.prototype.remove = function<T>(item: T): Array<T> { 
        let index = (<Array<T>>this).indexOf(item); 
        if (index >= 0) { 
            (<Array<T>>this).splice(index, 1); 
        } 
        return this; 
    }; 
} 

if (!Array.prototype.removeFirst) { 
    Array.prototype.removeFirst = function<T>(this: Array<T>): Array<T> { 
        if (this.length > 0) {
            return this.splice(0, 1);
        }
        return this;
    }; 
} 


if (!Array.prototype.removeLast) { 
    Array.prototype.removeLast = function<T>(this: Array<T>): Array<T> { 
        if (this.length > 0) {
            return this.splice(this.length - 1, 1);
        }
        return this;
    }; 
} 


if (!Array.prototype.insert) { 
    Array.prototype.insert = function<T>(item: T, atIndex: number): Array<T> { 
        return <Array<T>>this.splice(atIndex, 0, item); 
    }; 
} 


if (!Array.prototype.insertItems) { 
    Array.prototype.insertItems = function<T>(items: Array<T>, atIndex: number): Array<T> { 
        return <Array<T>>this.splice(atIndex, 0, items); 
    }; 
} 


if (!Array.prototype.replace) { 
    Array.prototype.replace = function<T>(index: number, item: T): Array<T> { 
        if (this.length > index) {
            (<Array<T>>this)[index] = item;
        }
        return this;
    }; 
} 

if (!Array.prototype.filterNull) { 
    Array.prototype.filterNull = function<T>(): Array<T> { 
        return this.filter(e => e !== null && e !== undefined);
    }; 
} 


export { }; // this file needs to be a module
declare global {
    interface Array<T> {
        where(predicate: (item: T) => boolean): T[];
    }
}

export { }; // this file needs to be a module


(function () {

	if (!Array.prototype.where) { 
		Array.prototype.where = function (predicate: (item: any) => boolean) { 
			let result = []; 
			for (var i = 0; i < (<Array<any>>this).length; i++) { 
				let item = (<Array<any>>this)[i]; 
				if (predicate(item)) { 
					result.push(item); 
				} 
			} 
			return result; 
		}; 
	} 

})();


/// interface 方法测试
export function testArray(){

    console.log([].first(), [].last());

    let list = ["a", "b", "c", "d"];
	console.log(list.first(), list.last());

    list.add("aa");
    console.log(list);

    list.addItems(["bb", "cc", "dd", "ee", "ff", "gg"]);
    console.log(list);

    list.removeFirst();
    console.log(`removeFirst: ${list}`);

    list.removeLast();
    console.log(`removeLast: ${list}`);

    list.remove("ee");
    console.log(`remove("ee"): ${list}`);

    list.insert("x", 1);
    console.log(`insert("xx", 1);: ${list}`);

    list.insertItems(["y", "z"], 2);
    console.log(`list.insertItems(["y", "z"], 2): ${list}`);

    list.replace(1, "oo");
    console.log(`list.replace(1, "oo"): ${list}`);
}
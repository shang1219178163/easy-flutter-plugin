
import {
	global,
} from 'vscode';


/// 方法扩展
declare global {
	interface String {
		format(...args: string[]): string;

		isEmpty: () => boolean;
		/// 首字母大写
		toCapitalized(): string;
	
		substringBetween(prefix: string, suffix: string, isContain: boolean): string;
	
	}

	// interface Array<T> {
	// 	first?: T;
	// 	last?: T;
	// }
}

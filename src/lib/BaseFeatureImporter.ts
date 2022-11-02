import { TWithContext } from "@haibun/context/build/Context";
import { TResolvedFeature, TResultError } from "@haibun/core/build/lib/defs";
import { TControl, TEvent, TFeatureError, TFeatureParsed } from "./defs";

const PAGE = 'Page';
const WIDTH = 'Width';
const HEIGHT = 'Height';
const SELECTOR = 'Selector';

export default abstract class BaseFeatureImporter {
    stored: { [tag: string]: number } = {};
    tags: { [tag: string]: string | number } = {};
    backgrounds: { [pageName: string]: { [tag: string]: string | number } } = {};
    currentPageTag: string | undefined = undefined;
    statements: string[] = [];
    buffered: string;

    abstract getResult(): TFeatureParsed | TResultError;

    bg = (what: string, val: string | number, isCurrent = false) => {
        if (!isCurrent && !this.currentPageTag) {
            throw Error(`missing current page for background`);
        }
        let num = this.stored[what] || 0;
        this.stored[what] = ++num;
        const tag = `${what}${num}`;
        this.tags[tag] = val;
        if (isCurrent) {
            this.currentPageTag = tag;
        }
        const set = { [tag]: val };
        if (this.currentPageTag) {
            this.backgrounds[this.currentPageTag] = this.backgrounds[this.currentPageTag] ? { ...this.backgrounds[this.currentPageTag], ...set } : set;
        }

        return tag;
    }
}


import { TWithContext } from "@haibun/context/build/Context";
import BaseFeatureImporter from "./BaseFeatureImporter";
import { TControl, TEvent, TFeatureParsed } from "./defs";
import { WEB_PAGE } from '@haibun/domain-webpage/build/domain-webpage';

const PAGE = 'Page';
const WIDTH = 'Width';
const HEIGHT = 'Height';
const SELECTOR = 'Selector';

export default class ContextFeatureImporter extends BaseFeatureImporter {
    stored: { [tag: string]: number } = {};
    tags: { [tag: string]: string | number } = {};
    backgrounds: { [pageName: string]: { [tag: string]: string | number } } = {};
    currentPageTag: string | undefined = undefined;
    statements: string[] = [];
    buffered: string;

    getResult() {
        this.finishBuffered();
        return <TFeatureParsed>{
            ok: true,
            backgrounds: this.backgrounds,
            feature: this.statements.join('\n')
        }
    }
    finishBuffered() {
        if (this.buffered) {
            this.statements.push(this.buffered);
            this.buffered = undefined;
        }
    }

    // bq = (what: string, val: string | number, isCurrent: boolean = false) => {
    //     return this.vq(this.bg(what, val, isCurrent));
    // }

    variableQuoted = (tag: string) => '`' + tag + '`';

    controlToStatement(contexted: TControl): Promise<void> {
        const { control } = contexted;
        console.log('CONTROL', contexted);
        if (control === 'startRecording') {
            this.currentPageTag = contexted.href;
            this.addStatement(`On the ${this.variableQuoted(this.bg(SELECTOR, contexted.href))} ${WEB_PAGE}`);
            this.reset();
            return;
        }
        if (control === 'stopRecording') {
            console.log(this.getResult());
            return;
        }
        throw Error(`Unknown control ${JSON.stringify(control)}`);
    }
    reset() {
        console.info('not resetting');
        // this.statements = [];
    }
    async eventToStatement(event: TEvent): Promise<void> {
        const { action } = event;
        console.log('EVENT', action);
        if (action === 'click') {
            this.addStatement(`click ${this.variableQuoted(this.bg(SELECTOR, event.selector))}`);
            return;
        }
        if (action === 'dblclick') {
            this.addStatement(`double-click ${this.variableQuoted(this.bg(SELECTOR, event.selector))}`);
            return;
        }
        if (action === 'keydown') {
            this.buffered = `input "${event.value + String.fromCharCode(parseInt(event.keyCode, 10))} for ${this.variableQuoted(this.bg(SELECTOR, event.selector))}`;
            return;
        }
        if (action === 'submit') {
            this.buffered = `submit ${this.variableQuoted(this.bg(SELECTOR, event.selector))}`;
            return;
        }
        if (action === 'change') {
            return;
        }
        console.log('🤑 unknown', JSON.stringify(event, null, 2));

        // throw Error(`Unknown event action ${action} from ${JSON.stringify(event)}`);
    }
    addStatement(statement: string) {
        this.finishBuffered();
        this.statements.push(statement);
    }
    contextToStatement(context: TWithContext): Promise<void> {
        const { '@context': contextType, ...rest } = context;
        switch (contextType) {
            case '#haibun/event':
                return this.eventToStatement(rest as TEvent);
            case '#haibun/control':
                return this.controlToStatement(rest as TControl);
            default:
                throw Error('known context type');
        }
    }
    // goto(where: string) {
    //     currentPageTag = bg(PAGE, where, true);
    //     this.feature.push(`go to ${vq(currentPageTag)}`);
    // },
    // setViewportSize({ width, height }: { width: number, height: number }) {
    //     this.feature.push(`Set viewport to ${bq(WIDTH, width)}, ${bq(HEIGHT, height)}`);
    // },
    // waitForSelector(sel: string) {
    //     this.feature.push(`wait for ${bq(SELECTOR, sel)}`);
    // },
}


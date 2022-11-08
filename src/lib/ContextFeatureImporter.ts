import { TWithContext } from "@haibun/context/build/Context";
import BaseFeatureImporter from "./BaseFeatureImporter";
import { TControl, TEvent, TFeatureParsed } from "./defs";
import { WEB_PAGE, SELECTOR } from '@haibun/domain-webpage/build/domain-webpage';

export default class ContextFeatureImporter extends BaseFeatureImporter {
    stored: { [tag: string]: number } = {};
    tags: { [tag: string]: string | number } = {};
    backgrounds: { [pageName: string]: { [tag: string]: string | number } } = {};
    statements: string[] = [];
    inputBuffered: { input: string, selector: string } | undefined = undefined;

    getResult() {
        this.finishBuffered();
        return <TFeatureParsed>{
            ok: true,
            backgrounds: this.backgrounds,
            feature: this.statements.join('\n')
        }
    }
    finishBuffered() {
        if (this.inputBuffered) {
            const { input, selector } = this.inputBuffered;
            this.addStatement(`input "${input}" for ${this.variableQuoted(this.bg(SELECTOR, selector))}`, false);
            this.inputBuffered = undefined;
        }
    }
    controlToStatement(contexted: TControl): Promise<void> {
        const { control } = contexted;
        if (control === 'startRecording') {
            const tag = this.setCurrentPage(contexted.href);
            this.addStatement(`On the ${this.variableQuoted(tag)} ${WEB_PAGE}`);
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
        this.statements = [];
        this.backgrounds = {};
    }
    async eventToStatement(event: TEvent): Promise<void> {
        const { action } = event;
        if (action === 'change') {
            this.finishBuffered();
            return;
        }
        if (action === 'click') {
            this.addStatement(`click ${this.variableQuoted(this.bg(SELECTOR, event.selector))}`);
            return;
        }
        if (action === 'dblclick') {
            this.addStatement(`double-click ${this.variableQuoted(this.bg(SELECTOR, event.selector))}`);
            return;
        }
        if (action === 'keydown') {
            this.inputBuffered = {
                input: event.value + String.fromCharCode(parseInt(event.keyCode, 10)),
                selector: event.selector
            }
            return;
        }
        if (action === 'submit') {
            this.addStatement(`submit ${this.variableQuoted(this.bg(SELECTOR, event.selector))}`);
            return;
        }
        console.log('🤑 unknown', JSON.stringify(event, null, 2));

        // throw Error(`Unknown event action ${action} from ${JSON.stringify(event)}`);
    }
    addStatement(statement: string, debuffer = true) {
        this.logger.log(`adding statement: ${statement}`)
        if (debuffer) {
            this.finishBuffered();
        }
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


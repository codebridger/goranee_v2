import eventBus from './event-bus';

function toast(option: { label: string, description?: string, type?: string }) {
    eventBus.fire('toast', option);
}

function showDialog(option: { component: any, props: object, events: object, modal: object }) {
    eventBus.fire('show-dialog', option)
}

interface Action {
    label: string,
    pending: boolean
    button: object,
}

interface OnAction {
    (label: string, action: Action, close: Function): Function
}

function showAlertDialog(option: {
    title: string,
    description: string,
    actions: [string] | [Action],
    onAction: OnAction
}) {
    eventBus.fire('show-alert-dialog', option);
}

export default {
    toast, showDialog, showAlertDialog
}
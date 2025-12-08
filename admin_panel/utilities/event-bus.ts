import Vue from 'vue';

class EventBus {

    private static Instance: EventBus;
    private bus: Vue;
    private constructor() {
        this.bus = new Vue();
    }

    public static getInstance() {

        if (EventBus.Instance == null)
            EventBus.Instance = new EventBus();

        return EventBus.Instance;
    }

    /**
     * register an event
     * @param {string} eventName 
     * @param {function} handler 
     */
    listen(eventName: string, handler: Function) {
        this.bus.$on(eventName, handler)
    }

    /**
     * register an event for one time
     * @param {string} eventName 
     * @param {function} handler 
     */
    listenOnce(eventName: string, handler: Function) {
        this.bus.$once(eventName, handler)
    }

    /**
     * remove specific event from event stack
     * @param {string} eventName 
     * @param {function} handler 
     */
    remove(eventName: string, handler: Function) {
        if (handler) {
            this.bus.$off(eventName, handler)
        } else {
            this.bus.$off(eventName)
        }
    }

    /**
     * remove all events from stack
     */
    removeAll() {
        this.bus.$off()
    }

    /**
     * 
     * @param {string} eventName
     * @param {any} arg event data
     */
    fire(eventName: string, arg: any) {
        this.bus.$emit(eventName, arg)
    }

}

export default EventBus.getInstance();

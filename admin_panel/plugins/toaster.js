import Vue from 'vue'
import ToasterComponent from '../components/notifiers/Toaster.vue';

// create a component class
let componentClass = Vue.extend(ToasterComponent);

// create an instance from component class
let instance = new componentClass();
instance.$mount();

// inject into body
document.body.appendChild(instance.$el)
import { Types, authentication } from '@modular-rest/client';
import toaster from '../utilities/notifier';

interface Context {
    commit: any,
    dispatch: any,
}

interface State {
    user: any,
    error: any,
}

// Type definitions based on @modular-rest/client v1.14.0
interface LoginOptionsType {
    idType: 'email' | 'phone';
    id: string;
    password: string;
}

interface IdentityType {
    idType: 'email' | 'phone';
    id: string;
}

interface RequestError {
    hasError: boolean;
    error: any;
}

export default {
    state() {
        return {
            user: null,
            error: null,
        }
    },

    getters: {
        isLogin(state: any) {
            return !!state.user
        }
    },

    mutations: {
        SET_USER(state: State, user: object) {
            state.user = user;
        },
        SET_ERROR(state: State, error: object) {
            state.error = error;
        }
    },

    actions: {
        login({ commit }: Context, option: LoginOptionsType) {

            return authentication.login(option, true)
                .then(user => {
                    commit('SET_USER', user);
                })
                .catch((result: RequestError) => {
                    toaster.toast({
                        label: 'Login error',
                        description: result.error?.e || result.error
                    })

                    commit('SET_ERROR', result.error)
                    throw result;
                })

        },

        loginWithLastSession({ commit }: Context) {
            return authentication.loginWithLastSession()
                .then(user => {
                    commit('SET_USER', user);
                }).catch(error => {
                    return authentication.loginAsAnonymous()
                })
                // .catch((result: RequestError) => {
                //     toaster.toast({
                //         label: 'Login error',
                //         description: result.error
                //     })

                //     commit('SET_ERROR', result.error)
                //     throw result;
                // })

        },

        submitIdentity({ commit }: Context, option: IdentityType) {

            return authentication.registerIdentity(option)
                .catch((result: RequestError) => {
                    toaster.toast({
                        label: 'Register error',
                        description: result.error?.e || result.error
                    })

                    commit('SET_ERROR', result.error)
                    throw result.error;
                })
        },

        verifyId({ commit }: Context, option: { code: string, id: string }) {

            return authentication.validateCode(option)
                .catch((result: RequestError) => {
                    toaster.toast({
                        label: 'Verify code error',
                        description: result.error?.e || result.error
                    })

                    commit('SET_ERROR', result.error)
                    throw result.error;
                })
        },

        submitPassword({ commit }: Context, option: { code: string, id: string, password: string }) {

            return authentication.submitPassword(option)
                .catch((result: RequestError) => {
                    toaster.toast({
                        label: 'Submit password error',
                        description: result.error?.e || result.error
                    })

                    commit('SET_ERROR', result.error)
                    throw result.error;
                })
        },

        changePassword({ commit }: Context, option: { code: string, id: string, password: string }) {

            return authentication.changePassword(option)
                .catch((result: RequestError) => {
                    toaster.toast({
                        label: 'Change password error',
                        description: result.error?.e || result.error
                    })

                    commit('SET_ERROR', result.error)
                    throw result.error;
                })
        },
    }
}
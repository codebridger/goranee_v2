import { BASE_URL } from "@/config";

export default {
  state() {
    return {
      list: [],
    };
  },

  getters: {
    list(state) {
      return state.list || [];
    },
  },

  mutations: {
    SET_LIST(state, list) {
      state.list = list;
    },

    REMOVE_FROMlIST(state, fileName) {
      let index = state.list.findIndex(fileName);
      state.list.splice(index, 1);
    },
  },

  actions: {
    getList(
      { commit, state },
      options = {
        reload: false,
      }
    ) {
      const url = BASE_URL + "/backup/list";

      return fetch(url).then(async (r) => {
        let body = await r.json();
        commit("SET_LIST", body.list);
        return body;
      });
    },

    createNewBackup({ commit, state }) {
      const url = BASE_URL + "/backup";
      return fetch(url);
    },

    removeBackupfile({ commit, state }, fileName) {
      const url = BASE_URL + "/backup/" + fileName;
      return fetch(url, {
        method: "DELETE",
      }).then(() => commit("REMOVE_FROMlIST", fileName));
    },

    restoreBackupFile({}, fileName) {
      const url = BASE_URL + "/backup/restore";

      const body = JSON.stringify({
        fileName,
      });

      return fetch(url, {
        method: "POST",
        body,
        headers: {
          "Content-Type": "application/json",
        },
      }).then(async (res) => {
        const body = res.json();

        if (!res.ok) throw body;
        else return body;
      });
    },
  },
};

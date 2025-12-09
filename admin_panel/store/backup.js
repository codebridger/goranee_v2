import { BASE_URL } from "@/config";

export default {
  state() {
    return {
      list: []
    };
  },

  getters: {
    list(state) {
      return state.list || [];
    }
  },

  mutations: {
    SET_LIST(state, list) {
      state.list = list;
    },

    REMOVE_FROMlIST(state, fileName) {
      let index = state.list.findIndex(fileName);
      state.list.splice(index, 1);
    }
  },

  actions: {
    getList(
      { commit, state },
      options = {
        reload: false
      }
    ) {
      const url = BASE_URL + "/backup/list";

      return fetch(url).then(async r => {
        const body = await r.json();
        if (!r.ok) {
          throw body.message || body.error || "Failed to load backup list";
        }
        commit("SET_LIST", body.list);
        return body;
      });
    },

    createNewBackup({ commit, state }) {
      const url = BASE_URL + "/backup";
      return fetch(url).then(async r => {
        const body = await r.json().catch(() => ({}));
        if (!r.ok) {
          throw body.message || body.error || "Failed to create backup";
        }
        return body;
      });
    },

    removeBackupfile({ commit, state }, fileName) {
      const url = BASE_URL + "/backup/" + fileName;
      return fetch(url, {
        method: "DELETE"
      }).then(async r => {
        const body = await r.json().catch(() => ({}));
        if (!r.ok) {
          throw body.message || body.error || "Failed to remove backup";
        }
        commit("REMOVE_FROMlIST", fileName);
        return body;
      });
    },

    restoreBackupFile({}, fileName) {
      const url = BASE_URL + "/backup/restore";

      const body = JSON.stringify({
        fileName
      });

      return fetch(url, {
        method: "POST",
        body,
        headers: {
          "Content-Type": "application/json"
        }
      }).then(async res => {
        const body = await res.json();

        if (!res.ok) throw body.message;
        else return body;
      });
    }
  }
};

import { dataProvider } from "@modular-rest/client";

export default {
  state() {
    return {
      tables: [],
      chords: []
    };
  },

  getters: {
    chords(state) {
      return state.chords || [];
    }
  },

  mutations: {
    SET_TABLES(state, list) {
      state.tables = list;
    },
    SET_CHORDS(state, list) {
      state.chords = list;
    }
  },

  actions: {
    getTables({ commit, state }, options = { reload: false }) {
      // Skip API calls during static generation
      if (process.server) {
        return Promise.resolve();
      }

      if (options.reload || !state.tables.length) {
        return dataProvider
          .find({
            database: "chord",
            collection: "table",
            query: {},
            populates: [
              "keySignature",
              "type",
              "rows.major",
              "rows.naturalMinor",
              "rows.harmonicMinor",
              "rows.melodicMinor",
              "chromaticRows.one",
              "chromaticRows.two",
              "chromaticRows.three",
              "chromaticRows.four"
            ]
          })
          .then(list => commit("SET_TABLES", list));
      } else {
        return new Promise(done => done());
      }
    },
    getChords({ commit, state }) {
      // Skip API calls during static generation
      if (process.server) {
        return Promise.resolve();
      }

      return dataProvider
        .find({
          database: "chord",
          collection: "chord",
          query: {}
        })
        .then(list => commit("SET_CHORDS", list));
    }
  }
};

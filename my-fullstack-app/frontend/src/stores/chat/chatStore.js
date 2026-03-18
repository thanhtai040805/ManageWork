import { create } from "zustand";

export const useChatStore = create((set) => ({
  /* connection */
  connected: false,

  /* rooms */
  rooms: [],
  loadingRooms: false,

  /* current room */
  currentRoomId: null,

  /* search */
  keyword: "",
  searchResults: [],

  /* connection */
  setConnected: (status) => set({ connected: status }),

  /* room */
  setCurrentRoom: (roomId) => set({ currentRoomId: roomId }),

  /* rooms */
  setRooms: (rooms) => set({ rooms }),
  setLoadingRooms: (v) => set({ loadingRooms: v }),

  addRoom: (room) =>
    set((state) => ({
      rooms: [room, ...state.rooms],
    })),

  updateRoom: (updatedRoom) =>
    set((state) => ({
      rooms: state.rooms.map((r) =>
        r.room_id === updatedRoom.room_id ? updatedRoom : r,
      ),
    })),

  removeRoom: (roomId) =>
    set((state) => ({
      rooms: state.rooms.filter((r) => r.room_id !== roomId),
    })),

  /* search */
  setKeyword: (keyword) => set({ keyword }),
  setSearchResults: (results) => set({ searchResults: results }),
}));

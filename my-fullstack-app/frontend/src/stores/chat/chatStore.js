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
        r.room_id === updatedRoom.room_id ? { ...r, ...updatedRoom } : r,
      ),
    })),

  updateRoomLastMessage: (roomId, message) =>
    set((state) => {
      const isCurrentRoom = state.currentRoomId === roomId;
      const updatedRooms = state.rooms.map((r) => {
        if (r.room_id === roomId) {
          return {
            ...r,
            last_message_content: message.content,
            last_message_at: message.created_at,
            last_message_sender_name: message.sender_name,
            unread_count: isCurrentRoom ? 0 : (r.unread_count || 0) + 1,
          };
        }
        return r;
      });

      // Sort by last message time
      return {
        rooms: [...updatedRooms].sort((a, b) => 
          new Date(b.last_message_at) - new Date(a.last_message_at)
        )
      };
    }),
  
  markRoomAsRead: (roomId) =>
    set((state) => ({
      rooms: state.rooms.map((r) =>
        r.room_id === roomId ? { ...r, unread_count: 0 } : r
      ),
    })),

  removeRoom: (roomId) =>
    set((state) => ({
      rooms: state.rooms.filter((r) => r.room_id !== roomId),
    })),

  selectFirstRoom: () => {
    set((state) => {
      if (state.rooms.length > 0) {
        return { currentRoomId: state.rooms[0].room_id };
      }
      return {};
    });
  },

  /* search */
  setKeyword: (keyword) => set({ keyword }),
  setSearchResults: (results) => set({ searchResults: results }),
}));

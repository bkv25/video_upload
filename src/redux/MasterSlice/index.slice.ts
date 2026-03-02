import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import logger from "../../utils/logger";
// import apiService from "../../service/apiService";
// import { adminMasterEndPoint } from "../../apiEndPoints";

export interface MasterState {
  serviceType: unknown[];
  allServiceType: unknown[];
  roomType: unknown[];
  allRoomType: unknown[];
}

const initialState: MasterState = {
  serviceType: [],
  allServiceType: [],
  roomType: [],
  allRoomType: [],
};

type ListPayload = {
  option: unknown[];
  list: unknown[];
};

const masterSlice = createSlice({
  name: "master",
  initialState,
  reducers: {
    serviceTypeAction: (state, action: PayloadAction<ListPayload>) => {
      return (state = {
        ...state,
        serviceType: [...action.payload.option],
        allServiceType: [...action.payload.list],
      });
    },
    roomTypeAction: (state, action: PayloadAction<ListPayload>) => {
      return (state = {
        ...state,
        roomType: [...action.payload.option],
        allRoomType: [...action.payload.list],
      });
    },
    resetAction: (state) => {
      return (state = {
        ...state,
        serviceType: [],
        roomType: [],
        allServiceType: [],
        allRoomType: [],
      });
    },
  },
});
export const { serviceTypeAction, roomTypeAction, resetAction } =
  masterSlice.actions;

// export const getServiceType = () => async (dispatch) => {
//   try {
//     let res = await apiService(adminMasterEndPoint.getAllServiceList);
//     if (res?.status === "success") {
//       let data = res?.data?.map((i) => {
//         return {
//           value: i?.id,
//           label: i?.service_type,
//         };
//       });
//       dispatch(serviceTypeAction({ option: data, list: res?.data }));
//     }
//   } catch (error) {
//     logger(error);
//   }
// };

// export const getRoomType = () => async (dispatch) => {
//   try {
//     let res = await apiService(adminMasterEndPoint.getAllRoomList);
//     if (res?.status === "success") {
//       let data = res?.data?.map((i) => {
//         return {
//           value: i?.id,
//           label: i?.room_type,
//         };
//       });
//       dispatch(roomTypeAction({ option: data, list: res?.data }));
//     }
//   } catch (error) {
//     logger(error);
//   }
// };

export const resetMasterList =
  () =>
  async (dispatch: (action: unknown) => void): Promise<void> => {
    try {
      dispatch(resetAction());
    } catch (error) {
      logger(error);
    }
  };

export const selectServiceType = (state: { master: MasterState }) =>
  state.master.serviceType;
export const selectRoomType = (state: { master: MasterState }) =>
  state.master.roomType;
export const selectAllServiceType = (state: { master: MasterState }) =>
  state.master.allServiceType;
export const selectAllRoomType = (state: { master: MasterState }) =>
  state.master.allRoomType;

export default masterSlice.reducer;

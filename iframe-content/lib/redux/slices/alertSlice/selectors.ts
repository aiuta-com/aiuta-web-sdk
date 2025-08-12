import { RootState } from "../../store";

const showAlertStatesSelector = (state: RootState) =>
  state.alert.showAlertStates;

export { showAlertStatesSelector };

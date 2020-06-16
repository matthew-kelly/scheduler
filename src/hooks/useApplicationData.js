import { useEffect, useReducer } from "react";
import axios from "axios";
import Error from "components/Appointment/Error";

export default function useApplicationData() {
  const SET_DAY = "SET_DAY";
  const SET_APPLICATION_DATA = "SET_APPLICATION_DATA";
  const SET_INTERVIEW = "SET_INTERVIEW";

  function reducer(state, action) {
    switch (action.type) {
      case SET_DAY:
        return {
          ...state,
          day: action.value,
        };
      case SET_APPLICATION_DATA:
        return {
          ...state,
          days: action.days,
          appointments: action.appointments,
          interviewers: action.interviewers,
        };
      case SET_INTERVIEW:
        const appointment = {
          ...state.appointments[action.value.id],
          interview: action.value.interview,
        };
        const appointments = {
          ...state.appointments,
          [action.value.id]: appointment,
        };
        let newState = {
          ...state,
          appointments,
        };
        const days = updateDaySpots(newState, action);
        return {
          ...newState,
          days,
        };
      default:
        throw new Error(
          `Tried to reduce with unsupported action type: ${action.type}`
        );
    }
  }

  const [state, dispatch] = useReducer(reducer, {
    day: "Monday",
    days: [],
    appointments: {},
    interviewers: {},
  });

  const setDay = (day) => dispatch({ type: SET_DAY, value: day });

  function bookInterview(id, interview) {
    const appointment = {
      ...state.appointments[id],
      interview: { ...interview },
    };
    return axios.put(`/api/appointments/${id}`, appointment).then((res) => {
      if (res.status === 204) {
        dispatch({ type: SET_INTERVIEW, value: { id, interview } });
      }
    });
  }

  function cancelInterview(id) {
    return axios.delete(`/api/appointments/${id}`).then((response) => {
      if (response.status === 204) {
        dispatch({ type: SET_INTERVIEW, value: { id, interview: null } });
      }
    });
  }

  function updateDaySpots(state, action) {
    return state.days.map((day) => {
      if (day.name !== state.day) {
        return day;
      } else {
        let spots = 0;
        day.appointments.forEach((ID) => {
          if (!state.appointments[ID].interview) {
            spots++;
          }
        });
        return {
          ...day,
          spots,
        };
      }
    });
  }

  // Fetch days, only run once
  useEffect(() => {
    Promise.all([
      Promise.resolve(
        axios.get("/api/days").then((res) => {
          return res.data;
        })
      ),
      Promise.resolve(
        axios.get("/api/appointments").then((res) => {
          return res.data;
        })
      ),
      Promise.resolve(
        axios.get("/api/interviewers").then((res) => {
          return res.data;
        })
      ),
    ]).then((all) => {
      const [days, appointments, interviewers] = all;
      dispatch({
        type: SET_APPLICATION_DATA,
        days,
        appointments,
        interviewers,
      });
      const socket = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);

      socket.onopen = () => {
        // socket.send("ping");
      };

      socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === "SET_INTERVIEW") {
          dispatch({
            type: SET_INTERVIEW,
            value: { id: msg.id, interview: msg.interview },
          });
        }
      };
    });
  }, []);

  return {
    state,
    setDay,
    bookInterview,
    cancelInterview,
  };
}

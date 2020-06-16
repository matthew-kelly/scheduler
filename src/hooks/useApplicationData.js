import { useEffect, useReducer } from "react";
import axios from "axios";
import Error from "components/Appointment/Error";

export default function useApplicationData() {
  const SET_DAY = "SET_DAY";
  const SET_APPLICATION_DATA = "SET_APPLICATION_DATA";
  const SET_INTERVIEW = "SET_INTERVIEW";
  const SET_DAYS = "SET_DAYS";

  function reducer(state, action) {
    switch (action.type) {
      case SET_DAY:
        return {
          ...state,
          day: action.day,
        };
      case SET_DAYS:
        return {
          ...state,
          days: action.days,
        };
      case SET_APPLICATION_DATA:
        return {
          ...state,
          days: action.days,
          appointments: action.appointments,
          interviewers: action.interviewers,
        };
      case SET_INTERVIEW:
        return {
          ...state,
          appointments: action.appointments,
        };
      default:
        throw new Error(
          `Tried to reduce with unsupported action type: ${action.type}`
        );
    }
  }

  // const [state, setState] = useState({
  //   day: "Monday",
  //   days: [],
  //   appointments: {},
  //   interviewers: {},
  // });

  const [state, dispatch] = useReducer(reducer, {
    day: "Monday",
    days: [],
    appointments: {},
    interviewers: {},
  });

  const setDay = (day) => dispatch({ type: SET_DAY, day });

  function bookInterview(id, interview) {
    const appointment = {
      ...state.appointments[id],
      interview: { ...interview },
    };
    return axios.put(`/api/appointments/${id}`, appointment).then((res) => {
      if (res.status === 204) {
        const appointments = {
          ...state.appointments,
          [id]: appointment,
        };
        dispatch({ type: SET_INTERVIEW, appointments });
        updateSpots(id, appointments);
      }
    });
  }

  function cancelInterview(id) {
    return axios.delete(`/api/appointments/${id}`).then((response) => {
      if (response.status === 204) {
        const appointment = {
          ...state.appointments[id],
          interview: null,
        };
        const appointments = {
          ...state.appointments,
          [id]: appointment,
        };
        dispatch({ type: SET_INTERVIEW, appointments });
        updateSpots(id, appointments);
      }
    });
  }

  function updateSpots(appointmentID, appointments) {
    // get day
    const day = state.days.find((day) =>
      day.appointments.includes(appointmentID)
    );
    // check each appointment for that day and get if empty or not
    let spots = 0;
    day.appointments.forEach((ID) => {
      if (!appointments[ID].interview) {
        spots++;
      }
    });
    // update day with new spots value
    const newDay = {
      ...day,
      spots,
    };
    const days = state.days.map((day) => {
      if (day.id === newDay.id) {
        return newDay;
      } else {
        return day;
      }
    });
    dispatch({ type: SET_DAYS, days });
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
    });
  }, []);

  return {
    state,
    setDay,
    bookInterview,
    cancelInterview,
  };
}

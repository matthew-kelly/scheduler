import { useState, useEffect } from "react";
import axios from "axios";

export default function useApplicationData() {
  const [state, setState] = useState({
    day: "Monday",
    days: [],
    appointments: {},
    interviewers: {},
  });

  const setDay = (day) => setState((prev) => ({ ...prev, day }));

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
        setState((prev) => ({ ...prev, appointments }));
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
        setState((prev) => ({ ...prev, appointments }));
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
    // update days array in state
    setState((prev) => ({
      ...prev,
      days,
    }));
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
      setState((prev) => ({ ...prev, days, appointments, interviewers }));
    });
  }, []);

  return {
    state,
    setDay,
    bookInterview,
    cancelInterview,
  };
}

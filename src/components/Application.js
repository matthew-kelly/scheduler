import React, { useState, useEffect } from "react";
import axios from "axios";

import "components/Application.scss";
import DayList from "./DayList";
import Appointment from "./Appointment";

import {
  getAppointmentsForDay,
  getInterviewersForDay,
  getInterview,
} from "helpers/selectors";

export default function Application(props) {
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
        return true;
      }
      return false;
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
        return true;
      } else {
        return false;
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
      setState((prev) => ({ ...prev, days, appointments, interviewers }));
    });
  }, []);

  const appointments = getAppointmentsForDay(state, state.day);
  const interviewers = getInterviewersForDay(state, state.day);
  const schedule = appointments.map((appt) => {
    const interview = getInterview(state, appt.interview);

    return (
      <Appointment
        key={appt.id}
        id={appt.id}
        time={appt.time}
        interview={interview}
        interviewers={interviewers}
        bookInterview={bookInterview}
        cancelInterview={cancelInterview}
      />
    );
  });

  return (
    <main className="layout">
      <section className="sidebar">
        <img
          className="sidebar--centered"
          src="images/logo.png"
          alt="Interview Scheduler"
        />
        <hr className="sidebar__separator sidebar--centered" />
        <nav className="sidebar__menu">
          <DayList days={state.days} day={state.day} setDay={setDay} />
        </nav>
        <img
          className="sidebar__lhl sidebar--centered"
          src="images/lhl.png"
          alt="Lighthouse Labs"
        />
      </section>
      <section className="schedule">
        {schedule}
        <Appointment key="last" time="5pm" />
      </section>
    </main>
  );
}

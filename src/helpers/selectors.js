export function getAppointmentsForDay(state, day) {
  let result = [];
  const stateDay = state.days.find((dayObj) => dayObj.name === day);
  if (!stateDay) {
    return result;
  }
  stateDay.appointments.forEach((ID) => {
    const appointment = state.appointments[ID];
    result.push(appointment);
  });
  return result;
}

export function getInterviewersForDay(state, day) {
  let result = [];
  const stateDay = state.days.find((dayObj) => dayObj.name === day);
  if (!stateDay) {
    return result;
  }
  stateDay.interviewers.forEach((ID) => {
    const interviewer = state.interviewers[ID];
    result.push(interviewer);
  });
  return result;
}

export function getInterview(state, interview) {
  if (!interview) {
    return null;
  }
  const interviewer = state.interviewers[interview.interviewer];
  if (!interviewer) {
    return null;
  }
  const interviewObj = { ...interview, interviewer };
  return interviewObj;
}
